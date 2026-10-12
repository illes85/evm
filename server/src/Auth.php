<?php

/**
 * Regisztráció, bejelentkezés, munkamenetek.
 *
 * A munkamenet-token véletlen bájtokból áll, és csak a hash-e kerül az
 * adatbázisba — így egy esetleges adatbázis-szivárgásból nem lehet belépni.
 * A token lejár, de minden használatkor megújul, hogy a napi használatban
 * lévő telefon ne jelentkezzen ki magától.
 */
final class Auth
{
    const TOKEN_LIFETIME_DAYS = 60;
    const MIN_PASSWORD_LENGTH = 10;
    const MAX_ATTEMPTS = 8;
    const ATTEMPT_WINDOW_MINUTES = 15;

    /** @var Db */
    private $db;

    public function __construct(Db $db)
    {
        $this->db = $db;
    }

    public function register(string $email, string $password, ?string $device): array
    {
        $email = $this->normaliseEmail($email);

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Http::fail(422, 'invalid_email', 'Az email cím formátuma nem megfelelő.');
        }
        if (mb_strlen($password) < self::MIN_PASSWORD_LENGTH) {
            Http::fail(422, 'weak_password', sprintf(
                'A jelszó legyen legalább %d karakter.',
                self::MIN_PASSWORD_LENGTH
            ));
        }

        $existing = $this->db->one('SELECT id FROM users WHERE email = ?', [$email]);
        if ($existing !== null) {
            Http::fail(409, 'email_taken', 'Ezzel az email címmel már van fiók.');
        }

        $now = gmdate('Y-m-d H:i:s');
        $id = self::uuid();
        $this->db->query(
            'INSERT INTO users (id, email, password_hash, plan, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)',
            [$id, $email, password_hash($password, PASSWORD_DEFAULT), 'basic', $now, $now]
        );

        return $this->issueSession($id, $email, 'basic', $device);
    }

    public function login(string $email, string $password, ?string $device): array
    {
        $email = $this->normaliseEmail($email);
        $ip = Http::clientIp();

        if ($this->tooManyAttempts($email, $ip)) {
            Http::fail(429, 'too_many_attempts',
                'Túl sok sikertelen próbálkozás. Várj néhány percet, mielőtt újra próbálod.');
        }

        $user = $this->db->one(
            'SELECT id, email, password_hash, plan FROM users WHERE email = ?',
            [$email]
        );

        if ($user === null) {
            // Ismeretlen email esetén is elvégzünk egy ugyanolyan drága
            // műveletet: a hashelés és az ellenőrzés ideje megegyezik, így a
            // válaszidőből nem derül ki, létezik-e a fiók. (Mérve: érvényes
            // hash ellenőrzése ~240 ms, érvénytelené ~0,1 ms — beégetett
            // álhash helyett ezért számolunk valódit.)
            password_hash($password, PASSWORD_DEFAULT);
            $ok = false;
        } else {
            $ok = password_verify($password, $user['password_hash']);
        }

        if (!$ok) {
            $this->recordFailedAttempt($email, $ip);
            Http::fail(401, 'invalid_credentials', 'Hibás email cím vagy jelszó.');
        }

        $this->clearAttempts($email, $ip);

        // Ha időközben erősebb lett az alapértelmezett algoritmus, frissítünk.
        if (password_needs_rehash($user['password_hash'], PASSWORD_DEFAULT)) {
            $this->db->query('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [
                password_hash($password, PASSWORD_DEFAULT),
                gmdate('Y-m-d H:i:s'),
                $user['id'],
            ]);
        }

        return $this->issueSession($user['id'], $user['email'], $user['plan'], $device);
    }

    /** A kérést küldő felhasználó, vagy null, ha nincs érvényes token. */
    public function authenticate(?string $token): ?array
    {
        if ($token === null) {
            return null;
        }

        $row = $this->db->one(
            'SELECT s.id AS session_id, u.id, u.email, u.plan
             FROM sessions s
             JOIN users u ON u.id = s.user_id
             WHERE s.token_hash = ? AND s.expires_at > ?',
            [self::hashToken($token), gmdate('Y-m-d H:i:s')]
        );

        if ($row === null) {
            return null;
        }

        $this->db->query(
            'UPDATE sessions SET last_used_at = ?, expires_at = ? WHERE id = ?',
            [
                gmdate('Y-m-d H:i:s'),
                gmdate('Y-m-d H:i:s', time() + self::TOKEN_LIFETIME_DAYS * 86400),
                $row['session_id'],
            ]
        );

        return $row;
    }

    public function logout(?string $token): void
    {
        if ($token !== null) {
            $this->db->query('DELETE FROM sessions WHERE token_hash = ?', [self::hashToken($token)]);
        }
    }

    private function issueSession(string $userId, string $email, string $plan, ?string $device): array
    {
        $token = bin2hex(random_bytes(32));
        $now = gmdate('Y-m-d H:i:s');

        $this->db->query(
            'INSERT INTO sessions (id, user_id, token_hash, device_label, created_at, last_used_at, expires_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                self::uuid(),
                $userId,
                self::hashToken($token),
                $device !== null ? mb_substr($device, 0, 190) : null,
                $now,
                $now,
                gmdate('Y-m-d H:i:s', time() + self::TOKEN_LIFETIME_DAYS * 86400),
            ]
        );

        return [
            'token' => $token,
            'user' => ['id' => $userId, 'email' => $email, 'plan' => $plan],
        ];
    }

    private function tooManyAttempts(string $email, string $ip): bool
    {
        $since = gmdate('Y-m-d H:i:s', time() - self::ATTEMPT_WINDOW_MINUTES * 60);
        $row = $this->db->one(
            'SELECT COUNT(*) AS c FROM login_attempts
             WHERE attempted_at > ? AND (email = ? OR ip = ?)',
            [$since, $email, $ip]
        );
        return (int) ($row['c'] ?? 0) >= self::MAX_ATTEMPTS;
    }

    private function recordFailedAttempt(string $email, string $ip): void
    {
        $this->db->query(
            'INSERT INTO login_attempts (email, ip, attempted_at) VALUES (?, ?, ?)',
            [$email, $ip, gmdate('Y-m-d H:i:s')]
        );
    }

    private function clearAttempts(string $email, string $ip): void
    {
        $this->db->query('DELETE FROM login_attempts WHERE email = ? OR ip = ?', [$email, $ip]);
    }

    private function normaliseEmail(string $email): string
    {
        return mb_strtolower(trim($email));
    }

    private static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    public static function uuid(): string
    {
        $data = random_bytes(16);
        $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
        $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
        return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
    }
}

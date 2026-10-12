<?php

/** Kérés beolvasása és válaszadás, egy helyen. */
final class Http
{
    /** @var array */
    private $config;

    public function __construct(array $config)
    {
        $this->config = $config;
    }

    /** Csak az engedélyezett forrásokat szolgáljuk ki böngészőből. */
    public function applyCors(): void
    {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        $allowed = $this->config['allowed_origins'] ?? [];

        if ($origin !== '' && in_array($origin, $allowed, true)) {
            header('Access-Control-Allow-Origin: ' . $origin);
            header('Vary: Origin');
            header('Access-Control-Allow-Headers: Content-Type, Authorization');
            header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
            header('Access-Control-Max-Age: 86400');
        }

        if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
    }

    /** A kért útvonal. Működik átírás nélkül (?r=...) és azzal is. */
    public static function route(): string
    {
        $fromQuery = $_GET['r'] ?? '';
        if ($fromQuery !== '') {
            return trim((string) $fromQuery, '/');
        }
        $pathInfo = $_SERVER['PATH_INFO'] ?? '';
        return trim($pathInfo, '/');
    }

    public static function method(): string
    {
        return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    }

    /** A kérés JSON törzse tömbként. Hibás JSON-ra 400-zal elszáll. */
    public static function body(): array
    {
        $raw = file_get_contents('php://input');
        if ($raw === '' || $raw === false) {
            return [];
        }
        $data = json_decode($raw, true);
        if (!is_array($data)) {
            self::fail(400, 'invalid_json', 'A kérés törzse nem érvényes JSON.');
        }
        return $data;
    }

    public static function bearerToken(): ?string
    {
        $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if ($header === '' && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            foreach ($headers as $name => $value) {
                if (strcasecmp($name, 'Authorization') === 0) {
                    $header = $value;
                    break;
                }
            }
        }
        if (stripos($header, 'Bearer ') !== 0) {
            return null;
        }
        $token = trim(substr($header, 7));
        return $token === '' ? null : $token;
    }

    public static function clientIp(): string
    {
        return (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    }

    public static function json($data, int $status = 200): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }

    /** Hibaválasz. A `message` a felhasználónak szól, belső részlet nélkül. */
    public static function fail(int $status, string $code, string $message): void
    {
        self::json(['error' => $code, 'message' => $message], $status);
    }
}

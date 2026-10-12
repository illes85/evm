<?php

/**
 * Szinkron: letöltés és feltöltés.
 *
 * Ütközésfeloldás: az nyer, amelyik változat `updatedAt`-je későbbi (last
 * write wins). Ez azért elég, mert egy fiókhoz egy vállalkozó tartozik, aki
 * jellemzően egyszerre egy eszközön dolgozik — a valódi ütközés ritka. Ha
 * később több felhasználó dolgozik egy fiókon, ezt mezőnkénti összefésülésre
 * kell cserélni.
 */
final class Sync
{
    /** Egy körben feltölthető rekordok száma, hogy a kérés ne fusson időtúllépésbe. */
    const MAX_CHANGES_PER_PUSH = 500;

    /** @var Db */
    private $db;

    public function __construct(Db $db)
    {
        $this->db = $db;
    }

    /**
     * Minden rekord, ami a megadott szerveridő óta változott — a törölteket
     * (sírköveket) is beleértve, különben a másik eszköz nem tudna róluk.
     */
    public function pull(string $userId, string $since): array
    {
        $since = $this->normaliseTimestamp($since) ?? '1970-01-01 00:00:00.000';
        $cursor = $since;
        $changes = [];

        foreach (Schema::SYNCED_TABLES as $table) {
            $rows = $this->db->all(
                "SELECT id, payload, created_at, updated_at, server_updated_at, deleted_at
                 FROM `$table`
                 WHERE user_id = ? AND server_updated_at > ?
                 ORDER BY server_updated_at ASC
                 LIMIT 1000",
                [$userId, $since]
            );

            $changes[$table] = [];
            foreach ($rows as $row) {
                $changes[$table][] = $this->toRecord($row);
                if ($row['server_updated_at'] > $cursor) {
                    $cursor = $row['server_updated_at'];
                }
            }
        }

        return ['changes' => $changes, 'cursor' => $cursor, 'serverTime' => $this->now()];
    }

    /**
     * A kliens által módosított rekordok befogadása. Visszaadjuk azokat,
     * amiket elutasítottunk, mert a szerveren frissebb változat van — így a
     * kliens tudja, hogy felül kell írnia a sajátját.
     */
    public function push(string $userId, array $changes): array
    {
        $accepted = 0;
        $rejected = [];
        $count = 0;

        foreach ($changes as $table => $records) {
            if (!in_array($table, Schema::SYNCED_TABLES, true) || !is_array($records)) {
                continue;
            }
            $count += count($records);
        }
        if ($count > self::MAX_CHANGES_PER_PUSH) {
            Http::fail(413, 'too_many_changes', sprintf(
                'Egyszerre legfeljebb %d rekord küldhető. Az app kisebb adagokban küldi majd.',
                self::MAX_CHANGES_PER_PUSH
            ));
        }

        $this->db->transaction(function (Db $db) use ($userId, $changes, &$accepted, &$rejected) {
            foreach ($changes as $table => $records) {
                if (!in_array($table, Schema::SYNCED_TABLES, true) || !is_array($records)) {
                    continue;
                }

                foreach ($records as $record) {
                    if (!is_array($record) || !isset($record['id'], $record['updatedAt'])) {
                        continue;
                    }

                    $id = (string) $record['id'];
                    $updatedAt = $this->normaliseTimestamp((string) $record['updatedAt']);
                    if ($updatedAt === null || !$this->looksLikeUuid($id)) {
                        continue;
                    }

                    $existing = $db->one(
                        "SELECT updated_at FROM `$table` WHERE user_id = ? AND id = ?",
                        [$userId, $id]
                    );

                    // A szerveren lévő változat frissebb: nem írjuk felül.
                    if ($existing !== null && $existing['updated_at'] > $updatedAt) {
                        $rejected[$table][] = $id;
                        continue;
                    }

                    $createdAt = $this->normaliseTimestamp((string) ($record['createdAt'] ?? ''))
                        ?? $updatedAt;
                    $deletedAt = isset($record['deletedAt'])
                        ? $this->normaliseTimestamp((string) $record['deletedAt'])
                        : null;

                    $db->query(
                        "INSERT INTO `$table`
                            (id, user_id, payload, created_at, updated_at, server_updated_at, deleted_at)
                         VALUES (?, ?, ?, ?, ?, ?, ?)
                         ON DUPLICATE KEY UPDATE
                            payload = VALUES(payload),
                            updated_at = VALUES(updated_at),
                            server_updated_at = VALUES(server_updated_at),
                            deleted_at = VALUES(deleted_at)",
                        [
                            $id,
                            $userId,
                            json_encode($record, JSON_UNESCAPED_UNICODE),
                            substr($createdAt, 0, 19),
                            $updatedAt,
                            $this->now(),
                            $deletedAt !== null ? substr($deletedAt, 0, 19) : null,
                        ]
                    );
                    $accepted++;
                }
            }
        });

        return [
            'accepted' => $accepted,
            // Mindig objektum, üresen is: különben a JSON-ban üres tömbként
            // jelenne meg, és a kliensnek két alakot kellene kezelnie.
            'rejected' => (object) $rejected,
            'cursor' => $this->now(),
            'serverTime' => $this->now(),
        ];
    }

    private function toRecord(array $row): array
    {
        $payload = json_decode($row['payload'], true);
        if (!is_array($payload)) {
            $payload = [];
        }
        // A mérvadó adat mindig az oszlopokból jön, nem a mentett JSON-ből.
        $payload['id'] = $row['id'];
        $payload['createdAt'] = $this->toIso($row['created_at']);
        $payload['updatedAt'] = $this->toIso($row['updated_at']);
        if ($row['deleted_at'] !== null) {
            $payload['deletedAt'] = $this->toIso($row['deleted_at']);
        } else {
            unset($payload['deletedAt']);
        }
        return $payload;
    }

    /** ISO 8601 (a kliens formátuma) → MySQL DATETIME(3), UTC-ben. */
    private function normaliseTimestamp(string $value): ?string
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }
        try {
            $dt = new DateTimeImmutable($value);
        } catch (Exception $e) {
            return null;
        }
        return $dt->setTimezone(new DateTimeZone('UTC'))->format('Y-m-d H:i:s.v');
    }

    private function toIso(string $mysqlDateTime): string
    {
        $dt = new DateTimeImmutable($mysqlDateTime, new DateTimeZone('UTC'));
        return $dt->format('Y-m-d\TH:i:s.v\Z');
    }

    private function looksLikeUuid(string $id): bool
    {
        return (bool) preg_match('/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i', $id);
    }

    private function now(): string
    {
        return (new DateTimeImmutable('now', new DateTimeZone('UTC')))->format('Y-m-d H:i:s.v');
    }
}

<?php
require __DIR__.'/config.php';
header('Content-Type: application/json');
// No saques HTML en caso de notice/warning:
ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok'=>false,'err'=>'method_not_allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!$data || !isset($data['user_id'],$data['chapter'],$data['slot'],$data['payload'])) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'err'=>'bad_request']);
  exit;
}

$user_id = substr((string)$data['user_id'], 0, 64);
$chapter = substr((string)$data['chapter'], 0, 32);
$slot    = max(1, min(9, (int)$data['slot']));
$payload = json_encode($data['payload'], JSON_UNESCAPED_UNICODE);

if (!$user_id || !$chapter) {
  http_response_code(400);
  echo json_encode(['ok'=>false,'err'=>'invalid_fields']);
  exit;
}

try {
  // Si tu columna 'payload' es TEXT:
  $sql = "INSERT INTO saves (user_id, chapter, slot, payload)
          VALUES (:u,:c,:s,:p)
          ON DUPLICATE KEY UPDATE payload=VALUES(payload), updated_at=CURRENT_TIMESTAMP";

  // Si usas columna JSON y tu MySQL lo soporta, podrías usar:
  // $sql = "INSERT INTO saves (user_id, chapter, slot, payload)
  //         VALUES (:u,:c,:s,CAST(:p AS JSON))
  //         ON DUPLICATE KEY UPDATE payload=CAST(VALUES(payload) AS JSON), updated_at=CURRENT_TIMESTAMP";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([':u'=>$user_id, ':c'=>$chapter, ':s'=>$slot, ':p'=>$payload]);

  echo json_encode(['ok'=>true]);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'err'=>'server_error']);
}

<?php
require __DIR__.'/config.php';
header('Content-Type: application/json');

$user_id = substr((string)($_GET['user_id'] ?? ''), 0, 64);
$chapter = substr((string)($_GET['chapter'] ?? ''), 0, 32);
$slot    = (int)($_GET['slot'] ?? 1);

if (!$user_id || !$chapter || !$slot) { 
  http_response_code(400); echo json_encode(['ok'=>false,'err'=>'bad_request']); exit; 
}

$stmt = $pdo->prepare("SELECT payload, updated_at FROM saves WHERE user_id=? AND chapter=? AND slot=?");
$stmt->execute([$user_id, $chapter, $slot]);
$row = $stmt->fetch();

echo json_encode([
  'ok'=>true,
  'payload'   => $row ? (is_string($row['payload']) ? json_decode($row['payload'], true) : $row['payload']) : null,
  'updated_at'=> $row['updated_at'] ?? null
]);

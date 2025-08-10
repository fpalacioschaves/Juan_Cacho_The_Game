<?php
require __DIR__.'/config.php';
header('Content-Type: application/json');

$user_id = substr((string)($_GET['user_id'] ?? ''), 0, 64);
$chapter = substr((string)($_GET['chapter'] ?? ''), 0, 32);
if (!$user_id || !$chapter){ http_response_code(400); echo json_encode(['ok'=>false]); exit; }

$stmt = $pdo->prepare("SELECT slot, updated_at FROM saves WHERE user_id=? AND chapter=? ORDER BY slot");
$stmt->execute([$user_id, $chapter]);
$rows = $stmt->fetchAll();

echo json_encode(['ok'=>true,'slots'=>$rows]);

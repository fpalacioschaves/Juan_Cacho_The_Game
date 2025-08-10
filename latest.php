<?php
require __DIR__.'/config.php';
header('Content-Type: application/json');

$user_id = substr((string)($_GET['user_id'] ?? ''), 0, 64);
if (!$user_id){ http_response_code(400); echo json_encode(['ok'=>false]); exit; }

$stmt = $pdo->prepare("SELECT chapter, slot, updated_at 
                       FROM saves WHERE user_id=? 
                       ORDER BY updated_at DESC LIMIT 1");
$stmt->execute([$user_id]);
$row = $stmt->fetch();

echo json_encode(['ok'=>true,'latest'=>$row ?: null]);

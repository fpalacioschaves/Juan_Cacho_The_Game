<?php
// public/api/dialogue.php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$chapter = $_GET['chapter'] ?? 'c1';
$id = $_GET['id'] ?? '';

$root = dirname(__DIR__, 1);
$dataDir = realpath($root . '/../data/dialogues');
if ($dataDir === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Dialogues dir not found']);
  exit;
}

$chapter = preg_replace('/[^a-zA-Z0-9_\-]/', '', $chapter);
$id = preg_replace('/[^a-zA-Z0-9_\-]/', '', $id);

$path = $dataDir . DIRECTORY_SEPARATOR . $chapter . DIRECTORY_SEPARATOR . $id . '.json';
if (!is_file($path)) {
  http_response_code(404);
  echo json_encode(['error' => 'Dialogue not found', 'path' => $path]);
  exit;
}

$raw = file_get_contents($path);
if ($raw === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Dialogue read error']);
  exit;
}

echo $raw;

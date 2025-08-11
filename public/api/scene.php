<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$id = $_GET['id'] ?? '';
$chapter = $_GET['chapter'] ?? '';

if ($id === '' || $chapter === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Missing id or chapter']);
  exit;
}

$root = dirname(__DIR__, 2); // /Juan_Cacho_The_Game
$path = $root . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'scenes' . DIRECTORY_SEPARATOR . $chapter . DIRECTORY_SEPARATOR . $id . '.json';

if (!file_exists($path)) {
  http_response_code(404);
  echo json_encode(['error' => 'Scene not found', 'path' => $path]);
  exit;
}

$raw = file_get_contents($path);
if ($raw === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Cannot read scene']);
  exit;
}

echo $raw;

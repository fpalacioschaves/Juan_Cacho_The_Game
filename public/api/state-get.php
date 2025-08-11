<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$root = dirname(__DIR__, 2);           // /Juan_Cacho_The_Game
$dataDir = $root . DIRECTORY_SEPARATOR . 'data';
$stateFile = $dataDir . DIRECTORY_SEPARATOR . 'state.json';

if (!is_dir($dataDir)) {
  http_response_code(500);
  echo json_encode(['error' => 'Data dir not found']);
  exit;
}

if (!file_exists($stateFile)) {
  // Estado inicial por defecto
  $initial = [
    'chapter' => 'c1',
    'scene' => 'piso-juan',
    'inventory' => []
  ];
  file_put_contents($stateFile, json_encode($initial, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  echo json_encode($initial, JSON_UNESCAPED_UNICODE);
  exit;
}

$raw = file_get_contents($stateFile);
if ($raw === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Cannot read state']);
  exit;
}

echo $raw;

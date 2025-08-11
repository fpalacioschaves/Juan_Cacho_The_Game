<?php
declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');

$root = dirname(__DIR__, 2);
$dataDir = $root . DIRECTORY_SEPARATOR . 'data';
$stateFile = $dataDir . DIRECTORY_SEPARATOR . 'state.json';

if (!is_dir($dataDir)) {
  @mkdir($dataDir, 0777, true);
}

$body = file_get_contents('php://input');
$input = json_decode($body ?: '[]', true);
if (!is_array($input)) $input = [];

$existing = [];
if (file_exists($stateFile)) {
  $raw = file_get_contents($stateFile);
  $existing = json_decode($raw ?: '[]', true) ?: [];
}

$merged = array_merge($existing, $input);
file_put_contents($stateFile, json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo json_encode($merged, JSON_UNESCAPED_UNICODE);

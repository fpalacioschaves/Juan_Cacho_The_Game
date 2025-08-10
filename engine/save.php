<?php
// /engine/save.php — guarda estado en /engine/saves/{id}.json
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$raw = file_get_contents('php://input');
if(!$raw){ http_response_code(400); echo json_encode(['ok'=>false,'err'=>'empty']); exit; }
$in = json_decode($raw, true);
if(!$in || !isset($in['id']) || !isset($in['state'])){ http_response_code(400); echo json_encode(['ok'=>false,'err'=>'bad_json']); exit; }
$id = preg_replace('/[^a-zA-Z0-9_-]/','', $in['id']);
$file = __DIR__ . '/saves/' . $id . '.json';
if(!is_dir(__DIR__.'/saves')){ mkdir(__DIR__.'/saves', 0775, true); }
$ok = file_put_contents($file, json_encode($in['state'], JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE), LOCK_EX);
echo json_encode(['ok'=> (bool)$ok]);

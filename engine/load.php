<?php
// /engine/load.php — devuelve estado guardado
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$id = isset($_GET['id']) ? preg_replace('/[^a-zA-Z0-9_-]/','', $_GET['id']) : '';
if($id===''){ http_response_code(400); echo json_encode(['ok'=>false,'err'=>'missing_id']); exit; }
$file = __DIR__ . '/saves/' . $id . '.json';
if(!file_exists($file)){ http_response_code(404); echo json_encode(['ok'=>false,'err'=>'not_found']); exit; }
readfile($file);

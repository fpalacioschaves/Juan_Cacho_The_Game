<?php
require __DIR__ . '/../../app/bootstrap.php';
if ($_SERVER['REQUEST_METHOD'] !== 'POST') Util::json(['error'=>'POST only'],405);
$sid = Util::getSessionId();
$gs = new GameState($sid);
Util::json($gs->reset());

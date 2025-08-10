<?php
// Ajusta credenciales
$DB_HOST = 'localhost';
$DB_NAME = 'juan_cacho';
$DB_USER = 'root';
$DB_PASS = '';

$pdo = new PDO(
  "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
  $DB_USER, $DB_PASS,
  [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false,
  ]
);

// Si sirves los PHP desde otro subdominio, habilita CORS sencillo:
// header('Access-Control-Allow-Origin: https://TU-DOMINIO');
// header('Access-Control-Allow-Headers: Content-Type');
// header('Access-Control-Allow-Methods: GET,POST,OPTIONS');
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

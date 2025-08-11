<?php
require __DIR__ . '/../app/bootstrap.php';

// Sirve index.html para rutas no API (SPA clásica)
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
if (str_starts_with($uri, '/api/')) {
  http_response_code(404);
  Util::json(['error' => 'Not found'], 404);
}

// Entrega shell estático
readfile(__DIR__ . '/index.html');

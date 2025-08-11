<?php
class Util {
  public static function json($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, Config::SEND_JSON_FLAGS);
    exit;
  }
  public static function readJson(string $path) {
    if (!is_file($path)) return null;
    $raw = file_get_contents($path);
    return $raw === false ? null : json_decode($raw, true);
  }
  public static function writeJson(string $path, $data): bool {
    $tmp = $path . '.tmp';
    $json = json_encode($data, Config::SEND_JSON_FLAGS);
    if (file_put_contents($tmp, $json, LOCK_EX) === false) return false;
    return rename($tmp, $path);
  }
  public static function ensureDirs(): void {
    foreach ([Config::STORAGE_DIR, Config::SAVES_DIR, Config::LOCKS_DIR] as $dir) {
      if (!is_dir($dir)) mkdir($dir, 0775, true);
    }
  }
  public static function getSessionId(): string {
    // Sesión corta pero suficiente. En producción, usa PHP sessions o auth real.
    if (!isset($_COOKIE['jc_sid'])) {
      $sid = bin2hex(random_bytes(16));
      setcookie('jc_sid', $sid, time()+3600*24*30, '/', '', false, true);
      return $sid;
    }
    return preg_replace('/[^a-f0-9]/', '', $_COOKIE['jc_sid']);
  }
}

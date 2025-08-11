<?php
class SceneRepository {
  public static function load(string $sceneId, ?string $chapter = null): ?array {
    // Busca primero por capítulo si viene indicado, si no, intenta plano
    $paths = [];
    if ($chapter) $paths[] = Config::DATA_DIR . "/scenes/{$chapter}/{$sceneId}.json";
    $paths[] = Config::DATA_DIR . "/scenes/{$sceneId}.json";
    foreach ($paths as $p) {
      if (is_file($p)) return Util::readJson($p);
    }
    return null;
  }
}

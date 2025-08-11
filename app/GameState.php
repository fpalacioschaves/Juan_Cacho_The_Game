<?php
class GameState {
  private string $savePath;

  public function __construct(string $sessionId) {
    Util::ensureDirs();
    $dir = Config::SAVES_DIR . '/' . $sessionId;
    if (!is_dir($dir)) mkdir($dir, 0775, true);
    $this->savePath = $dir . '/' . Config::SAVE_FILE;
    if (!is_file($this->savePath)) $this->init();
  }

  public function get(): array {
    $state = Util::readJson($this->savePath);
    return is_array($state) ? $state : $this->init();
  }

  public function reset(): array {
    return $this->init(true);
  }

  public function patch(array $delta): array {
    $state = $this->get();

    // Validación simple (evitar sobrescrituras maliciosas)
    if (isset($delta['chapter']) && is_string($delta['chapter'])) {
      $state['player']['chapter'] = $delta['chapter'];
    }
    if (isset($delta['scene']) && is_string($delta['scene'])) {
      $state['player']['scene'] = $delta['scene'];
    }
    if (isset($delta['addItem']) && is_string($delta['addItem'])) {
      if (!in_array($delta['addItem'], $state['player']['inventory'], true)) {
        $state['player']['inventory'][] = $delta['addItem'];
      }
    }
    if (isset($delta['flags']) && is_array($delta['flags'])) {
      foreach ($delta['flags'] as $k => $v) {
        $state['player']['flags'][$k] = $v;
      }
    }

    Util::writeJson($this->savePath, $state);
    return $state;
  }

  private function init(bool $force = false): array {
    $game = Util::readJson(Config::DATA_DIR . '/game.json');
    $start = $game['start'] ?? ['chapter' => 'c1', 'scene' => 'piso-juan'];
    $state = [
      'player' => [
        'chapter' => $start['chapter'],
        'scene' => $start['scene'],
        'inventory' => [],
        'flags' => []
      ],
      'world' => [
        'visited' => [],
        'unlockedLocations' => ['piso-juan','portal','bar-dudu','academia'],
        'evidence' => []
      ]
    ];
    Util::writeJson($this->savePath, $state);
    return $state;
  }
}

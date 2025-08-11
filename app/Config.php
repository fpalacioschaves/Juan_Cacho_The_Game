<?php
class Config {
  public const DATA_DIR = __DIR__ . '/../data';
  public const STORAGE_DIR = __DIR__ . '/../storage';
  public const SAVES_DIR = __DIR__ . '/../storage/saves';
  public const LOCKS_DIR = __DIR__ . '/../storage/locks';
  public const SAVE_FILE = 'save.json'; // por sesión
  public const SEND_JSON_FLAGS = JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES;
}

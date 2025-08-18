Recarga del juego

localStorage.removeItem('STATE_V1'); location.reload();

o

GameState.reset();
Engine.gotoScene(SceneManager.getInitialSceneId());
UI.refreshInventory();

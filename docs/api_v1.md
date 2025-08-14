# API estable v1 — Juan Cacho, el Juego

Esta especificación es el “contrato” al que nos ceñimos a partir de ahora.

## HUD v1
Métodos garantizados:
- `setObjective(text: string): void`
- `addItem(item: {id: string, name?: string, icon?: string}): void`
- `setInventory(items: Array<Item>): void`
- `render(state?: GameState): void`

Notas:
- No se eliminarán ni cambiarán firmas en v1. Si hay extensiones, serán métodos nuevos y opcionales.

## Scene v1 (consumida por SceneManager)
- `onEnter(): Promise<void> | void`
- `onExit(): Promise<void> | void`
- Propiedades opcionales inyectadas: `hud`, `state`

## SaveManager v1
- `save(state: GameState): void`
- `load(): GameState | null`
- `migrate?(fromVersion: string, toVersion: string): GameState` (opcional)

## Feature Flags v1
- Fichero: `src/config/features.js`
- Export por defecto: objeto con flags booleanos. Todos OFF por defecto.

## Plugins v1
- Interfaz: `init(ctx: { state, sceneManager, features }): void`
- Los plugins no hacen nada si el flag correspondiente está en `false`.

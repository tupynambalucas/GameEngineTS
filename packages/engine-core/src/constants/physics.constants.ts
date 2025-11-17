export const PLAYER_PHYSICS = {
  SPEED: 5.0,
  JUMP_FORCE: 6.0,
  RUN_MULTIPLIER: 1.5,
  // Altura do raycast para detectar o chão
  GROUND_CHECK_DISTANCE: 0.1, 
};

export const WORLD_PHYSICS = {
  GRAVITY: [0, -15, 0] as [number, number, number],
};
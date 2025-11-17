export interface PlayerInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  emote: boolean; // <-- Adicionado
}

// Mapeamento de teclas (opcional, mas bom para configuração futura)
export type KeyBinding = Record<string, keyof PlayerInputState>;
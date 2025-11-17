// O que o cliente envia para o servidor
export interface PlayerInput {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
}

// O que o servidor envia para os clientes
export interface PlayerState {
  id: string; // socket.id
  position: { x: number; y: number; z: number };
  rotation: { w: number; x: number; y: number; z: number };
}

export interface GameState {
  players: Record<string, PlayerState>;
}

// --- Definições de Tipos para o Socket.IO ---

// Eventos que o servidor envia ao cliente
export interface ServerToClientEvents {
  gameState: (state: GameState) => void;
}

// Eventos que o cliente envia ao servidor
export interface ClientToServerEvents {
  playerInput: (input: PlayerInput) => void;
}
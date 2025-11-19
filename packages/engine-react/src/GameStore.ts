import { create } from 'zustand';

type ScreenState = 'loading' | 'launcher' | 'lobby' | 'game';

interface GameState {
  isPlaying: boolean;
  currentScreen: ScreenState;
  goToLauncher: () => void;
  goToLobby: () => void;
  goToGame: () => void;

  isEmoteWheelOpen: boolean;
  currentEmoteSelection: string | null;
  openEmoteWheel: () => void;
  closeEmoteWheel: () => string | null;
  setEmoteSelection: (emote: string | null) => void;

  isPointerLocked: boolean;
  setPointerLock: (isLocked: boolean) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  isPlaying: false,
  currentScreen: 'loading',

  goToLauncher: () => set({ currentScreen: 'launcher', isPlaying: false }),
  goToLobby: () => set({ currentScreen: 'lobby', isPlaying: false }),
  goToGame: () => set({ currentScreen: 'game', isPlaying: true }),

  isEmoteWheelOpen: false,
  currentEmoteSelection: null,

  openEmoteWheel: () => {
    set({ isEmoteWheelOpen: true, currentEmoteSelection: null });
  },

  closeEmoteWheel: () => {
    const selected = get().currentEmoteSelection;
    set({ isEmoteWheelOpen: false, currentEmoteSelection: null });
    return selected;
  },

  setEmoteSelection: (emote) => {
    console.log(`Emote selected: ${emote}`);
    set({ currentEmoteSelection: emote });
  },

  isPointerLocked: false,
  setPointerLock: (isLocked) => {
    set({ isPointerLocked: isLocked });
  },
}));
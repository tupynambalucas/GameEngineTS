import { setup, assign } from 'xstate';

export type PlayerEvent =
  | { type: 'WALK' }
  | { type: 'RUN' }
  | { type: 'JUMP' }
  | { type: 'STOP' }
  | { type: 'STOP_RUN' }
  | { type: 'LAND' } 
  | { type: 'ANIM_FINISHED'; isMoving: boolean; isSprinting: boolean }
  | { type: 'EMOTE'; emoteName: string } 
  | { type: 'EMOTE_FINISHED' };

export interface PlayerContext {
  currentEmote: string | null;
}

const playerSetup = setup({
  types: {
    context: {} as PlayerContext,
    events: {} as PlayerEvent,
  },
});

export const PlayerStateMachine = playerSetup.createMachine({
  id: 'player',
  initial: 'idle',
  context: {
    currentEmote: null,
  },
  states: {
    idle: {
      on: {
        WALK: { target: 'walking' },
        RUN: { target: 'running' }, 
        JUMP: { target: 'jumping' }, 
        EMOTE: {
          target: 'emoting',
          actions: assign({
            currentEmote: ({ event }) => event.type === 'EMOTE' ? event.emoteName : null
          }),
        },
      },
    },
    walking: {
      on: {
        STOP: { target: 'idle' },
        JUMP: { target: 'walkingJumping' }, 
        RUN: { target: 'running' },
        EMOTE: {
          target: 'emoting',
          actions: assign({
            currentEmote: ({ event }) => event.type === 'EMOTE' ? event.emoteName : null
          }),
        },
      },
    },
    running: {
      on: {
        STOP: { target: 'idle' },
        STOP_RUN: { target: 'walking' },
        JUMP: { target: 'runningJumping' }, 
      },
    },
    jumping: {
      on: {
        // FIX: LAND agora vai direto para idle. 
        // Se o jogador estiver segurando teclas, o loop do Player.tsx enviará WALK/RUN no frame seguinte.
        LAND: { target: 'idle' },
      },
    },
    walkingJumping: {
      on: {
        LAND: { target: 'idle' },
      },
    },
    runningJumping: {
      on: {
        LAND: { target: 'idle' },
      },
    },
    // O estado 'landing' foi removido/simplificado pois causava deadlock sem animação
    emoting: {
      on: {
        WALK: { target: 'walking', actions: assign({ currentEmote: null }) },
        RUN: { target: 'running', actions: assign({ currentEmote: null }) },
        EMOTE_FINISHED: {
          target: 'idle',
          actions: assign({ currentEmote: null }),
        }
      },
    },
  },
});
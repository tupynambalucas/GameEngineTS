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
        JUMP: { target: 'jumping' }, // Pulo parado
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
        JUMP: { target: 'walkingJumping' }, // ALTERADO: Agora vai para WalkingJumping
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
        JUMP: { target: 'runningJumping' }, // Pulo correndo
      },
    },
    jumping: {
      on: {
        LAND: { target: 'landing' },
      },
    },
    // NOVO ESTADO
    walkingJumping: {
      on: {
        LAND: { target: 'landing' },
      },
    },
    runningJumping: {
      on: {
        LAND: { target: 'landing' },
      },
    },
    landing: {
      on: {
        ANIM_FINISHED: [
          {
            target: 'running',
            guard: ({ event }) => event.type === 'ANIM_FINISHED' && event.isMoving && event.isSprinting,
          },
          {
            target: 'walking',
            guard: ({ event }) => event.type === 'ANIM_FINISHED' && event.isMoving,
          },
          {
            target: 'idle',
          },
        ],
      },
    },
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
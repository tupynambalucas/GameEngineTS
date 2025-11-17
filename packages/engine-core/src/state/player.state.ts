import { createMachine } from 'xstate';

type PlayerEvent =
  | { type: 'WALK' }
  | { type: 'RUN' }
  | { type: 'JUMP' }
  | { type: 'STOP' }
  | { type: 'STOP_RUN' }
  | { type: 'LAND' } 
  | { type: 'ANIM_FINISHED'; isMoving: boolean; isSprinting: boolean }
  | { type: 'EMOTE' }
  | { type: 'EMOTE_FINISHED' };

export const PlayerStateMachine = createMachine({
  id: 'player',
  initial: 'idle',
  types: {
    events: {} as PlayerEvent,
  },
  states: {
    idle: {
      on: {
        WALK: 'walking',
        JUMP: 'jumping',
        EMOTE: 'emoting',
      },
    },
    walking: {
      on: {
        STOP: 'idle',
        JUMP: 'jumping',
        RUN: 'running',
        EMOTE: 'emoting',
      },
    },
    running: {
      on: {
        STOP: 'idle',
        STOP_RUN: 'walking',
        JUMP: 'runningJumping',
      },
    },
    jumping: {
      on: {
        LAND: 'landing',
      },
    },
    runningJumping: {
      on: {
        LAND: 'landing',
      },
    },
    landing: {
      on: {
        ANIM_FINISHED: [
          {
            target: 'running',
            guard: ({ event }) => event.isMoving && event.isSprinting,
          },
          {
            target: 'walking',
            guard: ({ event }) => event.isMoving,
          },
          {
            target: 'idle',
          },
        ],
      },
    },
    emoting: {
      on: {
        EMOTE_FINISHED: 'idle',
      },
    },
  },
});
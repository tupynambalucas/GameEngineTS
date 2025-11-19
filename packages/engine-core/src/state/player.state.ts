import { createMachine, assign } from 'xstate';

type PlayerEvent =
  | { type: 'WALK' }
  | { type: 'RUN' }
  | { type: 'JUMP' }
  | { type: 'STOP' }
  | { type: 'STOP_RUN' }
  | { type: 'LAND' } 
  | { type: 'ANIM_FINISHED'; isMoving: boolean; isSprinting: boolean }
  | { type: 'EMOTE'; emoteName: string } 
  | { type: 'EMOTE_FINISHED' };

interface PlayerContext {
  currentEmote: string | null;
}

export const PlayerStateMachine = createMachine<PlayerContext, PlayerEvent>({
  id: 'player',
  initial: 'idle',
  context: {
    currentEmote: null,
  },
  types: {
    events: {} as PlayerEvent,
  },
  states: {
    idle: {
      on: {
        WALK: 'walking',
        JUMP: 'jumping',
        EMOTE: {
          target: 'emoting',
          actions: assign({
            currentEmote: ({ event }) => event.emoteName,
          }),
        },
      },
    },
    walking: {
      on: {
        STOP: 'idle',
        JUMP: 'jumping',
        RUN: 'running',
        EMOTE: {
          target: 'emoting',
          actions: assign({
            currentEmote: ({ event }) => event.emoteName,
          }),
        },
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
        EMOTE_FINISHED: {
          target: 'idle',
          actions: assign({
            currentEmote: null,
          }),
        }
      },
    },
  },
});
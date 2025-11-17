import { useState, useEffect } from 'react';
import { PlayerInputState } from '@tupynambagame/engine-core';

const defaultInput: PlayerInputState = {
  forward: false,
  backward: false,
  left: false,
  right: false,
  jump: false,
  sprint: false,
  emote: false,
};

export const useInputControls = () => {
  const [input, setInput] = useState<PlayerInputState>(defaultInput);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyB') return; 

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInput((prev) => ({ ...prev, forward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInput((prev) => ({ ...prev, backward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInput((prev) => ({ ...prev, left: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInput((prev) => ({ ...prev, right: true }));
          break;
        case 'Space':
          setInput((prev) => ({ ...prev, jump: true }));
          break;
        case 'ShiftLeft':
          setInput((prev) => ({ ...prev, sprint: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyB') return;

      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInput((prev) => ({ ...prev, forward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInput((prev) => ({ ...prev, backward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInput((prev) => ({ ...prev, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInput((prev) => ({ ...prev, right: false }));
          break;
        case 'Space':
          setInput((prev) => ({ ...prev, jump: false }));
          break;
        case 'ShiftLeft':
          setInput((prev) => ({ ...prev, sprint: false }));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return input;
};
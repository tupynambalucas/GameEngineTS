import React from 'react';
import { useGameStore } from '../../GameStore';
import wheelStyles from '../css-module/player/emote-wheel.module.css';

const EMOTES = ["Breakdance", "Waving", "Shuffling"];

export const EmoteWheel: React.FC = () => {
  const isEmoteWheelOpen = useGameStore((state) => state.isEmoteWheelOpen);
  const setEmoteSelection = useGameStore((state) => state.setEmoteSelection);

  if (!isEmoteWheelOpen) {
    return null;
  }

  return (
    <div 
      className={wheelStyles.wheelContainer}
      onMouseLeave={() => setEmoteSelection(null)}
    >
      {EMOTES.map((emote, index) => (
        <div
          key={emote}
          className={wheelStyles.wheelItem}
          style={{
            '--i': index,
            '--total': EMOTES.length,
          } as React.CSSProperties}
          onMouseEnter={() => setEmoteSelection(emote)}
        >
          {emote}
        </div>
      ))}
    </div>
  );
};
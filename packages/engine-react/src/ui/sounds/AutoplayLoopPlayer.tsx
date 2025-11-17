import React, { useRef, useState, useEffect } from 'react';
import * as Tone from 'tone';

// Define the component's props
interface AutoplayLoopPlayerProps {
  soundFile: string; // e.g., "techno-loop.mp3" or "ambient-pad.wav"
}

const AutoplayLoopPlayer: React.FC<AutoplayLoopPlayerProps> = ({ soundFile }) => {
  // 1. Set the initial playing state to true for autoplay
  const [isPlaying, setIsPlaying] = useState(true);
  const playerRef = useRef<Tone.Player | null>(null);

  // This effect runs whenever the `soundFile` prop changes
  useEffect(() => {
    // Since we're in Electron, we can start the audio context programmatically.
    const startAudio = async () => {
      await Tone.start();
      console.log('AudioContext started for autoplay.');
    };

    // Ensure the context is running before creating the player
    startAudio();

    const soundUrl = `../../assets/sounds/background/${soundFile}`;
    
    // 2. Re-enable autostart and set the initial state
    const player = new Tone.Player({
      url: soundUrl,
      loop: true,
      autostart: true, // Autoplay is enabled
      onload: () => {
        console.log(`Sound "${soundFile}" loaded and playing automatically.`);
      },
    }).toDestination();

    playerRef.current = player;
    setIsPlaying(true); // Ensure state is true when new sound loads

    // Cleanup function: runs when component unmounts or `soundFile` changes
    return () => {
      player?.stop();
      player?.dispose();
    };
  }, [soundFile]); // Rerun effect when the sound file changes

  // Function to handle the play/pause logic
  const togglePlayPause = () => {
    // The audio context is already started, so we just control the player.
    if (playerRef.current) {
      if (isPlaying) {
        playerRef.current.stop();
      } else {
        // Use start() to resume the loop from the beginning
        playerRef.current.start();
      }
      // Update the state to reflect the change
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <h1 onClick={togglePlayPause} style={{ cursor: 'pointer', userSelect: 'none' }}>
      {/* Change the emoji based on the playing state */}
      {isPlaying ? '🔊' : '🔇'}
    </h1>
  );
};

export default AutoplayLoopPlayer;
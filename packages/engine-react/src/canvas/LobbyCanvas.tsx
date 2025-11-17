import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { LobbyScene } from '../scenes/LobbyScene';
import { SimpleLoader } from '../ui/loaders/SimpleLoader';
import { useGameStore } from '../GameStore';

const playButtonStyle: React.CSSProperties = {
  position: 'absolute',
  bottom: '10%',
  left: '50%',
  transform: 'translateX(-50%)',
  padding: '15px 30px',
  fontSize: '1.5rem',
  color: 'white',
  background: '#4CAF50',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  zIndex: 10,
};

const LobbyCanvas: React.FC = () => {
  const goToGame = useGameStore((state) => state.goToGame);

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#222' }}>
      
      <button style={playButtonStyle} onClick={goToGame}>
        Play
      </button>

      <Canvas camera={{ position: [0, 0.5, 3], fov: 50 }}>
        <Suspense fallback={<Html><SimpleLoader message="Carregando Lobby..." /></Html>}>
          <LobbyScene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default LobbyCanvas;
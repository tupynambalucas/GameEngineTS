import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { LoaderScreen } from '../ui/loaders/LoaderScreen';
import { GameScene } from '../scenes/GameScene';
import { Html } from '@react-three/drei';
import { EmoteWheel } from '../ui/player/EmoteWheel';
import { useGameStore } from '../GameStore';

const GameCanvas: React.FC = () => {
  const setPointerLock = useGameStore((state) => state.setPointerLock);

  useEffect(() => {
    const onPointerLockChange = () => {
      const isLocked = !!document.pointerLockElement;
      setPointerLock(isLocked);
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    return () => {
      document.removeEventListener('pointerlockchange', onPointerLockChange);
    };
  }, [setPointerLock]);

  return (
    <div style={{ height: '100vh', width: '100vw', background: '#000', position: 'relative' }}>
      
      <EmoteWheel />

      <Canvas 
        shadows 
        camera={{ position: [0, 5, 10], fov: 50 }}
        onPointerDown={(e) => {
          (e.target as HTMLElement).requestPointerLock();
        }}
      >
        <Suspense fallback={<Html><LoaderScreen /></Html>}>
          <GameScene />
        </Suspense>
      </Canvas>
      
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', pointerEvents: 'none' }}>
        <h1>In Game</h1>
        <p>Clique na tela para controlar a câmera</p>
        <p>WASD para mover | Shift para correr | Scroll para zoom</p>
      </div>

    </div>
  );
};

export default GameCanvas;
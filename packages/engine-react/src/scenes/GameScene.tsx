import React, { useRef, useState, useCallback } from 'react'; // <--- Adicione useCallback
import { Physics, RapierRigidBody } from '@react-three/rapier';
import { Sky, Environment } from '@react-three/drei';
import { Player } from '../player/Player';
import { CameraController } from '../player/CameraController';
import { GameMap } from '../world/map/Map'; // Certifique-se do caminho correto (Map ou GameMap)
import { WORLD_PHYSICS } from '@tupynambagame/engine-core';
import NightclubUrl from '@tupynambagame/engine-assets/local/models/maps/nightclub.glb'; 

export const GameScene: React.FC = () => {
  const playerRef = useRef<RapierRigidBody>(null);
  const [spawnPos, setSpawnPos] = useState<[number, number, number] | null>(null);

  // FIX: Use useCallback para garantir que essa função seja a mesma entre renders
  const handleSpawnFound = useCallback((pos: [number, number, number]) => {
    setSpawnPos((current) => {
      // Só atualiza se for diferente para evitar re-render desnecessário
      if (!current) return pos;
      if (current[0] === pos[0] && current[1] === pos[1] && current[2] === pos[2]) return current;
      return pos;
    });
  }, []);

  return (
    <>
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
      />

      <Physics debug gravity={WORLD_PHYSICS.GRAVITY}>
        
        <GameMap 
          mapUrl={NightclubUrl} 
          onSpawnFound={handleSpawnFound} // <--- Passa a função memoizada
        />

        {spawnPos && (
          <Player 
            ref={playerRef} 
            initialPosition={spawnPos} 
          />
        )}

      </Physics>
      
      {spawnPos && <CameraController target={playerRef} />}
    </>
  );
};
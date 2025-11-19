import React from 'react';
import { useGLTF, Environment } from '@react-three/drei';
import AmyUrl from '@tupynambagame/engine-assets/local/models/characters/Amy.glb';
import { Npc } from '../world/npc/Npc';

export const LobbyScene: React.FC = () => {
  const { scene } = useGLTF(AmyUrl);

  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <group position={[0, -1, 0]}>
        <primitive object={scene} scale={1.2} />
      </group>
      
      <Npc 
        modelUrl={AmyUrl} 
        emoteName="Waving"
        position={[-1.5, -1, 0]}
        rotation={[0,0.5,0]}
      />
    </>
  );
};
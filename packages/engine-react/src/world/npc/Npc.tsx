import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useEmoteAnimations } from '../../hooks/useEmoteAnimations';

interface NpcProps {
  modelUrl: string;
  emoteName: string;
  position: [number, number, number];
  rotation: [number, number, number];
}

export const Npc: React.FC<NpcProps> = ({ modelUrl, emoteName, position, rotation }) => {
  const characterRef = useRef<THREE.Group | null>(null);
  const { scene } = useGLTF(modelUrl);

  useEmoteAnimations({
    groupRef: characterRef,
    emoteName: emoteName,
    loop: true,
    onEmoteFinished: () => {},
  });

  return (
    <group position={position} rotation={rotation}>
      <primitive 
        object={scene} 
        ref={characterRef} 
        scale={1.2} 
      />
    </group>
  );
};
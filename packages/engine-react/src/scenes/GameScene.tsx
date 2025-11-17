import React, { useRef } from 'react';
import { Physics, RigidBody, RapierRigidBody } from '@react-three/rapier';
import { Sky, Environment } from '@react-three/drei';
import { Player } from '../player/Player';
import { CameraController } from '../player/CameraController';
import { WORLD_PHYSICS } from '@tupynambagame/engine-core';

const Floor = () => (
  <RigidBody type="fixed" colliders="cuboid">
    <mesh position={[0, -1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#444" />
    </mesh>
  </RigidBody>
);

export const GameScene: React.FC = () => {
  const playerRef = useRef<RapierRigidBody>(null);

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
        <Player ref={playerRef} />
        <Floor />
      </Physics>

      <CameraController target={playerRef} />
    </>
  );
};
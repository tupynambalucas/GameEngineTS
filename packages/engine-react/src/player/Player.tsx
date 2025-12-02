import React, { useRef, forwardRef, useImperativeHandle, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import {
  RigidBody,
  CapsuleCollider,
  RapierRigidBody,
  useRapier,
  RapierCollider,
} from '@react-three/rapier';
import * as THREE from 'three';
import { useMachine } from '@xstate/react';
import { SkeletonUtils } from 'three-stdlib';

import AmyUrl from '@tupynambagame/engine-assets/local/models/characters/AmyTest.glb';
import { useInputControls } from './useInputControls';
import { PLAYER_PHYSICS, PlayerStateMachine } from '@tupynambagame/engine-core';
import { useCharacterAnimations } from './useCharacterAnimations';
import { useEmoteAnimations } from '../hooks/useEmoteAnimations';
import { useGameStore } from '../GameStore';

interface PlayerProps {
  initialPosition?: [number, number, number];
}

export const Player = forwardRef<RapierRigidBody, PlayerProps>(({ initialPosition = [0, 5, 0] }, ref) => {
  const internalRef = useRef<RapierRigidBody>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const colliderRef = useRef<RapierCollider | null>(null);

  const { scene: gltfScene } = useGLTF(AmyUrl);
  
  const input = useInputControls();
  const { camera, gl } = useThree(); 
  const { rapier, world } = useRapier();

  const [state, send] = useMachine(PlayerStateMachine);
  const jumpPressed = useRef(false);

  const openEmoteWheel = useGameStore((s) => s.openEmoteWheel);
  const closeEmoteWheel = useGameStore((s) => s.closeEmoteWheel);

  const { processedScene, colliderProps, modelOffset } = useMemo(() => {
    if (!gltfScene) return { processedScene: null, colliderProps: null, modelOffset: [0,0,0] };

    const scene = SkeletonUtils.clone(gltfScene) as THREE.Group;
    
    scene.position.set(0,0,0);
    scene.rotation.set(0,0,0);
    scene.scale.set(1,1,1);
    
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    
    box.getSize(size);
    box.getCenter(center);

    let height = size.y;
    let width = Math.max(size.x, size.z);

    if (height < 0.5) {
      height = 1.7;
      width = 0.5;
    }

    const offsetX = -center.x;
    const offsetZ = -center.z;
    const offsetY = -box.min.y; 

    let radius = width / 2;
    if (radius > height / 3) radius = height / 4; 
    if (radius < 0.2) radius = 0.2;

    let halfHeight = (height / 2) - radius;
    if (halfHeight < 0) halfHeight = 0;

    return {
      processedScene: scene,
      colliderProps: {
        args: [halfHeight, radius] as [number, number],
        position: [0, (halfHeight + radius), 0] as [number, number, number]
      },
      modelOffset: [offsetX, offsetY, offsetZ] as [number, number, number]
    };
  }, [gltfScene]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.code === 'KeyB' && !state.matches('emoting')) {
        if (document.pointerLockElement) document.exitPointerLock();
        openEmoteWheel();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyB') {
        const selectedEmote = closeEmoteWheel();
        if (selectedEmote) send({ type: 'EMOTE', emoteName: selectedEmote }); 
        setTimeout(() => { gl.domElement.requestPointerLock(); }, 50);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state, openEmoteWheel, closeEmoteWheel, send, gl]);

  const onLocomotionFinished = () => {
    const isMoving = input.forward || input.backward || input.left || input.right;
    send({ type: 'ANIM_FINISHED', isMoving: isMoving, isSprinting: input.sprint });
  };
  
  const onEmoteFinished = () => {
    send({ type: 'EMOTE_FINISHED' });
    if (document.pointerLockElement !== gl.domElement) {
        gl.domElement.requestPointerLock();
    }
  };

  useCharacterAnimations(
    characterRef, 
    state.matches('emoting') ? null : (state.value as string),
    onLocomotionFinished
  );
  
  useEmoteAnimations({
    groupRef: characterRef,
    emoteName: state.context.currentEmote, 
    loop: false,
    onEmoteFinished: onEmoteFinished,
  });

  useImperativeHandle(ref, () => internalRef.current!);

  useFrame(() => {
    if (!internalRef.current || !characterRef.current) return;

    if (state.matches('emoting')) {
      const isTryingToMove = input.forward || input.backward || input.left || input.right;
      if (isTryingToMove) {
        send({ type: input.sprint ? 'RUN' : 'WALK' });
        if (document.pointerLockElement !== gl.domElement) gl.domElement.requestPointerLock();
      }
      internalRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return; 
    }

    const velocity = internalRef.current.linvel();
    const cameraForward = new THREE.Vector3();
    const cameraRight = new THREE.Vector3();
    
    camera.getWorldDirection(cameraForward);
    cameraForward.y = 0;
    cameraForward.normalize();
    cameraRight.crossVectors(cameraForward, new THREE.Vector3(0, 1, 0));

    const direction = new THREE.Vector3();
    if (input.forward) direction.add(cameraForward);
    if (input.backward) direction.sub(cameraForward);
    if (input.right) direction.add(cameraRight);
    if (input.left) direction.sub(cameraRight);
    direction.normalize();

    if (direction.length() > 0.1) {
      const angle = Math.atan2(direction.x, direction.z);
      const targetRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      const currentRotation = new THREE.Quaternion().copy(internalRef.current.rotation());
      currentRotation.slerp(targetRotation, 0.15);
      internalRef.current.setRotation(currentRotation, true);
    }

    const speed = input.sprint
      ? PLAYER_PHYSICS.SPEED * PLAYER_PHYSICS.RUN_MULTIPLIER
      : PLAYER_PHYSICS.SPEED;
    direction.multiplyScalar(speed);

    internalRef.current.setLinvel(
      { x: direction.x, y: velocity.y, z: direction.z },
      true
    );

    const playerPos = internalRef.current.translation();
    const rayOrigin = { x: playerPos.x, y: playerPos.y + 0.5, z: playerPos.z };
    const rayDir = { x: 0, y: -1, z: 0 };
    const rayLength = 0.6 + PLAYER_PHYSICS.GROUND_CHECK_DISTANCE; 

    const hit = world.castRay(
      new rapier.Ray(rayOrigin, rayDir),
      rayLength,
      true,
      undefined,
      undefined,
      colliderRef.current || undefined
    );

    const isGrounded = hit !== null; 
    const isMoving = direction.length() > 0.1;

    if (!input.jump) jumpPressed.current = false;

    if (
        state.matches('jumping') || 
        state.matches('runningJumping') || 
        state.matches('walkingJumping')
    ) {
      if (isGrounded && velocity.y <= 0.1) {
        send({ type: 'LAND' });
      }
    } else if (isGrounded) {
      if (input.jump && !jumpPressed.current) {
        jumpPressed.current = true;
        
        const mass = internalRef.current.mass();
        internalRef.current.setLinvel({ x: velocity.x, y: 0, z: velocity.z }, true);
        internalRef.current.applyImpulse({ 
            x: 0, 
            y: PLAYER_PHYSICS.JUMP_FORCE * mass, 
            z: 0 
        }, true);
        
        send({ type: 'JUMP' });
      }

      if (isMoving && !jumpPressed.current) {
        if (input.sprint && !state.matches('running')) send({ type: 'RUN' });
        else if (!input.sprint && !state.matches('walking')) send({ type: 'WALK' });
      } else if (!isMoving && !jumpPressed.current) {
        if (state.matches('walking') || state.matches('running')) send({ type: 'STOP' });
      }
    }

    if (state.matches('running') && !input.sprint && isMoving) send({ type: 'STOP_RUN' });
  });

  if (!processedScene || !colliderProps) return null;

  return (
    <RigidBody
      ref={internalRef}
      colliders={false} 
      position={initialPosition}
      enabledRotations={[false, false, false]} 
      friction={0}
      ccd={true}
      linearDamping={0.5}
    >
      <CapsuleCollider
        ref={colliderRef}
        args={colliderProps.args}
        position={colliderProps.position}
        friction={0}
      />
      
      <group position={modelOffset}>
          <primitive
              object={processedScene}
              scale={1.0}
              ref={characterRef}
          />
      </group>
    </RigidBody>
  );
});
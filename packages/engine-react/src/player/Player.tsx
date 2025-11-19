import React, { useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
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

import AmyUrl from '@tupynambagame/engine-assets/local/models/characters/Amy.glb';
import { useInputControls } from './useInputControls';
import { PLAYER_PHYSICS, PlayerStateMachine } from '@tupynambagame/engine-core';
import { useCharacterAnimations } from './useCharacterAnimations';
import { useEmoteAnimations } from '../hooks/useEmoteAnimations';
import { useGameStore } from '../GameStore';

export const Player = forwardRef<RapierRigidBody>((props, ref) => {
  const internalRef = useRef<RapierRigidBody>(null);
  const characterRef = useRef<THREE.Group | null>(null);
  const colliderRef = useRef<RapierCollider | null>(null);

  const { scene } = useGLTF(AmyUrl);
  const input = useInputControls();
  
  // Acesso ao gl para manipular o canvas DOM element diretamente (importante para pointer lock)
  const { camera, gl } = useThree(); 
  const { rapier, world } = useRapier();

  const [state, send] = useMachine(PlayerStateMachine);
  const jumpPressed = useRef(false);

  const openEmoteWheel = useGameStore((s) => s.openEmoteWheel);
  const closeEmoteWheel = useGameStore((s) => s.closeEmoteWheel);
  const isPointerLocked = useGameStore((s) => s.isPointerLocked);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Previne disparos múltiplos ao segurar a tecla
      if (e.repeat) return;

      // Abre o menu e solta o mouse
      if (e.code === 'KeyB' && !state.matches('emoting')) {
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
        openEmoteWheel();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyB') {
        // Fecha a UI e recupera qual emote foi selecionado (se houver)
        const selectedEmote = closeEmoteWheel();
        
        if (selectedEmote) {
          send({ type: 'EMOTE', emoteName: selectedEmote }); 
        } 
        
        // setTimeout garante que o React teve tempo de remover a UI do EmoteWheel
        // antes de solicitar o pointer lock novamente.
        setTimeout(() => {
          gl.domElement.requestPointerLock();
        }, 50);
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
    // Segurança extra: se a animação acabou e não estamos travados, trava novamente
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

    // --- Lógica enquanto está fazendo Emote ---
    if (state.matches('emoting')) {
      const isTryingToMove = input.forward || input.backward || input.left || input.right;
      
      // Se o jogador tentar andar, cancela o emote
      if (isTryingToMove) {
        send({ type: input.sprint ? 'RUN' : 'WALK' });
        
        // Garante que o pointer lock esteja ativo ao cancelar o emote
        if (document.pointerLockElement !== gl.domElement) {
            gl.domElement.requestPointerLock();
        }
      }

      // Zera a velocidade física durante o emote para ele não deslizar
      internalRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
      return; 
    }

    // --- Lógica padrão de movimento ---

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

      const targetRotation = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angle
      );
      const currentRotation = new THREE.Quaternion().copy(
        internalRef.current.rotation()
      );
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
    const rayOrigin = playerPos;
    const rayDir = { x: 0, y: -1, z: 0 };
    const rayLength = 0.1 + PLAYER_PHYSICS.GROUND_CHECK_DISTANCE;

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

    if (!input.jump) {
      jumpPressed.current = false;
    }

    // --- Lógica de Estados de Pulo e Aterrissagem ---
    if (state.matches('landing')) {
       // Aguarda animação de landing (controlada por onLocomotionFinished)
    } else if (
      state.matches('jumping') || 
      state.matches('runningJumping') || 
      state.matches('walkingJumping') // <--- ADICIONADO: Suporte ao novo estado
    ) {
      if (isGrounded) {
        send({ type: 'LAND' });
      }
    } else if (isGrounded) {
      if (input.jump && !jumpPressed.current) {
        jumpPressed.current = true;
        internalRef.current.applyImpulse(
          { x: 0, y: PLAYER_PHYSICS.JUMP_FORCE, z: 0 },
          true
        );
        send({ type: 'JUMP' });
      }

      if (isMoving && !jumpPressed.current) {
        if (input.sprint && !state.matches('running')) {
          send({ type: 'RUN' });
        } else if (!input.sprint && !state.matches('walking')) {
          send({ type: 'WALK' });
        }
      } else if (!isMoving && !jumpPressed.current) {
        if (state.matches('walking') || state.matches('running')) {
          send({ type: 'STOP' });
        }
      }
    }

    if (state.matches('running') && !input.sprint && isMoving) {
      send({ type: 'STOP_RUN' });
    }

    characterRef.current.position.set(0, 0, 0);
  });

  return (
    <RigidBody
      ref={internalRef}
      colliders={false}
      position={[0, 5, 0]}
      enabledRotations={[false, false, false]}
      friction={0}
    >
      <CapsuleCollider
        ref={colliderRef}
        args={[0.5, 0.5]}
        position={[0, 0.9, 0]}
      />
      <primitive
        object={scene}
        scale={1.0}
        ref={characterRef}
        position={[0, 0, 0]}
      />
    </RigidBody>
  );
});
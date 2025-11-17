import { useEffect, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import LocomotionUrl from '@tupynambagame/engine-assets/local/animations/locomotion.glb';

const ANIMATION_MAP = {
  idle: 'Idle',
  walking: 'Walking',
  running: 'Running',
  jumping: 'Jumping',
  runningJumping: 'RunningJumping',
};

export const useCharacterAnimations = (
  groupRef: React.RefObject<THREE.Group | null>,
  currentState: string,
  onAnimationFinished: () => void
) => {
  const { animations } = useGLTF(LocomotionUrl);
  const { actions } = useAnimations(animations, groupRef);

  const animFinishedCallback = useRef(onAnimationFinished);
  animFinishedCallback.current = onAnimationFinished;

  const currentAnimation = useRef<string | null>(null);

  useEffect(() => {
    if (!actions || !groupRef.current) return;

    if (currentState === 'landing') {
      return;
    }

    // @ts-ignore
    const nextActionName = ANIMATION_MAP[currentState] || 'Idle';

    if (nextActionName === currentAnimation.current) {
      return;
    }

    const current = actions[nextActionName];
    if (!current) return;

    const oldAnimation = actions[currentAnimation.current!];
    if (oldAnimation) {
      oldAnimation.fadeOut(0.2);
    }

    currentAnimation.current = nextActionName;

    if (nextActionName === 'Jumping' || nextActionName === 'RunningJumping') {
      current.reset().fadeIn(0.2).play();
      current.setLoop(THREE.LoopOnce, 1);
      
      // 1. "CONGELA" A ANIMAÇÃO NO ÚLTIMO FRAME
      current.clampWhenFinished = true;

      const onFinish = (e: any) => {
        if (e.action === current) {
          const mixer = current.getMixer();
          mixer.removeEventListener('finished', onFinish);

          // 2. REMOVA A LÓGICA DO 'IDLE' - Não é mais necessário
          /*
          const idleAction = actions.Idle;
          if (idleAction) {
            idleAction.reset().play();
            currentAnimation.current = 'Idle';
          }
          */

          // 3. APENAS notifique a máquina de estados
          animFinishedCallback.current();
        }
      };

      const mixer = current.getMixer();
      mixer.removeEventListener('finished', onFinish);
      mixer.addEventListener('finished', onFinish);
    } else {
      current.reset().fadeIn(0.1).play();
      current.setLoop(THREE.LoopRepeat, Infinity);
      current.clampWhenFinished = false;
    }
  }, [actions, currentState, groupRef, animFinishedCallback]);

  return { actions };
};
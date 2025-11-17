import { useEffect, useRef } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import EmotesUrl from '@tupynambagame/engine-assets/local/animations/emotes.glb';

interface UseEmoteAnimationsProps {
  groupRef: React.RefObject<THREE.Group | null>;
  emoteName: string | null;
  loop: boolean;
  onEmoteFinished: () => void;
}

export const useEmoteAnimations = ({
  groupRef,
  emoteName,
  loop,
  onEmoteFinished,
}: UseEmoteAnimationsProps) => {
  const { animations } = useGLTF(EmotesUrl);
  const { actions, mixer } = useAnimations(animations, groupRef);

  const emoteFinishedCallback = useRef(onEmoteFinished);
  emoteFinishedCallback.current = onEmoteFinished;

  useEffect(() => {
    if (!actions || !groupRef.current || !emoteName) {
      return;
    }

    const currentAction = actions[emoteName];
    if (!currentAction) {
      console.warn(`Emote "${emoteName}" não encontrado.`);
      return;
    }

    Object.values(actions).forEach(action => {
      if (action && action !== currentAction) {
        action.fadeOut(0.2);
      }
    });

    currentAction.reset().fadeIn(0.2).play();
    
    let onFinish: ((e: any) => void) | undefined = undefined;

    if (loop) {
      currentAction.setLoop(THREE.LoopRepeat, Infinity);
    } else {
      currentAction.setLoop(THREE.LoopOnce, 1);
      currentAction.clampWhenFinished = true;

      onFinish = (e: any) => {
        if (e.action === currentAction) {
          mixer.removeEventListener('finished', onFinish!);
          emoteFinishedCallback.current();
        }
      };

      mixer.removeEventListener('finished', onFinish);
      mixer.addEventListener('finished', onFinish);
    }
    
    return () => {
      if (onFinish) {
        mixer.removeEventListener('finished', onFinish);
      }
      currentAction.fadeOut(0.2);
    }

  }, [actions, mixer, groupRef, emoteName, loop, emoteFinishedCallback]);

  return { actions };
};
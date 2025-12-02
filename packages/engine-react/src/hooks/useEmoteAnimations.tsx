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
  // Removi o console.log para limpar o output, pode descomentar se quiser debug
  const { animations } = useGLTF(EmotesUrl);
  const { actions, mixer } = useAnimations(animations, groupRef);

  const onFinishRef = useRef<((e: any) => void) | null>(null);

  useEffect(() => {
    if (!actions || !groupRef.current || !emoteName) {
      return;
    }

    const currentAction = actions[emoteName];
    
    if (!currentAction) {
      console.warn(`Emote "${emoteName}" não encontrado.`);
      onEmoteFinished(); 
      return;
    }

    // --- FIX: Lógica de repetição corrigida ---
    // Se for loop, usamos Infinity. Se não, usamos 1.
    const repetitions = loop ? Infinity : 1;
    const loopMode = loop ? THREE.LoopRepeat : THREE.LoopOnce;

    currentAction
        .reset()
        .fadeIn(0.2)
        .setLoop(loopMode, repetitions) // <--- Aqui estava o erro (estava fixo em 1)
        .play();

    currentAction.clampWhenFinished = !loop;

    // Handler de cleanup e finish
    const handleFinished = (e: any) => {
      if (e.action === currentAction) {
        onEmoteFinished();
      }
    };

    // Só adicionamos listener de 'finished' se NÃO for loop infinito
    if (!loop) {
      mixer.addEventListener('finished', handleFinished);
      onFinishRef.current = handleFinished;
    }

    return () => {
      currentAction.fadeOut(0.2);
      if (onFinishRef.current) {
        mixer.removeEventListener('finished', onFinishRef.current);
        onFinishRef.current = null;
      }
    };
  }, [actions, mixer, groupRef, emoteName, loop]); 

  return { actions };
};
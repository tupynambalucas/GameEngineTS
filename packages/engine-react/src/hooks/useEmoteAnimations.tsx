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
  console.log('Should run emoteName:', emoteName);
  const { animations } = useGLTF(EmotesUrl);
  // Adicione o <any> ou a tipagem correta se necessário para evitar conflito de types do Three
  const { actions, mixer } = useAnimations(animations, groupRef);

  const onFinishRef = useRef<((e: any) => void) | null>(null);

  useEffect(() => {
    // Se não tivermos actions, ref ou nome do emote, paramos tudo.
    if (!actions || !groupRef.current || !emoteName) {
      // Opcional: Fade out de segurança se o emoteName virar null abruptamente
      return;
    }

    const currentAction = actions[emoteName];
    
    if (!currentAction) {
      console.warn(`Emote "${emoteName}" não encontrado.`);
      // Se não achou a animação, encerra o estado de emote para não travar o boneco
      onEmoteFinished(); 
      return;
    }

    // Configura a animação
    currentAction.reset().fadeIn(0.2).setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, 1).play();
    currentAction.clampWhenFinished = !loop;

    // Handler de cleanup e finish
    const handleFinished = (e: any) => {
      if (e.action === currentAction) {
        onEmoteFinished();
      }
    };

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
  }, [actions, mixer, groupRef, emoteName, loop]); // Removi onEmoteFinished das deps para evitar re-subscriptions desnecessários

  return { actions };
};
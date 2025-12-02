import React from 'react';
import { Environment } from '@react-three/drei'; // Não precisa mais carregar useGLTF aqui se só usar no NPC
import AmyUrl from '@tupynambagame/engine-assets/local/models/characters/Amy.glb';
import { Npc } from '../world/npc/Npc';

export const LobbyScene: React.FC = () => {
  // Removemos o carregamento duplicado aqui para deixar o Npc gerenciar seu próprio modelo
  
  return (
    <>
      <Environment preset="city" />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      <Npc 
        modelUrl={AmyUrl} 
        emoteName="Waving"
        position={[-2, -1, 0]} // Centralizei ele um pouco melhor
        rotation={[0, 0, 0]}
      />
    </>
  );
};
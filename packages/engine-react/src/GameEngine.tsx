import './base.css'
import React, { Suspense, useEffect } from 'react'; 
import LauncherCanvas from './canvas/LauncherCanvas'
import GameCanvas from './canvas/GameCanvas'
import LobbyCanvas from './canvas/LobbyCanvas';
import AutoplayLoopPlayer from './ui/sounds/AutoplayLoopPlayer';
import launcherStyle from './ui/css-module/launcher.module.css'
import { SimpleLoader } from './ui/loaders/SimpleLoader'; 
import { useAuthStore } from './auth/AuthStore';
import { useGameStore } from './GameStore';
import { AuthForm } from './auth/AuthForm'; 

interface GameEngineProps {
  onGameStart?: () => void;
}

function GameEngine({ onGameStart }: GameEngineProps): React.JSX.Element {
  
  // --- A CORREÇÃO ESTÁ AQUI ---
  // Selecione cada valor individualmente.
  // Isso garante que as funções (verifyAuth) sejam estáveis
  // e que o componente só renderize se um valor de estado mudar.
  
  // Auth Store
  const isAuthLoading = useAuthStore(state => state.isAuthLoading);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const verifyAuth = useAuthStore(state => state.verifyAuth);

  // Game Store
  const currentScreen = useGameStore(state => state.currentScreen);
  const goToLauncher = useGameStore(state => state.goToLauncher);
  const goToLobby = useGameStore(state => state.goToLobby);
  
  // ------------------------------

  
  // Efeito 1: Verificação inicial (agora seguro)
  useEffect(() => {
    const checkAuth = async () => {
      await verifyAuth();
      const isLoggedIn = useAuthStore.getState().isAuthenticated;
      
      if (isLoggedIn) {
        goToLobby();
      } else {
        goToLauncher();
      }
    };
    
    if (currentScreen === 'loading') {
      checkAuth();
    }
  }, [verifyAuth, currentScreen, goToLauncher, goToLobby]);

  // Efeito 2: Reagir a mudanças no login (A CORREÇÃO)
  useEffect(() => {
    if (isAuthenticated && currentScreen === 'launcher') {
      goToLobby(); 
    }
  }, [isAuthenticated, currentScreen, goToLobby]);


  // Efeito 3: Lidar com onGameStart (para Electron)
  useEffect(() => {
    if (currentScreen === 'game') {
      if (onGameStart) {
        onGameStart();
      }
    }
  }, [currentScreen, onGameStart]);


  // Roteador de Tela
  switch (currentScreen) {
    
    case 'loading':
      return <SimpleLoader message="Verificando autenticação..." />;

    case 'launcher':
      return (
        <>
          <div className={launcherStyle.launcherScreen}>
            <AutoplayLoopPlayer soundFile={'launcher_background_music.mp3'} />
            <AuthForm />
          </div>
          <LauncherCanvas />
        </>
      );
    
    case 'lobby':
      return <LobbyCanvas />;
      
    case 'game':
      return <GameCanvas />;

    default:
      return <SimpleLoader message="Erro de estado!" />;
  }
}

export default GameEngine;
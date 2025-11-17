import { createRoot } from 'react-dom/client';
// Importa o Launcher da engine
import EngineReact from '@tupynambagame/engine-react/src/GameEngine';

const container = document.getElementById('root');
const root = createRoot(container!);

// Função que lida com o evento de play específico do Desktop
const handleDesktopGameStart = () => {
  console.log('Desktop: Solicitando tela cheia...');
  // Usa a API exposta pelo preload.ts
  // @ts-ignore (pois window.electron é injetado pelo preload)
  if (window.electron && window.electron.ipcRenderer) {
    // Envia uma mensagem para o processo principal (Main Process)
    // @ts-ignore
    window.electron.ipcRenderer.send('window-maximize');
  }
};

root.render(
  <EngineReact onGameStart={handleDesktopGameStart} />
);
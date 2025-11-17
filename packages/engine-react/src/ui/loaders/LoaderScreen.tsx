import React from 'react';
import { useProgress } from '@react-three/drei';

// Estilos simples para cobrir a tela e centralizar o conteúdo.
const loaderContainerStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: '#1A1A1A', // Cor de fundo da tela de carregamento
  color: '#FFFFFF',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 9999 // Garante que fique acima de todos os outros elementos da UI
};

const barContainerStyle: React.CSSProperties = {
  height: '10px',
  width: '300px',
  background: '#333',
  marginTop: '20px',
  borderRadius: '5px',
  overflow: 'hidden',
  boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)'
};

const getFillStyle = (progress: number): React.CSSProperties => ({
  height: '100%',
  width: `${progress}%`,
  background: '#4CAF50', // Cor da barra de progresso
  transition: 'width 0.2s'
});

/**
 * Componente que exibe a tela de carregamento com barra de progresso.
 * Usa useProgress para rastrear o carregamento de ativos 3D dentro do <Canvas>.
 */
export const LoaderScreen: React.FC = () => {
  // useProgress rastreia o carregamento de qualquer recurso no <Canvas>
  const { progress } = useProgress();

  return (
    <div style={loaderContainerStyle}>
      <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Carregando Jogo...</p>
      <div style={barContainerStyle}>
        <div style={getFillStyle(progress)} />
      </div>
      <p style={{ marginTop: '10px' }}>{progress.toFixed(0)}%</p>
    </div>
  );
};
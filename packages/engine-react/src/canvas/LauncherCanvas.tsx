import React, { Suspense, FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { LauncherScene } from '../scenes/LauncherScene';
import { SimpleLoader } from '../ui/loaders/SimpleLoader';
import { Html } from '@react-three/drei';

const LauncherCanvas: FC = () => {
  return (
    <div style={{ height: '100vh', width: '100vw', background: '#333', zIndex: '0' }}>
      <Canvas>
        <Suspense fallback={<Html><SimpleLoader message="Carregando..." /></Html>}>
          <LauncherScene />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default LauncherCanvas;
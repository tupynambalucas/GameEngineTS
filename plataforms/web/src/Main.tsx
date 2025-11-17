import React from 'react';
import { createRoot } from 'react-dom/client';

// Importa o Launcher da engine compartilhada usando o alias
import Launcher from '@engine/Launcher';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(<Launcher />);
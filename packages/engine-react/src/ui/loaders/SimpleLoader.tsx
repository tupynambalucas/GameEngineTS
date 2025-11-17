import React from 'react';
import SimpleLoaderStyle from '../css-module/loaders/simple-loader.module.css';

interface SimpleLoaderProps {
  message: string;
}

export const SimpleLoader: React.FC<SimpleLoaderProps> = ({ message }) => {
  return (
    // 1. Aplique o estilo inline
    <div className={SimpleLoaderStyle.simpleLoaderContainer}>
        <div>
            <p>{message}</p>
        </div>
    </div>
  );
};
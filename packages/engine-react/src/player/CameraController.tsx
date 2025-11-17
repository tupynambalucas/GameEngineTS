import React, { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import { CAMERA_SETTINGS } from '@tupynambagame/engine-core';

interface CameraControllerProps {
  target: React.RefObject<any>;
}

export const CameraController: React.FC<CameraControllerProps> = ({ target }) => {
  const { camera, gl } = useThree();
  
  const state = useRef({
    distance: 5,
    phi: Math.PI / 4,
    theta: 0,
    targetPosition: new Vector3(),
  });

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      state.current.distance = MathUtils.clamp(
        state.current.distance + e.deltaY * 0.001 * CAMERA_SETTINGS.zoomSpeed,
        CAMERA_SETTINGS.minZoom,
        CAMERA_SETTINGS.maxZoom
      );
    };

    const canvas = gl.domElement;
    canvas.addEventListener('wheel', handleWheel);
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [gl]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === gl.domElement) {
        state.current.theta -= e.movementX * CAMERA_SETTINGS.rotationSpeed;
        state.current.phi -= e.movementY * CAMERA_SETTINGS.rotationSpeed;
        state.current.phi = MathUtils.clamp(state.current.phi, 0.1, Math.PI / 2 - 0.1);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, [gl]);

  useFrame((_, delta) => {
    if (!target.current) return;

    const targetPos = target.current.translation 
      ? target.current.translation() 
      : target.current.position;

    state.current.targetPosition.lerp(
      new Vector3(targetPos.x, targetPos.y + CAMERA_SETTINGS.heightOffset, targetPos.z),
      delta / CAMERA_SETTINGS.smoothTime
    );

    const x = state.current.distance * Math.sin(state.current.phi) * Math.sin(state.current.theta);
    const y = state.current.distance * Math.cos(state.current.phi);
    const z = state.current.distance * Math.sin(state.current.phi) * Math.cos(state.current.theta);

    camera.position.set(
      state.current.targetPosition.x + x,
      state.current.targetPosition.y + y,
      state.current.targetPosition.z + z
    );

    camera.lookAt(state.current.targetPosition);
  });

  return null;
};
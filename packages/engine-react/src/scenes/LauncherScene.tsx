import React, { useMemo, FC, useRef } from 'react';
import Model from '@tupynambagame/engine-assets/local/models/scenes/LauncherCanvas.glb';
import { useGLTF, PerspectiveCamera, useHelper } from '@react-three/drei';
import * as THREE from 'three';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

function isPerspectiveCamera(cam: THREE.Camera): cam is THREE.PerspectiveCamera {
  return 'isPerspectiveCamera' in cam;
}

function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return (obj as THREE.Mesh).isMesh;
}

interface RectLightUserData {
  intensity?: number;
  color?: [number, number, number];
}

const RectLightInstance: FC<{ node: THREE.Mesh }> = ({ node }) => {
  const lightRef = useRef<THREE.RectAreaLight>(null!);
  useHelper(lightRef, RectAreaLightHelper, 'cyan');
  const { intensity, color } = (node.userData || {}) as RectLightUserData;
  const width = node.scale.x;
  const height = node.scale.y;
  const lightIntensity = intensity ?? 10.0;
  const lightColor = color ?? '#ffffff';
  
  return (
    <rectAreaLight
      ref={lightRef}
      position={node.position}
      rotation={node.rotation}
      width={width}
      height={height}
      color={lightColor}
      intensity={lightIntensity}
    />
  );
};

export const LauncherScene: FC = () => {
  const { scene, cameras, nodes } = useGLTF(Model);
  
  
  const blenderCamera = useMemo(() => cameras.find(isPerspectiveCamera), [cameras]);
  const existingLights = useMemo(() => {
    return Object.values(nodes).filter((node): node is THREE.Light => (node as THREE.Light).isLight);
  }, [nodes]);
  const rectLightPlaceholders = useMemo(() => {
    return Object.values(nodes).filter(
      (node): node is THREE.Mesh => isMesh(node) && node.name.startsWith('RectLight')
    );
  }, [nodes]);

  return (
    <>
      <primitive object={scene} />
      {existingLights.map((light) => (
        <primitive key={light.uuid} object={light.clone()} />
      ))}
      {rectLightPlaceholders.map((mesh) => (
        <RectLightInstance key={mesh.uuid} node={mesh} />
      ))}
      {blenderCamera ? (
        <PerspectiveCamera
          makeDefault
          position={blenderCamera.position}
          rotation={blenderCamera.rotation}
          fov={blenderCamera.fov}
          near={blenderCamera.near}
          far={blenderCamera.far}
        />
      ) : (
        <PerspectiveCamera makeDefault position={[0, 5, 10]} fov={60} />
      )}
    </>
  );
};
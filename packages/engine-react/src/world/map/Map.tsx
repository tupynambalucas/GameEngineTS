import React, { useEffect, useMemo, useRef, FC } from 'react';
import { useGLTF, useHelper } from '@react-three/drei';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';

interface GameMapProps {
  mapUrl: string;
  onSpawnFound?: (position: [number, number, number]) => void;
}

interface RectLightUserData {
  intensity?: number;
  color?: [number, number, number];
}

function isMesh(obj: THREE.Object3D): obj is THREE.Mesh {
  return (obj as THREE.Mesh).isMesh;
}

function isLight(obj: THREE.Object3D): obj is THREE.Light {
  return (obj as THREE.Light).isLight;
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

export const GameMap: React.FC<GameMapProps> = ({ mapUrl, onSpawnFound }) => {
  const { scene: gltfScene, nodes } = useGLTF(mapUrl);
  const scene = useMemo(() => SkeletonUtils.clone(gltfScene) as THREE.Group, [gltfScene]);

  const existingLights = useMemo(() => {
    return Object.values(nodes).filter((node): node is THREE.Light => isLight(node));
  }, [nodes]);

  const rectLightPlaceholders = useMemo(() => {
    return Object.values(nodes).filter(
      (node): node is THREE.Mesh => isMesh(node) && node.name.startsWith('RectLight')
    );
  }, [nodes]);

  useEffect(() => {
    if (!scene) return;

    const spawnObject = scene.getObjectByName('SpawnPoint');
    if (spawnObject) {
      const position = new THREE.Vector3();
      spawnObject.getWorldPosition(position);
      console.log('Spawn point found at:', position);
      if (onSpawnFound) {
        onSpawnFound([position.x, position.y, position.z]);
      }
      spawnObject.removeFromParent();
    } else {
      if (onSpawnFound) onSpawnFound([0, 5, 0]);
    }

    const objectsToRemove: THREE.Object3D[] = [];

    scene.traverse((obj) => {
      if (isLight(obj)) {
        objectsToRemove.push(obj);
      }
      if (isMesh(obj) && obj.name.startsWith('RectLight')) {
        objectsToRemove.push(obj);
      }
    });

    objectsToRemove.forEach((obj) => obj.removeFromParent());

  }, [scene, onSpawnFound]);

  return (
    <group>
      {existingLights.map((light) => (
        <primitive key={light.uuid} object={light.clone()} />
      ))}
      
      {rectLightPlaceholders.map((mesh) => (
        <RectLightInstance key={mesh.uuid} node={mesh} />
      ))}

      <RigidBody type="fixed" colliders="trimesh" friction={1}>
        <primitive object={scene} />
      </RigidBody>
    </group>
  );
};
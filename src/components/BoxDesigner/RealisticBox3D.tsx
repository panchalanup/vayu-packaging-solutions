/**
 * Realistic 3D Cardboard Box Component
 * Adapted from: https://github.com/uuuulala/Threejs-folding-cardboard-box-tutorial
 * Features layered cardboard with authentic flute pattern
 */

import { useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  BoxParams,
  BoxMeshes,
  AnimationState,
  createBoxGeometries,
  setGeometryHierarchy,
  updatePanelsTransform,
  createCardboardMaterial,
} from '@/lib/boxDesigner/realisticBoxGeometry';

interface RealisticBox3DProps {
  width?: number;
  length?: number;
  depth?: number;
  autoRotate?: boolean;
  openingAngle?: number; // 0 to 0.5 * Math.PI (0 = closed, PI/2 = fully open)
}

export default function RealisticBox3D({
  width = 27,
  length = 80,
  depth = 45,
  autoRotate = true,
  openingAngle = 0.5 * Math.PI, // Fully open by default
}: RealisticBox3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  
  // Box parameters
  const params = useMemo<BoxParams>(
    () => ({
      width,
      length,
      depth,
      thickness: 0.6,
      fluteFreq: 5,
      flapGap: 1,
    }),
    [width, length, depth]
  );

  // Animation state
  const animated = useMemo<AnimationState>(
    () => ({
      openingAngle,
      flapAngles: {
        backHalf: {
          width: { top: 0, bottom: 0 },
          length: { top: 0, bottom: 0 },
        },
        frontHalf: {
          width: { top: 0, bottom: 0 },
          length: { top: 0, bottom: 0 },
        },
      },
    }),
    [openingAngle]
  );

  // Create box meshes structure
  const meshes = useMemo<BoxMeshes>(() => {
    const material = createCardboardMaterial();
    
    return {
      frontHalf: {
        width: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), material),
          side: new THREE.Mesh(new THREE.BufferGeometry(), material),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), material),
        },
        length: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), material),
          side: new THREE.Mesh(new THREE.BufferGeometry(), material),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), material),
        },
      },
      backHalf: {
        width: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), material),
          side: new THREE.Mesh(new THREE.BufferGeometry(), material),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), material),
        },
        length: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), material),
          side: new THREE.Mesh(new THREE.BufferGeometry(), material),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), material),
        },
      },
    };
  }, []);

  // Generate geometries when parameters change
  useEffect(() => {
    if (!groupRef.current) return;

    createBoxGeometries(params, meshes);
    setGeometryHierarchy(groupRef.current, meshes);
    updatePanelsTransform(params, meshes, animated);
  }, [params, meshes, animated]);

  // Auto-rotation
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <group ref={groupRef} position={[0, depth / 2, 0]}>
      {/* Render all meshes as primitives so they're part of R3F scene */}
      <primitive object={meshes.frontHalf.width.side} />
      <primitive object={meshes.frontHalf.width.top} />
      <primitive object={meshes.frontHalf.width.bottom} />
      <primitive object={meshes.frontHalf.length.side} />
      <primitive object={meshes.frontHalf.length.top} />
      <primitive object={meshes.frontHalf.length.bottom} />
      <primitive object={meshes.backHalf.width.side} />
      <primitive object={meshes.backHalf.width.top} />
      <primitive object={meshes.backHalf.width.bottom} />
      <primitive object={meshes.backHalf.length.side} />
      <primitive object={meshes.backHalf.length.top} />
      <primitive object={meshes.backHalf.length.bottom} />
    </group>
  );
}

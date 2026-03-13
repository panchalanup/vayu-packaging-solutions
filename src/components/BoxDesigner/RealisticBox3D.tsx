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
  createCardboardMaterialWithIcons,
} from '@/lib/boxDesigner/realisticBoxGeometry';
import { createKraftPaperTexture } from '@/lib/boxDesigner/textureLoader';
import { createShippingIconsTexture } from '@/lib/boxDesigner/shippingIcons';
import { CanvasTexture } from 'three';

interface RealisticBox3DProps {
  width?: number;
  length?: number;
  depth?: number;
  autoRotate?: boolean;
  animationState?: AnimationState; // Complete animation state including flaps
  showIcons?: boolean; // Whether to show shipping icons
  plyColor?: string; // Cardboard color
}

export default function RealisticBox3D({
  width = 27,
  length = 80,
  depth = 45,
  autoRotate = true,
  animationState, // Accept complete animation state
  showIcons = true, // Show icons by default
  plyColor = '#C9A87C', // Default kraft color
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

  // Animation state - use provided state or default to fully open
  const animated = useMemo<AnimationState>(() => {
    if (animationState) {
      return animationState;
    }
    
    // Default: fully open box with no flap folding
    return {
      openingAngle: 0.5 * Math.PI,
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
    };
  }, [animationState]);

  // Create textures with icons
  const textureWithIcons = useMemo(() => {
    if (!showIcons) return null;
    
    // Create base kraft texture
    const baseTexture = createKraftPaperTexture(plyColor, 'brown');
    
    // Create composite canvas with icons
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d')!;
    
    // Draw base texture
    ctx.drawImage(baseTexture.image, 0, 0, canvas.width, canvas.height);
    
    // Create and draw icons (positioned on bottom-right like screenshot)
    const iconsTexture = createShippingIconsTexture(plyColor, '#000000', 140);
    const iconRowWidth = canvas.width * 0.4;
    const iconRowHeight = iconRowWidth * 0.35;
    const iconX = canvas.width * 0.55;
    const iconY = canvas.height * 0.6;
    
    ctx.drawImage(iconsTexture.image, iconX, iconY, iconRowWidth, iconRowHeight);
    
    const texture = new CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.needsUpdate = true;
    
    return texture;
  }, [showIcons, plyColor]);

  // Create box meshes structure
  const meshes = useMemo<BoxMeshes>(() => {
    // Base material for all panels without icons
    const baseMaterial = createCardboardMaterial(null, plyColor);
    
    // Material with icons for front panel
    const frontMaterial = textureWithIcons 
      ? createCardboardMaterialWithIcons(textureWithIcons, plyColor)
      : baseMaterial;
    
    return {
      frontHalf: {
        width: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
          side: new THREE.Mesh(new THREE.BufferGeometry(), frontMaterial), // Front face gets icons
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
        },
        length: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
          side: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
        },
      },
      backHalf: {
        width: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
          side: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
        },
        length: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
          side: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), baseMaterial),
        },
      },
    };
  }, [textureWithIcons, plyColor]);

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

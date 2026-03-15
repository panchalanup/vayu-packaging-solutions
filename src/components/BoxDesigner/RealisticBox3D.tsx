/**
 * Realistic 3D Cardboard Box Component
 * Adapted from: https://github.com/uuuulala/Threejs-folding-cardboard-box-tutorial
 * Features layered cardboard with authentic flute pattern
 */

import { useEffect, useRef, useMemo, useState } from 'react';
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
import {
  createKraftPaperTexture,
  getAOMap,
  getRoughnessMap,
  getEdgeWearMap,
} from '@/lib/boxDesigner/textureLoader';
import { createShippingIconsTexture } from '@/lib/boxDesigner/shippingIcons';
import { createFaceTexture, getFaceDimensions } from '@/lib/boxDesigner/graphicsRenderer';
import { FaceImage, TextElement, BoxFace } from '@/types/boxDesigner';
import { CanvasTexture } from 'three';

interface RealisticBox3DProps {
  width?: number;
  length?: number;
  depth?: number;
  autoRotate?: boolean;
  animationState?: AnimationState; // Complete animation state including flaps
  showIcons?: boolean; // Whether to show shipping icons
  plyColor?: string; // Cardboard color
  faceImages?: FaceImage[]; // Custom images for faces
  textElements?: TextElement[]; // Custom text for faces
  selectedFace?: BoxFace | null; // Currently selected face
  onFaceSelect?: (face: BoxFace) => void; // Callback when face is clicked
}

export default function RealisticBox3D({
  width = 27,
  length = 80,
  depth = 45,
  autoRotate = true,
  animationState, // Accept complete animation state
  showIcons = true, // Show icons by default
  plyColor = '#C9A87C', // Default kraft color
  faceImages = [],
  textElements = [],
  selectedFace = null,
  onFaceSelect,
}: RealisticBox3DProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const [hoveredFace, setHoveredFace] = useState<BoxFace | null>(null);
  const [faceTextures, setFaceTextures] = useState<Record<BoxFace, CanvasTexture | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    'top-front': null,
    'top-back': null,
    'top-left': null,
    'top-right': null,
    bottom: null,
  });
  
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

  // Create base kraft texture
  const baseKraftTexture = useMemo(() => {
    return createKraftPaperTexture(plyColor, 'brown');
  }, [plyColor]);

  // Generate composite textures for each face with custom graphics and text
  useEffect(() => {
    const generateFaceTextures = async () => {
      const newTextures: Record<BoxFace, CanvasTexture | null> = {
        front: null,
        back: null,
        left: null,
        right: null,
        'top-front': null,
        'top-back': null,
        'top-left': null,
        'top-right': null,
        bottom: null,
      };

      // Map of box faces - front face is the one with icons (width side)
      const faces: BoxFace[] = ['front', 'back', 'left', 'right', 'top-front', 'top-back', 'top-left', 'top-right', 'bottom'];

      for (const faceName of faces) {
        const faceImage = faceImages.find(img => img.face === faceName);
        const faceTexts = textElements.filter(t => t.face === faceName);
        
        // Get appropriate dimensions for this face
        const dims = getFaceDimensions(faceName, length, width, depth, 2048);
        
        // Create base texture with shipping icons on front face only
        let baseTexture = baseKraftTexture;
        
        if (faceName === 'front' && showIcons) {
          // Create composite with icons for front face
          const canvas = document.createElement('canvas');
          canvas.width = dims.width;
          canvas.height = dims.height;
          const ctx = canvas.getContext('2d')!;
          
          // Draw kraft texture
          ctx.drawImage(baseKraftTexture.image, 0, 0, canvas.width, canvas.height);
          
          // Add shipping icons
          const iconsTexture = createShippingIconsTexture(plyColor, '#000000', 140);
          const iconRowWidth = canvas.width * 0.4;
          const iconRowHeight = iconRowWidth * 0.35;
          const iconX = canvas.width * 0.55;
          const iconY = canvas.height * 0.6;
          
          ctx.drawImage(iconsTexture.image, iconX, iconY, iconRowWidth, iconRowHeight);
          
          baseTexture = new CanvasTexture(canvas);
          baseTexture.needsUpdate = true;
        }
        
        // Create composite texture with images and text if any custom content exists
        if (faceImage || faceTexts.length > 0) {
          const compositeTexture = await createFaceTexture(
            baseTexture,
            faceImage,
            faceTexts,
            dims.width,
            dims.height
          );
          newTextures[faceName] = compositeTexture;
        } else {
          // Use base texture (with or without icons)
          newTextures[faceName] = baseTexture;
        }
      }

      setFaceTextures(newTextures);
    };

    generateFaceTextures();
  }, [faceImages, textElements, baseKraftTexture, showIcons, plyColor, width, length, depth]);

  // Create enhanced textures for realism
  const aoMap = useMemo(() => getAOMap(), []);
  const roughnessMapTexture = useMemo(() => getRoughnessMap(0.93), []);

  // Create box meshes structure with click handlers
  const meshes = useMemo<BoxMeshes>(() => {
    // Create materials for each face with visual feedback
    const createMaterialForFace = (face: BoxFace) => {
      const texture = faceTextures[face];
      const material = createCardboardMaterial(
        texture, 
        plyColor, 
        aoMap, 
        roughnessMapTexture
      );
      
      // Add highlight for selected or hovered face
      const isSelected = selectedFace === face;
      const isHovered = hoveredFace === face;
      
      if (isSelected) {
        material.emissive = new THREE.Color('#22c55e'); // Green highlight for selected
        material.emissiveIntensity = 0.3;
      } else if (isHovered) {
        material.emissive = new THREE.Color('#3b82f6'); // Blue highlight for hover
        material.emissiveIntensity = 0.2;
      }
      
      return material;
    };
    
    // Helper to add interaction to mesh (exclude bottom)
    const addInteraction = (mesh: THREE.Mesh, face: BoxFace) => {
      // Don't add interaction to bottom face
      if (face === 'bottom') {
        return;
      }
      
      // Store interaction data in userData
      mesh.userData.face = face;
      mesh.userData.onClick = () => {
        if (onFaceSelect) {
          // Toggle: if clicking the same face, deselect it
          onFaceSelect(selectedFace === face ? null : face);
        }
      };
      
      mesh.userData.onPointerOver = (e: any) => {
        e.stopPropagation();
        setHoveredFace(face);
        document.body.style.cursor = 'pointer';
      };
      
      mesh.userData.onPointerOut = () => {
        setHoveredFace(null);
        document.body.style.cursor = 'default';
      };
    };
    
    // Front = width side (the one facing us initially)
    // Left/Right = length sides
    // Top/Bottom = horizontal faces
    
    const newMeshes = {
      frontHalf: {
        width: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('top-front')),
          side: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('front')),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('bottom')),
        },
        length: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('top-right')),
          side: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('right')),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('bottom')),
        },
      },
      backHalf: {
        width: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('top-back')),
          side: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('back')),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('bottom')),
        },
        length: {
          top: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('top-left')),
          side: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('left')),
          bottom: new THREE.Mesh(new THREE.BufferGeometry(), createMaterialForFace('bottom')),
        },
      },
    };
    
    // Add interaction to all clickable faces (individual flaps)
    addInteraction(newMeshes.frontHalf.width.side, 'front');
    addInteraction(newMeshes.backHalf.width.side, 'back');
    addInteraction(newMeshes.frontHalf.length.side, 'right');
    addInteraction(newMeshes.backHalf.length.side, 'left');
    addInteraction(newMeshes.frontHalf.width.top, 'top-front');
    addInteraction(newMeshes.backHalf.width.top, 'top-back');
    addInteraction(newMeshes.frontHalf.length.top, 'top-right');
    addInteraction(newMeshes.backHalf.length.top, 'top-left');
    
    return newMeshes;
  }, [faceTextures, plyColor, aoMap, roughnessMapTexture, selectedFace, hoveredFace, onFaceSelect]);

  // Update mesh materials when textures change
  useEffect(() => {
    // Front face
    if (faceTextures.front && meshes.frontHalf.width.side.material) {
      (meshes.frontHalf.width.side.material as THREE.MeshStandardMaterial).map = faceTextures.front;
      (meshes.frontHalf.width.side.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    // Back face
    if (faceTextures.back && meshes.backHalf.width.side.material) {
      (meshes.backHalf.width.side.material as THREE.MeshStandardMaterial).map = faceTextures.back;
      (meshes.backHalf.width.side.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    // Left face
    if (faceTextures.left && meshes.backHalf.length.side.material) {
      (meshes.backHalf.length.side.material as THREE.MeshStandardMaterial).map = faceTextures.left;
      (meshes.backHalf.length.side.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    // Right face
    if (faceTextures.right && meshes.frontHalf.length.side.material) {
      (meshes.frontHalf.length.side.material as THREE.MeshStandardMaterial).map = faceTextures.right;
      (meshes.frontHalf.length.side.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    // Top flaps
    if (faceTextures['top-front'] && meshes.frontHalf.width.top.material) {
      (meshes.frontHalf.width.top.material as THREE.MeshStandardMaterial).map = faceTextures['top-front'];
      (meshes.frontHalf.width.top.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    if (faceTextures['top-back'] && meshes.backHalf.width.top.material) {
      (meshes.backHalf.width.top.material as THREE.MeshStandardMaterial).map = faceTextures['top-back'];
      (meshes.backHalf.width.top.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    if (faceTextures['top-left'] && meshes.backHalf.length.top.material) {
      (meshes.backHalf.length.top.material as THREE.MeshStandardMaterial).map = faceTextures['top-left'];
      (meshes.backHalf.length.top.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    if (faceTextures['top-right'] && meshes.frontHalf.length.top.material) {
      (meshes.frontHalf.length.top.material as THREE.MeshStandardMaterial).map = faceTextures['top-right'];
      (meshes.frontHalf.length.top.material as THREE.MeshStandardMaterial).needsUpdate = true;
    }
    
    // Bottom face
    if (faceTextures.bottom) {
      if (meshes.frontHalf.width.bottom.material) {
        (meshes.frontHalf.width.bottom.material as THREE.MeshStandardMaterial).map = faceTextures.bottom;
        (meshes.frontHalf.width.bottom.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
      if (meshes.backHalf.width.bottom.material) {
        (meshes.backHalf.width.bottom.material as THREE.MeshStandardMaterial).map = faceTextures.bottom;
        (meshes.backHalf.width.bottom.material as THREE.MeshStandardMaterial).needsUpdate = true;
      }
    }
  }, [faceTextures, meshes]);

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
      {/* Render all meshes as primitives with click handlers */}
      <primitive 
        object={meshes.frontHalf.width.side}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.frontHalf.width.side.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.frontHalf.width.side.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.frontHalf.width.side.userData.onPointerOut?.()}
      />
      <primitive 
        object={meshes.frontHalf.width.top}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.frontHalf.width.top.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.frontHalf.width.top.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.frontHalf.width.top.userData.onPointerOut?.()}
      />
      <primitive object={meshes.frontHalf.width.bottom} />
      
      <primitive 
        object={meshes.frontHalf.length.side}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.frontHalf.length.side.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.frontHalf.length.side.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.frontHalf.length.side.userData.onPointerOut?.()}
      />
      <primitive 
        object={meshes.frontHalf.length.top}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.frontHalf.length.top.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.frontHalf.length.top.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.frontHalf.length.top.userData.onPointerOut?.()}
      />
      <primitive object={meshes.frontHalf.length.bottom} />
      
      <primitive 
        object={meshes.backHalf.width.side}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.backHalf.width.side.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.backHalf.width.side.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.backHalf.width.side.userData.onPointerOut?.()}
      />
      <primitive 
        object={meshes.backHalf.width.top}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.backHalf.width.top.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.backHalf.width.top.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.backHalf.width.top.userData.onPointerOut?.()}
      />
      <primitive object={meshes.backHalf.width.bottom} />
      
      <primitive 
        object={meshes.backHalf.length.side}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.backHalf.length.side.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.backHalf.length.side.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.backHalf.length.side.userData.onPointerOut?.()}
      />
      <primitive 
        object={meshes.backHalf.length.top}
        onClick={(e: any) => {
          e.stopPropagation();
          e.nativeEvent?.stopPropagation?.();
          meshes.backHalf.length.top.userData.onClick?.();
        }}
        onPointerOver={(e: any) => meshes.backHalf.length.top.userData.onPointerOver?.(e)}
        onPointerOut={() => meshes.backHalf.length.top.userData.onPointerOut?.()}
      />
      <primitive object={meshes.backHalf.length.bottom} />
    </group>
  );
}

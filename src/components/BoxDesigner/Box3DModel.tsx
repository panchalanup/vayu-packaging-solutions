/**
 * 3D Box Model Component
 * Interactive 3D box visualization with texture mapping
 */

import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector2, CanvasTexture } from 'three';
import { BoxDimensions, PlyConfig, FaceImage, BoxFace, TextElement } from '@/types/boxDesigner';
import { getKraftTexture, getFluteNormalMap, getRoughnessMap } from '@/lib/boxDesigner/textureLoader';
import { createFaceTexture, getFaceDimensions } from '@/lib/boxDesigner/graphicsRenderer';

interface Box3DModelProps {
  dimensions: BoxDimensions;
  plyConfig: PlyConfig;
  faceImages: FaceImage[];
  textElements: TextElement[];
  selectedFace: BoxFace | null;
  onFaceClick: (face: BoxFace) => void;
  autoRotate?: boolean;
}

export default function Box3DModel({
  dimensions,
  plyConfig,
  faceImages,
  textElements,
  selectedFace,
  onFaceClick,
  autoRotate = false,
}: Box3DModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);
  const [faceTextures, setFaceTextures] = useState<Record<BoxFace, CanvasTexture | null>>({
    front: null,
    back: null,
    left: null,
    right: null,
    top: null,
    bottom: null,
  });

  // Convert cm to Three.js units (1 unit = 10cm for better visibility)
  const scale = 0.1;
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const depth = dimensions.length * scale;

  // Generate base textures with memoization
  const kraftTexture = useMemo(() => {
    return getKraftTexture(plyConfig.id, plyConfig.color);
  }, [plyConfig.id, plyConfig.color]);

  const normalMap = useMemo(() => {
    return plyConfig.fluteType ? getFluteNormalMap(plyConfig.fluteType) : null;
  }, [plyConfig.fluteType]);

  const roughnessMap = useMemo(() => {
    return getRoughnessMap(plyConfig.roughness || 0.75);
  }, [plyConfig.roughness]);

  const normalScale = useMemo(() => new Vector2(0.3, 0.3), []);

  // Face names for interaction
  const faceNames: BoxFace[] = ['right', 'left', 'top', 'bottom', 'front', 'back'];

  // Generate composite textures for faces with graphics/text
  useEffect(() => {
    const generateFaceTextures = async () => {
      const newTextures: Record<BoxFace, CanvasTexture | null> = {
        front: null,
        back: null,
        left: null,
        right: null,
        top: null,
        bottom: null,
      };

      for (const faceName of faceNames) {
        const faceImage = faceImages.find(img => img.face === faceName);
        const faceTexts = textElements.filter(t => t.face === faceName);
        
        // Only create composite texture if there's custom content
        if (faceImage || faceTexts.length > 0) {
          const dims = getFaceDimensions(
            faceName,
            dimensions.length,
            dimensions.width,
            dimensions.height
          );
          
          const compositeTexture = await createFaceTexture(
            kraftTexture,
            faceImage,
            faceTexts,
            dims.width,
            dims.height
          );
          
          newTextures[faceName] = compositeTexture;
        }
      }

      setFaceTextures(newTextures);
    };

    generateFaceTextures();
  }, [faceImages, textElements, kraftTexture, dimensions]);

  // Auto-rotate when enabled
  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <group>
      {/* Main box mesh */}
      <mesh
        ref={meshRef}
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          if (e.faceIndex !== undefined) {
            const faceIndex = Math.floor(e.faceIndex / 2);
            onFaceClick(faceNames[faceIndex]);
          }
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          if (e.faceIndex !== undefined) {
            setHoveredFace(Math.floor(e.faceIndex / 2));
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => {
          setHoveredFace(null);
          document.body.style.cursor = 'default';
        }}
      >
        <boxGeometry args={[width, height, depth]} />
        
        {/* Materials for each face with PBR */}
        {faceNames.map((faceName, index) => {
          const isSelected = selectedFace === faceName;
          const isHovered = hoveredFace === index;
          // Use composite texture if available, otherwise use base kraft texture
          const faceTexture = faceTextures[faceName] || kraftTexture;
          
          return (
            <meshStandardMaterial
              key={index}
              attach={`material-${index}`}
              map={faceTexture}
              normalMap={normalMap || undefined}
              normalScale={normalScale}
              roughnessMap={roughnessMap}
              roughness={plyConfig.roughness || 0.75}
              metalness={plyConfig.metalness || 0.08}
              color={isSelected ? '#90EE90' : isHovered ? '#FFE4B5' : '#FFFFFF'}
              emissive={isSelected ? '#2E7D32' : isHovered ? '#FFA000' : '#000000'}
              emissiveIntensity={isSelected ? 0.2 : isHovered ? 0.15 : 0}
              envMapIntensity={0.5}
            />
          );
        })}
      </mesh>

      {/* Ground plane for shadow */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, 0, 0]} 
        receiveShadow
      >
        <planeGeometry args={[10, 10]} />
        <shadowMaterial opacity={0.3} />
      </mesh>
    </group>
  );
}

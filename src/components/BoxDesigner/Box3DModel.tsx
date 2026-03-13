/**
 * 3D Box Model Component
 * Interactive 3D box visualization with texture mapping
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { BoxDimensions, PlyConfig, FaceImage } from '@/types/boxDesigner';

interface Box3DModelProps {
  dimensions: BoxDimensions;
  plyConfig: PlyConfig;
  faceImages: FaceImage[];
  selectedFace: string | null;
  onFaceClick: (face: string) => void;
  autoRotate?: boolean;
}

export default function Box3DModel({
  dimensions,
  plyConfig,
  faceImages,
  selectedFace,
  onFaceClick,
  autoRotate = false,
}: Box3DModelProps) {
  const meshRef = useRef<Mesh>(null);
  const [hoveredFace, setHoveredFace] = useState<number | null>(null);

  // Convert cm to Three.js units (1 unit = 10cm for better visibility)
  const scale = 0.1;
  const width = dimensions.width * scale;
  const height = dimensions.height * scale;
  const depth = dimensions.length * scale;

  // Auto-rotate when enabled
  useFrame((state, delta) => {
    if (meshRef.current && autoRotate) {
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  // Face names for interaction
  const faceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];

  return (
    <mesh
      ref={meshRef}
      position={[0, height / 2, 0]}
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
      
      {/* Materials for each face */}
      {faceNames.map((faceName, index) => {
        const isSelected = selectedFace === faceName;
        const isHovered = hoveredFace === index;
        const faceImage = faceImages.find(img => img.face === faceName);
        
        return (
          <meshStandardMaterial
            key={index}
            attach={`material-${index}`}
            color={isSelected ? '#4CAF50' : isHovered ? '#FFD700' : plyConfig.color}
            roughness={0.7}
            metalness={0.1}
            emissive={isSelected ? '#2E7D32' : isHovered ? '#FFA000' : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : isHovered ? 0.2 : 0}
          />
        );
      })}
    </mesh>
  );
}

/**
 * 3D Canvas Wrapper
 * Sets up the Three.js scene with lighting and controls
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { ReactNode, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

interface Canvas3DProps {
  children: ReactNode;
  controlMode?: 'rotate' | 'pan';
}

/**
 * Scene setup component to configure background and other scene properties
 */
function SceneSetup() {
  const { scene } = useThree();
  
  useEffect(() => {
    // Clean white background for professional product photography look
    scene.background = new THREE.Color('#ffffff');
  }, [scene]);
  
  return null;
}

/**
 * Professional studio lighting setup - matches product photography
 */
function StudioLights() {
  return (
    <>
      {/* Main key light - top-front-right (primary illumination) */}
      <directionalLight
        position={[10, 15, 8]}
        intensity={1.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />
      
      {/* Fill light - left side to soften shadows */}
      <directionalLight
        position={[-8, 10, 5]}
        intensity={0.4}
        color="#ffffff"
      />
      
      {/* Rim/back light - adds depth and separation */}
      <directionalLight
        position={[-5, 8, -10]}
        intensity={0.3}
        color="#ffffff"
      />
      
      {/* Soft top light for even illumination */}
      <pointLight
        position={[0, 20, 0]}
        intensity={0.3}
        color="#ffffff"
        distance={50}
        decay={2}
      />
    </>
  );
}

export default function Canvas3D({ children, controlMode = 'rotate' }: Canvas3DProps) {
  return (
    <div className="w-full h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner">
      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        {/* Scene Configuration */}
        <SceneSetup />
        
        {/* Camera - positioned for 3/4 view like product photography */}
        <PerspectiveCamera makeDefault position={[20, 25, 35]} fov={40} />
        
        {/* Professional Studio Lighting Setup */}
        {/* Soft ambient light - subtle base illumination */}
        <ambientLight intensity={0.4} color="#ffffff" />
        
        {/* Main studio lights */}
        <StudioLights />

        {/* Grid helper - positioned at ground level */}
        <Grid
          args={[100, 100]}
          cellSize={5}
          cellThickness={0.6}
          cellColor="#d0d0d0"
          sectionSize={25}
          sectionThickness={1.2}
          sectionColor="#a0a0a0"
          fadeDistance={150}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[0, 0, 0]}
        />

        {/* Orbit Controls - mode-based behavior */}
        <OrbitControls
          enablePan={controlMode === 'pan'}
          enableZoom={true}
          enableRotate={controlMode === 'rotate'}
          minDistance={25}
          maxDistance={150}
          maxPolarAngle={Math.PI}
          minPolarAngle={0}
          target={[0, 5, 0]}
          enableDamping
          dampingFactor={0.08}
          mouseButtons={{
            LEFT: controlMode === 'rotate' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: controlMode === 'rotate' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE
          }}
        />

        {/* Children (3D models) */}
        {children}
      </Canvas>
    </div>
  );
}

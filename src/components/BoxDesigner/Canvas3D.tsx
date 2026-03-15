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
  onBackgroundClick?: () => void;
  onRendererReady?: (gl: THREE.WebGLRenderer) => void;
}

/**
 * Scene setup component to configure background and other scene properties
 */
function SceneSetup({ onRendererReady }: { onRendererReady?: (gl: THREE.WebGLRenderer) => void }) {
  const { scene, gl } = useThree();
  
  useEffect(() => {
    // Clean white background for professional product photography look
    scene.background = new THREE.Color('#ffffff');
  }, [scene]);
  
  useEffect(() => {
    if (onRendererReady && gl) {
      onRendererReady(gl);
    }
  }, [gl, onRendererReady]);
  
  return null;
}

/**
 * Professional studio lighting setup - matches product photography
 * Enhanced for realistic cardboard rendering with soft shadows
 */
function StudioLights() {
  return (
    <>
      {/* Main key light - top-front-right (primary illumination) */}
      <directionalLight
        position={[12, 18, 10]}
        intensity={1.4}
        color="#FFF8F0"
        castShadow
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={120}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-bias={-0.00005}
        shadow-radius={4}
      />
      
      {/* Fill light - left side to soften shadows and show texture detail */}
      <directionalLight
        position={[-10, 12, 6]}
        intensity={0.5}
        color="#FFF8F0"
      />
      
      {/* Rim/back light - adds depth and separation from background */}
      <directionalLight
        position={[-6, 10, -12]}
        intensity={0.35}
        color="#FFE4B5"
      />
      
      {/* Soft top light for even illumination - simulates studio softbox */}
      <pointLight
        position={[0, 25, 0]}
        intensity={0.4}
        color="#FFFFFF"
        distance={60}
        decay={2}
      />
      
      {/* Subtle ground bounce light - simulates light reflection from floor */}
      <directionalLight
        position={[0, -5, 8]}
        intensity={0.15}
        color="#F5DEB3"
      />
    </>
  );
}

export default function Canvas3D({ children, controlMode = 'rotate', onBackgroundClick, onRendererReady }: Canvas3DProps) {
  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner"
      onClick={onBackgroundClick}
    >
      <Canvas 
        shadows 
        gl={{ antialias: true, alpha: false, preserveDrawingBuffer: true }}
      >
        {/* Scene Configuration */}
        <SceneSetup onRendererReady={onRendererReady} />
        
        {/* Camera - positioned for 3/4 view with more zoom out for better visibility */}
        <PerspectiveCamera makeDefault position={[30, 35, 50]} fov={45} />
        
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

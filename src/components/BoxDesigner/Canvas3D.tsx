/**
 * 3D Canvas Wrapper
 * Sets up the Three.js scene with lighting and controls
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { ReactNode, useEffect } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';

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
    // Set a pleasant light gray background color
    scene.background = new THREE.Color('#f5f5f5');
  }, [scene]);
  
  return null;
}

export default function Canvas3D({ children, controlMode = 'rotate' }: Canvas3DProps) {
  return (
    <div className="w-full h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner">
      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        {/* Scene Configuration */}
        <SceneSetup />
        
        {/* Camera - closer position for better zoom and visibility */}
        <PerspectiveCamera makeDefault position={[15, 45, 60]} fov={45} />
        
        {/* Enhanced Lighting Setup for Clear Visibility */}
        {/* Ambient light - increased for better base illumination */}
        <ambientLight intensity={1.0} />
        
        {/* Hemisphere light for natural sky/ground lighting */}
        <hemisphereLight
          color="#ffffff"
          groundColor="#b8b8b8"
          intensity={0.6}
        />
        
        {/* Main key light with shadows - increased intensity */}
        <directionalLight
          position={[50, 100, 50]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={500}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />
        
        {/* Fill light from opposite side - increased intensity */}
        <directionalLight
          position={[-30, 50, -30]}
          intensity={0.7}
        />
        
        {/* Rim light for better depth - increased intensity */}
        <directionalLight
          position={[0, 20, -50]}
          intensity={0.5}
        />
        
        {/* Additional side light for better coverage */}
        <directionalLight
          position={[0, 40, 60]}
          intensity={0.4}
        />

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

        {/* Orbit Controls - mode-based behavior with custom mouse buttons */}
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

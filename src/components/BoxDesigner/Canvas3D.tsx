/**
 * 3D Canvas Wrapper
 * Sets up the Three.js scene with lighting and controls
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid, Environment } from '@react-three/drei';
import { ReactNode } from 'react';

interface Canvas3DProps {
  children: ReactNode;
}

export default function Canvas3D({ children }: Canvas3DProps) {
  return (
    <div className="w-full h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner">
      <Canvas shadows gl={{ antialias: true, alpha: false }}>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={50} />
        
        {/* Enhanced Lighting for realistic materials */}
        <ambientLight intensity={0.4} />
        
        {/* Main key light */}
        <directionalLight
          position={[10, 10, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
          shadow-bias={-0.0001}
        />
        
        {/* Fill light from opposite side */}
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.5}
        />
        
        {/* Rim light for edge definition */}
        <directionalLight
          position={[0, 2, -5]}
          intensity={0.4}
        />
        
        {/* Subtle point lights for depth */}
        <pointLight position={[-10, 5, -5]} intensity={0.3} color="#FFF8E7" />
        <pointLight position={[10, 3, 10]} intensity={0.2} color="#E8F4FF" />
        
        {/* Environment map for realistic reflections */}
        <Environment preset="warehouse" />

        {/* Grid helper - positioned at origin */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#cccccc"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#999999"
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid={false}
          position={[0, 0, 0]}
        />

        {/* Orbit Controls - target the box center */}
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          maxPolarAngle={Math.PI / 1.8}
          minPolarAngle={Math.PI / 6}
          target={[0, 1, 0]}
          enableDamping
          dampingFactor={0.05}
        />

        {/* Children (3D models) */}
        {children}
      </Canvas>
    </div>
  );
}

/**
 * 3D Canvas Wrapper
 * Sets up the Three.js scene with lighting and controls
 */

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Grid } from '@react-three/drei';
import { ReactNode } from 'react';

interface Canvas3DProps {
  children: ReactNode;
}

export default function Canvas3D({ children }: Canvas3DProps) {
  return (
    <div className="w-full h-[550px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden shadow-inner">
      <Canvas shadows>
        {/* Camera */}
        <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={50} />
        
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-10, -10, -5]} intensity={0.3} />
        <spotLight
          position={[0, 10, 0]}
          angle={0.3}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Grid helper - positioned at origin */}
        <Grid
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#aaaaaa"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#888888"
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
          minDistance={3}
          maxDistance={15}
          maxPolarAngle={Math.PI / 1.5}
          target={[0, 1, 0]}
        />

        {/* Children (3D models) */}
        {children}
      </Canvas>
    </div>
  );
}

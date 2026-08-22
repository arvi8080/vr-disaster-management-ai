import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Float,
  Stars,
} from "@react-three/drei";

function Core() {
  const r = useRef();

  useFrame((_, d) => {
    if (r.current) {
      r.current.rotation.y += d * 0.15;
      r.current.rotation.x =
        Math.sin(performance.now() / 1800) * 0.03;
    }
  });

  return (
    <group ref={r}>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.4, 1.2, 1.5]} />
        <meshStandardMaterial
          color="#121b2e"
          metalness={0.65}
          roughness={0.3}
        />
      </mesh>

      <mesh position={[0, 0.75, 0]}>
        <coneGeometry args={[1.4, 0.9, 4]} />
        <meshStandardMaterial
          color="#273450"
          metalness={0.5}
        />
      </mesh>

      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshBasicMaterial color="#8b5cf6" />
      </mesh>
    </group>
  );
}

export default function DisasterScene() {
  return (
    <div className="scene-wrap">
      <Canvas
        camera={{
          position: [4, 2.5, 5],
          fov: 45,
        }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.45} />

        <pointLight
          position={[3, 4, 3]}
          color="#7c3aed"
          intensity={18}
        />

        <pointLight
          position={[-4, 2, 2]}
          color="#2563eb"
          intensity={10}
        />

        <Stars
          radius={20}
          depth={8}
          count={900}
          factor={2}
          saturation={0}
        />

        <Float
          speed={1.1}
          rotationIntensity={0.15}
          floatIntensity={0.3}
        >
          <Core />
        </Float>

        <Environment preset="night" />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.45}
        />
      </Canvas>

      <div className="scene-glow" />
    </div>
  );
}
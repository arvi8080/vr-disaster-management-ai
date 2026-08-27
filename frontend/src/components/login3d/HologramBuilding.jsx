import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function HologramBuilding() {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    ref.current.rotation.y =
      Math.sin(state.clock.elapsedTime * 0.4) *
      0.15;

    ref.current.position.y =
      -0.7 +
      Math.sin(state.clock.elapsedTime * 1.2) *
        0.04;
  });

  return (
    <group ref={ref}>

      {/* Base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.2, 64]} />

        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* Holographic tower */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.7, 2, 0.7]} />

        <meshBasicMaterial
          color="#00d9ff"
          wireframe
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Top */}
      <mesh position={[0, 1.55, 0]}>
        <octahedronGeometry args={[0.25]} />

        <meshBasicMaterial
          color="#00ffcc"
          wireframe
        />
      </mesh>

    </group>
  );
}
import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function RadarScanner() {
  const scanner = useRef();

  useFrame((state) => {
    if (!scanner.current) return;

    scanner.current.rotation.z =
      state.clock.elapsedTime * 1.2;
  });

  return (
    <group
      ref={scanner}
      position={[0, -1.2, -4]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      {/* Main radar */}
      <mesh>
        <ringGeometry args={[2.4, 2.43, 96]} />

        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <ringGeometry args={[1.5, 1.52, 96]} />

        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.15}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh>
        <ringGeometry args={[0.7, 0.72, 96]} />

        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.18}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Radar beam */}
      <mesh position={[1.2, 0, 0]}>
        <planeGeometry args={[2.4, 0.015]} />

        <meshBasicMaterial
          color="#00ffcc"
          transparent
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
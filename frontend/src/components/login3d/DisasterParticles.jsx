import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function DisasterParticles() {
  const ref = useRef();

  const particles = Array.from(
    { length: 180 },
    (_, i) => ({
      x: (Math.random() - 0.5) * 14,
      y: Math.random() * 7 - 1,
      z: Math.random() * -15,
      speed: Math.random() * 0.008 + 0.002,
      size: Math.random() * 0.025 + 0.008,
    })
  );

  useFrame(() => {
    if (!ref.current) return;

    ref.current.children.forEach(
      (particle, index) => {
        const data = particles[index];

        particle.position.y -= data.speed;

        particle.rotation.x += 0.01;
        particle.rotation.z += 0.01;

        if (particle.position.y < -1) {
          particle.position.y = 6;
        }
      }
    );
  });

  return (
    <group ref={ref}>
      {particles.map((particle, index) => (
        <mesh
          key={index}
          position={[
            particle.x,
            particle.y,
            particle.z,
          ]}
        >
          <boxGeometry
            args={[
              particle.size,
              particle.size,
              particle.size,
            ]}
          />

          <meshBasicMaterial
            color={
              index % 5 === 0
                ? "#ff334c"
                : "#7c8990"
            }
          />
        </mesh>
      ))}
    </group>
  );
}
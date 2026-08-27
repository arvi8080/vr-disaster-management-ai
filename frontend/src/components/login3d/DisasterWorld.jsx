import React, { useRef } from "react";
import { Float } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

function Building({
  position,
  scale = 1,
  rotation = 0,
  damaged = false,
}) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    if (damaged) {
      ref.current.rotation.z =
        rotation +
        Math.sin(state.clock.elapsedTime * 1.5) * 0.008;
    }
  });

  return (
    <group
      ref={ref}
      position={position}
      rotation={[0, rotation, 0]}
      scale={scale}
    >
      {/* Main building */}
      <mesh>
        <boxGeometry args={[1, 2.5, 1]} />
        <meshStandardMaterial
          color={damaged ? "#171b20" : "#071923"}
          roughness={0.7}
          metalness={0.5}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 1.3, 0]}>
        <boxGeometry args={[1.05, 0.08, 1.05]} />
        <meshStandardMaterial
          color="#101820"
          metalness={0.8}
        />
      </mesh>

      {/* Windows */}
      {[-0.8, -0.25, 0.3, 0.85].map((y, i) => (
        <React.Fragment key={i}>
          <mesh position={[-0.28, y, 0.51]}>
            <boxGeometry args={[0.15, 0.22, 0.025]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? "#ff3148" : "#00d9ff"}
            />
          </mesh>

          <mesh position={[0.28, y, 0.51]}>
            <boxGeometry args={[0.15, 0.22, 0.025]} />
            <meshBasicMaterial
              color={i % 2 === 0 ? "#00d9ff" : "#ff3148"}
            />
          </mesh>
        </React.Fragment>
      ))}

      {/* Damage section */}
      {damaged && (
        <mesh position={[0.25, 0.65, 0.53]}>
          <boxGeometry args={[0.45, 0.06, 0.03]} />
          <meshBasicMaterial color="#ff203d" />
        </mesh>
      )}
    </group>
  );
}

function Fire({ position }) {
  const ref = useRef();

  useFrame((state) => {
    if (!ref.current) return;

    const pulse =
      1 +
      Math.sin(state.clock.elapsedTime * 8) *
        0.12;

    ref.current.scale.setScalar(pulse);
  });

  return (
    <group position={position}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshBasicMaterial
          color="#ff243e"
          transparent
          opacity={0.9}
        />
      </mesh>

      <pointLight
        color="#ff243e"
        intensity={4}
        distance={2}
      />
    </group>
  );
}

function SmokeColumn({ position }) {
  const group = useRef();

  useFrame((state) => {
    if (!group.current) return;

    group.current.children.forEach((smoke, index) => {
      smoke.position.y += 0.003;

      smoke.position.x =
        position[0] +
        Math.sin(
          state.clock.elapsedTime * 0.6 +
            index
        ) *
          0.08;

      if (smoke.position.y > 3.8) {
        smoke.position.y = 1.2;
      }
    });
  });

  return (
    <group ref={group}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <mesh
          key={i}
          position={[
            position[0],
            1.2 + i * 0.4,
            position[2],
          ]}
          scale={0.8 + i * 0.1}
        >
          <sphereGeometry args={[0.22, 12, 12]} />

          <meshBasicMaterial
            color="#38434a"
            transparent
            opacity={0.11}
          />
        </mesh>
      ))}
    </group>
  );
}

function Street() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -1.28, 0]}
    >
      <planeGeometry args={[30, 30]} />

      <meshStandardMaterial
        color="#02080d"
        roughness={0.95}
      />
    </mesh>
  );
}

export default function DisasterWorld() {
  return (
    <>
      <ambientLight intensity={0.15} />

      <directionalLight
        position={[4, 8, 5]}
        intensity={0.5}
        color="#8bdcff"
      />

      <pointLight
        position={[0, 2, 2]}
        intensity={3}
        color="#00d9ff"
      />

      <pointLight
        position={[0, 1, -2]}
        intensity={3}
        color="#ff263f"
      />

      <Street />

      <Building
        position={[-2.8, 0, -3]}
        scale={1.3}
      />

      <Building
        position={[2.8, 0, -4]}
        scale={1.7}
        damaged
      />

      <Building
        position={[-4.2, 0, -7]}
        scale={2}
      />

      <Building
        position={[4.5, 0, -8]}
        scale={2.2}
        damaged
      />

      <Building
        position={[-1.8, 0, -8]}
        scale={1.6}
      />

      <Building
        position={[1.8, 0, -10]}
        scale={1.8}
      />

      <Float
        speed={1}
        rotationIntensity={0.15}
        floatIntensity={0.15}
      >
        <Fire position={[2.5, 0.1, -3]} />
      </Float>

      <Fire position={[-2.7, 0.1, -3]} />

      <Fire position={[4.3, 0.1, -7]} />

      <SmokeColumn position={[-2.7, 0, -3]} />

      <SmokeColumn position={[2.8, 0, -4]} />
    </>
  );
}
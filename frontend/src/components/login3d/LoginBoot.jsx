import React, {
  useEffect,
  useState,
} from "react";

import {
  Canvas,
  useThree,
} from "@react-three/fiber";

import { PerspectiveCamera } from "@react-three/drei";

import DisasterWorld
  from "./DisasterWorld";

import DisasterParticles
  from "./DisasterParticles";

import RadarScanner
  from "./RadarScanner";

import HologramBuilding
  from "./HologramBuilding";

function CameraAnimation() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(
      0,
      0.5,
      5.5
    );
  }, [camera]);

  return null;
}

export default function LoginBoot({
  onComplete,
}) {
  const [stage, setStage] =
    useState(0);

  useEffect(() => {
    const sequence = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1300),
      setTimeout(() => setStage(3), 2200),
      setTimeout(() => setStage(4), 3000),
      setTimeout(() => setStage(5), 3900),
      setTimeout(() => onComplete(), 4700),
    ];

    return () =>
      sequence.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="boot-screen">

      {/* 3D WORLD */}

      <div className="boot-3d">

        <Canvas
          dpr={[1, 2]}
          camera={{
            position: [0, 0.5, 5.5],
            fov: 50,
          }}
        >

          <PerspectiveCamera
            makeDefault
            position={[0, 0.5, 5.5]}
            fov={50}
          />

          <CameraAnimation />

          <DisasterWorld />

          <DisasterParticles />

          <RadarScanner />

          {stage >= 3 && (
            <HologramBuilding />
          )}

        </Canvas>

      </div>

      {/* Dark cinematic overlay */}

      <div className="boot-vignette" />

      {/* Scanline */}

      <div className="boot-scanline" />

      {/* Top HUD */}

      <div className="boot-header">

        <div className="boot-brand">

          <span className="live-dot" />

          VR DISASTER MANAGEMENT

        </div>

        <div>
          SYSTEM // 2048
        </div>

      </div>

      {/* Center */}

      <div className="boot-content">

        {stage >= 1 && (
          <div className="boot-alert">
            ⚠ EMERGENCY NETWORK DETECTED
          </div>
        )}

        {stage >= 2 && (
          <h1>
            DISASTER
            <span>ENVIRONMENT</span>
          </h1>
        )}

        {stage >= 3 && (
          <div className="boot-status">

            <span className="status-bar" />

            AI THREAT ANALYSIS
            <strong>ACTIVE</strong>

          </div>
        )}

        {stage >= 4 && (
          <div className="boot-message">
            IMMERSIVE RESPONSE
            ENVIRONMENT INITIALIZED
          </div>
        )}

        {stage >= 5 && (
          <div className="boot-ready">
            SYSTEM READY
          </div>
        )}

      </div>

      {/* HUD */}

      <div className="boot-coordinates">
        LAT 19.0760
        <br />
        LNG 72.8777
        <br />
        SECTOR: MUMBAI
      </div>

      <div className="boot-hazard">

        HAZARD LEVEL

        <strong>
          CRITICAL
        </strong>

      </div>

      <div className="boot-footer">

        <span>
          AI CORE: ONLINE
        </span>

        <span>
          VR ENGINE: READY
        </span>

        <span>
          RESPONSE NETWORK: ACTIVE
        </span>

      </div>

    </div>
  );
}
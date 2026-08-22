import React from "react";
import { ArrowRight, Play, Radio } from "lucide-react";
import DisasterScene from "../3d/DisasterScene";

export default function Hero() {
  return (
    <section className="hero panel">
      <div className="hero-copy">
        <span className="eyebrow">
          <Radio size={14} />
          AI POWERED
        </span>

        <h2>
          Prepare. Respond.
          <br />
          <b>Save Lives.</b>
        </h2>

        <p>
          Immersive VR training, real-time disaster monitoring and AI-powered
          intelligence for a safer tomorrow.
        </p>

        <div className="hero-actions">
          <button className="glow-btn">
            Start VR Simulation
            <ArrowRight size={18} />
          </button>

          <button className="demo-btn">
            <span>
              <Play size={15} fill="currentColor" />
            </span>
            Watch Demo
          </button>
        </div>
      </div>

      <DisasterScene />

      <div className="hero-grid" />
    </section>
  );
}
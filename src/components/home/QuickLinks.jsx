import React from "react";

import {
  Box,
  Map,
  Bot,
  GraduationCap,
  Package,
  ChevronRight,
} from "lucide-react";

import { Link } from "react-router-dom";

const items = [
  [
    "/simulations",
    "VR Simulations",
    "Practice real-life disaster scenarios",
    Box,
    "purple",
  ],
  [
    "/map",
    "Disaster Map",
    "Real-time monitoring & live updates",
    Map,
    "blue",
  ],
  [
    "/ai-assistant",
    "AI Assistant",
    "Get AI-powered suggestions",
    Bot,
    "cyan",
  ],
  [
    "/training",
    "Training Center",
    "Learn & get certified",
    GraduationCap,
    "pink",
  ],
  [
    "/resources",
    "Resource Hub",
    "Access emergency resources",
    Package,
    "orange",
  ],
];

export default function QuickLinks() {
  return (
    <div className="quick-grid">
      {items.map(([to, title, description, Icon, color]) => (
        <Link
          className="quick-card"
          to={to}
          key={title}
        >
          <span className={`quick-icon ${color}`}>
            <Icon />
          </span>

          <div>
            <strong>{title}</strong>
            <small>{description}</small>
          </div>

          <ChevronRight />
        </Link>
      ))}
    </div>
  );
}
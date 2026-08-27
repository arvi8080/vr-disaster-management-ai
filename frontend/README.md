# VR Disaster Management & Training Platform - Frontend

Modern React-based frontend for a real-world **VR Disaster Management and Training Platform Using Digital Skill Twins with AI-Driven Feedback**.

The frontend provides a responsive web dashboard for monitoring disaster situations, managing training scenarios, viewing alerts, analyzing performance, interacting with AI assistance, and visualizing Digital Skill Twin data.

---

## 🛠️ Tech Stack

- **Framework:** React 19
- **Build Tool:** Vite
- **Routing:** React Router DOM
- **Styling:** CSS3
- **3D Rendering:** Three.js
- **React 3D:** React Three Fiber
- **3D Utilities:** React Three Drei
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State Management:** Zustand
- **Server State:** TanStack React Query
- **Forms:** React Hook Form
- **Validation:** Zod
- **HTTP Client:** Axios

---

## 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │    React Frontend     │
                         │                       │
                         │  Dashboard / Admin    │
                         │  Training / Analytics │
                         │  Alerts / Skill Twin │
                         └───────────┬───────────┘
                                     │
                                  REST API
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │   Node.js + Express   │
                         │      Backend API      │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
                    ▼                ▼                ▼
              ┌──────────┐    ┌─────────────┐   ┌───────────┐
              │ Firebase │    │ Python AI   │   │ Unity VR  │
              │          │    │ Service     │   │ Training  │
              └──────────┘    └─────────────┘   └───────────┘
                                      │                │
                                      └───────┬────────┘
                                              ▼
                                    Digital Skill Twin
📁 Frontend Directory Structure
frontend/
│
├── public/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   ├── models/
│   ├── sounds/
│   └── textures/
│
├── src/
│   │
│   ├── assets/
│   │
│   ├── components/
│   │   │
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Container.jsx
│   │   │   ├── Loading.jsx
│   │   │   ├── Panel.jsx
│   │   │   └── SectionTitle.jsx
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.jsx
│   │   │   ├── AlertsPanel.jsx
│   │   │   ├── QuickLinks.jsx
│   │   │   ├── WorldRisk.jsx
│   │   │   ├── StatsPanel.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   └── RecentSimulations.jsx
│   │   │
│   │   └── 3d/
│   │       ├── HeroScene.jsx
│   │       ├── FloatingCard.jsx
│   │       └── ParticleField.jsx
│   │
│   ├── layouts/
│   │   ├── MainLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── Topbar.jsx
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Admin.jsx
│   │   ├── Simulations.jsx
│   │   ├── DisasterMap.jsx
│   │   ├── AIAssistant.jsx
│   │   ├── Alerts.jsx
│   │   ├── Resources.jsx
│   │   ├── Analytics.jsx
│   │   ├── Training.jsx
│   │   ├── SkillTwin.jsx
│   │   └── Settings.jsx
│   │
│   ├── data/
│   │   ├── dashboard.js
│   │   ├── simulations.js
│   │   └── training.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   └── authService.js
│   │
│   ├── store/
│   │
│   ├── styles/
│   │   ├── global.css
│   │   └── pages.css
│   │
│   ├── App.jsx
│   └── main.jsx
│
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── vite.config.js
└── README.md
📊 Dashboard

The Dashboard is the central control interface of the platform.

It provides an overview of:

Disaster alerts
Quick actions
Global disaster risks
Platform statistics
AI Assistant
Recent training activity
System performance
Emergency information

The dashboard is designed for quick decision-making without requiring users to navigate through multiple pages.

🚨 Alerts & Notifications

The Alerts module provides information about active disaster situations.

Features
Active alerts
Disaster severity
Alert status
Disaster type
Location
Alert timestamp
Warning indicators
Emergency notifications

Example severity levels:

Critical
High
Medium
Low
Resolved
🗺️ Disaster Map

The Disaster Map provides a geographical view of disaster-related information.

Features
Disaster locations
Risk indicators
Emergency locations
Disaster categories
Risk levels
Interactive map visualization

The frontend can consume real-time geographical data from the backend.

🤖 AI Assistant

The AI Assistant provides an interactive interface for disaster-management questions and recommendations.

Example queries:

What should I do during an earthquake?

Which regions have high disaster risk?

How can evacuation time be improved?

What resources are currently available?

Explain this disaster scenario.

The frontend handles the chat interface while AI processing is handled by the backend and AI service.

🎮 VR Simulations

The actual immersive disaster training experience is performed through the Unity VR application.

The React frontend does not replace the VR application.

Instead, the frontend manages and displays:

Available scenarios
Scenario information
Training history
Training status
Performance results
Scores
AI feedback

Architecture:

React Dashboard
       │
       ▼
Select Training Scenario
       │
       ▼
Backend API
       │
       ▼
Unity VR Application
       │
       ▼
VR Training Session
       │
       ▼
Telemetry & Events
       │
       ▼
Backend
       │
       ▼
AI Analysis
       │
       ▼
Training Result
       │
       ▼
Digital Skill Twin
🎓 Training & Courses

The Training page acts as the management and monitoring interface for VR-based training.

The actual training is performed using the VR headset.

The web application can be used to:

View available scenarios
View training objectives
Start/launch training
View training history
View completed sessions
View scores
View performance metrics
View AI feedback
Track skill development
Training Flow
User
 ↓
Select Scenario
 ↓
Launch VR Training
 ↓
Wear VR Headset
 ↓
Perform Disaster Scenario
 ↓
Training Events Recorded
 ↓
AI Performance Analysis
 ↓
Training Score
 ↓
Digital Skill Twin Updated
 ↓
Results Displayed on Web Dashboard
🧠 Digital Skill Twin

The Digital Skill Twin represents the user's disaster-management capabilities based on training performance.

The frontend can display:

Decision Making
Situational Awareness
Communication
Safety Awareness
Evacuation Skills
Teamwork
Emergency Response
Overall Score

Example:

Digital Skill Twin

Decision Making          82%
Situational Awareness    88%
Communication            76%
Safety Awareness         91%
Evacuation Skill         84%
Teamwork                 79%
Emergency Response       86%

Overall Score            84%

The values are provided by the backend based on VR training performance and AI analysis.

📈 Analytics & Reports

The Analytics section provides visual insights into training and disaster-management data.

Possible metrics include:

Training performance
Average score
Scenario completion
Response time
Evacuation time
Mistakes
Safety violations
Skill development
Risk level
AI performance analysis

The module is mainly useful for trainers and administrators.

📦 Resource Management

The Resource Management page provides visibility into disaster-response resources.

Resources may include:

Medical equipment
Ambulances
Rescue equipment
Emergency personnel
Food supplies
Water supplies
Emergency shelters
Rescue vehicles

The frontend displays resource information received from the backend.

⚙️ Settings

The Settings page provides platform configuration options.

Possible settings include:

User profile
Notifications
Account preferences
Security
System preferences
Platform configuration
👤 User Roles

The frontend supports role-based functionality.

Trainee

Can access:

Training
VR scenarios
Training history
Digital Skill Twin
AI feedback
Personal performance
Trainer

Can access:

Training scenarios
Trainee performance
Training analytics
Skill Twin information
AI feedback
Training reports
Administrator

Can access:

Dashboard
Users
Alerts
Resources
Analytics
Training
Scenarios
System settings
📱 Responsive Design

The frontend is responsive and designed for:

Desktop
   ↓
Laptop
   ↓
Tablet
   ↓
Mobile
Mobile Interface

On mobile devices:

Sidebar becomes a hamburger menu
Navigation opens as an overlay/sidebar
Dashboard grids become responsive
Cards resize automatically
Search becomes responsive
Topbar actions adapt to screen width
Profile controls remain accessible
3D scenes adapt to viewport size
🎨 UI Design

The application uses a modern dark dashboard design.

Design Features
Dark theme
Glassmorphism
Gradient backgrounds
Purple and blue accents
Responsive cards
Interactive navigation
3D visualization
Smooth animations
Data visualization
Status indicators

Design concept:

Dark UI
   +
Glassmorphism
   +
3D Visualization
   +
AI Interface
   +
Disaster Management
🌐 Application Routes

The frontend uses React Router for navigation.

/dashboard
/simulations
/map
/ai-assistant
/alerts
/resources
/analytics
/training
/skill-twin
/settings
/admin
🔌 Backend Integration

The frontend communicates with the Node.js + Express backend through REST APIs.

React Frontend
      │
      │ HTTP / REST API
      ▼
Node.js + Express
      │
      ├── Firebase
      ├── Training Services
      ├── AI Service
      └── Skill Twin Engine

Example:

axios.get("/api/dashboard/trainee");

Protected API requests use authentication tokens.

🔐 Authentication

Authenticated users can access protected platform features.

Example protected areas:

Dashboard
Training
Skill Twin
Analytics
Resources
Admin
Settings

Authentication flow:

User
 ↓
Login
 ↓
Authentication
 ↓
Access Token
 ↓
React Application
 ↓
Protected Routes
 ↓
Backend API
⚙️ Environment Setup

Create a .env file in the frontend root:

VITE_API_BASE_URL=http://localhost:5000/api

For production:

VITE_API_BASE_URL=https://your-backend-domain.com/api

Do not commit sensitive credentials or API keys to Git.

🚀 Installation

Clone the repository:

git clone https://github.com/Gauravthakur003/vr-disaster-management-ai.git

Navigate to the frontend:

cd frontend

Install dependencies:

npm install
▶️ Run Development Server
npm run dev

The application will normally be available at:

http://localhost:5173
🏗️ Production Build

Create the production build:

npm run build

Preview the production build:

npm run preview

The production files are generated in:

dist/
🔄 Project Workflow
                    ┌──────────────┐
                    │     User     │
                    └──────┬───────┘
                           │
                           ▼
                 ┌──────────────────┐
                 │ React Dashboard  │
                 └────────┬─────────┘
                          │
             ┌────────────┼─────────────┐
             │            │             │
             ▼            ▼             ▼
          Alerts       Training       Analytics
             │            │             │
             │            ▼             │
             │       Unity VR           │
             │            │             │
             │            ▼             │
             │      VR Telemetry        │
             │            │             │
             └────────────┼─────────────┘
                          ▼
                  ┌───────────────┐
                  │ Backend API   │
                  └───────┬───────┘
                          │
                 ┌────────┴────────┐
                 ▼                 ▼
           AI Analysis        Database
                 │
                 ▼
          Digital Skill Twin
                 │
                 ▼
           React Dashboard
🎯 Project Objective

The objective of the frontend is to provide a centralized web interface for a VR-based disaster management and training ecosystem.

The platform connects:

React Web Dashboard
        ↓
Backend API
        ↓
Unity VR Training
        ↓
Telemetry & Performance Data
        ↓
AI Analysis
        ↓
Digital Skill Twin
        ↓
Training Feedback
        ↓
React Dashboard

This allows users to perform realistic disaster training through VR while trainers and administrators can monitor performance, analyze results, and track skill development through the web platform.

🔮 Future Enhancements

Planned improvements include:

Real-time disaster alerts
Live disaster map
Real-time VR training status
Advanced analytics
Interactive Digital Skill Twin
AI-powered recommendations
Trainer monitoring dashboard
Advanced 3D visualization
WebSocket-based live updates
Training reports
PDF report generation
Advanced role-based dashboards
Mobile/PWA support
📌 Project Status

Frontend Status: 🚧 Active Development

The frontend dashboard and responsive interface are currently under development.

Backend APIs, AI services, and Unity VR training will be progressively integrated into the frontend.
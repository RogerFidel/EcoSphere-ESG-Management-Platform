# 🌿 GreenQuest — ESG Gamification & AI Recommendation Platform

> **Winner-grade ESG Gamification & AI Recommendations Engine.** GreenQuest is an enterprise-ready sustainability alignment platform that turns eco-friendly choices into an engaging, gamified habit loop while delivering predictive analytics, smart carbon reduction strategies, and automated compliance policy reminders.

---

## 🚀 Key Features

### 🎮 Hackathon-Winning Gamification Engine
*   **Dynamic XP Engine:** Tracks user actions across various ESG categories (transport, energy, waste, food, CSR, etc.) and awards XP based on carbon savings and custom rules.
*   **Automatic Badge Awarder:** Service checks user actions, carbon saved, level benchmarks, and streaks to auto-award tier-based badges (Common to Legendary) in real time.
*   **Employee Leveling & Progress Bars:** Calculates progress and level thresholds dynamically using custom math based on current XP.
*   **Streak tracker:** Dynamic calculations for daily streak preservation and streak breaks, with special rewards for maintaining active streaks.
*   **Reward Redemption:** Secure redemption workflows generating unique gift codes (`GQ-XXXXXXXX`) with inventory checks and XP debiting.
*   **Interactive Challenges:** Team, department, and company-wide challenges with goal countdowns, contribution values, and leaderboard progress tracking.
*   **Global & Department Leaderboards:** High-performance ranking systems presenting Top-3 Podiums, monthly XP leaders, and department ESG competitions.

### 🤖 Smart AI Insights & Recommendations (GPT-4o)
*   **Carbon Reduction Suggestions:** Analyzes logged user activity to recommend personalized, high-impact carbon offset actions.
*   **Smart ESG Insights:** Generates department and organization-level trends, highlighting areas for active green improvements.
*   **Goal Completion Prediction:** Uses past contribution rates and historical trends to forecast whether active challenges will finish on time.
*   **Department Performance Prediction:** Predicts monthly ESG achievements and identifies lagging groups before the cycle ends.
*   **Risk & Compliance Alerts:** Flags low participation departments, high carbon sectors, and ESG policy deviations.

### 📢 Real-Time Communications & Alerts
*   **Server-Sent Events (SSE):** Provides instant, battery-efficient live push notifications (level up, challenge invites, badge unlocks, compliance alerts) directly from Redis.
*   **Automated Cron Scheduler:** Daily/weekly jobs handling policy triggers, CSR event alerts, streak checkups, and challenge completions.
*   **Compliance Alerts & Policy Reminders:** Admin broadcast alerts to departments or all employees.

---

## 🛠️ Technology Stack

### Backend
*   **Runtime:** Node.js (v20) & Express
*   **Database:** PostgreSQL (via Sequelize ORM)
*   **Cache & Messaging:** Redis (caching and Server-Sent Events client management)
*   **AI Integration:** OpenAI GPT-4o SDK
*   **Scheduling:** Node-Cron background workers
*   **Security:** JWT, Bcrypt password hashing, and Express-Validator inputs sanitization
*   **Logging:** Winston & Morgan logging outputs

### Frontend
*   **Core:** React (Vite, Single Page Application)
*   **State:** Zustand (Auth, Notifications, Toast states)
*   **Visuals:** Chart.js & React-Chartjs-2 (Visual ESG trends, categories, and breakdown donut)
*   **Styling:** Premium dark-theme custom design system (custom variables, glassmorphism, floating alerts, and micro-animations)

---

## 📁 Directory Structure

```
greenquest/
├── backend/
│   ├── src/
│   │   ├── config/          # Sequelize & Redis connectors
│   │   ├── middleware/      # JWT auth, role validation, error handlers
│   │   ├── models/          # Relational Sequelize schemas
│   │   ├── routes/          # Express API endpoints
│   │   ├── services/        # Gamification, Notification, AI logic
│   │   ├── jobs/            # Node-cron background schedules
│   │   ├── utils/           # Winston logger configuration
│   │   └── server.js        # API app entry
│   ├── seeds/               # Mock generator for rich demo data
│   ├── tests/               # Unit & Integration test suites
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios clients mapping all endpoints
│   │   ├── components/      # Common shell, Toast, Notif Panel
│   │   ├── store/           # Zustand state managers
│   │   ├── pages/           # All application dashboard views
│   │   ├── App.jsx          # Route router & guards
│   │   ├── index.css        # Core custom CSS UI design system
│   │   └── main.jsx         # React application mounting
│   ├── nginx.conf           # SPA production server config
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml       # Production Compose
├── docker-compose.dev.yml   # Infrastructure developer Compose (Postgres/Redis)
└── README.md
```

---

## 🚦 Quick Start Guide

### Local Development Setup

To run GreenQuest locally on your machine, you need **Docker** installed for hosting local Postgres/Redis databases:

1.  **Clone the Repository** and navigate to the directory:
    ```bash
    git clone https://github.com/your-org/greenquest.git
    cd greenquest
    ```

2.  **Start Infrastructure Services:**
    Spin up the dev PostgreSQL and Redis containers using:
    ```bash
    docker compose -f docker-compose.dev.yml up -d
    ```

3.  **Setup the Backend:**
    Navigate to `backend/`, copy the env example, install packages, run seeds, and launch the dev API:
    ```bash
    cd backend
    cp .env.example .env
    npm install
    # Execute the seed script to populate demo users, badges, challenges, and actions:
    npm run seed
    # Run backend API
    npm run dev
    ```

4.  **Setup the Frontend:**
    In a new terminal window, navigate to `frontend/`, install packages, and start Vite dev server:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Access the application at `http://localhost:3000`.

---

## 🏆 Demo Credentials

Use these seeded logins to test GreenQuest's role-based features:

*   **Administrator Dashboard:** `admin@greenquest.io` / `password123`
*   **Department Manager Tools:** `sarah.chen@greenquest.io` / `password123`
*   **Employee Portal:** `demo@greenquest.io` / `password123`

---

## 🧪 Testing

Execute test suites inside the `backend/` directory:

```bash
cd backend
# Run all Jest tests (unit & integration)
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration
```

---

## 🐳 Docker Stack Deployment

To deploy the entire production stack (Frontend, Backend API, Redis, and PostgreSQL) together:

```bash
docker compose up -d --build
```
The application will serve the Vite SPA via Nginx on port `80`, proxying `/api` queries to the backend automatically.

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

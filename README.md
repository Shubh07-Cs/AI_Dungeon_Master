# ⚔️ ChronosRPG — Git-Native AI Dungeon Master & Time-Loop RPG

*“In a world where spellcraft is compiled, ley lines are fiber-optic, and time itself is version-controlled by a dead god’s abacus.”*

Welcome to **ChronosRPG** — a premium, dark-fantasy cyberpunk text RPG. In this game, your character sheets, inventory bags, and narrative story chronicle are stored directly as files in a Git repository. Every choice you make, battle you fight, or item you loot is committed to your repository in real-time. If your character dies or you regret a choice, you escape the time-loop by **physically reverting your Git commit history** (Time Travel) or **branching out to alternate Git realities**.

Developed with Next.js, Tailwind, Framer Motion, and powered by OpenRouter LLM narration.

---

## 🌌 Core Features

* **🧠 AI-Narrated Game Master**: Dynamic, atmospheric, and highly adaptive storytelling in a gritty, high-magic cyberpunk world, powered by a customized GM soul instruction system.
* **⏳ Git-Native Time Travel**: Escape temporal collapses (death) or rewind mistakes. Time-travel rolls back your physical character sheets, stats, and storyline to previous reality anchors (commits) using real `git reset --hard` operations.
* **🌿 Branching Realities**: Create alternate timelines (Git branches) to see how different paths unfold, switching back and forth seamlessly from your dashboard.
* **🎲 D&D 5e-Style Mechanics**: Automated 1d20 skill checks, stat modifiers, difficulty classes (DCs), inventory items, equip slots, status effects, and level-ups.
* **🖥️ Premium MMO-Style UI**: Full-screen, no-scroll dashboard with high-fidelity glassmorphism, slow-floating ambient particles, reactive health/XP bars, and a custom visual Git timeline.
* **☁️ Dual-Mode Engine**:
  * **💻 Local Git Mode (Local Play)**: Runs real filesystem read/writes and executes actual local `git commit` commands. Automatically redirects you to a play branch (`chronicle`) to keep your `main` codebase 100% clean.
  * **☁️ Browser Emulation Mode (Production/Vercel)**: Automatically engages on Vercel deployments, managing player state, logs, and timeline snapshots isolated in browser `localStorage` so anyone can play instantly without server crashes or database setup.

---

## 🛠️ Local Development Setup

To play the true Git-Native version locally on your computer with physical files and shell Git commits:

### 1. Prerequisites
* [Node.js](https://nodejs.org/) installed (v18+ recommended)
* [Git](https://git-scm.com/) installed and configured on your machine
* An **OpenRouter API Key** (or another LLM provider key)

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/AIDungeonMaster.git
cd AIDungeonMaster
npm install
```

### 3. Environment Variables
Create a file named `.env.local` in the project root directory and add your keys:
```env
# OpenRouter API Configuration
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Override game directory path (defaults to 'game')
GAME_DIR=game
```

### 4. Running the Game
Start the Next.js development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser. 

---

## 🌿 The Dual-Branch Git Workflow (Local Development)

To keep your application source code clean and distinct from your play sessions, the engine features **automated branch protection**:

1. **Auto-Switching**: When you open the dashboard locally, the engine automatically checks if you are on `main`. If so, it programmatically checks out a dedicated play branch called `chronicle` (creating it if it doesn't exist).
2. **Commit Isolation**: All your game file changes and RPG commits (e.g. `game: COMBAT | Defeated Glitch-Wraith`) are kept completely off your `main` branch.
3. **Getting Code Updates**: If the developer releases new features or styling updates on GitHub, you can pull them into your local copy smoothly without merge conflicts:
   ```bash
   git checkout main
   git pull origin main
   git checkout chronicle
   git merge main
   ```
4. **Submitting Pull Requests**: If you want to contribute UI fixes or engine updates back to the project, make your changes on the `main` branch. Your pull requests will be completely clean—containing zero save files or RPG history!

---

## 🚀 Serverless Deployment (Vercel)

This app is pre-configured to be deployed to Vercel with zero database setup:
1. Connect your repository to **Vercel**.
2. Add your `OPENROUTER_API_KEY` to the **Environment Variables** in your Vercel project settings.
3. Deploy! The app will automatically detect Vercel, isolate every visitor's session in their browser's `localStorage`, and run 100% serverless.

---

## 📜 Licenses & Guides
* Review the full gameplay rules, dice formulas, status effects, and guides in [GUIDE.md](file:///c:/Users/shubh/Desktop/AIDungeonMaster/GUIDE.md).
* The Game Master's prompt configuration lives in [game/SOUL.md](file:///c:/Users/shubh/Desktop/AIDungeonMaster/game/SOUL.md).

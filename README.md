# Jamii Tourney - Tournament Management Platform

Multi-model tournament management platform for Kenyan sports supporting administrative hierarchies, inter-county tournaments, leagues, and fixture scheduling.

## Tech Stack

- **Frontend**: React 18 + Vite + TypeScript
- **Styling**: Tailwind CSS + Radix UI
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Netlify
- **Version Control**: GitHub

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd jt3-app/JamiiTourney
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon/public key
4. Create a `.env` file:

```bash
cp .env.example .env
```

5. Update `.env` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment to Netlify

### Option 1: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

### Option 2: Deploy via GitHub

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" > "Import an existing project"
4. Connect your GitHub repository
5. Netlify will auto-detect the build settings from `netlify.toml`
6. Add environment variables in Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
7. Click "Deploy"

## Project Structure

```
JamiiTourney/
├── client/               # React frontend
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utilities and configs
│   └── pages/           # Page components
├── supabase/            # Database migrations
│   └── migrations/      # SQL migration files
├── .env.example         # Environment variables template
├── netlify.toml         # Netlify configuration
├── package.json         # Dependencies
└── vite.config.ts       # Vite configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check

## Features

- Multi-hierarchy tournament support (Ward → County → National)
- Player registration with eligibility validation
- Inter-county tournament management
- League management
- Fixture scheduling
- Discipline case management
- Officials assignment

## License

MIT

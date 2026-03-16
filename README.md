# CoffeeChattr

AI-native agentic CRM for business school students navigating recruiting season. Consolidates job discovery, alumni outreach, resume management, and interview prep into a single intelligent system.

## Stack

- **Frontend:** React + TypeScript + Tailwind CSS (Vite)
- **Backend:** Flask + Flask-RESTX + SQLAlchemy
- **Database:** PostgreSQL
- **AI:** Claude API (Anthropic) with tool use
- **Infra:** Docker Compose

## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- An [Anthropic API key](https://console.anthropic.com/) (for the chat agent)

### Setup

1. Clone the repo and copy the env file:
   ```bash
   cp .env.example .env
   ```

2. Add your Anthropic API key to `.env`:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

3. Start everything:
   ```bash
   docker compose up --build
   ```

4. Open [http://localhost:5173](http://localhost:5173)

The backend runs on port 5000 (API only). The Vite dev server on 5173 proxies API requests automatically.

### Common Commands

```bash
docker compose up --build     # Start all services
docker compose down           # Stop all services
docker compose logs -f        # Tail logs
docker compose exec backend uv run flask db migrate   # Generate migration
docker compose exec backend uv run flask db upgrade    # Run migrations
docker compose exec backend uv run flask shell         # Flask REPL
```

## Features

### Phase 1 — Core Loop (implemented)
- User auth + onboarding
- Career goals CRUD (target industries, roles, locations, narrative)
- Jobs pipeline with status tracking (discovered → saved → applied → interviewing → offer/rejected)
- Resume upload + version management (PDF/DOCX)
- Dashboard with stats and pipeline breakdown
- Agentic chat widget (Claude with tool use — manages pipeline, searches alumni, adds jobs via conversation)

### Phase 2 — Network & Outreach (partial)
- Alumni database browser (search alumni by name, company, location)
- Firm coverage analysis (alumni distribution across firms)
- Agent tools for alumni search and firm lookup

### Phase 3 — Intelligence Layer (planned)
- AI email drafting with personalization
- Gmail/Outlook integration (draft creation, send tracking)
- LinkedIn Chrome MCP extension
- Agentic job discovery
- AI resume tailoring
- Event briefings

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── agent/          # Claude agent loop + tool definitions
│   │   ├── models/         # SQLAlchemy models (all PRD tables)
│   │   ├── routes/         # Flask-RESTX API endpoints
│   │   ├── config.py
│   │   └── extensions.py
│   └── migrations/
├── frontend/
│   └── src/
│       ├── api/            # API client + types
│       ├── components/     # Layout, ChatWidget, UI primitives
│       ├── context/        # Auth state
│       └── pages/          # All app pages
├── docker-compose.yml
└── .env
```

## Design System

- Navy `#0C2340` — primary
- Mid Blue `#2A5F8F` — links and accents
- Light Blue `#B9D9EB` — highlights
- Gold `#C4A35A` — brand accent

Typography: DM Sans (body), Playfair Display (headings), JetBrains Mono (data).

## License

MIT

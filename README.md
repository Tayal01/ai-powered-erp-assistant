# AI Powered ERP Assistant

A full-stack AI-powered ERP assistant built for product discovery, business analytics, and intelligent search workflows. The project combines a React + Vite frontend with a FastAPI backend to support dashboard views, natural-language querying, product search, and image-based product matching.

## Overview

This application is designed for a modern ERP-style merchandising workflow and includes:

- Product catalog exploration and filtering
- AI assistant for natural-language business questions
- Product search across structured data
- Image search and similar-product matching
- Supabase-based authentication and data access
- PostgreSQL + vector-style fallback search support
- Graceful degradation when external services like Typesense are unavailable

## Tech Stack

### Frontend
- React
- Vite
- JavaScript / JSX
- Tailwind CSS
- Framer Motion
- Supabase client

### Backend
- FastAPI
- Python
- Pydantic
- SQLAlchemy
- PostgreSQL / Supabase
- Typesense (optional external search service)
- OpenRouter / Vanna AI integration
- Embedding and image processing support

## Key Features

### Dashboard and ERP workflow
- KPI and operational summary cards
- Product and business data overview
- Modular UI for warehouse / merchandising operations

### Product search
- Search over product data using text-based queries
- Filter support for product attributes
- Fallback logic when external search services are down

### Image search
- Upload an image or use an image URL
- Find visually similar products
- Embedding-based matching and result ranking

### AI assistant
- Natural-language Q&A interface
- Business insight generation from ERP data
- Search and analytics assistance for non-technical users

## Project Structure

```bash
ai-powered-erp-assistant/
├── backend/
│   ├── app/
│   ├── database/
│   ├── scripts/
│   ├── requirements.txt
│   ├── runtime.txt
│   └── README.md
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
├── docs/
├── .gitignore
├── README.md
└── .env.example
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn
- Supabase project access
- PostgreSQL database access
- API keys for AI/search services if enabled

### 1. Clone the repository

```bash
git clone https://github.com/Tayal01/ai-powered-erp-assistant.git
cd ai-powered-erp-assistant
```

### 2. Backend setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a local environment file or configure your project secrets in your runtime environment, including values such as:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `DATABASE_URL`
- `OPENROUTER_API_KEY`
- `TYPESENSE_HOST`
- `TYPESENSE_API_KEY`

Then start the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

The frontend application will typically run at:

```bash
http://localhost:5174
```

## Environment Notes

- Keep all real secrets and environment config local.
- Do not commit `.env` files or local virtual environments to GitHub.
- The repository uses a root-level `.gitignore` to exclude local environment and build artifacts.

## Notes on Search Functionality

The backend is designed to work even when optional external services are unavailable. In particular, the application gracefully falls back to database-backed search behavior if Typesense is unreachable, which helps keep product and image search functional in local or degraded environments.

## Repository Purpose

This repository is structured as a single-project submission for an AI-powered ERP assistant demo and is intended to showcase:

- full-stack application architecture
- realistic ERP data workflows
- AI-assisted product discovery
- resilient backend design

## License

This project is provided for educational and portfolio use.

## Author

WFX AI ERP Assistant

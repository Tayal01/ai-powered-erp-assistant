# WFX AI ERP — Technical Documentation

**Project:** AI-Native ERP Exploration Platform for the Apparel Industry
**Prepared for:** WFX (World Fashion Exchange) — AI Intern Skill Test
**Version:** 0.1.0
**Date:** 10 July 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [Tech Stack](#2-tech-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schema](#4-database-schema)
5. [AI Features](#5-ai-features)
6. [Frontend Screens](#6-frontend-screens)
7. [API Documentation](#7-api-documentation)
8. [Deployment](#8-deployment)
9. [Local Setup](#9-local-setup)
10. [Security & Performance](#10-security--performance)
11. [Use of AI Tools & Design Decisions](#11-use-of-ai-tools--design-decisions)
12. [Screenshots](#12-screenshots)
13. [Future Improvements](#13-future-improvements)

---

## 1. Overview

WFX AI ERP is an **AI-native exploration platform** built on top of a structured apparel-sourcing ERP dataset. The goal is to let business users — merchandisers, buyers, and sourcing managers — interrogate ERP data without writing SQL or navigating multiple back-office screens.

Instead of learning the schema, a user can simply ask:

> *"Which supplier supplied the most denim products?"*
> *"Show all black hoodies under ₹900."*
> *"Which buyer generated the highest revenue?"*

…or search the finished-goods catalogue by natural language (*"blue floral dress"*) or by uploading a reference image to find visually similar garments.

This is **not a chatbot**. It is a full-stack system consisting of a structured PostgreSQL database, a natural-language-to-SQL engine, a hybrid text + vector search layer, clean REST APIs, and a modern React frontend — designed with clean architecture and modular separation rather than a single monolithic script.

### What the platform delivers

| Capability | Status |
| --- | --- |
| Structured database (Supabase / PostgreSQL, 6 tables, ~1,000 rows) | ✅ Implemented |
| Natural Language → SQL (Vanna + OpenRouter) | ✅ Implemented |
| Streaming AI responses (Server-Sent Events) | ✅ Implemented |
| Text product search (Typesense) | ✅ Implemented |
| Image similarity search (CLIP embeddings + vector search) | ✅ Implemented |
| Structured filters with live results | ✅ Implemented |
| Dashboard with KPIs and charts | ✅ Implemented |
| Finished Goods Explorer (gallery, pagination, sorting, filtering) | ✅ Implemented |
| Clean REST APIs + authentication | ✅ Implemented |
| Cloud deployment (Render + Vercel + Supabase) | ✅ Implemented |

---

## 2. Tech Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| **Frontend** | React 18 + Vite | Single-page application |
| | Tailwind CSS | Styling / design system |
| | Recharts | Dashboard charts |
| | Framer Motion | Animations and transitions |
| | Axios | REST client |
| | `@supabase/supabase-js` | Auth session handling |
| **Backend** | FastAPI (Python 3.12) | REST API framework |
| | SQLAlchemy | Database engine / safe query execution |
| | Uvicorn | ASGI server |
| **Database** | Supabase (PostgreSQL) | Structured ERP data |
| | pgvector | Vector column + cosine fallback search |
| **AI / Search** | Vanna AI (`vanna[openai]`) | Natural Language → SQL (RAG over schema) |
| | OpenRouter (`openai/gpt-4o-mini`) | Underlying LLM for SQL + summaries |
| | Typesense | Text search + vector search engine |
| | Sentence-Transformers (`clip-ViT-B-32`) | 512-dim CLIP embeddings (text + image) |
| **Deployment** | Render (backend), Vercel (frontend), Supabase (DB), Typesense Cloud (search) | Hosting |

---

## 3. System Architecture

The system follows a **three-tier, service-oriented architecture**. The frontend never talks to the database or AI providers directly — every operation flows through the FastAPI backend, which owns all business logic, guardrails, and integrations.

```
┌──────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                             │
│   React + Vite SPA  ·  Tailwind  ·  Recharts  ·  Framer Motion        │
│   Dashboard │ Products │ Product Search │ AI Assistant │ Image Search │
└───────────────┬──────────────────────────────────┬───────────────────┘
                │ REST (Axios) + SSE (fetch)        │ Supabase Auth (JWT)
                ▼                                    ▼
┌──────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                              │
│                                                                      │
│   Routes:   /auth   /dashboard   /products   /ai   /search           │
│   ─────────────────────────────────────────────────────────────     │
│   Services:                                                          │
│     • auth_service      → verifies Supabase access tokens            │
│     • vanna_service     → NL→SQL, validation, safe execution         │
│     • embedding_service → CLIP text/image → 512-dim vectors          │
│     • typesense_service → indexing, text + vector search             │
│     • supabase_service  → data access, dashboard aggregation         │
└──────┬───────────────┬─────────────────┬──────────────────┬─────────┘
       │               │                 │                  │
       ▼               ▼                 ▼                  ▼
┌────────────┐  ┌────────────┐   ┌──────────────┐   ┌──────────────┐
│  Supabase  │  │ OpenRouter │   │  Typesense   │   │ CLIP model   │
│ PostgreSQL │  │   (LLM)    │   │    Cloud     │   │ (in-process) │
│ + pgvector │  │            │   │              │   │              │
└────────────┘  └────────────┘   └──────────────┘   └──────────────┘
```

### 3.1 Natural Language → SQL flow

1. User asks a question in the **AI Assistant** screen.
2. `POST /api/ai/chat` (or `/chat/stream`) receives the question.
3. **`vanna_service`** uses Vanna's RAG retrieval over the trained schema + curated example queries to build a prompt, and calls **OpenRouter** to generate SQL.
4. The generated SQL passes through a **strict validator** (SELECT-only, keyword blocklist, table whitelist, no chained statements, forced row limit).
5. The safe query runs against **Supabase PostgreSQL** via SQLAlchemy.
6. The result rows are sent back to OpenRouter to produce a concise **business summary**.
7. The response `{ question, sql, rows, row_count, summary }` is returned — streamed token-by-token over SSE when using the streaming endpoint.

### 3.2 Search flow

1. **Text search** — `POST /api/search/products` queries the Typesense `wfx_products` collection across searchable fields with facet filters (category, colour, fabric, GSM range, etc.).
2. **Image search** — an uploaded image or image URL is converted to a 512-dim CLIP embedding by `embedding_service`, then a **vector query** finds the nearest garments in Typesense.
3. **Graceful degradation** — if Typesense is unavailable, search transparently falls back to Supabase (`ILIKE` for text, `pgvector` cosine `<=>` for image similarity), so the feature never hard-fails.

### 3.3 Modular design

The backend is split into `routes/` (thin HTTP handlers) and `services/` (business logic), with configuration centralised in `config/settings.py` (Pydantic Settings). This separation keeps each concern independently testable and replaceable — e.g. swapping the LLM provider or the search engine touches a single service file.

---

## 4. Database Schema

The database runs on **Supabase (PostgreSQL)** with the `vector` (pgvector) extension enabled. It consists of six normalised tables populated from the provided CSV dataset (~1,000 rows).

### Entity relationships

```
buyers ──────────┐
                 │ (company_name)
                 ▼
suppliers ──► finished_goods ──► sales_orders ──► sales_invoices
(company_name)  (style_number)     (order_number)
                 │
                 └──► tech_packs  (1:1 on style_number)
```

### Tables

| Table | Key columns | Notes |
| --- | --- | --- |
| **buyers** | `buyer_id` (PK), `company_name` (unique), `country`, `buyer_category` | Companies placing orders |
| **suppliers** | `supplier_id` (PK), `company_name` (unique), `country`, `contact`, `lead_time_days`, `rating` | Manufacturers; rating 0–5 |
| **finished_goods** | `style_number` (PK), `style_name`, `category`, `fabric`, `gsm`, `color`, `print`, `season`, `brand`, `supplier` (FK), `cost`, `selling_price`, `image_url`, `embedding vector(512)` | Core product catalogue |
| **sales_orders** | `order_number` (PK), `buyer` (FK), `style_number` (FK), `quantity`, `unit_price`, `shipment_date`, `status` | Links buyers to styles |
| **sales_invoices** | `invoice_number` (PK), `sales_order` (FK), `amount`, `currency`, `payment_status` | Billing records |
| **tech_packs** | `tech_pack_id` (PK), `style_number` (FK, unique), `fabric_details`, `construction`, `wash_instructions` | 1:1 spec sheet per style |

### Design decisions

- **`embedding vector(512)`** is stored directly on `finished_goods`, so image similarity works even without Typesense (via pgvector cosine distance).
- **Referential integrity** is enforced through foreign keys (`supplier`, `buyer`, `style_number`, `sales_order`), and **CHECK constraints** guard numeric ranges (`gsm > 0`, `rating BETWEEN 0 AND 5`, non-negative money).
- **Indexes** are created on all frequently filtered/joined columns (category, supplier, season, status, shipment_date, payment_status) to keep dashboard aggregation and product listing fast.
- **Row Level Security** is enabled on every table; the backend uses the service role key for trusted access.

The full DDL lives in [`wfx-ai-erp-backend/database/schema.sql`](../wfx-ai-erp-backend/database/schema.sql).

---

## 5. AI Features

### 5.1 Natural Language → SQL (Vanna + OpenRouter)

- **Framework:** Vanna AI, composed with a lightweight in-memory vector store (RAG) plus OpenRouter as the LLM. The in-memory store avoids shipping ChromaDB/onnxruntime, keeping the service within the memory budget of small hosts and eliminating cold-start model downloads.
- **Training corpus:** the SQL schema (DDL) + curated documentation + example question/SQL pairs, so the model grounds its output in the real table structure.
- **Safety validation** (in `vanna_service.py`) before any query executes:
  1. **SELECT / WITH only** — read-only.
  2. **Keyword blocklist** — rejects `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `TRUNCATE`, `CREATE`, `GRANT`, `REVOKE`, `COMMENT`, `VACUUM`, `ANALYZE`, `COPY`.
  3. **Table whitelist** — only the six ERP tables may be referenced.
  4. **No chained statements** — a stray `;` is rejected.
  5. **Forced row limit** — the query is wrapped to cap results at 100 rows.
- **Output:** the UI displays the *user question*, the *generated SQL*, the *SQL result table*, and an *AI-generated natural-language summary*.
- **Streaming:** `/api/ai/chat/stream` emits Server-Sent Events (`status → sql → rows → summary deltas → done`) so the answer renders progressively.

### 5.2 Text & Image Search

- **Engine:** Typesense hosts a `wfx_products` collection with facetable fields and a 512-dim `embedding` field.
- **Embeddings:** `sentence-transformers` `clip-ViT-B-32` encodes both text and images into the same 512-dim space, enabling cross-modal search. The model is lazily loaded and cached (`@lru_cache`) so it only loads on first use.
- **Text search:** multi-field query across style name, category, fabric, colour, print, season, brand, supplier, and tech-pack details, with structured facet filters and a GSM range.
- **Image search:** upload a garment photo or paste an image URL → CLIP embedding → nearest-neighbour vector query returns visually similar garments with a similarity percentage.
- **Relevance scoring:** results carry a `match_percent` derived from either visual similarity or text relevance, giving users an intuitive confidence signal.
- **Fallback:** when Typesense is offline, the same searches run against Supabase (`ILIKE` + pgvector), so search is always available.

---

## 6. Frontend Screens

The frontend is a single-page React application with five primary views, protected behind a Supabase Auth login.

| # | Screen | Description |
| --- | --- | --- |
| 1 | **Dashboard** | KPI cards (Total Finished Goods, Suppliers, Buyers, Orders, Revenue, pending invoices) plus charts — category distribution, order/payment status, top buyers by revenue, and monthly order/revenue trend. All aggregation is done in SQL server-side. |
| 2 | **AI Assistant** | Chat-style interface. Displays the user question, generated SQL, streaming response, final AI answer, and the SQL result table. |
| 3 | **Product Search** | Natural-language search combined with structured filters (category, fabric, GSM, supplier, buyer, print, colour, season). Results update dynamically. |
| 4 | **Image Search** | Search by natural language or by uploading a reference image; displays visually similar garments with match scores. |
| 5 | **Finished Goods Explorer** | Professional product gallery. Each card shows product image, style number, style name, fabric, GSM, supplier, and selling price. Supports pagination, sorting, and filtering. |

Supporting UI concerns — auth flow, error banners, toast notifications, responsive sidebar navigation, and a shared component/animation library — live under `src/components/`.

---

## 7. API Documentation

**Base URL (local):** `http://127.0.0.1:8000`
**Auth:** All data endpoints require `Authorization: Bearer <supabase_access_token>`. The token is obtained by signing in through Supabase Auth on the frontend and verified server-side (with a short in-memory cache) by `auth_service`.

### Endpoint summary

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | Service metadata |
| `GET` | `/health` | Integration health (Supabase, OpenRouter, Typesense, embeddings, auth) |
| `GET` | `/api/auth/me` | Current authenticated user profile |
| `GET` | `/api/dashboard/summary` | KPIs, charts, and recent orders |
| `GET` | `/api/products` | Paginated product list (filters + sorting) |
| `GET` | `/api/products/{style_number}` | Single product detail |
| `POST` | `/api/ai/chat` | Natural-language question → SQL + rows + summary |
| `POST` | `/api/ai/chat/stream` | Same as above, streamed over Server-Sent Events |
| `POST` | `/api/search/products` | Text + structured filter search |
| `POST` | `/api/search/image` | Image-upload similarity search (multipart) |
| `POST` | `/api/search/image-url` | Image-URL similarity search (JSON) |
| `POST` | `/api/search/reindex` | Rebuild Typesense index + embeddings |

Each router also exposes a `GET .../status` health endpoint.

### Selected endpoint details

**`POST /api/ai/chat`**

Request:
```json
{ "question": "Which buyer generated the highest revenue?" }
```

Response:
```json
{
  "question": "Which buyer generated the highest revenue?",
  "sql": "SELECT buyer, SUM(quantity * unit_price) AS revenue FROM sales_orders GROUP BY buyer ORDER BY revenue DESC LIMIT 1",
  "row_count": 1,
  "rows": [{ "buyer": "ABC Retail", "revenue": 1250000.00 }],
  "summary": "ABC Retail is the top buyer, generating ₹1,250,000 in order revenue..."
}
```

**`GET /api/products`** — query params: `page` (default 1), `page_size` (default 24, max 100), optional `category`, `color`, `fabric`, `season`, `supplier`, `sort_by`, `sort_order` (`asc|desc`).

**`POST /api/search/products`**
```json
{ "query": "black oversized hoodie", "category": "Hoodies", "gsm_min": "200", "limit": 12 }
```

**`POST /api/search/image`** — multipart form-data: `image` (file), optional `limit`. Returns garments ranked by visual similarity.

### Error handling

Endpoints return meaningful HTTP status codes:
- `400` — invalid input (e.g. non-SELECT SQL, missing image).
- `401` — missing/expired session token.
- `404` — product not found.
- `502` / `503` — upstream integration unavailable (Supabase, OpenRouter, Typesense).

Interactive OpenAPI docs are available at `/docs` (Swagger UI) when the backend is running.

---

## 8. Deployment

The platform is deployed across three managed services, matching the assignment's recommended stack.

| Component | Platform | Notes |
| --- | --- | --- |
| **Backend** | Render | FastAPI served by Uvicorn; Python 3.12 (`runtime.txt`) |
| **Frontend** | Vercel | Static Vite build; environment variables injected at build time |
| **Database** | Supabase | PostgreSQL + pgvector + Supabase Auth |
| **Search** | Typesense Cloud | `wfx_products` collection |

### Backend (Render)

- **Build command:** `pip install -r requirements.txt`
- **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment variables:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `DATABASE_URL`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `TYPESENSE_HOST`, `TYPESENSE_PORT`, `TYPESENSE_PROTOCOL`, `TYPESENSE_API_KEY`, `FRONTEND_ORIGINS`.

### Frontend (Vercel)

- **Framework preset:** Vite
- **Build command:** `npm run build` · **Output:** `dist`
- **Environment variables:** `VITE_API_BASE_URL` (the deployed Render URL), `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

### Database (Supabase)

1. Create a project and run `database/schema.sql` in the SQL editor (enables pgvector, creates tables, indexes, RLS).
2. Import the CSV dataset via `scripts/import_erp_data.py`.
3. Generate embeddings and seed Typesense via `scripts/index_products.py`.

> **CORS:** the backend restricts origins to the values in `FRONTEND_ORIGINS`, so the deployed Vercel URL must be added there.

---

## 9. Local Setup

### Prerequisites
- Python 3.12+, Node.js 18+
- A Supabase project, a Typesense instance, and an OpenRouter API key

### Backend
```bash
cd wfx-ai-erp-backend
cp .env.example .env          # fill in Supabase / OpenRouter / Typesense values
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# one-time data setup
python scripts/import_erp_data.py     # load CSVs into Supabase
python scripts/index_products.py      # embeddings + Typesense index

uvicorn app.main:app --reload         # http://localhost:8000
```

### Frontend
```bash
cd wfx-ai-erp-frontend
cp .env.example .env          # set VITE_API_BASE_URL + Supabase public keys
npm install
npm run dev                   # http://localhost:5174
```

---

## 10. Security & Performance

### Security
- **Authentication** via Supabase Auth — the frontend signs in and passes the access token as a bearer credential; the backend verifies it against Supabase (`auth.get_user`) with a 5-minute in-memory cache.
- **SQL guardrails** — the multi-layer validator described in §5.1 makes the NL→SQL path read-only and injection-resistant.
- **Row Level Security** enabled on all tables.
- **Secrets** are kept in environment variables and never committed; the browser only receives public Supabase keys.

### Performance
- **SQL-side aggregation** — the dashboard computes all KPIs and chart series with `GROUP BY`/`SUM` in a handful of queries, never pulling thousands of rows into the app.
- **Caching** — CLIP model weights, the schema context, and the Vanna instance are cached with `@lru_cache`; dashboard results are cached with a short TTL.
- **Lazy model loading** — the heavy CLIP/torch model only loads when image search is first used.
- **Forced row limits** on generated SQL prevent runaway queries.
- **Graceful degradation** — search falls back to Supabase when Typesense is unavailable.

---

## 11. Use of AI Tools & Design Decisions

Per the assignment's request for transparency:

- **AI-assisted development:** AI coding assistants (Claude / Cursor-style tooling) were used to accelerate boilerplate — route scaffolding, the Typesense schema, and documentation drafting. All architecture, integration logic, the SQL-safety validator, and the search/fallback strategy were reviewed and adapted manually.
- **Built manually:** the service/route separation, the NL→SQL validation guardrails, the dashboard SQL aggregation, the Typesense↔Supabase fallback logic, and the frontend view composition.

### Key assumptions & decisions
- **In-memory Vanna store over ChromaDB** — chosen to keep the backend light enough for free-tier hosting and to avoid cold-start downloads.
- **CLIP (`clip-ViT-B-32`) for a shared text/image embedding space** — enables both text-and image-based visual search with one model.
- **Embeddings persisted on `finished_goods`** — provides a pgvector fallback so image search survives a Typesense outage.
- **OpenRouter with `openai/gpt-4o-mini`** — a cost-effective model that is accurate enough for schema-grounded SQL generation.

---

## 12. Screenshots

> _Add exported images to `docs/screenshots/` and reference them here before submission._

| Screen | Screenshot |
| --- | --- |
| Dashboard (KPIs + charts) | `docs/screenshots/dashboard.png` |
| AI Assistant (question → SQL → answer) | `docs/screenshots/assistant.png` |
| Product Search (filters + results) | `docs/screenshots/product-search.png` |
| Image Search (visual similarity) | `docs/screenshots/image-search.png` |
| Finished Goods Explorer (gallery) | `docs/screenshots/explorer.png` |

_Example embed:_
```markdown
![Dashboard](screenshots/dashboard.png)
```

---

## 13. Future Improvements

- **Confidence scores for NL→SQL** — surface a reliability signal and offer a "regenerate" option when confidence is low.
- **Dynamic chart rendering from query results** — auto-visualise AI answers that return groupable/time-series data.
- **Background jobs / webhooks for indexing** — move embedding generation off the request path into a queue for large catalogues.
- **Conversation memory** — allow follow-up questions ("…and only for Spring?") that build on prior context.
- **Role-based access control** — differentiate merchandiser, buyer, and admin permissions.
- **Docker + Docker Compose** — one-command local bring-up of backend, frontend, and Typesense.
- **CI/CD via GitHub Actions** — automated lint, test, and deploy on every push.
- **Query result caching & pagination for search** — cache frequent searches and paginate large result sets.
- **Observability** — structured logging, request tracing, and integration health dashboards.

---

*This document accompanies the WFX AI ERP submission: a public GitHub repository, a live frontend (Vercel) and backend (Render) deployment, and a short demo video.*

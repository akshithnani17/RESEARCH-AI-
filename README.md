# ResearchGap AI (Version 2.0)

> **Evidence-Grounded Research Gap Discovery and Solution Recommendation Platform**

ResearchGap AI is a full-stack research intelligence platform that enables researchers, graduate students, and software developers to upload 5 or more research papers, systematically analyze and compare their methodologies, discover evidence-backed research gaps with transparent multi-factor scoring, generate actionable system architectures, and export universal master prompts ready to paste into any LLM.

---

## 1. Core Academic Principles

ResearchGap AI enforces strict scientific demarcation across all outputs:

1. **FACT**: Information explicitly stated and cited directly from uploaded papers with verbatim quotes, section tags, and page numbers.
2. **INFERENCE**: Synthesized cross-paper gaps derived by comparing limitations, contradictions, and empirical trade-offs across literature.
3. **PROPOSAL**: An engineered solution, system architecture, algorithm suite, and implementation roadmap formulated by the AI.

The platform never presents AI inferences or proposals as directly stated facts, avoids unsupported universal claims, and enforces rigorous citation verification.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Dark/Modern Research SaaS theme)
- **Routing:** React Router v7
- **Data Fetching & State:** TanStack Query (React Query v5)
- **Forms & Validation:** React Hook Form + Zod
- **Diagrams & Graphs:** React Flow (`@xyflow/react`)
- **Icons:** Lucide React (Strictly zero emojis)
- **HTTP Client:** Axios with JWT request/response interceptors

### Backend
- **Framework:** Python 3.11+ / FastAPI
- **Data Validation & Schemas:** Pydantic v2
- **ORM & Database:** SQLAlchemy 2.0 (SQLite default for zero-setup local dev, PostgreSQL / pgvector ready)
- **Authentication:** JWT Bearer tokens (HS256) + bcrypt password hashing
- **PDF Extraction:** PyMuPDF (`fitz`) and `pypdf` with section classifier and chunker
- **AI & RAG Engine:** OpenAI-compatible client interface (OpenAI, Gemini, Ollama, DeepSeek) + Grounded Offline Heuristic Intelligence Engine

---

## 3. Project Architecture

```text
researchgap-ai/
├── backend/
│   ├── app/
│   │   ├── api/             # REST Endpoints (auth, projects, papers, analysis, gaps, solutions, prompts, reports)
│   │   ├── core/            # Config, security, database session
│   │   ├── models/          # SQLAlchemy Database Entities
│   │   ├── schemas/         # Pydantic Schemas & Data Contracts
│   │   ├── pdf/             # PyMuPDF Extractor & Semantic Chunker
│   │   ├── rag/             # Hybrid Cosine & TF-IDF Retriever
│   │   ├── ai/              # LLM Client, Prompts, Parser & Offline Engine
│   │   ├── services/        # Pipeline Coordinator, Demo Dataset, Report Service
│   │   └── main.py          # FastAPI Application Entrypoint
│   ├── tests/               # Pytest Automated Test Suite
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API Client
│   │   ├── contexts/        # Auth Context & Session Management
│   │   ├── components/      # Layout, Architecture Builder & Research Graph
│   │   ├── pages/           # Landing, Auth, Dashboard, Upload, Analysis, Matrix, Gaps, Workspace, Master Prompt, Reports
│   │   ├── types/           # TypeScript Types & Interfaces
│   │   ├── App.tsx          # Router Setup
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. Getting Started (Local Setup)

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Clone the Repository
```bash
cd "research ai antigravity"
```

### Step 2: Backend Setup
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run automated tests
pytest

# Start FastAPI backend server
python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```
The backend API documentation is available at `http://localhost:8000/docs`.

### Step 3: Frontend Setup
```bash
# In a new terminal window:
cd frontend

# Install packages
npm install

# Start Vite development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 5. Running with Docker Compose

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 6. End-to-End Workflow Demonstration

1. **Open Landing Page:** View the product overview, interactive mock dashboard preview, and methodology explanation.
2. **Sign Up / Sign In:** Create an account with secure password hashing and session persistence.
3. **Create Research Project or Click "Load Demo Project":**
   - Provide Project Title, Research Domain, Research Topic, and Research Question.
   - Or click **"Load Demo Research Project"** to immediately benchmark 5 seminal literature papers on Retrieval-Augmented Generation.
4. **Upload Research Papers:** Drag and drop 5 or more PDF papers with live progress and size validation.
5. **Start Literature Analysis:** Watch the live multi-step pipeline stepper (Extracting -> Analyzing -> Comparing -> Discovering Gaps -> Ranking Gaps -> Formulating Solution).
6. **Paper Analysis Cards:** Inspect extracted research problems, methodologies, datasets, algorithms, and reported limitations with exact page and section citations via the **Evidence Drawer**.
7. **Cross-Paper Comparison Matrix:** Compare baseline papers across 8 standardized dimensions, inspect detected contradictions and empirical trade-offs.
8. **Interactive Research Graph:** Pan, zoom, and inspect nodes and edges linking Papers, Limitations, Gaps, and Solutions in real-time.
9. **Research Gap Discovery & Ranking:** View candidate gaps scored transparently across:
   - 30% Evidence Strength
   - 20% Cross-Paper Support
   - 20% Potential Novelty
   - 15% Potential Impact
   - 15% Technical Feasibility
10. **Formulate Solution Blueprint:** Generate the interactive system architecture diagram, recommended algorithm suite with computational complexity, benchmark datasets, and phased implementation roadmap with checklist tracking.
11. **Generate Master Prompt:** Access the dedicated Universal Master Prompt page, review the complete prompt, search within text, copy with visual feedback, and download as `.txt` or `.md`.
12. **Export Research Report:** Download comprehensive academic markdown or plaintext synthesis reports.

---

## 7. AI Provider Configuration

ResearchGap AI supports both OpenAI-compatible external APIs and an intelligent offline research engine:

In `.env`:
```env
# For OpenAI / OpenAI-compatible endpoints:
LLM_PROVIDER=openai_compatible
LLM_API_KEY=your_api_key_here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini

# If LLM_API_KEY is omitted or offline, the platform automatically utilizes its grounded Offline Research Intelligence Engine.
```

---

## 8. REST API Summary

- `POST /api/auth/signup` - Register a new researcher account
- `POST /api/auth/login` - Authenticate and obtain JWT access token
- `GET  /api/auth/me` - Retrieve current authenticated user profile
- `GET  /api/projects` - List all research projects for the user
- `POST /api/projects` - Create a new research project
- `POST /api/projects/load-demo` - Load preloaded benchmark dataset
- `GET  /api/projects/{id}` - Retrieve project metadata and health score
- `POST /api/projects/{id}/papers/upload` - Upload PDF research papers
- `GET  /api/projects/{id}/papers` - List uploaded papers and analysis cards
- `POST /api/projects/{id}/analysis/run` - Trigger full cross-paper analysis pipeline
- `GET  /api/projects/{id}/comparison` - Retrieve cross-paper comparison matrix
- `GET  /api/projects/{id}/gaps` - List ranked research gaps and transparent scores
- `POST /api/projects/{id}/gaps/{gapId}/select` - Bookmark and select primary gap
- `GET  /api/projects/{id}/gaps/graph` - Retrieve React Flow graph nodes and edges
- `GET  /api/projects/{id}/solution` - Retrieve proposed solution, architecture, and roadmap
- `POST /api/projects/{id}/solution/generate` - Generate or regenerate solution
- `GET  /api/projects/{id}/prompt` - Retrieve Universal Master Prompt
- `POST /api/projects/{id}/prompt/generate` - Regenerate prompt with custom instructions
- `GET  /api/projects/{id}/reports/markdown` - Retrieve full academic markdown report
- `GET  /api/projects/{id}/reports/download` - Download report in `.md` or `.txt` format

---

## 9. Academic Safety & Verification

- No emojis are used in the user interface, buttons, toasts, generated reports, or prompts.
- All experimental metrics are labeled as **"Expected / Planned Metric"** to prevent falsification of empirical results.
- Users can only view and manage their own authenticated workspaces.

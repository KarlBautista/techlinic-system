# Penny — Fully Offline AI Document Assistant 🐧

> A penguin with a backpack filled with documents. Your offline NotebookLM alternative.

## Vision

Penny is a fully offline, mobile-first AI document assistant. Upload documents (PDF, DOCX, TXT, MD), and Penny helps you summarize, query, generate content, and organize everything — all running locally on your phone with zero internet required after initial setup.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│            React Native App (Expo Dev Build)      │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  UI Layer (React Native + NativeWind)      │  │
│  │  - Chat with Penny                         │  │
│  │  - Document manager                        │  │
│  │  - Workspace/notebook organizer            │  │
│  │  - Model manager (download/delete models)  │  │
│  │  - Settings                                │  │
│  └──────────────────┬─────────────────────────┘  │
│                     │                            │
│  ┌──────────────────▼─────────────────────────┐  │
│  │  Service Layer (TypeScript)                │  │
│  │  - LLMService (wraps llama.rn)             │  │
│  │  - RAGService (embed → search → generate)  │  │
│  │  - DocumentService (parse, chunk, store)   │  │
│  │  - WorkspaceService (CRUD workspaces)      │  │
│  │  - ChatService (conversation management)   │  │
│  │  - GenerationService (summaries, outlines) │  │
│  └───┬──────────┬──────────┬─────────────────┘  │
│      │          │          │                     │
│  ┌───▼───┐ ┌───▼────┐ ┌───▼──────────────────┐  │
│  │llama  │ │SQLite  │ │ Document Parsers     │  │
│  │.rn    │ │        │ │ - PDF (react-native- │  │
│  │       │ │Stores: │ │   blob-util + pdf)   │  │
│  │Runs:  │ │- Docs  │ │ - DOCX (mammoth)     │  │
│  │- Chat │ │- Chunks│ │ - Markdown (marked)  │  │
│  │- Embed│ │- Embeds│ │ - TXT (native)       │  │
│  │- Gen  │ │- Chats │ │                      │  │
│  └───────┘ └────────┘ └──────────────────────┘  │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │  Local File System (RNFS)                  │  │
│  │  /models/  → Downloaded GGUF model files   │  │
│  │  /docs/    → User uploaded documents       │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | React Native + Expo (dev build) | Cross-platform, native module support |
| LLM Engine | `llama.rn` (llama.cpp bindings) | On-device inference, GGUF models |
| Database | `expo-sqlite` | Document + embedding storage, zero-config |
| Styling | NativeWind (TailwindCSS for RN) | Fast, familiar, responsive |
| Navigation | React Navigation | Standard RN navigation |
| State | Zustand | Lightweight, simple, no boilerplate |
| File Access | `expo-file-system` + `expo-document-picker` | Pick & read local files |
| PDF Parsing | `react-native-pdf-parser` | Extract text from PDFs |
| DOCX Parsing | `mammoth` (adapted) | Extract text from Word docs |
| Markdown | `react-native-markdown-display` | Render markdown responses |

---

## Phases

### Phase 1 — Foundation & First Chat ✨
**Goal:** App loads, model runs, Penny responds.

- [ ] Environment setup (Android Studio, JDK, Expo)
- [ ] Create Expo project with dev build config
- [ ] Integrate `llama.rn` native module
- [ ] Download & load a GGUF model (Phi-3-mini or Gemma-2B)
- [ ] Build chat screen with streaming responses
- [ ] Penny system prompt & personality
- [ ] Basic navigation (Home, Chat, Settings)

### Phase 2 — Document Pipeline 📄
**Goal:** Upload docs, parse them, store in SQLite.

- [ ] File picker integration (PDF, DOCX, TXT, MD)
- [ ] Document parsing → text extraction
- [ ] Text chunking (semantic chunking with overlap)
- [ ] SQLite schema: documents, chunks, workspaces
- [ ] Document list screen with search
- [ ] Document viewer screen

### Phase 3 — RAG (Retrieval-Augmented Generation) 🔍
**Goal:** Ask questions about your documents, get grounded answers.

- [ ] Embedding pipeline (llama.rn embedding mode)
- [ ] Store embeddings in SQLite as BLOBs
- [ ] Cosine similarity search function
- [ ] RAG orchestration: embed query → retrieve → inject context → generate
- [ ] Source citations in responses
- [ ] "Ask about this document" mode in chat

### Phase 4 — Document Generation 📝
**Goal:** Generate new documents from uploaded ones.

- [ ] Summary generation (brief, detailed, bullet points)
- [ ] Outline generator
- [ ] Study guide / FAQ generator
- [ ] Export to Markdown file
- [ ] Template system for generation prompts
- [ ] Workspace/notebook grouping

### Phase 5 — Polish & Optimization 🚀
**Goal:** Fast, beautiful, production-ready.

- [ ] Model download manager (progress bar, model picker)
- [ ] Penny mascot/avatar in chat
- [ ] Response streaming with typing indicator
- [ ] Memory optimization (model unloading, chunk pagination)
- [ ] App startup optimization
- [ ] Offline model bundling option
- [ ] Dark/light theme

---

## Database Schema (SQLite)

```sql
-- Workspaces (like notebooks in NotebookLM)
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Documents
CREATE TABLE documents (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    file_type TEXT NOT NULL, -- pdf, docx, txt, md
    file_path TEXT,
    file_size INTEGER,
    content TEXT,            -- full extracted text
    created_at TEXT DEFAULT (datetime('now'))
);

-- Document chunks (for RAG)
CREATE TABLE chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT REFERENCES documents(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER,
    start_offset INTEGER,
    end_offset INTEGER,
    embedding BLOB           -- float32 array stored as blob
);

-- Chat conversations
CREATE TABLE conversations (
    id TEXT PRIMARY KEY,
    workspace_id TEXT REFERENCES workspaces(id) ON DELETE CASCADE,
    title TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Chat messages
CREATE TABLE messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,       -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    sources TEXT,             -- JSON array of chunk IDs used
    created_at TEXT DEFAULT (datetime('now'))
);

-- Model registry
CREATE TABLE models (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    model_type TEXT,          -- 'chat', 'embedding'
    is_default INTEGER DEFAULT 0,
    downloaded_at TEXT DEFAULT (datetime('now'))
);
```

---

## Recommended Models

### For Chat/Generation
| Model | Size | RAM Needed | Quality | Speed |
|-------|------|-----------|---------|-------|
| Phi-3-mini-4k Q4_K_M | ~2.3GB | ~3GB | ★★★★ | ★★★ |
| Gemma-2B-it Q4_K_M | ~1.5GB | ~2GB | ★★★ | ★★★★ |
| TinyLlama-1.1B Q4_K_M | ~700MB | ~1.2GB | ★★ | ★★★★★ |
| Llama-3.2-1B Q4_K_M | ~900MB | ~1.5GB | ★★★ | ★★★★ |
| Llama-3.2-3B Q4_K_M | ~2GB | ~3GB | ★★★★ | ★★★ |

### For Embeddings
| Model | Size | Dimensions | Quality |
|-------|------|-----------|---------|
| nomic-embed-text Q4 | ~250MB | 768 | ★★★★ |
| all-MiniLM-L6-v2 GGUF | ~80MB | 384 | ★★★ |
| BGE-small GGUF | ~130MB | 384 | ★★★★ |

**Recommendation:** Start with **Llama-3.2-3B Q4** for chat + **all-MiniLM-L6-v2** for embeddings. Good balance of quality and phone performance.

---

## Key Design Decisions

1. **Expo Dev Build** (not Expo Go) — We need native modules (llama.rn uses C++)
2. **SQLite for vectors** — Simpler than embedding a separate vector DB; fast enough for <50K chunks
3. **Streaming via callbacks** — llama.rn supports token-by-token callbacks for real-time chat
4. **Lazy embedding** — Documents are embedded on first query, not on upload (saves battery)
5. **Chunking strategy** — 512 tokens with 50-token overlap, respecting sentence boundaries

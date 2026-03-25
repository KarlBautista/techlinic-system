# Optimization Strategy — Penny

Everything in Penny must be optimized for mobile: limited RAM, limited CPU, battery constraints, and no network. This document covers every optimization layer.

---

## 1. LLM Inference Optimization

### Model Selection
- Use **quantized models** (Q4_K_M or Q4_K_S) — 4-bit quantization reduces model size by ~4x with minimal quality loss
- Start with **3B parameter** models max for ~4GB RAM phones; offer **1B models** for low-end devices
- Separate models for **chat** (3B) and **embeddings** (small specialized model ~80-250MB)

### llama.rn Configuration
```typescript
const contextParams = {
  n_ctx: 2048,        // Context window — lower = faster, 2048 is sweet spot
  n_batch: 512,       // Batch size for prompt processing
  n_threads: 4,       // Match physical CPU cores (not hyperthreaded)
  n_gpu_layers: 0,    // GPU offload (if device supports Vulkan/OpenCL)
  use_mmap: true,     // Memory-map model file — reduces RAM usage significantly
  use_mlock: false,   // Don't lock in RAM — let OS manage
};
```

### Key Optimizations
| Technique | Impact | How |
|-----------|--------|-----|
| **mmap loading** | -50% RAM | Model stays on disk, pages loaded on demand |
| **4-bit quantization** | -75% model size | Use Q4_K_M GGUF files |
| **KV cache quantization** | -30% KV RAM | llama.cpp supports Q8 KV cache |
| **Context window limit** | -40% RAM | Use 2048 instead of 4096+ |
| **Batch processing** | +30% throughput | Process 512 tokens per batch |
| **Thread count tuning** | +20% speed | Match physical cores (usually 4) |

### Model Lifecycle
```
App Start → No model loaded (fast startup)
User opens chat → Load model into memory (~2-5 sec)
User leaves chat → Keep model for 2 min, then unload
Background → Immediately unload model (free RAM for OS)
```

---

## 2. RAG Pipeline Optimization

### Chunking Strategy
```
Document Text
    │
    ▼ Split by paragraphs/sections first (semantic boundaries)
    │
    ▼ If chunk > 512 tokens, split at sentence boundaries
    │
    ▼ Add 50-token overlap between adjacent chunks
    │
    ▼ Store: chunk text + document_id + position + embedding
```

- **Chunk size:** 512 tokens (balances retrieval precision vs. context)
- **Overlap:** 50 tokens (prevents information loss at boundaries)
- **Semantic splitting:** Respect headers, paragraphs, list items

### Embedding Optimization
| Technique | Impact |
|-----------|--------|
| **Batch embedding** | Embed 16-32 chunks at once instead of one-by-one |
| **Lazy embedding** | Only embed when user first queries a document |
| **Cached embeddings** | Store in SQLite BLOB, never re-compute |
| **Dimensionality** | Use 384-dim models (vs 768) for 2x faster similarity search |
| **Float16 storage** | Store embeddings as Float16 — halves storage, negligible quality loss |

### Vector Search Optimization
For <50K chunks, brute-force cosine similarity in SQLite is fast enough:

```sql
-- Precompute and store embedding norms
ALTER TABLE chunks ADD COLUMN embedding_norm REAL;

-- At query time: compute dot product in native code, not SQL
-- Use a custom SQLite function or do it in TypeScript
```

**Performance targets:**
- <50ms for 10K chunks on mid-range phone
- <200ms for 50K chunks

If scaling beyond 50K chunks, consider:
- SQLite-vss extension (HNSW index)
- Pre-filtering by workspace/document before similarity search

### Retrieval Strategy
```
User Question
    │
    ▼ Embed question (single embedding, ~50ms)
    │
    ▼ Filter chunks by active workspace/document
    │
    ▼ Cosine similarity → Top 5 chunks
    │
    ▼ Re-rank by: relevance score × recency × document priority
    │
    ▼ Build prompt: System + Top 3-(5) chunks + User question
    │
    ▼ Generate response with source citations
```

---

## 3. Database Optimization (SQLite)

### Schema Design
- Use **TEXT PRIMARY KEY** with UUIDs (no auto-increment conflicts)
- **WAL mode** for concurrent reads during writes
- **Index** on: `chunks.document_id`, `documents.workspace_id`, `messages.conversation_id`

```typescript
// Enable WAL mode on database open
db.execAsync('PRAGMA journal_mode = WAL;');
db.execAsync('PRAGMA synchronous = NORMAL;');  // Faster writes, still safe
db.execAsync('PRAGMA cache_size = -8000;');    // 8MB cache
db.execAsync('PRAGMA temp_store = MEMORY;');   // Temp tables in RAM
```

### Query Patterns
- Paginate document lists (LIMIT 20, OFFSET)
- Load messages lazily (most recent 50 first, load more on scroll)
- Use transactions for bulk inserts (chunking a document = many inserts)

---

## 4. Memory Management

### RAM Budget (Target: 4GB device)
| Component | Budget |
|-----------|--------|
| OS + other apps | ~1.5GB |
| React Native runtime | ~150MB |
| LLM model (mmap) | ~500MB active pages |
| SQLite + embeddings | ~100MB |
| UI rendering | ~200MB |
| **Headroom** | ~1.5GB |

### Strategies
1. **mmap for models** — Model file stays on disk, only active pages in RAM
2. **Unload model on background** — Free all model RAM when app is backgrounded
3. **Pagination everywhere** — Never load all documents/messages/chunks at once
4. **Image optimization** — Compress Penny mascot assets, use vector SVG where possible
5. **FlatList with windowSize** — Only render visible list items + small buffer

---

## 5. Battery Optimization

| Technique | Why |
|-----------|-----|
| **Lazy embedding** | Don't process docs in background; only when user queries |
| **Debounce queries** | Wait 500ms after typing stops before searching |
| **Model unloading** | Free GPU/CPU resources when idle |
| **Batch operations** | One transaction for many DB writes vs. many transactions |
| **No background processing** | Everything happens in response to user actions |
| **Efficient rendering** | Minimize re-renders with React.memo, useMemo, useCallback |

---

## 6. App Startup Optimization

### Target: <2 second cold start

```
App Launch
    │
    ├─ Initialize React Native (~500ms)
    ├─ Load navigation + splash screen (~200ms)
    ├─ Open SQLite database (~50ms)
    ├─ Load user settings from SQLite (~20ms)
    └─ Render home screen (~200ms)
    
    Total: ~1 second
    
    Model loading happens LATER (when user enters chat)
```

### Techniques
- **No model loading on startup** — Load on-demand when chat is opened
- **Splash screen** — Show Penny mascot while initializing
- **Lazy screen loading** — Only load chat/document screens when navigated to
- **Preload critical data** — Workspace list + recent conversations in parallel

---

## 7. Document Parsing Optimization

| Format | Strategy |
|--------|----------|
| **TXT/MD** | Direct read, near-instant |
| **PDF** | Stream pages, parse in chunks of 10 pages, show progress |
| **DOCX** | mammoth is fast, single-pass extraction |
| **Large files (>10MB)** | Parse in background with progress indicator, chunk progressively |

### Chunking Performance
- Target: **1000 chunks/second** for text splitting
- Use worker thread for large documents to keep UI responsive
- Show progress bar for documents with >100 pages

---

## 8. UI/UX Optimization

### Chat Performance
- **Streaming tokens** — Show each token as it's generated (llama.rn callback)
- **Virtualized message list** — FlatList with inverted scroll
- **Markdown rendering** — Parse markdown only for visible messages
- **Typing indicator** — Show Penny thinking animation during inference

### Document List
- **Thumbnail generation** — First page preview, cached as images
- **Search** — SQLite FTS5 for instant full-text search across documents
- **Infinite scroll** — Load 20 documents at a time

### General
- **Skeleton loaders** — Show layout shapes while data loads
- **Optimistic UI** — Show changes immediately, sync to DB in background
- **Haptic feedback** — Subtle vibration on key interactions

---

## 9. Storage Optimization

### Model Storage
- Q4_K_M models: ~1.5-2.5GB per model
- Allow only 1-2 models downloaded at a time on low-storage devices
- Show storage usage in settings

### Embedding Storage
- 384-dim Float16: **768 bytes per chunk**
- 10K chunks = ~7.5MB of embeddings
- 100K chunks = ~75MB — very manageable

### Document Storage
- Store original files in app directory
- Store extracted text in SQLite (not duplicate on filesystem)
- Offer "remove original, keep text" option for storage savings

---

## 10. Performance Targets

| Metric | Target |
|--------|--------|
| Cold start | <2 seconds |
| Model load | <5 seconds |
| Token generation | 5-15 tokens/sec (varies by model/device) |
| Embedding (per chunk) | <100ms |
| Vector search (10K chunks) | <50ms |
| Document parse (10-page PDF) | <3 seconds |
| Chat message send-to-first-token | <1 second |
| UI frame rate | 60fps (no jank) |

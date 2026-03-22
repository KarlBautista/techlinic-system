# 🐧 Penny — Offline AI Document Assistant

> A penguin with a backpack filled with documents.

Penny is a fully offline, mobile-first AI document assistant. Upload documents and let Penny help you summarize, query, and generate content — all running locally on your device.

## Quick Links

| Doc | Description |
|-----|-------------|
| [Project Plan](docs/01-PROJECT-PLAN.md) | Architecture, phases, tech stack, database schema |
| [Environment Setup](docs/02-ENVIRONMENT-SETUP.md) | Step-by-step dev environment setup (JDK, Android Studio, Expo) |
| [Optimization Strategy](docs/03-OPTIMIZATION-STRATEGY.md) | Performance targets and optimization techniques |

## Getting Started

### 1. Set up your environment
Follow [docs/02-ENVIRONMENT-SETUP.md](docs/02-ENVIRONMENT-SETUP.md) to install:
- JDK 17
- Android Studio + Android SDK
- Expo CLI

### 2. Create the project
```bash
cd penny
npx create-expo-app@latest penny-app --template blank-typescript
cd penny-app
```

### 3. Install dependencies & build
See the setup guide for full dependency list.

## Architecture (TL;DR)

```
React Native App
  ├── llama.rn (on-device LLM via llama.cpp)
  ├── expo-sqlite (documents, embeddings, chats)
  ├── Document parsers (PDF, DOCX, MD, TXT)
  └── RAG pipeline (embed → search → generate)
```

No backend. No internet. Everything on your phone.

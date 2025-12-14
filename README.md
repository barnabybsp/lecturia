# Lecturia - AI-Powered Course Assistant Platform

A Next.js learning management system that allows lecturers to upload course materials and enables students to interact with an AI chatbot that has access to all course content using RAG (Retrieval-Augmented Generation).

## Features

### Lecturer Portal
- Create and manage courses
- Upload course materials (PDFs, Word docs, Excel, PowerPoint, images, text files)
- Generate invite links for students
- View enrolled students
- Manage course documents

### Student Portal
- Join courses via invite links
- View enrolled courses
- Chat with AI about course materials
- Persistent conversation history
- Support for multiple LLM providers (OpenAI, Anthropic)

## Tech Stack

- **Framework**: Next.js 16.0.8 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL + pgvector)
- **Authentication**: Supabase Auth (Magic Links)
- **Storage**: Supabase Storage
- **AI/LLM**: OpenAI GPT-4o-mini, Anthropic Claude 3.5 Sonnet
- **Vector Search**: pgvector (Supabase)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account and project
- OpenAI API key (or Anthropic API key)

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   - `supabase/migrations/001_initial_schema.sql`
3. Create a storage bucket:
   - Go to Storage → Create bucket
   - Name: `course-documents`
   - Set to Public (or configure policies as needed)
   - Add storage policies from `supabase/README.md`

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Anthropic Configuration (optional)
ANTHROPIC_API_KEY=your_anthropic_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── chat/         # Chat/RAG endpoints
│   │   ├── courses/      # Course management
│   │   ├── files/        # File upload & processing
│   │   └── invites/      # Invite system
│   ├── auth/             # Auth pages
│   ├── lecturer/         # Lecturer portal
│   └── student/          # Student portal
├── components/
│   ├── lecturer/         # Lecturer components
│   ├── student/          # Student components
│   └── shared/           # Shared components
├── lib/
│   ├── embeddings/       # Embedding generation
│   ├── file-processors/  # Document processing
│   ├── llm/              # LLM integrations
│   ├── rag/              # RAG search
│   └── supabase/         # Supabase clients
└── types/                # TypeScript types
```

## How It Works

### Document Processing Flow

1. Lecturer uploads a document
2. File is stored in Supabase Storage
3. Text is extracted from the document (PDF, Word, Excel, etc.)
4. Text is chunked into smaller pieces
5. Embeddings are generated using OpenAI
6. Embeddings are stored in pgvector

### RAG Chat Flow

1. Student asks a question
2. Question is converted to an embedding
3. Similar chunks are retrieved from pgvector using cosine similarity
4. Relevant context is sent to the LLM along with conversation history
5. LLM generates a response based on the course materials
6. Response is streamed back to the student
7. Conversation is saved for future reference

## Key Features Explained

### Magic Link Authentication
Users sign in with their email and receive a magic link. They select their role (lecturer/student) during sign-in.

### Vector Search
Uses pgvector's cosine similarity search to find relevant document chunks. The search function `match_document_chunks` is defined in the migration.

### Streaming Responses
Chat responses stream in real-time using Server-Sent Events (SSE) for a better user experience.

### Conversation Memory
All conversations are persisted in the database. Students can:
- View past conversations
- Continue existing conversations
- Start new conversations

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production

Make sure to set all environment variables in your deployment platform.

## Notes

- File processing happens asynchronously - embeddings are generated after upload
- Large files may take time to process
- The system supports multiple file types but text extraction quality varies
- Images are stored but OCR is not implemented (can be added later)

## License

MIT

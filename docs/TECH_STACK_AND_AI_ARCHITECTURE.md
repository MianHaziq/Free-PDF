# Technology Stack & AI Architecture

## Final Architecture (Approved)

This project will follow a **Hybrid Architecture** where the application
is fully functional without AI, while optional local AI enhances the
quality of resume tailoring.

The AI is an enhancement---not a dependency.

------------------------------------------------------------------------

# Core Philosophy

-   Personal project (single user)
-   No authentication
-   No database
-   No backend initially
-   Deploy frontend on Vercel
-   Keep the application free to use
-   Never depend on paid AI APIs
-   Preserve user privacy by processing AI requests locally

------------------------------------------------------------------------

# Why No Backend?

Since this application is only for personal use, maintaining a backend
would introduce unnecessary cost and complexity.

The application should work entirely in the browser for all core
features. This allows free deployment on Vercel and eliminates server
maintenance.

------------------------------------------------------------------------

# Application Architecture

``` text
                    Next.js Frontend
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
 Rule-Based Processing             Optional Local AI
          │                                 │
          ▼                                 ▼
 Resume Parsing                  Ollama (localhost:11434)
 JD Parsing                              │
 Matching Engine                         ▼
 ATS Score                    Qwen 3 (recommended)
 Resume Tailoring
 Preview
 PDF/DOCX Export
```

If Ollama is available locally, the application enables AI-powered
rewriting.

If Ollama is unavailable, the application automatically falls back to
the rule-based engine.

------------------------------------------------------------------------

# Core Features (No AI Required)

These features must always work:

-   Resume import (PDF, DOCX, JSON)
-   Job description import
-   Resume parser
-   Job description parser
-   Resume analyzer
-   Job description analyzer
-   Rule-based matching engine
-   ATS scoring
-   Missing keyword detection
-   Resume section reordering
-   Skill prioritization
-   Project prioritization
-   Resume preview
-   PDF export
-   DOCX export
-   Local storage/history

------------------------------------------------------------------------

# AI Features (Optional)

When Ollama is installed and running:

-   Rewrite professional summary
-   Improve resume bullet points
-   Improve wording and readability
-   Better keyword integration
-   Generate role-specific summaries
-   Improve ATS optimization while preserving truthfulness

The AI must never invent: - Experience - Skills - Companies -
Technologies - Achievements - Certifications

It may only improve and reorganize existing information.

------------------------------------------------------------------------

# Local AI

## Selected Runtime

-   Ollama

## Recommended Model

-   Qwen 3 Instruct (preferred)

Alternative models: - Llama 3.x - Gemma 3 - Mistral

No OpenAI, Claude, Gemini, or other paid APIs should be required.

------------------------------------------------------------------------

# Technology Stack

## Frontend

-   Next.js
-   TypeScript
-   Tailwind CSS
-   shadcn/ui

## State Management

-   Zustand

## Forms & Validation

-   React Hook Form
-   Zod

## Resume Parsing

-   pdfjs-dist
-   mammoth

## PDF Export

-   @react-pdf/renderer

## Local Persistence

-   IndexedDB (preferred)
-   localStorage (fallback)

------------------------------------------------------------------------

# Deployment Strategy

Deploy only the Next.js frontend to Vercel.

Core application features remain fully functional online.

AI-powered rewriting is available only on machines where Ollama is
installed and running locally.

This approach avoids backend hosting costs while keeping the project
private and free.

------------------------------------------------------------------------

# Design Principles

-   Modular architecture
-   Reusable components
-   Feature-based organization
-   Clean TypeScript
-   Strict validation
-   Offline-friendly where possible
-   Graceful fallback when AI is unavailable
-   AI enhances the application but never blocks functionality

------------------------------------------------------------------------

# Final Decision

The project will be built as a frontend-only Next.js application with a
powerful rule-based resume tailoring engine.

Optional local AI via Ollama + Qwen 3 will enhance writing quality when
available.

This architecture provides: - Zero recurring infrastructure cost - Free
AI usage - Privacy - Easy Vercel deployment - Maintainable codebase -
High-quality resume tailoring

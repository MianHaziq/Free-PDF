# AI_RULES.md

# AI Development Rules & Engineering Standards

> **Purpose**
>
> This document defines the mandatory development rules that every AI
> coding assistant (ChatGPT, Codex, Claude Code, Cursor, Windsurf,
> Copilot, etc.) must follow while working on this project.
>
> Code quality, maintainability, correctness, scalability, and testing
> always take priority over implementation speed.

------------------------------------------------------------------------

# Project Context

This is a personal Resume Tailoring Platform.

The application helps tailor an existing resume according to any job
description while remaining truthful and ATS-friendly.

Project constraints:

-   Single user
-   No authentication
-   No database
-   No backend initially
-   No paid AI APIs
-   Deployable on Vercel
-   AI is an enhancement, not a dependency

------------------------------------------------------------------------

# Core Development Philosophy

Always prioritize:

-   Clean Architecture
-   Reusable Components
-   Modular Design
-   Readability
-   Scalability
-   Maintainability

Never optimize for writing fewer lines of code.

------------------------------------------------------------------------

# Before Starting Any Task

Always:

1.  Analyze requirements.
2.  Analyze the existing codebase.
3.  Search for reusable code.
4.  Understand the current architecture.
5.  Plan implementation.
6.  Only then begin coding.

Never immediately generate code.

------------------------------------------------------------------------

# Never Break Existing Functionality

Before modifying anything:

-   Understand current behavior.
-   Preserve existing features.
-   Refactor safely.
-   Verify behavior after every change.

------------------------------------------------------------------------

# Architecture Rules

Use Feature-Based Architecture.

Each feature owns:

-   Components
-   Hooks
-   Utilities
-   Types
-   Validation
-   Business logic

Keep modules isolated.

------------------------------------------------------------------------

# Folder Conventions

-   app → routing only
-   components → reusable UI
-   features → feature logic
-   lib → reusable business logic
-   hooks → reusable hooks
-   types → shared types
-   constants → application constants
-   utils → pure helper functions

Never mix responsibilities.

------------------------------------------------------------------------

# Component Rules

-   One responsibility per component.
-   Prefer small reusable components.
-   Extract repeated JSX.
-   Avoid oversized components.

------------------------------------------------------------------------

# Naming Conventions

Components: PascalCase

Hooks: useSomething

Utilities: camelCase

Types: PascalCase

Constants: descriptive names

Never use vague filenames.

------------------------------------------------------------------------

# TypeScript Rules

-   Strict mode
-   Avoid any
-   Strong typing
-   Explicit return types for exported functions

------------------------------------------------------------------------

# Validation

Validate all external input using Zod.

Never trust uploaded files or user input.

------------------------------------------------------------------------

# State Management

Use:

-   Local state first
-   Zustand only when global state is necessary

------------------------------------------------------------------------

# Business Logic

Business logic must never live inside UI components.

Move it into reusable modules.

------------------------------------------------------------------------

# Resume Rules

Workflow:

Resume → Parse → JSON → Tailor → Preview → Export

Never modify uploaded PDFs directly.

------------------------------------------------------------------------

# AI Rules

AI must never invent:

-   Skills
-   Experience
-   Companies
-   Technologies
-   Certifications
-   Achievements
-   Years of experience

AI may only:

-   Improve wording
-   Improve grammar
-   Reorganize sections
-   Improve ATS keyword placement

Truthfulness is mandatory.

------------------------------------------------------------------------

# Rule-Based Engine

The application must remain fully functional without AI.

If Ollama is unavailable:

Automatically fall back to the rule-based engine.

------------------------------------------------------------------------

# Error Handling

Handle:

-   Invalid input
-   Corrupted files
-   Unsupported formats
-   Parser failures
-   Export failures
-   Unexpected errors

Always display meaningful messages.

------------------------------------------------------------------------

# Performance Guidelines

-   Avoid unnecessary re-renders.
-   Memoize expensive calculations.
-   Lazy load heavy components.
-   Avoid duplicate parsing.
-   Minimize bundle size.

------------------------------------------------------------------------

# UI / UX Standards

Use:

-   Tailwind CSS
-   shadcn/ui

Maintain:

-   Responsive layouts
-   Consistent spacing
-   Accessibility
-   Professional design

------------------------------------------------------------------------

# Accessibility

Support:

-   Keyboard navigation
-   Screen readers
-   Focus states
-   Proper labels
-   Color contrast

------------------------------------------------------------------------

# Code Quality

Prefer:

-   Small functions
-   Early returns
-   Pure functions
-   Clear naming

Avoid:

-   Duplicate logic
-   Deep nesting
-   Unnecessary complexity

------------------------------------------------------------------------

# Dependencies

Before installing any package:

-   Verify necessity.
-   Prefer existing solutions.
-   Avoid dependency bloat.

------------------------------------------------------------------------

# Testing Requirements

Every completed feature must include:

-   Happy path testing
-   Edge case testing
-   Error handling verification
-   Responsive testing
-   Regression testing

Never assume code works.

------------------------------------------------------------------------

# Definition of Done (DoD)

A feature is complete only if:

-   Requirements implemented
-   No TypeScript errors
-   No ESLint errors
-   Responsive
-   Accessible
-   Edge cases handled
-   Error handling implemented
-   No duplicate code
-   Fully tested
-   Existing functionality verified
-   Production ready

------------------------------------------------------------------------

# Git Commit Convention

Use Conventional Commits.

Examples:

-   feat: add resume parser
-   fix: resolve PDF export issue
-   refactor: simplify matching engine
-   perf: optimize keyword extraction
-   docs: update project roadmap
-   test: add parser edge case coverage

## Commit Cadence

Commit at the end of every development phase (see
`Resume_Tailoring_Platform_Development_Plan.md`), and only once that
phase's tests are green. Do not batch multiple phases into one commit,
and do not commit a phase that fails its own test criteria.

All commits in this repo are authored locally as `mianhaziq`
(`git config --local user.name/user.email`, set once in this repo, not
global).

------------------------------------------------------------------------

# AI Workflow

For every task:

1.  Analyze
2.  Plan
3.  Reuse existing code
4.  Implement
5.  Handle edge cases
6.  Test
7.  Verify existing features
8.  Ensure production quality

Never skip these steps.

------------------------------------------------------------------------

# Final Rule

Always prioritize:

Correctness \> Maintainability \> Readability \> Performance \> Speed

Generate production-ready code, not quick prototypes.

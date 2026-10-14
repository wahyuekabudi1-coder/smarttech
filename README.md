# Smart Tech — Software Engineering & Product Design

A modern, high-performance React application rewritten with React 19, TypeScript, Tailwind CSS, Vite, and Node.js/Express.

## Features

- **Public Marketing Website**:
  - Hero with telemetry monitors, standard stack blueprints, and trust markers
  - 6 Core Digital Engineering Solutions with detailed modal specifications
  - Portfolio showcase with live metrics and architectural deep-dives
  - Transparent pricing packages with auto-fill consultation action
  - Interactive consultation request form with real-time feedback
  - Full bilingual support (Indonesian & English)

- **Admin Workspace (`/admin/*`)**:
  - Full-page zero-modal routing across 10 functional modules
  - Operational KPIs and 10-step SOP visual pipeline
  - Consultations CRM with lifecycle state transitions and audit logging
  - Client registry with access code generation and meeting minutes
  - Proposals with automated payment term calculations (50/30/20) and 1-click project conversion
  - Project management with milestone tracking, sprint tasks, and client revision logs
  - Invoice management with ArtoPay Sandbox payment link generator
  - Integrated Calendar, Documents Repository, Analytics & Settings
  - Real-time studio logo upload and live cache-busted synchronization

- **Client Portal (`/portal`)**:
  - Private access code authentication (e.g. `PTN-8821`)
  - Milestone timeline and deliverable tracking
  - Secure document downloads and invoice payment checkout
  - Direct revision and feedback ticketing system

- **ArtoPay Payment Engine**:
  - Concurrency-safe unique payment codes
  - Cryptographic HMAC-SHA256 signature verification
  - Idempotent webhook notification processing
  - Sandbox simulation suite

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons & Material Symbols, TypeScript
- **Backend**: Node.js, Express, TypeScript (`tsx`)
- **Storage**: In-memory store with JSON persistence (`data/admin_store.json`, `data/orders.json`)

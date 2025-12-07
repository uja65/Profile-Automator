# Auto Profile Creator - AI-Powered Creative Portfolio Generator

## Overview

Auto Profile Creator is an AI-powered web application that transforms any creative professional's online presence into a comprehensive, verified portfolio. The system takes a single URL (portfolio site, social media profile, or personal website) and automatically constructs a rich creative profile by:

1. Crawling the provided URL and discovering linked content
2. Aggregating data from multiple platforms (IMDb, YouTube, Vimeo, LinkedIn, etc.)
3. Using AI (Perplexity for search, Google Gemini for synthesis) to create a unified profile
4. Presenting the information in a visually engaging, IMDb-inspired interface

The application addresses the challenge of fragmented creative portfolios by consolidating information from multiple sources into a single, professional presentation with confidence scores and source attribution.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript and Vite as the build tool

**Routing**: Wouter for client-side routing (lightweight alternative to React Router)

**UI Component System**: 
- Shadcn/ui components built on Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Design philosophy inspired by IMDb (data density), LinkedIn (professional presentation), and Behance (visual richness)
- Typography stack: Inter for body text, Space Grotesk for headings
- Component library includes profile headers, project cards/grids, media galleries, platform badges, and confidence indicators

**State Management**:
- TanStack Query (React Query) for server state and data fetching
- No global client state library (relies on React Query cache and local component state)

**Key Design Patterns**:
- Component composition with reusable UI primitives
- Custom hooks for responsive behavior (`use-mobile`) and toast notifications
- API request wrapper with credential handling and error transformation
- Loading states with staged progress indicators (crawling → aggregating → synthesizing → building)

### Backend Architecture

**Runtime**: Node.js with Express server

**Language**: TypeScript with ESNext modules

**API Structure**:
- RESTful endpoints under `/api` namespace
- Primary endpoint: `POST /api/profiles/generate` accepts URL and returns complete profile
- In-memory storage implementation (MemStorage) with interface for future database migration
- Static file serving for built frontend assets

**Data Flow**:
1. URL normalization and hash generation for caching
2. Web crawling with Cheerio for HTML parsing
3. External API integration (Perplexity for search enrichment)
4. AI synthesis with Google Gemini to unify data
5. Profile caching by URL hash to avoid redundant processing

**Build Process**:
- Esbuild for server bundling with selective dependency bundling (allowlist pattern)
- Vite for client bundling
- Development mode uses Vite middleware with HMR
- Production mode serves pre-built static assets

**Development Tools**:
- Replit-specific plugins for error overlay, cartographer, and dev banner
- Custom logging middleware with timestamp formatting
- Request/response duration tracking

### Data Storage

**Current Implementation**: In-memory storage using Map data structures

**Schema Design** (Drizzle ORM ready):
- Users table for authentication (username/password)
- Profiles with URL hash for deduplication
- Rich type definitions for projects, media items, social links
- Platform enumeration (imdb, tmdb, omdb, youtube, vimeo, linkedin, facebook, website)

**Database Configuration**: 
- Drizzle ORM configured for PostgreSQL with migrations directory
- Connection via `DATABASE_URL` environment variable
- Schema defined in shared directory for frontend/backend type safety

**Migration Strategy**: Schema uses Drizzle for type-safe migrations, currently backed by in-memory store with interface abstraction (`IStorage`) allowing seamless swap to database implementation

### External Dependencies

**AI & Search Services**:
- **Google Gemini AI** (`@google/genai`): Primary synthesis engine for profile generation, processes crawled data and enrichment to create unified profile narratives with confidence scoring
- **Perplexity API**: Intelligent search layer for enriching incomplete data with additional context about creative professionals

**Web Scraping**:
- **Cheerio**: HTML parsing and DOM traversal for extracting structured data from crawled pages
- **Axios**: HTTP client for making requests to target URLs and external APIs

**UI Component Libraries**:
- **Radix UI**: Unstyled, accessible component primitives (dialogs, dropdowns, tooltips, accordions, etc.)
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **React Player**: Embedded media player for YouTube/Vimeo content

**Database & ORM**:
- **Drizzle ORM**: Type-safe ORM with PostgreSQL dialect
- **Drizzle Kit**: Migration tool for schema management
- Configured but not actively used (in-memory storage active)

**Development Dependencies**:
- **Vite**: Frontend build tool and dev server with HMR
- **ESBuild**: Fast server-side bundling
- **TSX**: TypeScript execution for scripts
- **Replit plugins**: Development experience enhancements (error modal, cartographer, dev banner)

**Authentication** (Infrastructure Ready):
- Express session management with `express-session`
- Session store configured for PostgreSQL (`connect-pg-simple`)
- Currently unused as app focuses on profile generation without user accounts

**API Rate Limiting & Error Handling**:
- Fallback patterns when external APIs fail (Perplexity → local crawling)
- Confidence scoring to indicate data quality
- Graceful degradation when API keys are missing
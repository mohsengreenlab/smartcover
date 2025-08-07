# Overview

CoverLetter AI is a web application that streamlines the job application process by generating personalized cover letters using AI. Users can upload Excel files containing company and job information, then leverage Google's Gemini AI to automatically create customized cover letters for each application. The application provides a step-by-step workflow to guide users through multiple job applications efficiently.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Neon Database for serverless deployment
- **ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Session-based authentication using express-session with PostgreSQL store
- **File Processing**: Multer for file uploads, XLSX library for Excel parsing
- **Password Security**: Bcrypt for password hashing

## Data Storage
- **Primary Database**: PostgreSQL with the following key tables:
  - `users`: User accounts with authentication credentials
  - `companies`: Job application data parsed from Excel uploads
  - `user_sessions`: Progress tracking for multi-company workflows
  - `cover_letters`: Generated cover letter history
  - `sessions`: Express session storage
- **File Storage**: In-memory processing for Excel files (no persistent file storage)

## Authentication & Authorization
- **Session Management**: Server-side sessions stored in PostgreSQL
- **Middleware**: Custom authentication middleware protecting API routes
- **Security**: Password hashing with bcrypt, session-based authentication
- **Captcha Protection**: Math-based captcha system on login and registration pages
- **Custom Prompts**: User-specific prompt templates stored in users table

## AI Integration
- **AI Provider**: Google Gemini AI for cover letter generation
- **API Key Management**: Server-side API key only (GEMINI_API_KEY environment variable)
- **Template System**: User-customizable prompt templates stored in database with placeholder replacement for company-specific data

## File Processing Workflow
- **Upload**: Excel files processed in-memory with validation
- **Parsing**: XLSX library extracts company data (name, job title, description, application links)
- **Batch Processing**: Companies grouped by upload batch for progress tracking
- **Progress Management**: User sessions track current position in application workflow

## Development Environment
- **Hot Reload**: Vite development server with HMR
- **Type Safety**: Full TypeScript coverage across frontend and backend
- **Path Aliases**: Configured for clean imports (@/ for client, @shared for shared types)
- **Build Process**: Separate builds for client (Vite) and server (esbuild)

# External Dependencies

## Core Infrastructure
- **Database**: Neon Database (PostgreSQL) - `@neondatabase/serverless`
- **Build Tools**: Vite for frontend, esbuild for backend bundling

## AI Services
- **Google Gemini AI**: `@google/genai` for cover letter generation
- **API Key**: Requires GEMINI_API_KEY environment variable or user-provided keys

## UI Framework
- **Component Library**: Radix UI primitives for accessible components
- **Styling**: Tailwind CSS for utility-first styling
- **Icons**: Lucide React for consistent iconography

## Data Management
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Validation**: Zod for runtime type checking and validation
- **State Management**: TanStack React Query for API state

## File Processing
- **Excel Processing**: XLSX library for reading spreadsheet data
- **File Uploads**: Multer middleware for handling multipart uploads

## Development Tools
- **Replit Integration**: Replit-specific plugins for development environment
- **Error Handling**: Runtime error overlay for development debugging
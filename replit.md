# Overview

DejaYou is a dating application that matches people based on shared lived experiences rather than surface-level interests. The app focuses on emotional resonance and timeline-based compatibility, allowing users to build life event timelines and find matches who have gone through similar formative experiences, turning points, and growth moments.

The application is built as a full-stack web app with a React frontend and Express.js backend, using PostgreSQL for data persistence and implementing Replit's authentication system for user management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern component patterns
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Form Handling**: React Hook Form with Zod for validation
- **Build Tool**: Vite for fast development and optimized production builds

## Backend Architecture
- **Framework**: Express.js with TypeScript for API development
- **Database ORM**: Drizzle ORM with PostgreSQL dialect for type-safe database operations
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system with Passport.js
- **Session Management**: Express-session with PostgreSQL session store
- **API Design**: RESTful endpoints with JSON request/response format

## Database Design
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Key Tables**:
  - Users table for profile information and authentication
  - Life events templates and user-specific life events
  - Matching system with user relationships and shared events
  - Messaging system for matched users
  - Session storage for authentication state

## Component Structure
- **Pages**: Landing, authentication, profile setup, timeline management, matching, and chat
- **Shared Components**: Life event cards, match cards, timeline builder, conversation starters
- **UI Components**: Comprehensive design system with consistent styling and interactions

## Authentication Flow
- **Provider**: Replit OIDC for seamless integration with the platform
- **Session Handling**: Secure session management with PostgreSQL persistence
- **Authorization**: Middleware-based route protection for authenticated endpoints

## Data Flow
- **Client-Server Communication**: REST API with consistent error handling and response formatting
- **Real-time Updates**: Polling-based updates for messaging (5-second intervals)
- **Caching Strategy**: React Query for client-side caching with optimistic updates
- **Data Validation**: Zod schemas shared between client and server for type safety

# External Dependencies

## Core Framework Dependencies
- **@neondatabase/serverless**: PostgreSQL serverless connection for database hosting
- **drizzle-orm**: Type-safe ORM for database operations and query building
- **express**: Web application framework for the backend API server
- **react**: Frontend framework for building the user interface
- **@tanstack/react-query**: Server state management and caching solution

## Authentication & Security
- **passport**: Authentication middleware for Express.js
- **openid-client**: OpenID Connect client for Replit authentication
- **express-session**: Session middleware for user state management
- **connect-pg-simple**: PostgreSQL session store for persistent sessions

## UI & Styling
- **@radix-ui/react-***: Headless UI components for accessibility and customization
- **tailwindcss**: Utility-first CSS framework for styling
- **class-variance-authority**: Type-safe variant handling for component styling
- **lucide-react**: Icon library for consistent iconography

## Development Tools
- **vite**: Build tool and development server for the frontend
- **typescript**: Type safety across the entire application
- **drizzle-kit**: Database migration and schema management tool
- **wouter**: Lightweight routing library for React applications

## Form & Validation
- **react-hook-form**: Form state management and validation
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: Schema validation library shared between client and server
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

## Utility Libraries
- **date-fns**: Date manipulation and formatting utilities
- **clsx**: Conditional className utility for dynamic styling
- **memoizee**: Function memoization for performance optimization
DejaYou 💕
Not just who you are. Who you've been.

DejaYou is a revolutionary dating application that matches people based on shared lived experiences rather than surface-level interests. The app focuses on emotional resonance and timeline-based compatibility, allowing users to build life event timelines and find matches who have gone through similar formative experiences, turning points, and growth moments.

✨ Features
Core Matching System
Experience-Based Matching: Match with people who share similar life experiences
DejaScore Algorithm: Compatibility scoring based on shared emotional journeys
Three Interaction Types:
💔 Pass: Respectful decline with no notification
🌀 Curious: Express interest, requires mutual curiosity to match
🫂 Relate: Deep emotional connection, immediate match with shared chapters
User Experience
Life Event Timeline: Build your personal story with formative experiences
Shared Chapters: Unlock detailed stories when both users "Relate" (swipes right)
Photo Gallery: Mobile-style photo upload and browsing.
Gender Preferences: Filter matches by preferred gender
Real-time Messaging: Chat with your matches
Conversation Starters: AI-generated questions based on shared experiences
Privacy & Consent
Emotional Consent Layer: Sensitive experiences require mutual consent to share
Visibility Controls: Choose which life events to share publicly
Respectful Interactions: Pass actions don't notify the other user
🛠️ Tech Stack
Frontend
React 18 with TypeScript for type safety
Vite for fast development and optimized builds
Wouter for lightweight client-side routing
TanStack React Query for server state management
Tailwind CSS + Shadcn/UI for modern, accessible components
React Hook Form + Zod for form handling and validation
Backend
Express.js with TypeScript for API development
Drizzle ORM with PostgreSQL for type-safe database operations
Replit Authentication (OpenID Connect) with Passport.js
Express Session with PostgreSQL session store
Database
PostgreSQL (Neon serverless hosting)
Drizzle Kit for migrations and schema management
🚀 Quick Start
Prerequisites
Node.js 18+
PostgreSQL database (or use Replit's built-in database)
Installation
Clone the repository

git clone https://github.com/yourusername/dejayou.git
cd dejayou
Install dependencies

npm install
Set up environment variables

# Create .env file with:
DATABASE_URL=postgresql://...
SESSION_SECRET=your-session-secret
REPL_ID=your-repl-id (for Replit auth)
Set up the database

npm run db:push
Seed the database with life events

tsx server/seed.ts
Start the development server

npm run dev
The app will be available at http://localhost:5000

📁 Project Structure
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utility functions and API client
├── server/                 # Express.js backend
│   ├── db.ts              # Database connection
│   ├── routes.ts          # API endpoints
│   ├── storage.ts         # Data access layer
│   ├── replitAuth.ts      # Authentication setup
│   └── seed.ts            # Database seeding
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── package.json           # Dependencies and scripts
🔑 Key Components
Life Event System
Curated Library: Pre-built life events covering formative experiences, turning points, and growth moments
Custom Events: Users can create their own life events
Categories: Organized by life stages and impact levels
Sensitivity Markers: Emotional consent layer for difficult experiences
Matching Algorithm
The DejaScore algorithm considers:

Number of shared life events
Emotional impact similarity
Timing alignment (age when events occurred)
Personal growth narratives
Mobile-First Design
Responsive layout optimized for mobile devices
Touch-friendly interactions
Native-app-like photo gallery
Smooth animations and transitions
🔌 API Endpoints
Authentication
GET /api/auth/user - Get current user
GET /api/login - Initiate login flow
GET /api/logout - Log out user
User Management
PUT /api/user/profile - Update user profile
GET /api/user/life-events - Get user's life events
POST /api/user/life-events - Add life event to timeline
POST /api/user/photos - Upload user photo
Matching System
GET /api/matches - Get user's matches
GET /api/potential-matches - Get potential matches
POST /api/match-action - Perform match action (pass/curious/relate)
Messaging
GET /api/matches/:matchId/messages - Get match messages
POST /api/matches/:matchId/messages - Send message
🎨 Design System
Color Palette
Coral: hsl(0, 79%, 70%) - Warmth and connection
Teal: hsl(174, 65%, 60%) - Trust and growth
Sunset: hsl(51, 100%, 70%) - Hope and new beginnings
Soft Pink: hsl(0, 75%, 76%) - Gentleness and care
Typography
Primary font: System font stack for readability
Accent font: Caveat for handwritten elements
🧪 Testing
Run the test suite:

npm test
📝 Contributing
Fork the repository
Create a feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request
Development Guidelines
Follow TypeScript best practices
Use the existing component patterns
Maintain mobile-first responsive design
Write meaningful commit messages
Add tests for new features
🔒 Privacy & Security
All user data is encrypted in transit and at rest
Sensitive life events require explicit consent to share
Users control the visibility of their timeline events
Respectful interaction patterns (no unsolicited notifications)
Secure authentication via OpenID Connect
📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

🤝 Support
For support, please open an issue on GitHub or contact the development team.

🙏 Acknowledgments
Built with modern web technologies for optimal performance
Designed with user privacy and emotional safety as priorities
Inspired by the belief that shared experiences create deeper connections

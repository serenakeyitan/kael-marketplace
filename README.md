# Kael Skills Marketplace

A comprehensive marketplace for discovering, using, and creating AI-powered skills for Kael.im.

## Features

### Core Functionality
- **Browse & Search**: Discover skills with powerful search, filtering, and sorting capabilities
- **Skill Details**: Comprehensive information about each skill with examples and demos
- **Use in Kael**: One-click integration to use skills directly in Kael chat
- **My Skills**: Manage installed skills and uploaded creations
- **Create Skills**: Upload and share your own skills with the community

### User Experience
- **Audience-based Tags**: Skills are organized by target audience (Students, Researchers, Educators, Professionals, Creators)
- **Category Organization**: Browse skills by functional categories (Development, Data & AI, Research, etc.)
- **Role Switching**: Toggle between User and Creator modes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Form Handling**: React Hook Form + Zod validation
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_KAEL_CHAT_URL=https://kael.im/chat
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the marketplace.

### Build

Create a production build:

```bash
npm run build
```

### Production

Start the production server:

```bash
npm start
```

## Project Structure

```
kael-marketplace/
├── app/
│   ├── api/              # Mock API endpoints
│   ├── create/           # Skill creation page
│   ├── my-skills/        # User's skills management
│   ├── profile/          # User profile page
│   ├── skills/[slug]/    # Individual skill details
│   ├── layout.tsx        # Root layout with providers
│   └── page.tsx          # Home/marketplace page
├── components/
│   ├── Header.tsx        # Navigation header
│   ├── SkillCard.tsx     # Skill card component
│   └── ui/               # shadcn/ui components
├── contexts/
│   └── AuthContext.tsx   # Authentication context
├── data/
│   └── mockSkills.ts     # Mock data (~30 skills)
├── types/
│   └── skill.ts          # TypeScript type definitions
└── lib/
    └── utils.ts          # Utility functions
```

## Key Features Details

### Skill Discovery
- **Search**: Real-time search across skill names, descriptions, and tags
- **Filters**: Filter by category and audience tags
- **Sorting**: Sort by popularity, recent updates, usage, or rating
- **Pagination**: Efficient browsing with paginated results

### Skill Management
- **Installation**: One-click install to personal skill library
- **Enable/Disable**: Toggle skills on/off without uninstalling
- **Usage Tracking**: Track installation date, last used, and usage count
- **Quick Actions**: Use in Kael, view details, or uninstall

### Skill Creation
- **Guided Process**: Step-by-step form with validation
- **Audience Selection**: Choose target audiences for better discoverability
- **Examples**: Provide demo prompts and use cases
- **Publishing**: Save as draft or publish immediately

### Authentication
- **Mock Auth**: Demo authentication system
- **Role-based Access**: Different features for Users and Creators
- **Persistent Sessions**: Stays logged in during session

## API Endpoints (Mock)

- `GET /api/skills` - List all skills with filtering and pagination
- `GET /api/skills/[slug]` - Get skill details
- `POST /api/skills` - Create new skill
- `GET /api/me/installed` - Get user's installed skills
- `POST /api/me/installed` - Install a skill
- `DELETE /api/me/installed` - Uninstall a skill
- `PATCH /api/me/installed` - Toggle skill enabled status
- `GET /api/me/uploaded` - Get creator's uploaded skills
- `POST /api/me/uploaded` - Upload new skill
- `PATCH /api/me/uploaded` - Update skill status

## Design Principles

1. **Chat-first UX**: Optimized for quick skill discovery and activation
2. **Minimal friction**: One-click "Use in Kael" experience
3. **Audience-focused**: Skills organized by who benefits most
4. **Visual hierarchy**: Clean, scannable interface with clear CTAs
5. **Responsive**: Fully functional on all device sizes

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

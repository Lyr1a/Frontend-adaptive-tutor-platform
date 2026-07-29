# Tutor Matching Platform - Frontend

A modern ReactJS frontend for the Tutor Matching Platform built with Ant Design.

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Build tool
- **Ant Design 5** - UI Component Library
- **React Router 6** - Routing
- **Zustand** - State Management
- **Axios** - HTTP Client
- **TanStack Query** - Server State Management
- **dayjs** - Date handling

## Design System

Inspired by Kraken's design system with:
- Primary color: `#7132f5` (Kraken Purple)
- Dual font system: IBM Plex Sans
- 12px border radius buttons
- Subtle shadows and modern aesthetics

## Project Structure

```
src/
├── api/                    # API service layer
│   └── axios.ts           # Axios instance with interceptors
├── components/
│   ├── common/            # Reusable components
│   │   ├── Loading.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── EmptyState.tsx
│   │   ├── TutorCard.tsx
│   │   ├── SessionCard.tsx
│   │   └── ProtectedRoute.tsx
│   └── Layout/
│       ├── MainLayout.tsx
│       └── AuthLayout.tsx
├── config/
│   ├── constants.ts       # API endpoints and routes
│   └── theme.ts          # Ant Design theme config
├── pages/
│   ├── auth/             # Authentication pages
│   ├── student/          # Student dashboard and features
│   ├── tutor/            # Tutor dashboard and features
│   └── admin/            # Admin dashboard and features
├── services/
│   └── api/              # API services
├── stores/                # Zustand stores
├── styles/
│   └── globals.css        # Global styles and CSS variables
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   ├── formatters.ts      # Date and currency formatters
│   └── validators.ts      # Form validators
├── App.tsx               # Main app with routing
└── main.tsx              # Entry point
```

## Features

### Student Features
- Dashboard with credit balance and upcoming sessions
- Tutor search with filters (subject, rate, availability)
- Tutor profile viewing
- Session booking
- Session management (reschedule, cancel)
- Credit wallet (deposit, view transactions)
- Learning progress tracking (milestones)
- Profile management

### Tutor Features
- Dashboard with today's sessions and stats
- Session management (view, update meeting link, record results)
- Availability schedule management
- Student list
- Profile management (bio, qualifications, subjects & rates)
- Credit wallet

### Admin Features
- Dashboard with platform statistics
- Tutor approval management
- Credit request processing
- Complaint handling
- User management (suspend, kick)

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file in the root directory:

```env
VITE_API_URL=https://localhost:7143
```

### Running the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API Integration

The frontend connects to the .NET backend at `https://localhost:7143` (configurable via `VITE_API_URL`).

Start the backend first:

```bash
cd ../../BE/TutorMatchingPlatform.API
dotnet run --launch-profile https
```

### API Endpoints

The following API endpoints are integrated:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/tutor/search` - Search tutors
- `POST /api/session/book` - Book a session
- `GET /api/credits/balance` - Get credit balance
- `POST /api/feedback/rate` - Rate a session
- And more...

## Authentication

The app uses JWT Bearer authentication with:
- Access token stored in memory
- Refresh token stored in localStorage
- Automatic token refresh on 401 responses
- Role-based route protection

## Seed Data

Default users (password: `Admin@123` for admin):
- Admin: `admin@tutormatching.com`
- Students: `student1-3@test.com` (password: `Student@123`)
- Tutors: `tutor1-8@test.com` (password: `Tutor@123`)

## License

MIT

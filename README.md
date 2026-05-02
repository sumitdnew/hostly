# Hostly — Multi-Tenant Airbnb Management SaaS

A production-ready property management platform for short-term rental hosts. Manage multiple properties, bookings, guest communications, maintenance, and team members from a single dashboard.

## Tech Stack

- **Frontend:** React 18 + Vite 7 + Tailwind CSS v3 + shadcn/ui
- **Backend:** Express 5 + TypeScript
- **Database:** Supabase (PostgreSQL) with Row Level Security
- **Auth:** Supabase Auth (email/password, JWT sessions, token refresh)
- **Security:** Helmet, CORS, express-rate-limit, Zod validation

## Features

- **Multi-tenant:** Each organization's data is fully isolated via Supabase RLS
- **Dashboard:** Occupancy rates, today's arrivals, upcoming bookings, open maintenance
- **Properties:** CRUD with details (beds, baths, wifi, check-in instructions, house rules)
- **Bookings:** Full lifecycle (confirmed → checked-in → checked-out / cancelled), filter tabs
- **Guest Check-in Portal:** Public link per booking — guests verify ID and get instructions (no login needed)
- **Guest Chat:** AI-powered auto-responses for common questions (wifi, restaurants, transport)
- **Maintenance:** Issue tracking with priority levels and status workflow
- **Team:** Owner + Staff roles with invite flow
- **Security:** Rate-limited auth, validated inputs, scrypt password hashing (via Supabase), JWT sessions with refresh

## Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **Settings → API** and copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key

### 2. Run the Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Run `supabase/schema.sql` — creates all tables, indexes, RLS policies, and the auth trigger
3. Run `supabase/seed.sql` — inserts sample data (5 properties, 15 bookings, messages, maintenance)

### 3. Configure Environment

```bash
cp .env.example .env
```

Fill in your Supabase credentials:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install & Run

```bash
npm install
npm run dev
```

Open `http://localhost:5000`

### 5. Create Your Admin Account

Sign up via the UI at `/#/signup` — this creates the Supabase auth user, organization, and profile in one step.

Or to use the seed data: create a user manually in Supabase Dashboard → Authentication → Users with email `admin@hostly.com` and password `admin123`, then update the profile row to link it to org `org-sunset01`.

## Production Deployment

### Build

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

### Deploy Options

| Platform | Notes |
|---|---|
| **Railway** | Connect repo, set env vars, auto-deploys. Easiest. |
| **Render** | Free tier available. Set build command to `npm run build`, start command to `npm start`. |
| **Fly.io** | Add `fly.toml`, set secrets. Good for multi-region. |
| **VPS (DigitalOcean/Linode)** | Nginx reverse proxy + Let's Encrypt SSL + PM2 for process management. |

All platforms need the 5 env vars from `.env.example`.

## Project Structure

```
hostly/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # UI components (shadcn/ui)
│       ├── lib/             # Auth, Supabase client, query client
│       └── pages/           # Route pages
├── server/                  # Express backend
│   ├── index.ts             # Server entry (helmet, cors, rate-limit)
│   ├── routes.ts            # API routes + Zod validation
│   └── storage.ts           # Supabase storage layer
├── shared/
│   └── schema.ts            # Drizzle ORM schema + Zod types
├── supabase/
│   ├── schema.sql           # Tables, indexes, RLS policies, triggers
│   └── seed.sql             # Sample data
├── .env.example             # Required environment variables
└── README.md
```

## API Routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | Public | Create account + org |
| POST | `/api/auth/login` | Public | Sign in, get JWT |
| POST | `/api/auth/refresh` | Public | Refresh expired JWT |
| POST | `/api/auth/logout` | Public | Sign out |
| GET | `/api/auth/me` | JWT | Current user + org |
| POST | `/api/auth/invite` | Owner | Invite staff member |
| GET | `/api/team` | JWT | List team members |
| GET/POST/PATCH/DELETE | `/api/properties` | JWT | CRUD properties |
| GET/POST/PATCH/DELETE | `/api/bookings` | JWT | CRUD bookings |
| GET/POST | `/api/bookings/:id/messages` | JWT | Guest chat messages |
| GET/POST/PATCH | `/api/maintenance` | JWT | Maintenance requests |
| GET | `/api/stats` | JWT | Dashboard statistics |
| GET | `/api/checkin/:bookingId` | Public | Guest check-in info |
| POST | `/api/checkin/:bookingId/verify` | Public | Verify guest ID |

## Security

- **Auth:** Supabase Auth with bcrypt password hashing, JWT tokens with 1h expiry + refresh
- **RLS:** Every table has Row Level Security policies scoping data to the user's organization
- **Rate Limiting:** 20 auth attempts per 15 min, 100 API requests per minute
- **Input Validation:** Zod schemas on all mutation endpoints
- **Headers:** Helmet sets X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, etc.
- **CORS:** Configured for same-origin in production

## License

MIT

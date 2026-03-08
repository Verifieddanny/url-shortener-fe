# ShortLink.io — URL Shortener Frontend

The frontend dashboard for the [URL Shortener API](https://github.com/Verifieddanny/url-shortener). Built with TanStack Start, TypeScript, and Tailwind CSS.

**Live:** [https://url-shortener-fe-lovat.vercel.app](https://url-shortener-fe-lovat.vercel.app)

## Tech Stack

- **Framework:** TanStack Start (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Routing:** TanStack Router (file-based)
- **Deployment:** Vercel

## Features

- **Demo Mode** — Shorten URLs without creating an account. Demo links auto-expire in 48 hours.
- **Authentication** — Signup and login with JWT-based auth.
- **Dashboard** — View all your shortened links with click stats, search, and sorting (newest/popular).
- **Link Creation** — Shorten URLs with optional custom slugs and expiration dates via a modal form.
- **Analytics Modal** — View detailed stats for any link including total clicks, creation date, and original URL.
- **Copy to Clipboard** — One-click copy on any shortened link with visual feedback.
- **Expired Link Handling** — Expired links redirect to the dashboard/homepage with a contextual alert instead of a dead page.
- **Responsive Design** — Fully responsive across mobile and desktop.

## Pages

```
src/routes/
├── __root.tsx        # Root layout with navigation
├── index.tsx         # Landing page with demo shortener
├── login.tsx         # Login page
├── signup.tsx        # Signup page
└── dashboard.tsx     # Authenticated dashboard with link management
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- The [URL Shortener API](https://github.com/Verifieddanny/url-shortener) running locally or deployed

### Installation

```bash
git clone https://github.com/Verifieddanny/url-shortener-fe.git
cd url-shortener-fe
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```
VITE_API_BASE_URL=http://localhost:8080
```

For production, point this to your deployed API URL.

### Running the App

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs on `http://localhost:5173` by default.

## API Integration

This frontend consumes the following API endpoints:

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/demo/shorten` | POST | No | Shorten a URL (demo, 48hr expiry) |
| `/demo/:shortCode` | GET | No | Redirect demo short link |
| `/auth/sign-up` | POST | No | Create a new account |
| `/auth/login` | POST | No | Login and receive JWT |
| `/shorten/shortner` | POST | Yes | Shorten a URL (authenticated) |
| `/shorten/urls/all` | GET | Yes | Fetch all user links |
| `/shorten/:shortCode` | GET | Yes | Fetch link analytics |

## Expired Link Flow

When a user visits an expired link, the API redirects them to the frontend with an `?expired=true` query parameter. The frontend reads this parameter and displays a contextual alert banner informing the user that the link they followed is no longer available.

- Expired **demo** links redirect to the homepage (`/?expired=true`)
- Expired **authenticated** links redirect to the dashboard (`/dashboard?expired=true`)

## Related

- **Backend API:** [github.com/Verifieddanny/url-shortener](https://github.com/Verifieddanny/url-shortener)

## License

MIT
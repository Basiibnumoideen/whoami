# Frontend — Basi Portfolio Platform

Production Next.js 16 frontend for [https://basi.world](https://basi.world).

## Key Features

- **Next.js 16 (Turbopack) & React 19**
- **Dynamic CMS Dashboard** at `/admin` (Manage Projects, Skills, Experiences, Blog Posts, Services, Now page, and System Telemetry)
- **Automatic Domain SEO**: Configured with `metadataBase: new URL('https://basi.world')`, dynamic `robots.txt`, and `sitemap.xml`.
- **Dual Authentication Session**: Cookie-based + Bearer token in `localStorage` for robust cross-origin requests.
- **Cold-Start Resilience**: 45s connection tolerance for sleeping backend instances.

## Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For production deployment on **Vercel**:

```env
NEXT_PUBLIC_API_URL=https://your-backend-host.onrender.com/api
```

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the client.

## Building for Production

```bash
npm run build
npm run start
```

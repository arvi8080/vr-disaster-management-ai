# Local Docker deployment

This Compose setup runs the React frontend, Express API, and FastAPI AI service on Docker Desktop.

## Prerequisites

- Docker Desktop running with the Linux container engine.
- `backend/firebase-service-account.json` containing the Firebase Admin service-account credentials. The file is mounted read-only into the backend container and is not copied into its image.
- A rotated Firebase Web API key configured as `VITE_FIREBASE_API_KEY` in a root `.env` file. The previously committed key should be replaced or restricted in Google Cloud. This client key is embedded in the frontend bundle at build time, so it must not be treated as a private credential.

For local frontend development, set `VITE_FIREBASE_API_KEY` in `frontend/.env.local`.

## Start

From the repository root:

```powershell
docker compose up --build -d
```

Open the frontend at <http://localhost:8080>. The backend health endpoint is <http://localhost:5000/api/health>, and the AI service health endpoint is <http://localhost:8000/health>.

## Check and stop

```powershell
docker compose ps
docker compose logs -f
docker compose down
```

The frontend image uses `VITE_API_URL=http://localhost:5000/api` at build time. Override the Compose build argument when using different local ports or a reachable backend URL.

## Refreshing a dashboard route

The frontend Nginx configuration serves the React app for `/dashboard`, `/login`, and `/signup`, including direct browser refreshes. After changing frontend routing or Nginx configuration, rebuild and recreate the frontend container:

```powershell
docker compose up -d --build --force-recreate frontend
```

Verify the dashboard route serves the app entry point (HTTP 200), not an Nginx 404:

```powershell
curl.exe -I http://localhost:8080/dashboard
```

If the site is behind another reverse proxy, ensure that proxy forwards `/dashboard` requests to the frontend container rather than the backend API.

## Vercel deployment

For Vercel deployments:

1. Set the project root directory to `frontend`.
2. In the Vercel project settings, add `VITE_FIREBASE_API_KEY` as an environment variable for each environment you deploy (Production, Preview, and Development as applicable). Set its value to the Firebase Web API key from the Firebase console's project settings. Do not commit the key to the repository.
3. Redeploy after adding or changing the variable. Vite embeds `VITE_` variables into the frontend at build time, so changing the Vercel setting does not update deployments that have already been built.

The `frontend/vercel.json` rewrite sends client-side routes such as `/dashboard`, `/login`, and `/signup` to the SPA entry point so reloading those URLs does not return Vercel's 404 page.

In Unity, set the Firebase Web API key on the `FirebaseRestClient` component in the Inspector and restrict it in Google Cloud. The key is extractable from a client build; do not treat it as a private credential or commit scenes containing it.

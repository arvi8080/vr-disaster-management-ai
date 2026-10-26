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

In Unity, set the Firebase Web API key on the `FirebaseRestClient` component in the Inspector and restrict it in Google Cloud. The key is extractable from a client build; do not treat it as a private credential or commit scenes containing it.

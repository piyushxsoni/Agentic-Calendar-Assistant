@echo off
echo ========================================================
echo Starting Agentic Calendar Assistant (All Services)
echo ========================================================

echo [1/3] Ensuring PostgreSQL container is running...
docker compose up -d
if %errorlevel% neq 0 (
  echo [Warning] Docker compose returned code %errorlevel%. Ensure Docker Desktop is running.
)

echo [2/3] Running database migrations...
call npm --prefix backend run migrate

echo [3/3] Launching backend and frontend concurrently...
echo Backend will run on http://localhost:4000
echo Frontend will run on http://localhost:3000
echo ========================================================
call npm run dev

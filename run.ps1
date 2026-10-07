Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "Starting Agentic Calendar Assistant (All Services)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

Write-Host "`n[1/3] Ensuring PostgreSQL container is running..." -ForegroundColor Yellow
docker compose up -d

Write-Host "`n[2/3] Running database migrations..." -ForegroundColor Yellow
npm --prefix backend run migrate

Write-Host "`n[3/3] Launching backend and frontend concurrently..." -ForegroundColor Yellow
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "========================================================`n" -ForegroundColor Cyan

npm run dev

#!/usr/bin/env pwsh

Write-Host "🚀 Jamii Tourney Server Manager" -ForegroundColor Green
Write-Host "==============================="

# Start Backend Server
Write-Host "Starting backend server..." -ForegroundColor Yellow
Start-Process -FilePath "node" -ArgumentList "-r", "dotenv/config", "server/working-server.mjs" -WindowStyle Normal
Start-Sleep 3

# Start Frontend Server  
Write-Host "Starting frontend server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Normal
Start-Sleep 5

# Check status
Write-Host "Checking servers..." -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/health" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend: $($backend.status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend: Failed to start" -ForegroundColor Red
}

try {
    Invoke-RestMethod -Uri "http://localhost:5173/" -Method Get -TimeoutSec 5 | Out-Null
    Write-Host "✅ Frontend: Running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend: Failed to start" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Servers should be running!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:5173/"
Write-Host "🔧 Backend: http://127.0.0.1:5000/"
Write-Host ""
Write-Host "Press any key to exit..."
Read-Host
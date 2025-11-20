# Start both frontend and backend for development
Write-Host "Starting Jamii Tourney Development Servers..." -ForegroundColor Green

# Kill any existing processes on the ports
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {$_.MainWindowTitle -like "*5000*" -or $_.MainWindowTitle -like "*5173*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Start backend server in background
Write-Host "Starting backend server (port 5000)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev:server" -WindowStyle Normal

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "Starting frontend server (port 5173)..." -ForegroundColor Cyan
npm run dev

Write-Host "Both servers should now be running!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "Backend API: http://localhost:5000" -ForegroundColor White
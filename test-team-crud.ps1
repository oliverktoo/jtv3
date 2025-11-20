# Test team CRUD operations using PowerShell
$baseUrl = "http://127.0.0.1:5000/api"

Write-Host "🧪 Testing Team CRUD Operations" -ForegroundColor Yellow
Write-Host ""

try {
    # 1. Test READ
    Write-Host "1️⃣ Testing READ operations..." -ForegroundColor Cyan
    $teams = Invoke-RestMethod -Uri "$baseUrl/teams" -Method Get
    Write-Host "✅ GET /api/teams: Found $($teams.Count) teams" -ForegroundColor Green
    
    if ($teams.Count -eq 0) {
        Write-Host "⚠️ No teams found - skipping further tests" -ForegroundColor Yellow
        exit 0
    }
    
    $sampleTeam = $teams[0]
    Write-Host "📋 Sample team: $($sampleTeam.name) ($($sampleTeam.id))" -ForegroundColor White
    Write-Host "   Status: $($sampleTeam.registration_status)" -ForegroundColor White
    Write-Host "   Organization: $(if ($sampleTeam.org_id) { 'Affiliated' } else { 'Independent' })" -ForegroundColor White
    
    # 2. Test UPDATE - Change status
    Write-Host ""
    Write-Host "2️⃣ Testing UPDATE operations..." -ForegroundColor Cyan
    
    $newStatus = if ($sampleTeam.registration_status -eq 'ACTIVE') { 'PENDING' } else { 'ACTIVE' }
    $updateData = @{ registration_status = $newStatus } | ConvertTo-Json
    
    Write-Host "Attempting to update team status from $($sampleTeam.registration_status) to $newStatus..." -ForegroundColor White
    
    $updatedTeam = Invoke-RestMethod -Uri "$baseUrl/teams/$($sampleTeam.id)" -Method Patch -ContentType "application/json" -Body $updateData
    Write-Host "✅ PATCH /api/teams/$($sampleTeam.id): Status updated to $($updatedTeam.registration_status)" -ForegroundColor Green
    
    # 3. Test organization change
    Write-Host ""
    Write-Host "3️⃣ Testing organization affiliation change..." -ForegroundColor Cyan
    
    $newOrgId = if ($sampleTeam.org_id) { $null } else { "550e8400-e29b-41d4-a716-446655440000" }
    $orgUpdateData = @{ org_id = $newOrgId } | ConvertTo-Json
    
    $actionText = if ($sampleTeam.org_id) { "remove" } else { "add" }
    Write-Host "Attempting to $actionText organization affiliation..." -ForegroundColor White
    
    $orgUpdatedTeam = Invoke-RestMethod -Uri "$baseUrl/teams/$($sampleTeam.id)" -Method Patch -ContentType "application/json" -Body $orgUpdateData
    $affiliationText = if ($orgUpdatedTeam.org_id) { "Affiliated" } else { "Independent" }
    Write-Host "✅ Organization affiliation updated: $affiliationText" -ForegroundColor Green
    
    # 4. Test CREATE
    Write-Host ""
    Write-Host "4️⃣ Testing CREATE operations..." -ForegroundColor Cyan
    
    $timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    $newTeam = @{
        name = "Test Team $timestamp"
        description = "Test team for CRUD operations"
        registration_status = "PENDING"
        org_id = $null
        county_id = $sampleTeam.county_id
        sub_county_id = $sampleTeam.sub_county_id
        ward_id = $sampleTeam.ward_id
    } | ConvertTo-Json
    
    Write-Host "Creating independent team: Test Team $timestamp..." -ForegroundColor White
    
    $createdTeam = Invoke-RestMethod -Uri "$baseUrl/teams" -Method Post -ContentType "application/json" -Body $newTeam
    Write-Host "✅ Created team: $($createdTeam.name) ($($createdTeam.id))" -ForegroundColor Green
    
    # 5. Test DELETE
    Write-Host ""
    Write-Host "5️⃣ Testing DELETE operations..." -ForegroundColor Cyan
    
    $deleteResult = Invoke-RestMethod -Uri "$baseUrl/teams/$($createdTeam.id)" -Method Delete
    Write-Host "✅ Team deleted successfully" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 Team CRUD testing completed successfully!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}
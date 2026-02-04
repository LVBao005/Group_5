# Deploy Backend to Tomcat 9.0
# Run this script as Administrator

$ErrorActionPreference = "Stop"
$tomcatPath = "C:\Program Files\Apache Software Foundation\Tomcat 9.0"
$warSource = "d:\LAB\Group_5\src\core_app\backend\target\backend.war"

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          DEPLOYING BACKEND TO TOMCAT 9.0                   ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  WARNING: Not running as Administrator!" -ForegroundColor Red
    Write-Host "   Please run PowerShell as Administrator and try again.`n" -ForegroundColor Yellow
    exit 1
}

# Step 1: Stop Tomcat
Write-Host "⏹️  Step 1: Stopping Tomcat service..." -ForegroundColor Yellow
try {
    Stop-Service -Name "Tomcat9" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   ✓ Tomcat stopped" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Tomcat was not running" -ForegroundColor DarkYellow
}

# Step 2: Remove old files
Write-Host "`n🗑️  Step 2: Removing old backend files..." -ForegroundColor Yellow
if (Test-Path "$tomcatPath\webapps\backend") {
    Remove-Item "$tomcatPath\webapps\backend" -Recurse -Force
    Write-Host "   ✓ Removed old backend folder" -ForegroundColor Green
}
if (Test-Path "$tomcatPath\webapps\backend.war") {
    Remove-Item "$tomcatPath\webapps\backend.war" -Force
    Write-Host "   ✓ Removed old backend.war" -ForegroundColor Green
}

# Step 3: Copy new WAR file
Write-Host "`n📦 Step 3: Deploying new backend.war..." -ForegroundColor Yellow
if (Test-Path $warSource) {
    Copy-Item $warSource "$tomcatPath\webapps\backend.war"
    Write-Host "   ✓ Copied backend.war to webapps" -ForegroundColor Green
    Write-Host "   ✓ Fixed: JSON now uses snake_case (branch_name, pharmacist_name)" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ ERROR: backend.war not found at $warSource" -ForegroundColor Red
    exit 1
}

# Step 4: Start Tomcat
Write-Host "`n▶️  Step 4: Starting Tomcat service..." -ForegroundColor Yellow
try {
    Start-Service -Name "Tomcat9"
    Start-Sleep -Seconds 3
    Write-Host "   ✓ Tomcat started" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Failed to start Tomcat" -ForegroundColor Red
    Write-Host "   Manual start: net start Tomcat9" -ForegroundColor DarkGray
}

Write-Host "`n╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ DEPLOYMENT COMPLETE!                    ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host "`n📍 Backend URL: http://localhost:8080/backend/api/invoices" -ForegroundColor Cyan
Write-Host "⏱️  Wait ~10 seconds for Tomcat to extract the WAR file" -ForegroundColor Yellow
Write-Host "`n🔧 Changes in this build:" -ForegroundColor White
Write-Host "   • Fixed JSON field names: branchName → branch_name" -ForegroundColor Gray
Write-Host "   • Fixed JSON field names: pharmacistName → pharmacist_name" -ForegroundColor Gray
Write-Host "   • Fixed JSON field names: customerName → customer_name" -ForegroundColor Gray
Write-Host "   • Frontend will now display branch names correctly!`n" -ForegroundColor Gray

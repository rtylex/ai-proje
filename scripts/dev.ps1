Param(
  [string]$Project = "demo-aiproje",
  [int]$WebPort = 0
)

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path "$PSScriptRoot\..\").Path
if (-not (Test-Path "$root\firebase.json")) {
  Write-Host "firebase.json bulunamadı. Lütfen bu scripti repo içinde çalıştırın." -ForegroundColor Red
  exit 1
}

# Emulators in a separate window for easy logs
Write-Host "Emülatör penceresi açılıyor..." -ForegroundColor Cyan

# Detect Java for Firestore
$javaOk = $false
try {
  & java -version 2>$null
  if ($LASTEXITCODE -eq 0) { $javaOk = $true }
} catch {}

$emuCmd = if ($javaOk) { "firebase emulators:start --only auth,firestore,functions --project $Project" } else { "Write-Host 'Java yok: Firestore emülatörü olmadan başlatılıyor'; firebase emulators:start --only auth,functions --project $Project" }

Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location `"$root`"; $emuCmd"
) | Out-Null

Start-Sleep -Seconds 2

Set-Location "$root\web"
Write-Host "Web dev başlatılıyor (Next.js)..." -ForegroundColor Cyan

if ($WebPort -gt 0) {
  $env:PORT = $WebPort
}

npm run dev

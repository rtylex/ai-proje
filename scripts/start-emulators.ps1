Param(
  [string]$Project = "demo-aiproje"
)

$ErrorActionPreference = 'Stop'

$root = (Resolve-Path "$PSScriptRoot\..\").Path
Set-Location $root

if (-not (Test-Path "$root\firebase.json")) {
  Write-Host "firebase.json bulunamadı. Lütfen projeyi kök dizinden çalıştırın: $root" -ForegroundColor Red
  exit 1
}

# Ensure Java for Firestore emulator
$javaOk = $false
try {
  & java -version 2>$null
  if ($LASTEXITCODE -eq 0) { $javaOk = $true }
} catch {}

if (-not $javaOk) {
  Write-Host "Java bulunamadı. Firestore emülatörü başlatılamayacak. (Auth+Functions ile devam)" -ForegroundColor Yellow
  Write-Host "Java (JRE/JDK 11+) kurarsan Firestore'u da başlatabilirim." -ForegroundColor Yellow
  Write-Host "Emülatörler başlatılıyor (auth, functions) — proje: $Project" -ForegroundColor Cyan
  firebase emulators:start --only auth,functions --project $Project
} else {
  Write-Host "Emülatörler başlatılıyor (auth, firestore, functions) — proje: $Project" -ForegroundColor Cyan
  firebase emulators:start --only auth,firestore,functions --project $Project
}

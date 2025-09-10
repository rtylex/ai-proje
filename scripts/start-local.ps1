Param(
  [string]$ProjectId = "demo-aiproje",
  [string]$Region = "europe-west1"
)

$ErrorActionPreference = 'Stop'

Write-Host "Building Cloud Functions (TypeScript)..."
Push-Location functions
npm install | Out-Null
npm run build | Out-Null
Pop-Location

Write-Host "Starting Firebase Emulators (auth, firestore, functions)..."
$npx = (Get-Command npx).Source
Start-Process -FilePath $npx -ArgumentList @('firebase','emulators:start','--only','auth,firestore,functions','--project', $ProjectId) -WorkingDirectory $PWD

Write-Host "Starting Next.js dev server..."
Start-Process -FilePath "npm" -ArgumentList @('run','dev') -WorkingDirectory (Join-Path $PWD 'web')

Write-Host "Done."
Write-Host "- Emulator UI: http://127.0.0.1:4321"
Write-Host "- Functions:   http://127.0.0.1:5001/$ProjectId/$Region/api"
Write-Host "- Frontend:    http://localhost:3000"

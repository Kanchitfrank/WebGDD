@echo off
cd /d "%~dp0"
powershell -NoProfile -Command "$taskNode = Get-Command node -ErrorAction SilentlyContinue; if (-not $taskNode) { Write-Host 'Please install Node.js LTS, then open this file again.'; Read-Host 'Press Enter'; exit 1 }; $taskServer = Join-Path (Get-Location) 'admin/local-server.cjs'; Start-Process -FilePath $taskNode.Source -ArgumentList ('"' + $taskServer + '"') -WindowStyle Hidden; Start-Sleep -Seconds 1; Start-Process 'http://127.0.0.1:5510/admin/index.html'"

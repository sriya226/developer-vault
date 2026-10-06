   @echo off
   start "Vault API" /d "%~dp0server" cmd /k npm run dev
   start "Vault Client" /d "%~dp0client" cmd /k npm run dev
   timeout /t 6 >nul
   start http://localhost:5173
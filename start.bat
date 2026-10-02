@echo off
echo ===================================================
echo   Starting Smart Real Estate CRM Fullstack Suite
echo ===================================================
echo.

:: Launch Backend
echo [1/2] Launching Backend Express API on http://localhost:5000 ...
start "CRM-Backend-API" cmd /c "cd backend && npm run dev"

:: Launch Frontend
echo [2/2] Launching Frontend React Client on http://localhost:5173 ...
start "CRM-Frontend-App" cmd /c "cd frontend && npm run dev"

echo.
echo ===================================================
echo   Smart Real Estate CRM has started!
echo.
echo   - Backend REST API: http://localhost:5000/api
echo   - API Swagger Docs: http://localhost:5000/api-docs
echo   - Frontend Client:   http://localhost:5173
echo.
echo   (Press any key to close this launcher menu)
echo ===================================================
pause > null

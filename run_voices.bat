@echo off
setlocal

:: Load .env variables (simple parser)
for /f "usebackq tokens=1* delims==" %%A in (".env") do (
    if "%%A"=="TTS_API_KEY" set TTS_API_KEY=%%B
    if "%%A"=="TTS_BASE_URL" set TTS_BASE_URL=%%B
)

:: Run the script
node scripts/enumerate-voices.js

endlocal

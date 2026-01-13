@echo off
echo Testing /api/tts POST:
curl -X POST https://unspoken-8bmrulwwg-whytesteven74-1176s-projects.vercel.app/api/tts -H "Content-Type: application/json" -d "{\"input\":\"Hello, this is a test.\"}" --output test.mp3
echo.
echo TTS output saved to test.mp3
dir test.mp3

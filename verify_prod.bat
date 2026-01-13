@echo off
echo Testing /api/chat GET:
curl -L https://unspoken-8bmrulwwg-whytesteven74-1176s-projects.vercel.app/api/chat
echo.
echo.
echo Testing /api/chat POST:
curl -X POST https://unspoken-8bmrulwwg-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}]}"

@echo off
echo Testing /api/test GET:
curl -L https://unspoken-imzodgz7x-whytesteven74-1176s-projects.vercel.app/api/test
echo.
echo.
echo Testing /api/test POST:
curl -X POST https://unspoken-imzodgz7x-whytesteven74-1176s-projects.vercel.app/api/test
echo.
echo.
echo Testing /api/chat GET:
curl -L https://unspoken-imzodgz7x-whytesteven74-1176s-projects.vercel.app/api/chat
echo.
echo.
echo Testing /api/chat POST:
curl -v -X POST https://unspoken-imzodgz7x-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}],\"biometricData\":{\"derived_stress_score\":0.5}}"

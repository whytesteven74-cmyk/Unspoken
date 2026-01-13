@echo off
echo Testing GET:
curl -L https://unspoken-dvar3bvkg-whytesteven74-1176s-projects.vercel.app/api/chat
echo.
echo.
echo Testing POST:
curl -X POST https://unspoken-dvar3bvkg-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}],\"biometricData\":{\"derived_stress_score\":0.5}}"

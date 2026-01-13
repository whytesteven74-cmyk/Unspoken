@echo off
echo Testing NEW Deployment (Expect 200 or 500, but getting 405?)
curl -v -L -X POST https://unspoken-2nivvs5v7-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}],\"biometricData\":{\"derived_stress_score\":0.5}}"

echo.
echo Testing OLD Deployment (Expect 500 DB Error)
curl -v -L -X POST https://unspoken-o1jawxzc6-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}],\"biometricData\":{\"derived_stress_score\":0.5}}"

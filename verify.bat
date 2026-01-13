@echo off
curl -X POST https://unspoken-gpl2cxyi7-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}],\"biometricData\":{\"derived_stress_score\":0.5}}"

@echo off
echo Testing /api/chat POST:
curl -X POST https://unspoken-hyu5h5z1o-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}]}"

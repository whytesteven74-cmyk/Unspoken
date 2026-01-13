@echo off
echo Testing /api/chat POST:
curl -X POST https://unspoken-bexp1dufu-whytesteven74-1176s-projects.vercel.app/api/chat -H "Content-Type: application/json" -d "{\"messages\":[{\"role\":\"user\",\"content\":\"Can you hear me?\"}]}"

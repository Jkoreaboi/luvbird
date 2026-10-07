#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

if ! command -v node >/dev/null 2>&1 || ! node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 24 ? 0 : 1)'; then
  echo 'Node.js 24 이상을 설치하고 터미널을 다시 여세요: https://nodejs.org/'
  exit 1
fi
if ! command -v curl >/dev/null 2>&1; then
  echo 'curl이 필요합니다.'
  exit 1
fi
LAN_IP="${DEARBIRD_LAN_IP:-}"
if [[ -z "$LAN_IP" ]]; then
  for iface in en0 en1; do
    LAN_IP="$(ipconfig getifaddr "$iface" 2>/dev/null || true)"
    [[ -n "$LAN_IP" ]] && break
  done
fi
if [[ -z "$LAN_IP" ]]; then
  echo '맥북 Wi-Fi 주소를 찾을 수 없습니다. Wi-Fi에 연결한 뒤 DEARBIRD_LAN_IP=맥북주소 bash scripts/mac/start-phone.command 로 실행하세요.'
  exit 1
fi
if [[ ! "$LAN_IP" =~ ^[0-9]{1,3}(\.[0-9]{1,3}){3}$ ]]; then
  echo "잘못된 IP 주소: $LAN_IP"
  exit 1
fi
if lsof -nP -iTCP:4000 -sTCP:LISTEN >/dev/null 2>&1; then
  echo '4000번 포트를 사용 중입니다. 이전 DearBird 서버를 종료한 뒤 다시 실행하세요.'
  exit 1
fi

if [[ ! -d server/node_modules ]]; then (cd server && npm ci); fi
if [[ ! -d mobile/node_modules ]]; then (cd mobile && npm ci); fi

if [[ "${DEARBIRD_FAST:-0}" == "1" ]]; then
  echo '빠른 테스트: 별도 DB에서 편지가 60초 후 도착합니다.'
  DELIVERY_SECONDS=60
  DATABASE_PATH="$ROOT_DIR/server/data/luvbird-phone-fast.sqlite"
else
  echo '기본 테스트: 편지가 발송 24시간 후 도착합니다.'
  DELIVERY_SECONDS=86400
  DATABASE_PATH="$ROOT_DIR/server/data/luvbird-phone.sqlite"
fi

export APP_ENV=development DELIVERY_SECONDS DATABASE_PATH PORT=4000 PUSH_ENABLED=false
export DEV_WEB_ORIGINS="http://localhost:8081,http://127.0.0.1:8081,http://$LAN_IP:8081"
export EXPO_PUBLIC_API_URL="http://$LAN_IP:4000" APP_VARIANT=development

node server/index.mjs > "$ROOT_DIR/server/phone-test.log" 2>&1 &
API_PID=$!
cleanup() { kill "$API_PID" 2>/dev/null || true; wait "$API_PID" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

ready=0
for _ in {1..30}; do
  if curl -fsS 'http://127.0.0.1:4000/health' >/dev/null 2>&1; then ready=1; break; fi
  if ! kill -0 "$API_PID" 2>/dev/null; then break; fi
  sleep 1
done
if [[ "$ready" -ne 1 ]]; then
  echo '서버를 시작하지 못했습니다. server/phone-test.log를 확인하세요.'
  exit 1
fi

echo "API 확인: http://$LAN_IP:4000/health"
echo '휴대폰과 맥북을 같은 Wi-Fi에 연결하세요. 아래 Expo QR을 iPhone 카메라로 스캔합니다.'
echo '맥북에서 두 번째 계정을 만들려면 Expo 화면에서 w를 누르세요.'
echo '종료: 이 터미널에서 Ctrl+C'
cd mobile
CI=0 npx expo start --lan --port 8081

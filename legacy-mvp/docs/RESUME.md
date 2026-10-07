# 2026-09-26 · People-first entry and onboarding

- First-use tutorial is now a real 4-step pre-authentication screen (ko/en/ja), including skip, back, completion persistence and replay from login/profile. Available while API is offline.
- Root route, successful authentication and logout now target /app/pals. Tab order starts with people. Filters are collapsed by default.
- Tutorial profiles are labeled examples; authenticated people directory uses real server profiles. No public directory or fabricated members.
- scripts/ui-onboarding.cjs validates tutorial and people-first flow. Existing browser regressions updated to navigate intentionally.
- Live hosting/email/store distribution remain pending; this update is source + local browser verification.

# DearBird / luvbird 작업 재개 기록 — 2026-09-26 KST

## 복구 상태
이전 작업 폴더 `/workspace/scratch/b169caca6a6d/luvbird`의 소스와 의존성을 찾아 이어서 수정했다. 초기 서버 테스트 13개, TypeScript와 lint가 통과했다. 공유 대화 URL은 이 세션에서 직접 읽을 수 없었으나 이전 대화 기록과 실제 코드를 대조했다.

이전 세션의 `Stopped working` 원인을 확정할 원본 터미널 로그는 발견하지 못했다. 이전 화면에는 `Reasoning failed` / `Error in message stream`이 있었다는 기록이 있다. 앱 소스의 기존 검사에서는 실패가 재현되지 않았다.

## 이번에 실제 완료한 작업
- 이메일 인증: 내 프로필 → 코드 요청 → 코드 확인, 한국어/영어/일본어.
- 비밀번호 복구: 로그인 화면 → 이메일 코드 요청 → 새 비밀번호 및 확인 → 로그인.
- 32바이트 난수 코드의 SHA-256 해시만 저장, 15분 만료, 일회용, 용도/소유자 분리.
- 비밀번호 재설정 시 모든 서버 세션·기기 푸시 등록 해제; 비동기 비밀번호 검사 중 재설정되는 로그인 경합도 방어.
- SQLite 발송 대기열, 1분 재요청 제한/시간당5회, 발송 실패 최대3회 재시도.
- 발송 계정이 없으면 명시적인 준비 중 오류. 선택적 이메일 인증 필수 플래그.
- 발송 서비스 연결 어댑터, 서버 환경변수·Docker Compose 및 운영 가이드 추가.

## 검증 완료
- `server/npm test`: 18개 통과 (기존13 + 신규5).
- `mobile/npm run typecheck`, `npm run lint`: 통과.
- Expo web, Android, iOS JS 번들 export: 통과. APK/IPA가 아니다.
- `CHROME_PATH=/tmp/chromium node scripts/ui-account.cjs`: ACCOUNT_UI_PASS. 390×844 브라우저에서 요청/재설정/새 비밀번호 로그인/이메일 인증 확인.
- 테스트 메일함은 메모리 모의 발송이며 외부 이메일을 보내지 않았다.
- 화면 캡처: `docs/screenshots/09-account-recovery.png`.

## 이번 실행에서 해결한 환경/검증 문제
- 프로젝트 루트에는 package.json이 없다. npm 명령은 server 또는 mobile에서 실행해야 한다.
- Node가 TypeScript 원본 테스트를 읽는 `.ts` import를 위해 mobile tsconfig에 allowImportingTsExtensions를 추가했다. noEmit 타입 검사에서 통과.
- 번들 Chromium 해제 중 `/tmp/fonts` chown EINVAL 발생. 기존 실행파일 `/tmp/chromium`을 CHROME_PATH로 지정하여 해결했다. 다른 환경은 설치된 Chromium 경로를 사용한다.
- 화면 테스트는 비밀번호 재설정 모달이 닫힌 뒤 로그인 정보를 입력하도록 기다리고, 중복 이름 버튼은 dialog 안으로 범위를 한정했다.

## 다음 작업
1. 실제 발송 도메인/계정에 RESEND_API_KEY와 EMAIL_FROM 연결 후 인증·복구 이메일 수신 검증. 공개 운영 시 REQUIRE_EMAIL_VERIFICATION=true.
2. HTTPS 운영 서버, Expo/EAS·Apple 자격 증명 연결 후 두 실기기에서 권한·오프라인·푸시·APK/TestFlight 검증.
3. 광고/결제/셀카 인증은 아직 미연동. 가입자/발송량 증가 시 발송 작업을 별도 worker로 분리하고 운영 모니터링 추가.

현재 코드는 단일 서버 MVP다. 기존 DB는 수정하지 않았고 테스트는 임시 메모리 DB로 실행했다. 다음 작업은 이 기록과 REQUIREMENTS-AUDIT.md를 읽고 시작한다.

## 후속 업데이트 — 첫 사용자 유입 흐름
- 지도 상단에 현재 상태에 맞는 다음 행동 카드: 인증/받은 요청/첫 편지/대기/도착.
- 보낸 요청 표시·취소 API/UI, 취소된 요청의 수락/지연푸시 차단, 일일 한도 보존.
- 펜팔 부재/검색 불일치/연결 중 상태를 구분하고 필터 초기화 제공.
- 네트워크 오류 시 로그인 유지·재시도, 만료 세션은 로그인 화면 복귀.
- 설치 링크 없는 초대 버튼 제거, 탐색 목록 밖 상대의 초안 열기 복구.
- 운영 진입점은 이메일 인증 필수. 발송 설정 없으면 시작 거부.
- 서버 테스트19개, TypeScript/lint, 웹 export, JOURNEY_UI_PASS 및 전체 UI_FLOW_PASS 확인.
- 실제 서버/이메일/기기 연결은 미완료. LAUNCH-READINESS.md에 판단과 남은 연결 기록.

## 배포 준비 업데이트 — 사용자 모집 전 단계
- Dockerfile이 account.mjs를 누락해 서버 시작이 불가능했던 구성을 수정함.
- Render Node24+영구디스크 Blueprint, /ready, 신뢰 프록시 설정, 정상 종료 처리 추가.
- SQLite 백업/무결성/기존 백업 덮어쓰기 방지와 앱 복구 테스트 완료.
- scripts/release-check.mjs(설정 누락 검사), scripts/check-live.mjs(실제 HTTPS 배포 검사) 추가.
- mobile/.env.release.example, .env.production.example, release/DEPLOYMENT.md 추가.
- 실제 EAS 프로젝트가 없으면 디바이스/스토어 빌드를 거부함.
- 테스트22개 및 TypeScript/lint 통과. production 시작/SIGTERM 종료를 모의 자격증명/메모리DB로 검증했고 실제 이메일은 보내지 않음.
- Render·Resend는 미설치/미연결로 확인되어 설치 제안함. Expo/EAS 로그인 세션 없음. Luvbird 이름의 연결된 GitHub 저장소를 찾지 못함.
- 외부 계정 연결 없이는 실제 서버/발송/서명배포를 완료할 수 없음. 모집 메시지나 초대는 보내지 않음.
- 다음 입력: Render/Resend 설치 및 계정 연결, 실제 발송 도메인·지원 주소, Expo 계정·EAS 프로젝트, Apple Developer 상태, 소스 저장소 URL.

## 최종 배포 진입 점검
- 설치 설정과 release-check/check-live가 동일한 HTTPS origin 검사를 사용한다. 로컬/IP/예시 주소, 인증 정보·경로·쿼리가 붙은 주소를 거부한다. DNS 소유권이나 실제 배포를 증명하는 검사는 아니다.
- 운영 환경 파일과 네이티브 export, 배포 묶음을 git 제외 목록에 추가했다. 환경 예제 파일은 유지한다.
- 테스트23개 및 TypeScript/lint 통과. 외부 배포나 실제 이메일 전송은 수행하지 않았다.
- DearBird 이름으로도 연결된 GitHub 저장소를 찾지 못했다. 다음 단계는 실제 저장소 URL 및 Render/Resend/Expo 연결이다.

## 2026-09-27 계정 연결 없이 가능한 최종 화면 점검
- 첫 실행 안내/3개 언어/펜팔 우선 진입, 가입·요청·수락·사진·초안 복구·발송·지도·도착·답장, 비밀번호 복구·이메일 인증 화면 재검증 통과.
- 인증은 모의 이메일, 도착은 제어된 테스트 시계로 검증했다. 실제 수신/24시간 실시간 대기/실기기 설치 검증은 아니다.
- 화면 미리보기 docs/ONBOARDING-REVIEW.html 및 screenshots/14-onboarding-review.png 갱신.
- 세션 재시작으로 /tmp/chromium이 없어 실행 실패했다. 설치된 Chromium 패키지의 압축 해제 후 /tmp/fonts 소유권 설정에서 EINVAL이 발생했으나 브라우저 실행파일은 정상 생성되어 CHROME_PATH로 직접 지정해 모든 화면 검증을 완료했다.

## 2026-09-27 요청한 네 단계 업데이트
1. 질문 추가 시 본문 보존, 중복·길이 초과 방지, 로컬 초안 쓰기 순서 보장. 질문을 추가한 초안을 새로고침 후 복원 검증.
2. 공통 언어·관심사·명시된 교류 목적을 카드와 상세에 표시. 추측 점수나 자동 번역 매칭 없음.
3. 빈 목록에 자기소개/관심사/찾는 친구 작성 상태 및 편집 연결 추가.
4. 서버 OPERATIONS_TOKEN 설정 시 /ops 신고 운영 화면. 상태·메모·이력·낙관적 동시성, 계정 이용 제한/해제, 일반 사용자 접근 차단. 자세한 사용법은 OPERATIONS-DASHBOARD.md.
- 최종 검증: 서버26개 통과, TypeScript/lint/web export, JOURNEY_UI_PASS, OPERATIONS_UI_PASS, 전체 UI_FLOW_PASS. docs/FOUR-UPDATES.html에 네 단계 화면 묶음.

## 따뜻한 UI 개편
- 크림색 종이 배경, 짙은 녹색 글자, 차분한 갈색 강조로 색 체계 정리. 보조 버튼/태그 배경 및 과도한 둥근 모서리 축소.
- 펜팔 목록을 여백과 구분선 중심으로 변경. 닉네임·도시·소개글을 먼저 배치하고 공통점은 작은 텍스트로 표시. 교류 목적의 과일 이모지는 목록에서 제거하되 목적 선택 데이터와 기능은 유지.
- 기존 선택 아바타(새/꽃/달/바다)는 동일한 의미의 SVG 선 그림으로 표시해 글꼴에 따라 깨지는 문제 완화. 회사 마크 유지.
- 편지 질문은 기본 접힘. 접근성 expanded 상태를 제공하며 펼쳐 선택해도 본문 보존/중복 방지/초안 복원 유지.
- UI 개편 후 TypeScript/lint/web export, JOURNEY_UI_PASS, UI_FLOW_PASS, ONBOARDING_UI_PASS 통과. 최신 화면은 docs/WARM-UI-REVIEW.html.

# DearBird by Luvbird

멀리 있는 한 사람에게 하루를 사진과 편지로 보내고, 그 편지가 약 24시간 이동하는 동안 기다리는 모바일 앱입니다. Luvbird는 회사이고, DearBird는 그 첫 제품입니다. 메신저가 아닙니다.

- 회사: **Luvbird**
- 제품: **DearBird**
- 모바일: Expo SDK 57 / React Native 0.86 / React 19 / TypeScript / Expo Router
- 서버: Node 24 / Express 5 / SQLite / Sharp
- 언어: 한국어·영어·일본어

## 바로 시작

### iPhone에서 바로 시험하기 (MacBook)

Mac과 iPhone을 같은 Wi-Fi에 연결하고, iPhone에 Expo Go를 설치하세요. 물리적인 iPhone에서는 Mac의 Expo CLI와 iPhone Expo Go에 같은 Expo 계정으로 로그인해야 합니다. 아래 명령은 API와 Expo QR을 함께 시작합니다.

```bash
cd luvbird
bash scripts/mac/start-phone.command
```

터미널 QR을 iPhone 카메라로 스캔합니다. Mac에서 `w`를 누르면 두 번째 계정으로 쓸 브라우저 화면이 열립니다. 60초 도착 시험은 `DEARBIRD_FAST=1 bash scripts/mac/start-phone.command`로 별도 데이터에서 실행합니다. 자세한 순서는 [휴대폰 테스트 안내](docs/PHONE-TEST.md)를 참고하세요. 이 경로는 Expo Go 개발 실행이며 설치형 APK/IPA가 아닙니다.

Node.js 24 이상이 필요합니다. 두 터미널에서 실행합니다.

```bash
# 터미널 1: 서버
cd server
npm ci
cp .env.example .env
node --env-file=.env index.mjs
```

```bash
# 터미널 2: 모바일
cd mobile
npm ci
cp .env.example .env
# 폰에서 실행할 때 EXPO_PUBLIC_API_URL을 개발 컴퓨터의 LAN IP로 수정
npx expo start
```

실제 두 기기에서 서로 다른 계정을 만들고, 프로필 탐색 → 요청 → 수락 → 편지 작성으로 진행합니다. 시작 데이터나 자동 생성된 실제 사용자 계정은 없습니다.

24시간 기본 배송을 짧게 시험하려면 **별도 데이터베이스**를 쓰는 스테이징 서버에서 `APP_ENV=staging DELIVERY_SECONDS=60`을 설정합니다. 운영 모드는 항상 86400초를 강제합니다.

## 구현된 흐름

- 성인 확인, 이메일·비밀번호 가입/로그인, 프로필·아바타·사진 수정
- 국가·언어·관심사 탐색, 펜팔 요청·수락·거절 (하루 5회 요청, 활성 펜팔 10명)
- 10,000자 편지, 사진 3장, 편지지·우표, 자동 초안 저장, 최종 확인과 발송
- 서버 기준 24시간 도착 잠금, 멱등 발송, 비공개 사진, 서버 이미지 재인코딩/메타데이터 제거
- 실제 지형을 사용한 지도 확대·이동, 대권 경로·날짜 변경선 처리, 시간 기반 비둘기 위치
- 오는 중/도착/보낸 편지/초안, 봉투 개봉, 사진 보기, 답장
- 신고·차단·해제·계정 삭제, 운영자 신고 검토 CLI
- 푸시 등록·도착 이벤트·receipt 처리 코드 (기기/프로젝트 자격 증명 연결 필요)

## 현재 검증 상태

- 서버 보안·편지 교환과 지도 경로 테스트 **22개 통과**.
- 브라우저에서 실제 React Native 웹 렌더링을 대상으로 **가입 → 요청 → 수락 → 이미지 선택/첨부 → 초안 복구 → 발송 → 지도 → 도착 후 개봉 → 답장** 통과.
- TypeScript 검사 및 lint 확인.
- Android/iOS JavaScript 번들 export 확인. **APK/IPA가 아닙니다.**
- 사진 첨부 테스트는 자체 브랜드 아이콘 이미지를 사용했으며 UI의 Sunje/Emma는 임시 테스트 계정입니다.
- 실제 기기와 APNs/FCM 푸시 전달, APK 설치, TestFlight는 미검증/미배포입니다.

## 검증 명령

```bash
cd server
npm test
```

```bash
cd mobile
npm run typecheck
npm run lint
npx expo export --platform android --platform ios --platform web
```

`server/test/route.test.mjs`는 Node 24의 TypeScript 타입 제거 지원을 사용합니다.
`node scripts/ui-flow.cjs`는 프로젝트 루트에서 브라우저 UI 검증을 수행합니다. 먼저 `mobile/dist` 웹 export가 필요합니다. Linux에서는 포함된 개발 의존성 Chromium을 사용할 수 있고, 다른 환경에서는 `CHROME_PATH`에 설치된 Chromium 실행 파일 경로를 지정합니다. 테스트 서버와 계정은 해당 프로세스 안에서만 실행합니다.

## 배포에 필요한 연결

1. HTTPS API를 올릴 서버와 영구 디스크 (Docker 구성 포함)
2. 본인 Expo 계정과 EAS 프로젝트 연결
3. iOS TestFlight를 위한 Apple Developer / App Store Connect 접근
4. 실제 운영 문의 연락처와 확정된 정책

아직 설치 링크가 생성되지 않았습니다. `eas whoami`에서 미로그인을 확인했습니다. 외부 유료 리소스를 생성하거나 구매하지 않았습니다.

자세한 절차와 남은 제약은 [운영 안내](docs/OPERATIONS.md)를 확인하세요.

## 파일 구조

- `mobile/AppScreen.tsx`: 앱 상태 및 화면 흐름
- `mobile/src/app/`: Expo Router 진입점
- `mobile/src/WorldMap.tsx`, `route.ts`, `land.json`: 지도 및 비행 경로
- `mobile/src/ui.tsx`, `i18n.ts`, `config.ts`: UI, 문구, 브랜드
- `server/app.mjs`: 인증, 서버 권한, 편지, 사진, 펜팔, 푸시
- `server/moderate.mjs`: 운영자 신고 검토
- `server/test/`: 자동 검증
- `docs/screenshots/`: 실행 화면 캡처
- `docs/ui-verification.json`: UI 검증 결과
- `compose.yaml`, `Caddyfile`: 단일 서버 HTTPS 배포 구성

현재 단일 서버용 MVP이며, 대규모 상용 운영에 대한 보증은 아닙니다. 이메일 발송 계정 연결·실제 수신 검증, 운영 백업과 검토 인력 등 공개 출시 전 항목은 운영 안내에 명시했습니다.

## 2026-09-26 계정 복구 업데이트
이메일 인증과 비밀번호 재설정 화면/API를 추가했습니다. 발송 설정과 검증 범위는 [계정 복구 안내](docs/ACCOUNT-RECOVERY.md), 이어서 작업할 위치는 [재개 기록](docs/RESUME.md)을 확인하세요.

첫 사용자 안내·대기 요청·연결 재시도 개선과 공개 전 남은 연결은 [출시 준비 현황](docs/LAUNCH-READINESS.md)을 참고하세요.

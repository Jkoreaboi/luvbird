# Luvbird 개발 인수인계 — Cursor 시작 문서

업데이트: 2026-10-09 KST. 이 저장소를 Cursor에서 열면 이 문서부터 읽으세요. **Luvbird는 브랜드이고 DearBird는 첫 제품**입니다. 제품의 핵심은 해외의 한 사람에게 편지를 쓰고 약 24시간 기다리는 경험입니다. 즉시 채팅으로 바꾸거나, 아직 제공하지 않는 기능을 출시된 것처럼 설명하지 마세요.

개발은 이 저장소에서 이어 갑니다. `legacy-mvp/`를 `apps/`로 옮기지 마세요. 랜딩 페이지를 지우거나 Webild 시안으로 갈아끼우지 마세요.

## 현재 저장소와 사이트

| 위치 | 역할 | 현재 상태 |
| --- | --- | --- |
| 저장소 루트 `app/`, `components/` | Next.js 15 마케팅 랜딩 페이지 | 공개 마케팅 사이트로 유지한다. 계정과 편지 기능은 없다. |
| `legacy-mvp/mobile/` | Expo/React Native DearBird 앱 | 이어서 수정하는 제품 앱. |
| `legacy-mvp/server/` | Express/SQLite API | 이어서 수정하는 제품 API. 운영 서버는 아직 배포되지 않음. |
| [Webild 공유 미리보기](https://www.webild.io/preview/4bf2e80a-f9d0-4436-bfe7-7f6e1af43355) | 영어 중심의 시각 시안 | 이 Git 저장소에 코드가 없다. 색과 흐름의 참고만 한다. |
| [Webild 편집 화면](https://www.webild.io/projects/4bf2e80a-f9d0-4436-bfe7-7f6e1af43355/website) | Webild 프로젝트 편집 | 내부 프로젝트 이름은 원본 템플릿명 `Luxury Real Estate`로 남아 있음. 페이지 제목과 내용은 DearBird. |

최종 마케팅 페이지는 이 저장소의 Next.js 랜딩이다. Webild는 같은 방향의 시안이고, 도메인이 연결되지 않은 공유 미리보기다. 도메인 구매·연결은 하지 않았다. `luvbird.app`, 이 랜딩, Webild 미리보기는 서로 다른 대상이다. `luvbird.app`을 이 랜딩의 주소로 적지 마세요.

## 이미 정한 제품 규칙

- 사용자는 국가, 언어, 관심사, 교류 목적을 바탕으로 펜팔을 찾습니다. 목적 필터는 서버가 전체 회원에서 맞춘 뒤 최대 100명을 돌려줍니다.
- 글과 사진으로 편지를 쓰며, 편지는 약 24시간 이동합니다. 답장은 상대의 속도에 맡깁니다.
- 같은 사람에게 이동 중인 편지가 있으면 그 편지가 도착하기 전에는 다음 편지를 보낼 수 없습니다. 상대가 자기 편지를 보내는 것은 막지 않습니다.
- 하루 요청 3번, 함께 편지하는 사람 3명, 하루 편지 3통입니다.
- 읽음 표시, 팔로워, 좋아요, 정밀 위치 공유는 없습니다. 위치는 도시 수준입니다.
- 실물 우편, 앱스토어 출시, 결제, 광고, AI 매칭은 완료 기능이 아닙니다.

## 구현과 검증의 경계

`CURSOR_HANDOFF.md`와 `FEATURES_IMPLEMENTED.md`에 MVP 범위가 정리되어 있습니다. 2026-09-27 기록의 서버 테스트 26개는 당시 로컬 검증입니다. 2026-10-07에 Node.js 24로 서버 테스트를 다시 실행했고 30개가 통과했습니다. 추가된 검사는 이동 중 편지 잠금, 연결 3명 한도, 목적 검색입니다.

운영 API/영구 DB, 실제 이메일 송수신, APNs/FCM 실기기 전달, APK/TestFlight, 운영 정책과 연락처는 완료되지 않았습니다. 상세한 출시 조건은 `legacy-mvp/docs/LAUNCH-READINESS.md`와 `legacy-mvp/release/DEPLOYMENT.md`를 따르세요. 오래된 배포 문서에 “GitHub 저장소를 찾지 못했다”는 문장이 있더라도 현재 저장소의 remote는 `https://github.com/Jkoreaboi/luvbird.git`입니다. 과거 상태 기록을 현재 상태로 읽지 마세요.

공개 전에 남아 있는 연결은 네 가지입니다. Resend 키와 발송 도메인, 디스크가 유지되는 HTTPS API, 폰 두 대의 편지 교환, 운영 주체와 문의 연락처. 이 네 가지 없이는 다른 사람을 받지 않습니다. 가짜 사용자를 넣지 마세요.

## Webild 시안에서 이미 반영된 방향

랜딩은 짙은 청록색 `#24464A`, 따뜻한 종이색 `#F7F5EE`, 산호색 `#B76850`, 큰 세리프 제목, 봉투와 느린 움직임을 사용합니다. 화면 흐름은 문제 제기, Find / Write / Wait / Reply의 실제 앱 화면 4장, 제품 원칙, 실물 우편의 미래 구상, 출시 예정 상태입니다. 스토어 버튼은 출시 예정이며 가입 폼이 아닙니다.

Webild 히어로 문구 “A letter takes its time.”은 시안 문구입니다. 이 저장소 랜딩의 제목은 “A letter, written for you.”입니다. 실제 영상 자산이 없다면 무관한 스톡 영상을 끼워 넣지 마세요. 가짜 후기, 통계, 스토어 링크, 가입 폼도 만들지 마세요. `prefers-reduced-motion`, 읽기 쉬운 대비, 모바일 구성을 지키세요.

## 읽을 순서

1. 이 문서.
2. `CLAUDE.md` — 브랜드와 제품의 변하지 않는 규칙.
3. `README.md` — 랜딩 페이지 구조와 실행 방법.
4. `CURSOR_HANDOFF.md`, `FEATURES_IMPLEMENTED.md` — MVP의 범위와 한계.
5. `legacy-mvp/README.md`, `legacy-mvp/docs/RESUME.md` — 앱 실행과 작업 기록.
6. `legacy-mvp/mobile/AGENTS.md` — Expo 코드를 수정하기 전 반드시 확인할 지침.
7. 출시 작업 시 `legacy-mvp/docs/LAUNCH-READINESS.md`, `legacy-mvp/release/DEPLOYMENT.md`.

나머지 문서는 기능별로 `legacy-mvp/docs/`에 있습니다. `BRAND.md`와 `ABOUT-LUVBIRD.md`는 브랜드 문구, `USER-GUIDE.md`는 사용자 흐름, `ACCOUNT-RECOVERY.md`와 `OPERATIONS-DASHBOARD.md`는 해당 기능, `VERIFICATION.md`와 `REQUIREMENTS-AUDIT.md`는 과거 검증 기록입니다. `STORE-COPY.md`는 제출하지 않은 초안입니다.

## 실행

루트 웹은 Node.js 20 이상에서 `npm ci`, `npm run dev`, `npm run typecheck`, `npm run build`를 사용합니다. 루트 TypeScript 설정은 `legacy-mvp`를 제외합니다. 앱 타입검사는 `legacy-mvp/mobile/`에서 따로 실행합니다.

이전 API는 Node.js 24 이상에서 `legacy-mvp/server/` 안의 `npm ci`, `npm test`를 사용합니다. 이전 앱은 `legacy-mvp/mobile/` 안에서 `npm ci`, `npm run typecheck`, `npm run lint`, `npx expo start`를 사용합니다. API와 앱의 환경변수 예제는 각 폴더의 `.env.example`을 확인하세요. 비밀키를 문서나 공개 클라이언트 변수에 넣지 마세요.

기능 수정 전에는 현재 코드를 확인하고 기존 테스트를 기준선으로 실행하세요.

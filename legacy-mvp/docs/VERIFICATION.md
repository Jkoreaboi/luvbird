# 검증 기록

검증일: 2026-09-25. 로컬 테스트 환경.

| 항목 | 결과 | 범위 |
|---|---|---|
| 서버/지도 자동 테스트 | 10개 통과 | 실제 HTTP 요청, DB, 사진 재인코딩 및 권한 검사 |
| 두 계정 UI 흐름 | 통과 | 브라우저의 React Native 웹 렌더링, 390×844 |
| TypeScript | 통과 | `tsc --noEmit` |
| Lint | 오류·경고 없음 | AppScreen.tsx와 src 전체 |
| Android 번들 | export 성공 | Hermes JavaScript 번들, APK 아님 |
| iOS 번들 | export 성공 | Hermes JavaScript 번들, IPA 아님 |
| 실제 기기 설치 | 미실행 | APK/IPA 빌드 및 기기 필요 |
| APNs/FCM 푸시 | 미실행 | Expo 및 기기 자격 증명 필요 |
| EAS 로그인 | 미연결 | CLI `whoami` → Not logged in |
| 공개 API 배포 | 미실행 | 호스트·영구 디스크·도메인 미연결 |

## 확인한 보안과 동작

- 수신자가 도착 직전 본문·사진 API를 직접 호출하면 423.
- 제3자는 편지·사진을 읽을 수 없으며 404.
- 발신자는 자기 편지를 확인할 수 있음.
- 정확히 24시간이 지나면 수신자 접근 허용.
- 같은 요청 키를 재전송해도 편지가 하나만 생성됨. 내용이 달라지면 409.
- 발송 이후 본문 수정 API 없음.
- 타인 사진을 자신의 편지에 붙일 수 없음.
- 이미지 EXIF 제거 확인.
- 차단 시 이동 중 편지 취소 및 신규 발송 차단. 차단 해제 후에도 취소 유지.
- 계정 삭제 비밀번호 재확인, 관련 편지·사진·세션 삭제.
- 운영 서버에서 짧은 배송 시간 설정을 거부.
- 클라이언트가 임의로 전달한 도착 시각 무시.
- 중복 작업 실행 시 도착 이벤트 하나, 푸시 본문에는 사적 편지 내용 없음.
- 서울–시애틀 날짜 변경선 경로, 지도 경계 분리, 경로 진행률 확인.

## UI 흐름

실제 가입·로그인 → 펜팔 요청·수락 → 이미지 선택기 업로드 → 초안 닫기/복구 → 봉인/발송 → 지도 → 수신함 → 서버 테스트 시각을 24시간 이동 → 개봉 → 답장.

가짜 성공 응답이나 하드코딩 화면을 사용하지 않고 테스트 서버의 인증·DB·사진 저장 API를 사용했다. 단, 시간 경과는 테스트 서버의 제어 가능한 시계를 사용했으며 실제 24시간을 기다린 것은 아니다.

화면의 Sunje와 Emma는 테스트 과정에서 생성된 임시 계정이다. 첨부 이미지는 업로드 확인용 브랜드 아이콘이다. 사용자의 실제 연락처·사진은 사용하지 않았다.

물리 기기의 사진 권한 거절, 키보드·동작 줄이기, 네트워크 끊김 후 사진 재선택, OS별 푸시 동작은 기기 테스트 때 추가 확인해야 한다.

## 2026-09-26 update
- Delivery changed to 24 hours (86,400 seconds). Previously sealed letters keep stored arrival timestamps.
- 11 automated server/geometry tests passed, including upload retry idempotency and MBTI/travel profile persistence.
- TypeScript and ESLint passed. Updated Android/iOS JavaScript exports are not APK/IPA files.
- Free curated question cards are not AI-generated. Billing, advertising, blind reveal and selfie verification are not active.
- Failed photo data is still kept only in memory: app restart requires selecting that photo again. Persistent upload recovery remains outstanding.

## 3-language and recovery update
Added Korean/English/Japanese picker on the header and profile settings, persisted device preference, Japanese core UI/errors/notices/question cards, locale-aware dates, and profile letter history. Failed photo uploads now persist in chunked device storage with an idempotency key; success saves the local draft before removing recovery data. The previous memory-only limitation is superseded.
Latest verification: 12 server/geometry/translation tests passed; lint and typecheck passed. Browser UI tests passed three-language switching with Japanese persisted after reload, and deliberately dropped upload response followed by reload/retry produced one photo. Physical device process termination/storage pressure and OS permission localization remain unverified.

## In-app guide / company introduction
Added ten-topic usage guide and luvbird introduction in Korean, English and Japanese. Both open before login and from the profile. Browser flow verified Korean guide scrolling, introduction opening/closing, Japanese guide opening, and the existing two-account letter flow. Typecheck/lint passed. Native device verification remains pending.

## Brand and device update
13 automated tests passed including device-scoped token removal, cross-account token protection and avatar version changes. Added shared original vector brand geometry, icon/splash assets and intent filtering. Native icon cropping and push delivery still require device builds.

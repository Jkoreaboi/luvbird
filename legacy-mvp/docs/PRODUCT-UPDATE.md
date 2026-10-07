# 추가 업데이트 · 펜팔 우선 진입과 사전 사용 안내

기존 로그인 소개 문구/사용 가이드 링크에 더해, 앱 첫 실행 시 실제 4단계 안내 화면을 연결했습니다.

- 사용법: 사람 찾기 → 요청·수락 → 사진 편지 → 24시간 배송
- 완료 후 가입·로그인, 인증 후 펜팔 목록으로 이동
- 처음 사용법 다시 보기: 로그인 화면 및 내 프로필
- 한국어·영어·일본어, 이전/다음/건너뛰기, 완료 상태 저장
- 펜팔 카드가 먼저 보이도록 검색 조건 접기
- 안내용 인물은 예시라고 표시. 실제 목록은 서버에 가입한 프로필만 표시

미리보기: ONBOARDING-REVIEW.html (앱의 브라우저 렌더링과 테스트 계정). 실기기 및 스토어 배포 검증은 별도입니다.

# 24-hour update
New letters arrive after 86,400 seconds; production enforces this. Existing sealed letters keep their stored arrival. Replies take another 24 hours: minimum round trip 48 hours.
Implemented: optional self-reported MBTI, provisional fruit modes (orange friends, cherry romance, lemon languages, grape pen pals, mango travel), planned travel city, free curated question cards, hour/minute countdown. No GPS or personality inference.

## Planned, not integrated
Monetization: choose one-time ad removal initially; pricing unconfirmed. No active billing or ad SDK. Store receipt validation, restore purchases and entitlement sync are required before selling. Premium deferred until recurring benefits exist.
AdMob: use test ads and consent management during integration. ATT is needed for tracking/IDFA, not every ad. No promised revenue multiplier. Never send letters or MBTI to ad networks.
Blind profile: opt-in mutual reveal with server image access control; never sell bypass of owner privacy. Not enabled.
AI: current prompts are curated, not AI. Interest-based suggestions may follow; no psychological analysis claims.
Selfie verification: no badge until actual verification and operational review exist. No 100% safety claim; consent, biometric retention and vendor decisions pending.
Travel: user-entered destination available; paid destination search/matching not implemented.
References: Fate Penpal accessed; its seven days is a reply window. Geulwoll returned 403 and could not be verified. No competitor assets copied.

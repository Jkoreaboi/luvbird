# luvbird / DearBird — 운영과 테스트 배포

## 현재 상태와 경계

앱 소스와 서버를 구현했다. Android/iOS JavaScript 번들 export는 설치 파일 생성과 다르다.
APK/IPA, 실제 기기 실행, TestFlight 업로드는 별도 빌드 및 서명이 필요하다.
현재 프로젝트에는 실 서비스 계정, 비밀 키, 테스트 사용자 데이터가 포함되어 있지 않다.

## 백엔드

Node 24 + Express 5 + SQLite + Sharp. 초기에 요청된 Supabase를 검토했으나 연결된 프로젝트가 없어, 실제 접근 통제와 사진 처리까지 이 환경에서 검증할 수 있는 자체 API를 선택했다.
사진은 공개 웹 폴더에 저장하지 않고 데이터베이스 BLOB으로 보관한다. 모든 사진 조회는 인증 및 편지 도착 여부를 재검증한다.
이 MVP는 단일 서버·단일 데이터베이스 파일을 사용하는 작은 비공개 테스트용이다. 다중 replica 배포는 하지 않는다. 확장 시 PostgreSQL 및 private object storage로 옮긴다.

### 서버 실행

```bash
cd server
npm ci
node --env-file=.env index.mjs
```

`.env.example`을 `.env`로 복사한 뒤 설정한다. 기본 배송은 86400초(24시간)다.
별도 스테이징 데이터베이스에만 `APP_ENV=staging`, `DELIVERY_SECONDS=60`을 사용할 수 있다.
운영 모드에 다른 배송 시간을 넣으면 서버가 시작하지 않는다. 클라이언트 요청으로 시간을 바꿀 수 없다.

### HTTPS 배포

Docker 실행 가능한 호스트와 API 도메인이 준비되면 루트의 `compose.yaml`과 `Caddyfile`을 사용한다.

```bash
API_DOMAIN=api.YOUR-DOMAIN.example docker compose up -d --build
```

위 도메인은 예시다. 실제 소유 도메인과 해당 호스트를 가리키는 DNS 설정이 필요하다. 80/443 포트를 개방한다. Caddy가 TLS 인증서를 발급한다. API는 프록시 내부에서만 접근한다.
이 배포 명령은 현재 실행되지 않았다. 호스팅 계정이나 도메인을 임의로 구매하지 않았다.

`letters` 볼륨을 영구 보존한다. 볼륨 삭제는 사용자 데이터 삭제다. 백업은 SQLite의 온라인 백업 또는 안전하게 중단한 데이터베이스를 사용한다. 실행 중인 WAL 데이터베이스의 본 파일만 복사하지 않는다. 디스크·백업 암호화는 운영 호스트에서 설정한다.
현재 HTTP rate limit은 프록시 뒤에서 보수적으로 모든 사용자를 한 IP로 취급할 수 있다. 공개 확장 전 신뢰할 프록시 범위를 명시하여 설정한다. 무조건 `trust proxy=true`를 설정하지 않는다.

## 모바일 실행

```bash
cd mobile
npm ci
cp .env.example .env
npx expo start
```

실제 폰에서는 API URL의 localhost를 개발 컴퓨터 LAN IP로 바꾼다. 같은 네트워크의 두 기기에서 각자 계정을 만들어 사용한다. Expo SDK 57과 호환되는 개발 클라이언트/Expo Go가 필요하다. 원격 푸시는 Expo Go가 아닌 별도 모바일 빌드에서 검증한다.
환경 파일 변경 뒤 Expo를 다시 시작한다. 공개 테스트 빌드는 HTTPS API를 사용해야 한다.

## APK / TestFlight

1. 본인 Expo 계정으로 `npx eas-cli login` 후 프로젝트를 생성·연결한다.
2. Expo 프로젝트 ID를 `EXPO_PROJECT_ID`에 설정한다.
3. EAS preview 환경에는 스테이징 HTTPS URL을 `EXPO_PUBLIC_API_URL`로 설정하고 프로젝트 ID도 설정한다. production 환경에는 운영 API를 분리 설정한다.
4. Android: `npx eas-cli build --platform android --profile preview` → 성공 후 실제 APK 설치 링크 확보.
5. iOS TestFlight: Apple Developer/App Store Connect 연결 후 `npx eas-cli build --platform ios --profile production`, 이어서 `npx eas-cli submit --platform ios --profile production`.
6. iOS ad hoc 테스트를 선택하면 `preview` profile과 등록된 기기의 UDID가 필요하다. TestFlight는 production/store build를 사용한다.

번들 ID는 임시 `com.luvbird.dearbird`, 테스트용 `com.luvbird.dearbird.preview`다. 스토어 최초 등록 전에 실제 조직 소유 ID를 확인한다.
회사와 제품명을 각각 분리했으며, 화면 브랜드는 `mobile/src/config.ts`, 빌드 이름은 `mobile/app.config.js`에서 바꾼다.
EAS 클라우드 빌드를 시작하기 전에 계정별 무료 한도와 결제 설정을 확인한다. 계정 미로그인 상태에서는 빌드 링크가 생기지 않는다.

## 푸시

EAS 프로젝트 ID, APNs/FCM 자격 증명, 기기의 알림 권한이 필요하다. 서버에서 `PUSH_ENABLED=true`로 켠다.
서버는 `events`와 기기별 `deliveries`의 unique key로 같은 작업의 반복 처리를 막는다. 수신자에게 본문이나 사진은 보내지 않는다. 15분 이후 Expo receipt를 확인하고 등록 해제된 토큰을 제거한다.
외부 푸시 서비스는 exactly-once를 보장하지 않는다. 이 MVP는 발송 전 claim한 뒤 네트워크 오류가 불확실하면 자동 재발송하지 않는 at-most-once 방식이다. 중복 방지를 우선하므로 일부 푸시는 누락될 수 있다. 앱을 열면 서버 시간을 기준으로 항상 실제 도착 상태를 조회한다.
푸시 기능을 꺼도 편지 개봉 시각은 정확히 작동한다. 물리 기기 APNs/FCM 전달은 아직 별도 검증 대상이다.

## 신고 운영

운영자만 데이터베이스 호스트에서 아래 명령을 실행한다. 운영 도구는 앱이나 공개 API에 포함하지 않는다.

```bash
cd server
DATABASE_PATH=/data/luvbird.sqlite node moderate.mjs list
DATABASE_PATH=/data/luvbird.sqlite node moderate.mjs resolve REPORT_ID
```

신고를 확인하고 필요하면 차단·계정 제거를 검토한다. 제거 명령에는 동일한 ID를 `CONFIRM_REMOVE`로 다시 명시해야 한다.
신고 사유는 민감할 수 있으므로 터미널 출력과 운영 접근 권한을 제한한다. 정해진 담당자가 매일 확인하는 비공개 테스트 운영을 전제로 한다.

## 공개 출시 전 남은 항목

- 실제 기기: 사진 권한 거절, 작은 화면/큰 글씨, 키보드, Android 뒤로 가기, iOS 개봉 모달, 두 계정·푸시 검증.
- 운영자 연락처, 확정된 개인정보 처리방침/약관, 신고 검토 담당자와 보존 기간.
- 이메일 소유 확인 및 비밀번호 복구. 현재 비공개 테스트에서는 이메일+비밀번호 가입이며 이메일 발송은 미구현.
- 연령은 자기 확인 방식이며 신분증 기반 나이 검증은 제공하지 않음.
- 실 서비스 백업/복원, 외부 보안 검토, 계정별 업로드 저장량 한도 강화.
- 서버 프로필 탐색은 최근 500명 중 최대 100명 반환. 대규모 탐색 pagination은 후속 작업.
- 첨부 업로드 실패는 작성 화면에서 재시도 가능. 아직 서버에 업로드되지 않은 사진은 앱 종료 후 다시 선택해야 함.
- 서버 초안은 30일 후 만료. 기기 초안은 로그아웃·계정 삭제 때 정리하며, 기기 OS 백업 정책도 검토한다.

## 비용

현재 외부 유료 리소스 생성이나 지출은 없다. 예상 비용 항목은 서버/영구 디스크/백업/도메인/EAS 빌드/Apple 개발자 등록/Google Play 등록이다. 실제 금액은 선택한 계정·지역·플랜과 사용량이 확인되지 않아 산정하지 않았다. 지도는 번들에 포함된 Natural Earth 공개 데이터로 지도 API 비용이 없다.

## 참고한 공식 문서

- https://docs.expo.dev/versions/latest/
- https://docs.expo.dev/versions/latest/sdk/imagepicker/
- https://docs.expo.dev/versions/latest/sdk/securestore/
- https://docs.expo.dev/build/internal-distribution/
- https://docs.expo.dev/push-notifications/sending-notifications/
- https://supabase.com/docs/guides/storage/security/access-control
- https://nodejs.org/api/sqlite.html

지도: Natural Earth public domain, world-atlas 110m. 앱 내 attribution 포함. 디자인과 비둘기 벡터는 프로젝트에서 작성.

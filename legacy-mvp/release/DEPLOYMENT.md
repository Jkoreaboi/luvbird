# DearBird 배포 실행서

## 현재 확인된 상태
2026-09-26: Render/Resend 연결 없음, Expo/EAS 로그인 세션 없음, 프로젝트 UUID/API 운영 주소 없음. 실제 배포·실제 이메일 발송·APK/IPA 생성·스토어 제출은 하지 않았다. 코드 검증은 아래 결과와 별도다.

## 필요한 연결 정보
- Render 계정: 서버 프로젝트 생성/배포 및 비용 계획 확인.
- Resend 계정과 소유한 발송 도메인: SPF/DKIM DNS 검증, 발신 주소 확정.
- 소스 저장소: 연결된 GitHub 검색에서 Luvbird 저장소를 찾지 못했다. 소유할 비공개 저장소 URL 확정 후 이 소스를 업로드한다.
- Expo 계정과 실제 EAS 프로젝트 UUID/소유자, iOS TestFlight용 Apple Developer/App Store Connect 권한.
- 운영 주체, 문의 이메일, 공개할 개인정보/이용 안내의 최종 내용.

비밀키는 해당 서비스의 비밀 환경변수 입력 화면에서 설정한다. 모바일의 EXPO_PUBLIC_*에는 API 주소 같은 공개 설정만 넣는다.

## 운영 서버 — Render 경로
1. 프로젝트 루트의 render.yaml을 비공개 소스 저장소에 포함한다.
2. 계정 연결 후 Blueprint를 검토한다. 1개 Node24 서비스와 1GB 영구 디스크를 사용한다. 유료 컴퓨트/디스크 구성이다. 생성 전 계정에 표시되는 가격을 확인한다.
3. RESEND_API_KEY, EMAIL_FROM을 설정한다. DATABASE_PATH는 /var/data/luvbird.sqlite. API/사진 데이터는 이 SQLite 파일에 들어 있다.
4. 배포 후 서버가 반환한 HTTPS 주소를 기록한다. 임의로 서비스 URL을 만들지 않는다.
5. `node scripts/check-live.mjs https://실제-API-호스트`를 실행한다.
6. 프록시 설정은 직접 인터넷에 노출되지 않는 앱 서버와 정확히 한 개의 신뢰 프록시를 전제로 한다. 실제 배포의 두 클라이언트에서 요청 제한이 분리되는지 확인한다.
7. healthCheckPath=/ready는 DB 연결을 확인한다. 이메일의 실제 받은편지함 도착은 별도 검증한다.

동일 SQLite 파일에 대해 서버 인스턴스를 여러 개로 확장하지 않는다. 이 설정은 초기 단일 서버용이다. 원격 Render Blueprint 유효성 검사와 실제 서비스 구동은 계정 연결 후 수행해야 한다.

## 대안 — 보유 서버의 Docker Compose
루트 .env.production.example을 .env로 복사해 실제 도메인/발송 값을 채운다. DNS가 해당 서버를 가리키고 80/443 포트를 사용할 수 있어야 한다. `docker compose up -d --build`로 API+Caddy를 시작한다. API 포트는 직접 외부에 공개하지 않는다. Docker 실행기가 현재 작업 환경에 없어 실제 이미지 빌드는 아직 검증하지 않았다.

## 이메일 수신 검증
두 개의 본인 테스트 계정을 만든 뒤 각자 인증 이메일을 요청한다. 코드를 앱에서 확인하고 펜팔 요청/수락/사진 편지 흐름을 실행한다. 비밀번호 복구 후 이전 기기의 세션이 해제되는지 확인한다. 수신 지연·스팸함·Resend 로그를 확인한다. 테스트할 수신 주소가 지정되지 않아 이번 작업에서 실제 이메일을 발송하지 않았다.

## Android 설치 및 iOS TestFlight
mobile/에서 실행한다. 앱 식별자는 첫 스토어 등록 전에 본인 계정에서 사용할 수 있는 값인지 확인한다.

```bash
npx eas-cli@latest login
npx eas-cli@latest whoami
npx eas-cli@latest init
```

위 명령이 반환한 실제 projectId를 EXPO_PROJECT_ID에, 소유자를 EXPO_OWNER에 설정한다. 운영 API 주소를 EXPO_PUBLIC_API_URL로 설정한다. mobile/.env.release.example을 참고하되 빌드 서비스의 preview/production 환경에도 같은 공개 설정을 등록한다. init은 기본 development 환경에서 수행한다. 실제 프로젝트가 없으면 non-development 빌드는 실패하도록 구성했다.

```bash
# Android 직접 설치용 APK (preview 식별자)
npx eas-cli@latest build --platform android --profile preview
# iOS TestFlight 제출용 (production 식별자)
npx eas-cli@latest build --platform ios --profile production
# 성공한 정확한 build ID를 확인한 후 제출
npx eas-cli@latest submit --platform ios --profile production --id BUILD_ID
```

명령의 BUILD_ID에는 실제 반환값을 사용한다. Apple 서명·App Store Connect 앱 설정이 필요하다. 제출 후 처리/심사 상태를 확인하고 실제 TestFlight 설치를 검증한다. JS 번들 export는 APK나 IPA 생성이 아니다.

## 백업/복구
`node server/backup.mjs SOURCE.sqlite NEW-BACKUP.sqlite`는 실행 중 SQLite의 일관된 백업을 생성하고 무결성을 확인한다. 기존 경로는 덮어쓰지 않는다. 백업에는 편지와 사진 등 개인정보가 포함된다. 제한된 접근 권한을 적용한 별도 저장소로 옮겨야 디스크 손실에 대비할 수 있다. 이 별도 저장소와 주기적 실행은 아직 연결하지 않았다.

복구는 서비스를 중지하고 백업을 **새 DB 경로**로 복사해 DATABASE_PATH를 그 경로로 바꾼다. 백업 원본과 기존 DB는 보존한다. 재시작 후 무결성/로그인/사진 읽기를 확인한다. 기존 DB를 실행 중 덮어쓰거나 WAL 파일만 따로 복원하지 않는다.

## 유저 모집을 열기 직전 확인
- 실제 HTTPS API 및 영구 디스크가 동작하고 백업이 별도 저장소에 보관된다.
- 두 실기기에서 가입/이메일/요청/사진/24시간 도착/답장/차단/계정 삭제를 확인한다.
- 실제 APNs/FCM 자격 증명 연결 후 알림을 검증한다. PUSH_ENABLED는 그전까지 false이다.
- 공개 정책/문의 연락처/신고 처리 책임자가 확정되어 앱 안내와 일치한다.
- 신규 유저가 만날 실제 펜팔 그룹을 준비하되, 이번 단계에서는 모집 메시지를 발송하지 않는다.

공식 문서: https://render.com/docs/blueprint-spec · https://render.com/docs/disks · https://docs.expo.dev/build/setup/ · https://docs.expo.dev/submit/ios/ · https://resend.com/docs/api-reference/emails/send-email

## 신고 관리
모집 전 서버에 별도 OPERATIONS_TOKEN을 설정하고 HTTPS API의 /ops에서 운영 접속을 확인한다. 모바일 앱에는 포함하지 않는다. 설정과 동작은 ../docs/OPERATIONS-DASHBOARD.md 참고.

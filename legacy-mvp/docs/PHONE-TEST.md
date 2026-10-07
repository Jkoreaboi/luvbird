# MacBook → iPhone 테스트

이 파일은 **실제 기기 시험 방법**입니다. QR 코드와 설치 링크는 아직 생성되지 않았습니다. 맥북에서 명령을 실행한 뒤 터미널에 뜨는 QR을 사용합니다.

1. Mac에 Node.js 24 이상, iPhone에 Expo Go를 설치합니다. Mac과 iPhone을 같은 Wi-Fi에 연결합니다. iPhone Expo Go와 Mac의 Expo CLI에 **같은 Expo 계정**으로 로그인합니다. Mac 로그인 명령은 `npx expo login`입니다.
2. 압축을 풀어 `luvbird` 폴더를 연 뒤 터미널에서 실행합니다.

   ```bash
   cd /압축을/푼/경로/luvbird
   bash scripts/mac/start-phone.command
   ```

3. 서버가 준비되면 API 주소와 Expo QR이 표시됩니다. iPhone 카메라로 QR을 스캔하고 Expo Go에서 엽니다. 연결이 안 되면 휴대폰 브라우저에서 터미널에 표시된 `/health` 주소를 먼저 열어 Wi-Fi 연결을 확인하세요.
4. iPhone에서 첫 번째 계정을 만듭니다. 맥북 터미널에서 `w`를 누르면 브라우저 앱이 열립니다. 브라우저에서 두 번째 계정을 만든 후 iPhone에서 펜팔 요청, 브라우저에서 수락, 사진 편지 발송을 확인할 수 있습니다. 편지는 기본적으로 24시간 뒤 도착합니다.
5. 즉시 도착을 확인하려면 터미널에서 `Ctrl+C`로 종료하고 **별도 테스트 데이터베이스**를 쓰는 다음 명령으로 다시 시작합니다. 빠른 시험에서는 60초 뒤 도착합니다.

   ```bash
   DEARBIRD_FAST=1 bash scripts/mac/start-phone.command
   ```

기본/빠른 시험은 서로 다른 데이터베이스와 계정을 사용합니다. 빠른 시험에서 새로 가입하세요. 테스트 데이터는 `server/data/`에 보관되며 소스 배포에 포함하지 않습니다. 터미널을 열어둔 동안만 맥북 서버가 동작합니다. 푸시 알림은 Expo 프로젝트와 플랫폼 인증 정보가 없어 확인 대상에서 제외됩니다.

Expo Go가 로그인 오류를 띄우면 맥에서 `cd mobile && npx expo login`을 실행하고 iPhone의 Expo Go에서 같은 계정으로 로그인하세요. 계정은 무료로 생성할 수 있습니다. Wi-Fi에서 연결이 계속 막히면 라우터의 기기 간 통신 차단을 확인하세요. 현재 API는 맥북의 로컬 주소에 있으므로 Expo 터널만 켜서는 다른 네트워크의 iPhone에서 API에 도달할 수 없습니다.

맥북 Wi-Fi가 `en0`나 `en1`이 아닌 환경에서는 아래처럼 Mac의 실제 Wi-Fi IPv4 주소를 지정합니다.

```bash
DEARBIRD_LAN_IP=192.168.1.23 bash scripts/mac/start-phone.command
```

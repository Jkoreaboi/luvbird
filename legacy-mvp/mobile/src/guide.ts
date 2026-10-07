import type { Lang } from './i18n';
type Page = { title: string; intro: string; sections: { title: string; body: string }[] };
export const guide: Record<Lang, Page> = {
 ko: { title: 'DearBird 사용 가이드', intro: '한 장의 사진, 한 통의 편지. 처음이라도 천천히 시작해보세요.', sections: [
 {title:'01 · 나의 작은 세계 만들기',body:'만 18세 이상이라면 이메일과 12자 이상의 비밀번호로 가입하세요. 닉네임, 도시, 자기소개, 관심사와 사용 언어를 입력합니다. MBTI는 선택 사항이에요. 앱 표시 언어와 편지를 주고받을 언어는 따로 선택할 수 있어요.'},
 {title:'02 · 어떤 인연을 만나고 싶나요?',body:'🍊 친구 · 🍒 연인 · 🍋 언어 교환 · 🍇 편지 친구 · 🥭 여행 중 목적을 선택하세요. 여행 모드에서는 여행 예정 도시를 적을 수 있어요. 실시간 위치를 공개하는 기능은 아닙니다. 목적이나 MBTI가 궁합을 보장하지는 않아요.'},
 {title:'03 · 펜팔과 연결하기',body:'펜팔 탭에서 국가·언어·관심사로 찾아보고 상대의 프로필을 눌러 요청하세요. 상대가 수락하면 편지를 쓸 수 있어요. 요청은 하루 5명, 활성 펜팔은 최대 10명입니다. 처음 연결되면 서로 자기소개 편지를 보내보세요.'},
 {title:'04 · 사진 편지 쓰기',body:'편지는 최대 10,000자, 사진은 최대 3장입니다. 질문 카드를 눌러 첫 문장을 시작해도 좋아요. 사진을 고르고 편지지와 우표를 선택하세요. 보내기 전에 받는 사람과 도착 예정 시간을 확인하세요. 봉인한 뒤에는 글과 사진을 수정할 수 없어요.'},
 {title:'05 · 24시간의 기다림',body:'편지는 발송 후 24시간 뒤에 도착하며, 답장도 24시간이 걸립니다. 바로 답장해도 왕복에는 최소 48시간이 필요해요. 지도 위 비둘기는 도시 사이의 가상 여정을 보여줍니다. 실제 항공편이나 GPS 추적이 아니에요. 도착 시각은 현재 기기의 시간대로 표시됩니다.'},
 {title:'06 · 봉투를 열고 답장하기',body:'우편함의 오는 중·도착한 편지·보낸 편지·초안을 확인하세요. 도착 전에는 받은 편지의 글과 사진을 열 수 없습니다. 도착한 봉투를 눌러 열고 답장하세요. 상대 프로필에서 함께 나눈 편지 내역도 볼 수 있어요. 읽음 표시와 접속 상태는 제공하지 않습니다.'},
 {title:'07 · 초안과 사진 복구',body:'초안은 기기와 서버에 저장됩니다. 서버 초안은 30일 뒤 만료될 수 있어요. 업로드가 실패한 사진은 같은 기기에서 초안을 다시 열고 다시 시도를 누르세요. 사진을 빼려면 삭제를 누르세요. 앱 삭제·기기 데이터 삭제·로그아웃 후에는 기기에만 있던 내용이 사라질 수 있습니다.'},
 {title:'08 · 언어와 알림 설정',body:'상단 언어 버튼이나 내 프로필의 앱 언어에서 한국어·English·日本語를 선택하세요. 다음 실행에도 유지됩니다. 편지와 자기소개는 자동 번역되지 않아요. 내 프로필에서 도착 알림을 켤 수 있습니다. 현재 테스트 빌드에서는 푸시 연결이 준비되지 않을 수 있어요. 알림이 없어도 앱을 열어 도착 여부를 확인할 수 있습니다.'},
 {title:'09 · 편안하고 안전하게',body:'불편한 상대는 프로필에서 신고하거나 차단하세요. 차단하면 연결이 끝나고 이동 중인 편지는 취소됩니다. 해제해도 자동 복구되지 않아요. 돈·인증번호·비밀번호를 보내지 마세요. 현재 셀카 인증이나 안전 보증 마크는 제공하지 않습니다.'},
 {title:'10 · 계정과 개인정보',body:'정확한 주소나 GPS는 필요하지 않습니다. 본인이 선택한 도시가 공개돼요. 계정 삭제는 내 프로필에서 비밀번호 확인 후 진행하며 사진과 주고받은 편지도 삭제됩니다. 공개 프로필에는 이메일이 표시되지 않습니다. 이메일 인증은 내 프로필에서, 비밀번호 재설정은 로그인 화면에서 진행합니다. 테스트 서버의 이메일 발송이 준비되지 않은 경우 안내가 표시됩니다. 운영 문의 창구는 공개 전 확정할 예정입니다.'}
 ]},
 en: {title:'Your DearBird guide',intro:'One photograph. One letter. Start at your own pace.',sections:[
 {title:'01 · Your little world',body:'Adults aged 18+ can register with an email and a password of at least 12 characters. Add a nickname, city, story, interests and writing languages. MBTI is optional. App language and the languages you write in are separate settings.'},
 {title:'02 · Find your kind of connection',body:'Choose 🍊 friends, 🍒 romance, 🍋 languages, 🍇 pen pals or 🥭 travel. Travel mode lets you share a planned destination, not a live location. Intent and MBTI do not guarantee compatibility.'},
 {title:'03 · Connect with a pen pal',body:'Filter by country, language and interests, open a profile and send a request. Letters become available after acceptance. You can send 5 requests a day and have up to 10 active pen pals. Both of you can send an introduction right away.'},
 {title:'04 · Write a photo letter',body:'Write up to 10,000 characters and attach up to 3 photos. Tap a question card for inspiration, then choose paper and a stamp. Check the recipient and arrival estimate before sending. Sealed letters and photos cannot be edited.'},
 {title:'05 · A 24-hour journey',body:'Letters arrive 24 hours after sending. Replies take another 24 hours, so a round trip takes at least 48 hours. The bird follows a virtual journey between cities, not a real flight or GPS track. Arrival times use your device’s current time zone.'},
 {title:'06 · Open and reply',body:'Your mailbox has On the way, Arrived, Sent and Drafts. Received text and photos stay locked until arrival. Open an arrived envelope and write back. Open your pen pal’s profile to see your shared letter history. There are no read receipts or online status indicators.'},
 {title:'07 · Recover a draft or photo',body:'Drafts are saved on your device and server. Server drafts may expire after 30 days. If an upload fails, reopen the draft on the same device and tap Try again, or Remove to discard that photo. Uninstalling, clearing device data or logging out can remove content stored only on your device.'},
 {title:'08 · Language and notifications',body:'Use the header language button or My world → App language to choose 한국어, English or 日本語. Your choice persists. Letters and biographies are not automatically translated. Enable arrival notifications in your profile. Push may not be configured in the current test build; opening the app still checks arrivals.'},
 {title:'09 · Feel comfortable',body:'Report or block someone from their profile. Blocking ends the connection and cancels letters in flight; unblocking does not restore them. Never share money, verification codes or passwords. Selfie verification and guaranteed-safety badges are not available.'},
 {title:'10 · Account and privacy',body:'No precise address or GPS is needed. Your selected city is public. Delete your account from My world with password confirmation; exchanged letters and photos are deleted too. Email is not shown on public profiles. Verify your email in My world or reset your password from the login screen. A notice appears if email delivery is unavailable on the test server. An operating support channel will be confirmed before launch.'}
 ]},
 ja: {title:'DearBird 使い方ガイド',intro:'一枚の写真、一通の手紙。あなたのペースで始めましょう。',sections:[
 {title:'01 · あなたの小さな世界',body:'18歳以上の方はメールアドレスと12文字以上のパスワードで登録できます。名前、街、自己紹介、興味、文通に使う言語を入力しましょう。MBTIは任意です。アプリの表示言語と文通の言語は別々に設定できます。'},
 {title:'02 · 出会いの目的',body:'🍊 友達・🍒 恋人・🍋 言語交換・🍇 文通仲間・🥭 旅行から選べます。旅行モードでは予定している街を入力できます。現在地の追跡ではありません。目的やMBTIが相性を保証するものではありません。'},
 {title:'03 · ペンパルとつながる',body:'国・言語・興味で探し、プロフィールから申請しましょう。承認されると手紙を送れます。申請は1日5人、接続は最大10人です。最初はお互いに自己紹介の手紙を送りましょう。'},
 {title:'04 · 写真付きの手紙',body:'本文は10,000文字まで、写真は3枚までです。質問カードを押して書き始めても大丈夫。便箋と切手を選び、宛先と到着予定を確認しましょう。送信後は文章や写真を変更できません。'},
 {title:'05 · 24時間の旅',body:'送信から24時間後に届き、返信にも24時間かかります。すぐに返信しても往復には最短48時間が必要です。地図上の鳩は都市間の仮想の旅を示します。実際の飛行機やGPSの追跡ではありません。到着時刻は端末のタイムゾーンで表示されます。'},
 {title:'06 · 開封して返事を書く',body:'郵便受けには配達中・届いた手紙・送った手紙・下書きがあります。受け取った本文と写真は到着前には開けません。届いた封筒を開き、返事を書きましょう。相手のプロフィールで二人の手紙の履歴を確認できます。既読やオンライン状態は表示しません。'},
 {title:'07 · 下書きと写真の復元',body:'下書きは端末とサーバーに保存されます。サーバーの下書きは30日後に期限切れとなる場合があります。写真の送信に失敗したら、同じ端末で下書きを開き再試行してください。削除でその写真を取り消せます。アプリや端末データの削除、ログアウトにより、端末だけにある内容は失われる場合があります。'},
 {title:'08 · 言語と通知',body:'上部の言語ボタン、またはマイプロフィールのアプリの言語から 한국어・English・日本語 を選べます。再起動後も保持されます。手紙や自己紹介は自動翻訳されません。到着通知はプロフィールで設定します。テスト版では通知が未設定の場合もありますが、アプリを開けば到着を確認できます。'},
 {title:'09 · 安心して使うために',body:'困ったときは相手のプロフィールから通報・ブロックしてください。ブロックすると接続を終了し配達中の手紙を取り消します。解除しても復元されません。送金、認証コードやパスワードの共有はしないでください。セルフィー認証や安全保証バッジは現在ありません。'},
 {title:'10 · アカウントとプライバシー',body:'正確な住所やGPSは不要です。選択した街が公開されます。マイプロフィールでパスワードを確認してアカウントを削除すると、交換した手紙や写真も削除されます。メールアドレスは公開プロフィールに表示されません。メール確認はマイプロフィール、パスワード再設定はログイン画面で行います。テスト環境でメール送信が未設定の場合は案内が表示されます。問い合わせ窓口は公開前に確定します。'}
 ]}
};
export const about: Record<Lang, Page> = {
 ko:{title:'Luvbird 소개',intro:'누군가의 하루가, 당신에게 도착하는 시간.',sections:[{title:'우리가 만드는 것',body:'Luvbird는 회사입니다. 첫 제품 DearBird는 메신저가 아닙니다. 멀리 있는 한 사람에게 하루를 사진과 편지로 보내고, 그 편지가 24시간 동안 이동하게 합니다.'},{title:'우리의 약속',body:'사람과 이야기를 중심에 둡니다. 좋아요, 팔로워, 읽음 표시는 없습니다. 프로필은 도시만 보여 주고, 답장은 상대의 속도로 다시 24시간을 이동합니다.'},{title:'현재의 DearBird',body:'현재는 테스트 버전입니다. 실물 우편은 아직 없는 다음 이야기입니다. 운영 주체와 문의 연락처는 공개 전에 확정합니다. 이 소개는 법인 등록이나 안전 보증이 아닙니다.'}]},
 en:{title:'About Luvbird',intro:'A little piece of someone’s day, on its way to you.',sections:[{title:'What we are building',body:'Luvbird is the company. DearBird is its first product, and it is not a messenger. You send one person a photo and a letter about your day. The letter travels for 24 hours.'},{title:'What matters to us',body:'People and their stories come first. There are no likes, no followers, and no read receipts. A profile shows a city, and a reply travels for another 24 hours.'},{title:'DearBird today',body:'This is a test version. Physical mail is a later chapter, not something you can use now. Support contacts will be confirmed before public release. This page is not proof of registration or guaranteed safety.'}]},
 ja:{title:'Luvbirdについて',intro:'誰かの一日が、あなたに届く時間。',sections:[{title:'私たちがつくるもの',body:'Luvbirdは会社です。最初の製品DearBirdはメッセンジャーではありません。遠くの一人に、その日の写真と手紙を送り、手紙は24時間かけて届きます。'},{title:'大切にしていること',body:'人と物語を中心にします。いいね、フォロワー、既読表示はありません。プロフィールは街だけを示し、返信もまた24時間かけて届きます。'},{title:'現在のDearBird',body:'現在はテスト版です。紙の郵便は、まだ使えない次の章です。運営主体と問い合わせ先は公開前に確定します。この紹介は法人登録や安全性の保証ではありません。'}]}
};

export const accountMessages = {
  ko: {
    recover: '비밀번호를 잊으셨나요?', reset: '비밀번호 재설정', verify: '이메일 인증', verified: '이메일 인증 완료',
    request: '코드 이메일 요청', token: '이메일로 받은 코드', password: '새 비밀번호 (12자 이상)', confirm: '새 비밀번호 확인',
    help: '이메일로 받은 코드를 붙여넣으세요. 코드는 15분간 유효하며 한 번만 사용할 수 있어요.',
    requested: '등록된 이메일이라면 코드가 발송됩니다. 잠시 기다린 뒤 스팸함도 확인해주세요. 재요청은 1분 후 가능해요.',
    verifyRequested: '인증 이메일을 요청했어요. 잠시 기다린 뒤 스팸함도 확인해주세요. 재요청은 1분 후 가능해요.',
    done: '비밀번호를 변경했어요. 모든 기기에서 로그아웃되었으니 새 비밀번호로 로그인해주세요.',
    unavailable: '이메일 인증·복구 서비스가 아직 준비 중이에요.', mismatch: '새 비밀번호가 서로 달라요.',
  },
  en: {
    recover: 'Forgot your password?', reset: 'Reset password', verify: 'Verify email', verified: 'Email verified',
    request: 'Request email code', token: 'Code from your email', password: 'New password (12+ characters)', confirm: 'Confirm new password',
    help: 'Paste the code from your email. It expires in 15 minutes and can be used once.',
    requested: 'If this email is registered, a code will be sent. Please wait and check spam. You can request another code after one minute.',
    verifyRequested: 'Verification email requested. Please wait and check spam. You can request another code after one minute.',
    done: 'Password changed. All devices have been signed out. Sign in with your new password.',
    unavailable: 'Email verification and recovery are not available yet.', mismatch: 'The new passwords do not match.',
  },
  ja: {
    recover: 'パスワードを忘れましたか？', reset: 'パスワードの再設定', verify: 'メールアドレスの確認', verified: 'メールアドレス確認済み',
    request: 'コードをメールで送信', token: 'メールで受け取ったコード', password: '新しいパスワード（12文字以上）', confirm: '新しいパスワードの確認',
    help: 'メールのコードを貼り付けてください。有効期限は15分で、一度だけ使用できます。',
    requested: '登録済みのメールアドレスにはコードが送信されます。少し待って迷惑メールも確認してください。再送は1分後に可能です。',
    verifyRequested: '確認メールをリクエストしました。少し待って迷惑メールも確認してください。再送は1分後に可能です。',
    done: 'パスワードを変更し、すべての端末からログアウトしました。新しいパスワードでログインしてください。',
    unavailable: 'メール確認・復旧サービスは準備中です。', mismatch: '新しいパスワードが一致しません。',
  },
};
export const accountErrors: Record<string, { ko: string; en: string; ja: string }> = {
  network_unavailable: { ko: '연결을 확인하고 다시 시도해주세요. 입력한 내용은 그대로 두세요.', en: 'Check your connection and retry. Keep your current input.', ja: '接続を確認して再試行してください。入力内容はそのままにしてください。' },
  service_unavailable: { ko: '서비스에 연결하지 못했어요. 잠시 후 다시 시도해주세요.', en: 'The service is unavailable. Please retry shortly.', ja: 'サービスに接続できません。少し待って再試行してください。' },
  rate_limited: { ko: '요청이 많아요. 잠시 기다렸다 다시 시도해주세요.', en: 'Too many requests. Please wait and retry.', ja: 'リクエストが多すぎます。しばらく待って再試行してください。' },
  email_unavailable: { ko: accountMessages.ko.unavailable, en: accountMessages.en.unavailable, ja: accountMessages.ja.unavailable },
  invalid_account_token: { ko: '코드가 올바르지 않거나 만료되었어요. 새 코드를 요청해주세요.', en: 'This code is invalid or expired. Request a new code.', ja: 'コードが無効か期限切れです。新しいコードをリクエストしてください。' },
  account_suspended: { ko: '운영 검토로 계정 이용이 제한되었습니다.', en: 'Your account is restricted following an operational review.', ja: '運営の確認によりアカウントの利用が制限されています。' },
  email_verification_required: { ko: '내 프로필에서 이메일을 먼저 인증해주세요.', en: 'Verify your email in My profile first.', ja: 'マイプロフィールでメールアドレスを確認してください。' },
};

# DearBird — implemented MVP feature inventory

## Implemented and locally/browser/API tested

- Adult confirmation
- Email/password registration and login
- Profile editing and avatar/photo handling
- Korean / English / Japanese UI
- Email verification UI/API with mock/local verification during tests
- Password recovery/reset UI/API
- Country / language / interest / purpose discovery, with purpose applied on the server before the 100-person page
- Shared-context display (language, interests, exchange purpose)
- Pen-pal request / accept / reject / cancel
- Empty-state profile improvement guidance
- Long-form photo letters
- Up to 3 letter photos
- Letter paper / stamp selection
- First-letter question prompts
- Draft autosave / restore
- Send confirmation
- Server-enforced 24-hour journey in production logic
- One in-flight letter per sender and recipient; the next letter waits until arrival
- Three requests a day, three active connections, three letters a day
- In-flight, arrived, sent, draft states
- World map and route visualization
- Time-based pigeon/letter position
- Envelope open / letter read / reply
- Report / block / unblock
- Account deletion
- Operator report-review dashboard
- Private image delivery + image metadata removal/re-encoding
- Push token/event plumbing (credential-dependent delivery not verified)

## Recorded final verification state

- Server automated tests: 26 passed in the 2026-09-27 record. Re-run on Node.js 24 on 2026-10-07: 30 passed, including the in-flight letter lock, the three-person cap, and purpose search
- TypeScript: passed
- Lint: passed
- Browser journey: passed
- Browser letter flow: passed
- Browser onboarding: passed
- Browser account recovery: passed with mock email
- Backup/restore: passed

## Planned or incomplete

- Production hosting
- Real outbound email verification
- Real APNs/FCM delivery
- APK / TestFlight
- Billing / subscriptions
- Ads
- Identity/selfie verification
- AI matching
- Physical-mail fulfillment

# DearBird MVP handoff for Cursor

This bundle contains the **older functional DearBird MVP**, not the newer Next.js marketing landing page.

## Important repository distinction

- Current GitHub repository `Jkoreaboi/luvbird`: marketing landing page built with Next.js.
- `legacy-mvp/` in this bundle: earlier DearBird product MVP with a React Native / Expo mobile app and Node / Express API.

Do **not** assume DearBird is only a landing page. The code in `legacy-mvp/` is the prior product implementation and should be treated as the functional baseline/reference when continuing product development.

Do not overwrite the current landing page blindly. First inspect both codebases and propose a clean integration structure.

## Product identity

Luvbird is the company/brand. DearBird is its first product.

DearBird recreates the anticipation of old-fashioned letter writing for a modern global audience. Users discover people in other countries, write photo letters, and wait while a letter travels before it arrives. Waiting is intentionally part of the product experience.

Core product principles:

- Waiting is a feature, not a bug.
- No read-receipt pressure.
- No follower/like-driven social graph.
- City-level location rather than precise location.
- Photos + long-form letters rather than rapid chat.
- People, stories, and meaningful connection come before engagement mechanics.
- Current digital features must be clearly separated from future physical-mail ideas.

## Architecture in this bundle

### Mobile app

Path: `legacy-mvp/mobile/`

Stack:
- Expo SDK 57
- React Native 0.86
- React 19
- TypeScript
- Expo Router
- AsyncStorage / SecureStore
- Expo Image Picker / Notifications
- React Native SVG

Key files:
- `mobile/AppScreen.tsx` — main application state and screen flow
- `mobile/src/Onboarding.tsx` — onboarding
- `mobile/src/WorldMap.tsx` — world map / letter journey UI
- `mobile/src/route.ts` — route calculations
- `mobile/src/i18n.ts` — Korean / English / Japanese strings
- `mobile/src/api.ts` — API layer
- `mobile/src/guide.ts` — first-letter guidance / question content

### API server

Path: `legacy-mvp/server/`

Stack:
- Node.js 24+
- Express 5
- SQLite-backed application state
- Zod validation
- Sharp image processing
- Helmet / rate limiting

Key files:
- `server/app.mjs` — auth, profiles, requests, letters, photos, drafts, blocks/reports, push device endpoints
- `server/account.mjs` — email verification and password recovery
- `server/operations.mjs` — operator report-review dashboard/API
- `server/moderate.mjs` — moderation tooling
- `server/test/` — automated API and release tests

## Functionality that was actually implemented/tested

The older MVP implemented the following flows in source code and browser/API tests:

1. **Onboarding and account**
   - Adult confirmation
   - Email/password registration and login
   - Profile editing
   - Avatar/profile photo editing
   - Korean, English, Japanese UI
   - Email verification flow
   - Password recovery/reset flow
   - Logout and account deletion

2. **Profile and pen-pal discovery**
   - Country/language/interest-based discovery
   - Profile details
   - Shared language / interests / exchange purpose surfaced in UI
   - City-level profile concept
   - Pen-pal request / accept / reject / cancel
   - Daily request and active-pen-pal limits in the MVP
   - Empty-state guidance to improve bio/interests when no matches appear

3. **Letter creation**
   - Long-form letter editor (up to 10,000 characters in the MVP)
   - Up to 3 photos
   - Letter paper / stamp selection
   - First-letter question prompts
   - Adding a prompt without overwriting existing body text
   - Draft autosave and draft recovery
   - Final confirmation before sending

4. **24-hour journey**
   - Production logic enforcing 86,400-second delivery delay
   - Server-side arrival lock
   - Idempotent send behavior
   - In-flight / arrived / sent / draft states
   - World-map visualization
   - Great-circle route logic and date-line handling
   - Time-based bird position along the route
   - Countdown UI

5. **Receiving and replying**
   - Envelope opening
   - Letter/photo viewing
   - Reply flow
   - Replies travel again instead of becoming instant chat

6. **Safety / privacy**
   - Block / unblock
   - Report flow
   - Account deletion
   - Private photo access rules
   - Server image re-encoding and metadata removal
   - Operator report review dashboard when `OPERATIONS_TOKEN` is configured
   - Operator notes/status/history and account restriction/release flow

7. **Push plumbing**
   - Device push token registration/removal
   - Arrival event / receipt-processing code
   - Actual APNs/FCM credentials and real-device delivery were not completed

8. **Quality verification recorded in the old project**
   - 26 server tests passed in the final recorded revision
   - TypeScript passed
   - Lint passed
   - Browser journey passed
   - Browser letter flow passed
   - Onboarding and account-recovery browser checks passed
   - Backup/restore test passed
   - Native JavaScript export was tested in earlier revisions

## Not completed / do not claim as shipped

These items were **not** completed as production features:

- Public production API hosting
- Real external email delivery verification
- APK distribution
- TestFlight distribution
- Real-device push notification verification with APNs/FCM credentials
- Payments/subscriptions
- Advertising SDK integration
- Selfie/identity verification
- AI matching or psychological inference
- Physical letter printing/mailing

Physical mail remains a future vision. Do not present it as currently available.

## What Cursor should do next

1. Inspect the current Next.js landing-page repository and this `legacy-mvp/` source.
2. Do not delete the landing page.
3. Preserve the old MVP source until equivalent behavior is verified in any refactor.
4. Recommend a maintainable repo structure. A sensible target could be:

```text
luvbird/
  apps/
    web/       # existing Next.js landing page
    mobile/    # Expo / React Native DearBird app
    api/       # Express DearBird API
  docs/
```

However, do not perform a destructive monorepo migration until imports, scripts, env files, tests, and deployment assumptions have been checked.

5. Treat the old app as a product baseline, not throwaway mock code.
6. Run the available tests/typecheck/lint before and after major refactors.
7. Keep functionality and current-vs-future claims accurate.

## First analysis request

Before changing code, report:

- what exists in the current landing-page repo;
- what exists in `legacy-mvp/`;
- which capabilities can be reused directly;
- which parts require modernization/refactor;
- a staged plan to bring DearBird app + API into the current repository without breaking the landing page.

# Luvbird / DearBird project context

## Service

Luvbird creates DearBird, a global pen pal product. People discover someone abroad, share a photo and letter about their day, then wait while the letter travels for 24 hours. DearBird aims to connect digital relationships to physical mail in the future.

## Product philosophy

Waiting is part of the experience. Put people and stories ahead of feeds and engagement metrics. Do not add read receipts or precise location to profiles. The landing page must distinguish current digital features from the future physical letter vision.

## Audience

Global users aged 18–35 seeking international friends, language exchange, travel and cultural discovery, or deeper relationships than fast chat and social feeds offer.

## Design principles

Use vintage airmail, modern editorial layout, and a warm consumer-app tone. Use envelopes, stamps, postmarks, paper, ink, and restrained airmail red and blue. Reuse actual DearBird screens and brand assets first. Keep mobile and desktop layouts polished and accessible.

Avoid AI SaaS style, strong gradients, glassmorphism, dashboard layout, generic blue B2B styling, and repeated rounded cards. Modern clarity matters more than nostalgic decoration.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, and a shadcn/ui-style Button primitive.

## Development rules

- Keep page sections as small reusable components. Use semantic HTML and descriptive image alt text.
- Use links for navigation and buttons for actions. Keep every link valid.
- Respect reduced-motion preferences, visible focus, and mobile navigation.
- Keep metadata and OpenGraph content accurate. Set `NEXT_PUBLIC_SITE_URL` at deployment.
- Do not imply account signup, letter delivery, or physical mail works from this landing page.
- Run `npm run typecheck` and `npm run build` before delivery.

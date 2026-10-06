# Luvbird / DearBird

## Company and product

Luvbird is the company. DearBird is its first product. The public line is **DearBird by Luvbird**.

Luvbird is a global social-communication startup. It designs the feeling of human contact, and of waiting, as a modern digital product. It is not "a pen-pal app company" in the narrow sense.

Luvbird's philosophy:

- An algorithm does not come before a person.
- Relationships are not consumed quickly.
- Waiting can be the experience.
- A user's day and story stay at the center.
- Digital ease stays. Analog feeling comes back.

DearBird is not a messenger. It recreates, on a phone, the old feeling of writing a letter, sending it far away, and waiting days for a reply.

## DearBird loop

1. Find someone who fits: country, language, interests, and the purpose of the exchange.
2. Write about your day, with a photo.
3. The letter does not arrive at once. It travels for about 24 hours. The wait is part of the product.
4. The other person receives it and replies at their own pace.

Principles that stay in the product: 24-hour letter journey, no read receipts, no likes, no followers, city-level profile only, photos plus letters, slow communication, one meaningful connection at a time.

## Why it exists

Most social products optimized for speed and produced reply pressure, read-receipt stress, relationships consumed quickly, shallow talk, feed fatigue, and relationships scored by likes and followers. DearBird does not make messages faster. It makes people wait, so three moments return: anticipating a letter, opening it, and giving one person your attention.

## Audience

Global users aged 18–35, especially people who want friends abroad, language exchange, travel and other cultures, relief from social feeds, or a deeper tie than fast chat. Early markets: Korea, Japan, and English-speaking countries.

## Future vision

The long direction is digital relationship, then emotional connection, then a physical experience: a letter written in the app, printed locally, stamped, and delivered to a real mailbox.

On this landing page that sequence is a **future chapter** only. Do not write as if physical mail already works.

## Business model (internal)

Possible later revenue: ads, paying to remove ads, premium subscription, extra letters, avatar customization, priority matching, extra stamps, and eventually physical delivery. The early goal is users and proof in global markets. Do not put pricing, ads, or these plans on the landing page unless explicitly asked.

## Brand

Feelings: nostalgia, anticipation, warmth, curiosity, distance, connection, handwritten, personal, human, analog emotion.

Look: vintage airmail × modern editorial × warm consumer app. Motifs may include old letters, envelopes, postcards, airmail stripes, stamps, postmarks, paper, handwriting, ink, a world map, and a bird in flight. It must still feel like a refined Gen Z consumer app, not a costume vintage site.

Avoid AI SaaS style, strong gradients, glassmorphism, dashboard layout, generic blue B2B styling, and repeated rounded cards.

## Decision test

Before adding or keeping any UI, line of copy, or feature, ask: does this deliver DearBird's core feeling, the thrill of waiting for someone's letter? If it does not, remove it or simplify it.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, and a shadcn/ui-style Button primitive.

## Development rules

- Keep page sections as small reusable components. Use semantic HTML and descriptive image alt text.
- Use links for navigation and buttons for actions. Keep every link valid.
- Respect reduced-motion preferences, visible focus, and mobile navigation.
- Keep metadata and OpenGraph content accurate. Set `NEXT_PUBLIC_SITE_URL` at deployment.
- Do not imply account signup, letter delivery, or physical mail works from this landing page.
- Reuse actual DearBird screens and brand assets first.
- Run `npm run typecheck` and `npm run build` before delivery.

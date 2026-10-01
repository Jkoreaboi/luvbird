# DearBird by Luvbird

DearBird is a global pen pal experience that brings back the anticipation of sending a letter and waiting for a reply. The landing page introduces its 24-hour letter journey, city-level profiles, photo letters, and slower approach to connection. The product screens in `public/screens/` come from the existing DearBird app.

## Stack

Next.js App Router, TypeScript, Tailwind CSS, and a reusable shadcn/ui-style Button built with Radix Slot and class-variance-authority.

## Features and interactions

- Responsive editorial landing page: Hero, Problem, Features, How it works, Product Preview, Physical Letter Vision, Final CTA, and Footer.
- Smooth anchor scrolling for navigation and CTAs; mobile hamburger navigation.
- Subtle scroll motion on the hero postage stamp, disabled when reduced motion is preferred.
- Honest CTA feedback: the product is preparing for launch. The landing page does not create an account or send a letter.
- Semantic sections, image alt text, page metadata, and a generated OpenGraph image.

## Run locally

Use Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Check production output with:

```bash
npm run typecheck
npm run build
```

## Deploy

Import this repository into Vercel as a Next.js project. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS domain so canonical and OpenGraph URLs use that domain. Deploy the selected branch, then record the verified URL below.

**Deployment URL:** Pending deployment.

## GitHub submission

**Repository:** [Jkoreaboi/luvbird-mission5](https://github.com/Jkoreaboi/luvbird-mission5) (private project backup). This is not the course fork; a PR to the course repository still needs its fork URL.

**Branch:** `feature/mission5-luvbird`  
**PR title:** `[성선제]-미션5`  
**Suggested commit:** `feat: implement Luvbird landing page`

For the course submission, clone the required course fork, create `feature/mission5-luvbird`, and copy these project files into that working tree. Keep the fork's `.git` directory. Then run:

```bash
git add .
git status
git commit -m "feat: implement Luvbird landing page"
git push -u origin feature/mission5-luvbird
```

Create a PR titled `[성선제]-미션5` against the course repository's required base branch. The mentor review and Discord reminder are manual submission steps.

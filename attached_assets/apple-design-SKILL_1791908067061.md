---
name: apple-design
description: Restyle the Wasl storefront (HTML/CSS/JS) in an Apple-inspired design language: clarity, deference, depth. Use when asked to change, polish, or redesign the look of the store. Visual changes only.
---

# Apple-Inspired Design Skill (Wasl Storefront)

## Scope (hard rules)
- Change ONLY visuals: CSS, markup structure for layout, icons, copy tone, animations.
- Do NOT touch: API routes, MongoDB models, auth logic, JWT handling, order logic, secrets, .env files.
- Keep every existing feature working (products, sign up, log in, cart, checkout, My Orders, Wasl Gifts, Mood filter).
- No new frameworks. Keep plain HTML/CSS/JS and the Express API. No external UI kits.
- Before editing, list the files you will change. After editing, test every page.

## Core principles
1. **Clarity**: every element has one clear purpose. Text is legible, icons are simple, nothing decorative without meaning.
2. **Deference**: the UI steps back and lets the products be the hero. Big product images, quiet chrome.
3. **Depth**: use layering, soft shadows, and translucency to show hierarchy, never heavy borders.

## Design tokens (put in :root and reuse everywhere)
```css
:root {
  --bg: #ffffff;
  --bg-secondary: #f5f5f7;
  --text: #1d1d1f;
  --text-secondary: #6e6e73;
  --accent: #0071e3;
  --accent-hover: #0077ed;
  --separator: rgba(0,0,0,0.08);
  --radius-s: 10px;
  --radius-m: 16px;
  --radius-l: 24px;
  --shadow-s: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-m: 0 8px 30px rgba(0,0,0,0.08);
  --font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display",
          "Helvetica Neue", "Segoe UI", Inter, Arial, sans-serif;
  --ease: cubic-bezier(0.25, 0.1, 0.25, 1);
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #000000;
    --bg-secondary: #1c1c1e;
    --text: #f5f5f7;
    --text-secondary: #a1a1a6;
    --accent: #2997ff;
    --accent-hover: #4aa8ff;
    --separator: rgba(255,255,255,0.12);
    --shadow-s: 0 1px 3px rgba(0,0,0,0.5);
    --shadow-m: 0 8px 30px rgba(0,0,0,0.5);
  }
}
```
- Use the system font stack above. Do NOT download or embed SF Pro (licensed). Inter is the only web fallback.
- One accent color only. Use it for primary buttons, links, and active states.

## Typography
- Body 17px / line-height 1.47. Small text never below 12px.
- Headlines: large, tight, bold (hero 48-72px, weight 600-700, letter-spacing -0.02em).
- Section titles 28-40px. Product names 17-21px, weight 600. Secondary text uses --text-secondary.
- Max 2 weights per page section. Left-align body text; center only hero and short headings.
- Arabic/RTL: if the store supports Arabic, use a system Arabic font and mirror layout with logical properties (margin-inline, padding-inline).

## Layout and spacing
- 8pt grid: spacing values are multiples of 8 (8, 16, 24, 32, 48, 64, 96).
- Generous whitespace between sections (64-96px). Content max-width 1100-1200px, centered.
- Product grid: auto-fill, minmax(260px, 1fr), gap 24px. Cards sit on --bg-secondary with --radius-l.
- Mobile first. Touch targets at least 44x44px.

## Components
- **Navbar**: sticky, 48-56px tall, translucent blur (`background: rgba(255,255,255,0.72); backdrop-filter: saturate(180%) blur(20px);`), 1px bottom --separator. Small text links, centered or spaced evenly. Login/Logout on the right.
- **Hero**: one big headline, one short subline, one primary button, one text link ("Learn more >"). Lots of empty space.
- **Product card**: large image, name, one-line description, price, "Add to cart" pill button. On hover: scale 1.02 and --shadow-m. No visible border.
- **Buttons**: primary = filled --accent, white text, fully rounded (border-radius 980px), padding 12px 22px. Secondary = text-only in --accent with a chevron. Pressed state: scale(0.97).
- **Forms (Sign Up / Log In)**: single centered card, --radius-l, inputs 48px tall with --radius-s, 1px --separator border, focus ring `0 0 0 4px rgba(0,113,227,0.25)`. Labels above inputs. Clear inline error text in a soft red (#ff3b30), never alert().
- **My Orders**: list of rounded cards, each with order date, total, and item names. Gift orders get a small pill badge and a "Copy gift link" text button.
- **Wasl Gifts unwrap page**: full-screen soft gradient background per wrap style (Classic, Eid, Birthday, Minimal), centered card, gentle unwrap animation (opacity + translateY + scale, 600ms, --ease).
- **Mood filter**: horizontally scrollable segmented pills. Active pill filled with --accent, others on --bg-secondary.
- **Empty and loading states**: calm skeleton shimmer or a short friendly line, never a blank screen.

## Depth, material, motion
- Use translucency only for navbar, sheets, and modals (blur 20px). Everything else is solid.
- Shadows are soft and large, low opacity. Never use hard black borders or heavy drop shadows.
- Motion is subtle and purposeful: 200-400ms, --ease, animate only opacity and transform.
- Respect reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

## Images and icons
- Product images on clean backgrounds, object-fit: contain, consistent aspect ratio (4/3 or 1/1), lazy-loaded with width/height set.
- Icons: simple line icons, 1.5px stroke, one consistent set (inline SVG). No emoji as UI icons.

## Accessibility (non-negotiable)
- Text contrast at least 4.5:1. Visible keyboard focus on every interactive element.
- Semantic HTML (nav, main, section, button, label). Alt text on all images.
- Never rely on color alone to show state.

## Do not
- Do not copy Apple's logos, product photos, icons, wording, or page layouts. This is inspiration, not imitation.
- Do not use gradients as decoration on buttons, neon colors, or more than one accent.
- Do not add dependencies for styling.

## Workflow
1. Read this file and the existing SKILL.md conventions.
2. Create a single `styles/tokens.css` (or the equivalent in the current structure) with the tokens above, then restyle page by page: Home, Product, Cart/Checkout, Sign Up, Log In, My Orders, Gift page.
3. Test light and dark mode, mobile width (375px), desktop width, and RTL if used.
4. Re-test the full flow: sign up, log in, add to cart, place order, My Orders, gift link.
5. Summarize what changed in 5 bullets or fewer.

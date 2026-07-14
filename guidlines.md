

## 1. Stack & Runtime Constraints

| Constraint | Rule |
|---|---|
| Framework | Next.js 16 App Router only. No `pages/` directory. |
| React | Server components by default. `"use client"` only when required. |
| Language | TypeScript strict mode. No `any`, no `@ts-ignore`. |
| Styling | Tailwind CSS 4 + PostCSS. No CSS-in-JS, no style modules, no inline `style={{}}`. |
| Node | LTS. Align with `.nvmrc` if added. |

---

## 2. Folder Structure

```
/
├── app/
│   ├── layout.tsx              ← root layout + fonts + global metadata
│   ├── page.tsx                ← home page (thin shell only)
│   ├── not-found.tsx           ← custom 404
│   ├── globals.css             ← @theme tokens + CSS utility classes only
│   └── [route]/
│       ├── page.tsx            ← thin shell: metadata + section imports
│       └── *.tsx               ← co-located client components for that route only
│
├── components/
│   ├── icons/
│   │   ├── Icon*.tsx           ← one file per icon, PascalCase, Icon prefix
│   │   └── index.ts            ← barrel export (named exports only, no JSX)
│   ├── ui/
│   │   └── *.tsx               ← atoms: SectionLabel, IconBox, Divider
│   ├── sections/
│   │   └── [page]/
│   │       └── *Section.tsx    ← one section per file, self-contained with data
│   └── *.tsx                   ← molecules: ServiceCard, WhyCard, StatCard, etc.
│
├── public/                     ← static assets only (images, fonts, favicons)
├── scripts/
│   └── check-standards.mjs    ← build-time standards checker
├── STANDARDS.md                ← this file
└── .env.example                ← required env vars (no values)
```

### Rules
- No file may be placed outside its designated layer without a documented reason.
- Route folders use **kebab-case**: `case-studies/`, `not-found.tsx` (Next.js convention).
- No `index.tsx` files (creates ambiguous imports). Use `index.ts` for barrel exports only.
- New routes require: a `page.tsx` shell + a `components/sections/[route]/` directory.

---

## 3. File & Component Naming

| Type | Convention | Example |
|---|---|---|
| React component file | PascalCase | `HeroSection.tsx`, `ServiceCard.tsx` |
| Icon file | `Icon` prefix + PascalCase | `IconArrow.tsx`, `IconLinkedIn.tsx` |
| Barrel export | lowercase `index.ts` | `components/icons/index.ts` |
| Route folders | kebab-case | `case-studies/`, `not-found.tsx` |
| Utility/hook files | camelCase | `useScrollPosition.ts` |
| Script files | kebab-case | `check-standards.mjs` |

### Rules
- **File name must match the exported function name exactly.** `HeroSection.tsx` exports `HeroSection`.
- **One default export per component file.** Never multiple components in one file.
- **Named exports only** in barrel files (`index.ts`). Never `export default` from a barrel.

---

## 4. Component Architecture (Atomic Design)

```
Atoms (components/ui/)
  └─ Wrap a single CSS utility class. Accept className/children. No data.
     Examples: SectionLabel, IconBox, Divider

Molecules (components/*.tsx)
  └─ Compose atoms + icons. Accept typed props. No data arrays.
     Examples: ServiceCard, WhyCard, StatCard, PricingCard, TrustTicker

Sections (components/sections/[page]/*.tsx)
  └─ Self-contained. Own their static data arrays. Compose molecules.
     No props (unless genuinely reusable across pages).
     Examples: HeroSection, OurStorySection, MetricsStrip

Pages (app/**/page.tsx)
  └─ Thin shell only: export metadata + return JSX of section components.
     No inline JSX content. No data arrays. No logic.
```

### Rules
- Pages must contain **only** `metadata` export + `return (<> ... </>)` of section imports.
- Sections own their data. Data arrays (const arrays) never live in `page.tsx`.
- A molecule must not import another molecule (keep the hierarchy flat).
- Atoms must not import molecules or sections (strict upward-only dependency).
- Client components (`"use client"`) must **never** be at the page level. Extract them.

---

## 5. "use client" Rules

**Approved client files:**
- `components/Navbar.tsx` — scroll state, mobile menu state, pathname
- `components/ScrollAnimations.tsx` — IntersectionObserver, DOM manipulation
- `app/contact/ContactForm.tsx` — form state, fetch

**Rules:**
- Only add `"use client"` when the component uses: `useState`, `useEffect`, `useRef`, `useReducer`, browser-only APIs (`window`, `document`), or event handlers that mutate state.
- If only part of a component needs interactivity, extract that part into a child client component.
- Never add `"use client"` to a section or page file.
- When adding a new client component, document the reason next to `"use client"` as a comment.

```tsx
// ✅ Correct
"use client"; // needs useState for form submission state machine

// ❌ Wrong
"use client"; // (no explanation, or not actually needed)
```

---

## 6. Styling Constraints

### 6a. No Inline Styles
```tsx
// ❌ Forbidden
<div style={{ background: "radial-gradient(...)", width: 500 }} />

// ✅ Correct — add a utility class to globals.css
<div className="glow-gold w-125 h-125" />
```
**Rule:** Zero `style={{}}` attributes anywhere in `.tsx` files. Run `npm run standards` to verify.

### 6b. Tailwind 4 Canonical Classes
```tsx
// ❌ Old syntax — triggers canonical warnings
className="bg-gradient-to-br from-gold/[0.16] !text-charcoal w-[700px]"

// ✅ Tailwind 4 canonical
className="bg-linear-to-br from-gold/16 text-charcoal! w-175"
```

**Specific rules:**
- Gradient direction: `bg-linear-to-{dir}` not `bg-gradient-to-{dir}`
- Opacity modifier: `/16` not `/[0.16]` (percentage, not decimal)
- Important modifier: `class!` suffix, not `!class` prefix
- Pixel values: use scale units when divisible by 4 (`w-175` not `w-[700px]`)
- Negative arbitrary: `top-[-10%]` not `-top-[10%]`

### 6c. Complex Patterns → globals.css
If a pattern can't be expressed cleanly in Tailwind (radial gradients, masks, non-standard grids), add a utility class to `globals.css` — not an arbitrary Tailwind value.

```css
/* globals.css */
.glow-gold {
  border-radius: 50%;
  pointer-events: none;
  background: radial-gradient(circle, rgba(201,168,76,0.09) 0%, transparent 65%);
}
```

### 6d. Design Tokens
All brand values live in the `@theme` block in `globals.css`. Never hardcode brand colors as hex strings in className.

```
--color-charcoal: #1A1A1A   → bg-charcoal / text-charcoal
--color-deep:     #2C2C2C   → bg-deep
--color-mid:      #888888   → text-mid
--color-silver:   #C0C0C0   → text-silver
--color-offwhite: #F5F5F5   → bg-offwhite
--color-gold:     #C9A84C   → text-gold / bg-gold / border-gold
--color-gold-light:#E8C96F  → (via gradient utilities)
--font-display:   Bebas Neue → font-display
--font-sans:      DM Sans    → font-sans (default body)
```

### 6e. Responsive Breakpoints
```tsx
// ❌ Forbidden
<style>{`@media (max-width: 768px) { ... }`}</style>

// ✅ Correct
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```
All responsive behaviour via Tailwind prefixes: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px).

---

## 7. Icon System

### Structure
```
components/icons/
  IconArrow.tsx
  IconTarget.tsx
  ... (one file per icon)
  index.ts   ← barrel: export { default as IconArrow } from "./IconArrow"
```

### Icon Component Contract
```tsx
interface IconProps {
  size?: number;      // default varies per icon (14–24)
  className?: string; // passed to <svg> for currentColor
}

export default function IconArrow({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"       // ← required on all decorative icons
      className={className}
    >
      <path stroke="currentColor" ... />  {/* ← currentColor, never hardcoded */}
    </svg>
  );
}
```

### Rules
- `stroke` and `fill` must use `currentColor`, never hardcoded hex (exception: filled circle backgrounds on `IconCheck`).
- Every icon exports from `components/icons/index.ts` before use.
- Consume via: `import { IconX } from "@/components/icons"` — never direct file import.
- `aria-hidden="true"` on every decorative icon SVG.
- Icon files are named `Icon` + PascalCase descriptor: `IconLinkedIn.tsx`, `IconSmallCheck.tsx`.

---

## 8. TypeScript Rules

- `strict: true` in `tsconfig.json` — never disable.
- No `any`. Use `unknown` + type narrowing, or define a proper interface.
- No `@ts-ignore` or `@ts-expect-error` without a documented reason.
- All component props typed with an interface defined in the same file.
- Use `React.ReactNode` for children/icon props.
- `type` for unions and primitives; `interface` for object shapes.

```tsx
// ✅ Correct
interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  delay?: number;
}

// ❌ Wrong
function ServiceCard(props: any) { ... }
```

---

## 9. Import Order

Within every file, maintain this order (enforced by ESLint import plugin when added):

```tsx
// 1. Framework / built-ins
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

// 2. Section components
import HeroSection from "@/components/sections/home/HeroSection";

// 3. Molecules
import ServiceCard from "@/components/ServiceCard";

// 4. Atoms
import SectionLabel from "@/components/ui/SectionLabel";
import Divider from "@/components/ui/Divider";

// 5. Icons
import { IconArrow, IconTarget } from "@/components/icons";

// 6. Types / utilities (if any)
```

**Rules:**
- Always use `@/` path alias. Never relative `../../` imports.
- `import type` for type-only imports.

---

## 10. SEO & Metadata

- **Every** `page.tsx` must export a `metadata` object with at minimum `title` and `description`.
- Root `layout.tsx` defines `title.template: "%s | Velmora Softlab"`.
- Page titles must be descriptive (not just "Page").
- Each page must have exactly **one `<h1>`** in its section tree.
- Heading order must be logical: `h1` → `h2` → `h3` (no skipping levels).
- `html lang="en"` set in root layout (do not change without reason).

```tsx
// ✅ Required in every page.tsx
export const metadata: Metadata = {
  title: "Services",  // becomes "Services | Velmora Softlab" via template
  description: "...", // 120–160 characters
};
```

---

## 11. Performance Constraints

- **IntersectionObserver** must return a cleanup function:
  ```tsx
  useEffect(() => {
    const observer = new IntersectionObserver(...);
    // ...
    return () => observer.disconnect(); // ← required
  }, []);
  ```
- **Event listeners** must use `{ passive: true }` where applicable (scroll, touchstart).
- **Body scroll lock** must restore in the cleanup return of the effect that sets it.
- **No synchronous layout reads** inside render (no `getBoundingClientRect()` in render body).
- **No `console.log`** in committed code.

---

## 12. Forms

- State machine type: `"idle" | "sending" | "success" | "error"` — no boolean flags.
- Submit button disabled when `status === "sending"`.
- All fetch endpoints in `.env.local` referenced from `.env.example`.
- Always render an error state — no silent failures.
- `noValidate` on the `<form>` element when using custom validation.

---

## 13. Accessibility Baseline

- `aria-label` on every icon-only interactive element (buttons, links with no text).
- `htmlFor` + matching `id` on every form label/input pair.
- Semantic landmarks: `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>` where appropriate.
- `aria-hidden="true"` on all decorative SVG icons.
- Mobile nav overlay: include `role="dialog"` and `aria-modal="true"` when building a modal-style menu.
- Color contrast: text-on-background must meet WCAG AA (4.5:1 for body, 3:1 for large text).

---

## 14. Git & Environment

- `.env.local` is gitignored — never commit secrets.
- `.env.example` must list all required keys with placeholder values and comments.
- No `console.log`, `console.warn`, `debugger` in committed code.
- Commit messages: imperative mood, present tense (`feat: add contact form`).
- Branch names: `feat/`, `fix/`, `chore/` prefixes.

---

## 15. What Belongs Where — Quick Reference

| Content | Location |
|---|---|
| Brand color/font tokens | `app/globals.css` `@theme` block |
| Complex gradient/mask utilities | `app/globals.css` utility class |
| Reusable SVG icon | `components/icons/Icon*.tsx` + barrel |
| Wraps a single CSS class | `components/ui/*.tsx` (atom) |
| Card / repeating pattern with props | `components/*.tsx` (molecule) |
| Full page section with static data | `components/sections/[page]/*.tsx` |
| Co-located client form for a route | `app/[route]/ComponentName.tsx` |
| Page metadata + section composition | `app/[route]/page.tsx` |
| Static images / fonts | `public/` |
| Build/check scripts | `scripts/` |
| Required environment variables | `.env.example` |

---

## 16. Self-Review Checklist (before committing)

Use this checklist as a quick sanity pass before pushing any changes:

- [ ] Zero `style={{}}` in any `.tsx` file
- [ ] All Tailwind classes use canonical Tailwind 4 syntax (`bg-linear-to-*`, `/16` opacity, `class!` suffix)
- [ ] No hardcoded hex in `className` — use design tokens
- [ ] No `../../` relative imports — use `@/` alias
- [ ] Every new icon is in `components/icons/Icon*.tsx` and exported from `index.ts`
- [ ] Any new `page.tsx` exports `metadata` with `title` and `description`
- [ ] New client components have a comment explaining why `"use client"` is needed
- [ ] No `console.log` left in source files
- [ ] Page files are thin shells — only section imports, no inline JSX content
- [ ] New sections live in `components/sections/[page]/` and own their data arrays

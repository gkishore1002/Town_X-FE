---
name: ui-ux-design
description: Best-practice guidance for UI/UX design decisions — visual hierarchy, spacing, color/contrast, accessibility, responsive layout, interaction feedback, loading/empty/error states, and form design. Use this whenever building, styling, or reviewing any React component, page, or layout in this frontend project (Town Exchange), even if the user's request only mentions a feature and not "design" explicitly — e.g. "add a modal", "build the property card", "make the feed nicer", "the search bar looks off". Also use when reviewing existing frontend code for UX quality, not just when creating new UI.
---

# UI/UX Design

Apply this whenever writing or reviewing frontend UI in this project. The goal is not to follow rules for their own sake — it's that a listing platform lives or dies on whether users trust it enough to browse, post, and transact. Sloppy spacing, unclear states, or inaccessible controls read as "this app is unreliable," even if the backend is solid.

## Visual hierarchy

- Every screen should have one obvious primary action and a clear reading order (typically: headline → key info → supporting detail → actions). If everything is bold or the same size, nothing stands out — use size, weight, and color deliberately, not decoratively.
- Group related elements with proximity and whitespace rather than borders/dividers. Reach for a divider only when proximity alone can't express the grouping.
- Price, location, and the primary CTA (e.g. "Contact", "Favourite") are the highest-priority elements on a property card — they should be scannable in under a second.

## Spacing & layout

- Use a consistent spacing scale (e.g. Tailwind's default 4px-based scale) rather than arbitrary pixel values — this project already has Tailwind available, so prefer its spacing tokens over hardcoded `px` values.
- Don't let text touch container edges or other elements — when in doubt, add more breathing room, not less. Cramped UI is one of the fastest ways to look unpolished.
- Design mobile-first: this is a property-browsing app people will use on the go. Check that touch targets are at least ~44x44px, that swipe/tap gestures (already used via `react-tinder-card`) don't conflict with scroll gestures, and that key actions aren't hidden below the fold on small screens.

## Color & contrast

- Text must meet WCAG AA contrast (4.5:1 for body text, 3:1 for large text/icons) against its background. This matters even more on image-heavy cards (property photos) where text is often overlaid — use a scrim/gradient behind overlaid text rather than trusting the photo's contrast.
- Reserve the brand accent color (purple, per the landing config) for primary actions and active/selected states, so it stays meaningful. If everything is colored, color stops signaling importance.
- Don't rely on color alone to convey status (e.g. favourited vs not, expired story vs active) — pair it with an icon, label, or shape change so the UI works for colorblind users too.

## Accessibility

- Every interactive element (button, card, icon-button) needs an accessible name — visible text, `aria-label`, or both. Icon-only buttons (common in this app's header/nav) always need `aria-label`.
- Interactive elements should be real `<button>`/`<a>` tags or have proper `role` + keyboard handling (`Enter`/`Space` for buttons, arrow keys for carousels/story viewers) — not `<div onClick>` with no keyboard path.
- Respect `prefers-reduced-motion` for any non-essential animation (see the framer-motion skill for how). Modals and story viewers should trap focus and be dismissible via `Escape`.

## Interaction feedback

- Every action a user takes should have a visible response within ~100ms: a hover state, a pressed/active state, a loading spinner, or an optimistic UI update. Silence after a tap makes users tap again, which can trigger duplicate submissions (e.g. double-posting a property or double-toggling a favourite).
- Favouriting, deleting, and other mutating actions should update optimistically where safe, with a rollback + toast/error state if the request fails — don't block the whole UI on a network round-trip for a simple toggle.
- Destructive actions (deleting a property, deleting a story) need a confirmation step, since both are irreversible once the associated Cloudinary media is removed.

## Loading, empty, and error states

Every list or async view needs all three of these explicitly designed — not just the happy path:

- **Loading**: skeleton screens that mirror the final layout are better than a centered spinner for anything list-like (property feed, stories, favourites), since they reduce perceived layout shift.
- **Empty**: never show a bare blank screen. Explain why it's empty ("No favourites yet") and, where relevant, offer the next action ("Browse properties").
- **Error**: distinguish "nothing found" (empty state) from "something broke" (error state with a retry action). A failed image upload, a failed property fetch, and an empty search result are three different states and should look different.

## Forms

- Label every field (visually, not just via placeholder — placeholders disappear on focus and are easy to forget). This matters for the property-creation form, which has many fields.
- Validate inline, as close to the field as possible, and only after the user has interacted with that field (not immediately on page load). Error messages should say what's wrong and how to fix it, not just "Invalid input."
- For long forms (like creating a property listing), consider chunking into logical steps or sections with clear progress indication rather than one long scroll — reduces perceived effort and abandonment.
- Keep destructive/irreversible submit actions visually distinct from cancel/back actions so users can't mis-tap between them.

## When reviewing existing UI code

Look for: missing loading/empty/error handling, icon-only controls without labels, hardcoded colors that skip the design tokens, `<div>`s doing a button's job, and spacing that doesn't follow a consistent scale. Flag these even if not explicitly asked — they're cheap to fix early and expensive to fix after the pattern spreads across components.

---
name: framer-motion
description: Best-practice guidance for animating React components with Framer Motion (the project depends on framer-motion ^12 and motion ^12). Use this whenever adding or editing any animation, transition, gesture interaction, or mount/unmount effect in this frontend project — fading things in, sliding modals or cards, animating the property feed swipe deck, staggering lists, story-viewer transitions, or hover/tap feedback. Trigger even when the user just says "animate this", "make it feel smoother", "add a transition", or describes a motion effect without naming Framer Motion directly.
---

# Framer Motion

Apply this whenever writing animation code in this project. Framer Motion is powerful enough to write janky, expensive animations just as easily as smooth ones — the patterns below are about getting the smooth, cheap ones by default.

## Core mental model

- Animate `<motion.div>` (or `motion.<tag>`) instead of the plain element, and drive its appearance via `initial` / `animate` / `exit` props rather than manual state + CSS classes. Let Framer Motion own the animation lifecycle rather than fighting it with `useEffect` timers.
- Prefer **variants** over inline animate objects once more than one element needs coordinated animation. Variants centralize the animation definition and let parent/child state propagate automatically:

```jsx
const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={cardVariants} initial="hidden" animate="visible" />
```

This scales far better than repeating `{ opacity: 0, y: 16 }` inline across every component, and makes staggering (below) trivial.

## Mount/unmount transitions

Plain conditional rendering (`{show && <Modal />}`) removes elements instantly with no exit animation — React unmounts before Framer Motion gets a chance to animate out. Wrap conditionally-rendered content in `<AnimatePresence>` and give the child an `exit` variant:

```jsx
<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Modal />
    </motion.div>
  )}
</AnimatePresence>
```

This is the right tool for `CreatePostModal`, `StoryUploadModal`, and `StoryViewer` in this project — anything that mounts/unmounts based on state. Give each direct child a stable `key` when animating list changes (e.g. story slides, property cards) so `AnimatePresence` can tell additions apart from removals.

## Layout animations

- Add `layout` to a `motion` element to have Framer Motion automatically animate changes in position/size (e.g. a card growing when selected, a list reflowing when an item is removed) — no manual FLIP math needed.
- Use `layoutId` to animate one element morphing into another across different parts of the tree (e.g. a property thumbnail expanding into the `PropertyDetails` hero image, a story preview expanding into the full `StoryViewer`). This is the shared-element transition pattern and is one of Framer Motion's strongest features — reach for it before building a custom crossfade.
- `layout` animations are more expensive than opacity/transform ones — don't slap `layout` on every element by default; use it where a real position/size change needs to be smoothed.

## Gesture animations

Use the gesture props instead of manual `onMouseEnter`/`onMouseDown` state + CSS:

```jsx
<motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
  Favourite
</motion.button>
```

- `whileHover` / `whileTap` for buttons, cards, icons — cheap, immediate feedback that reinforces "this is interactive" (see the ui-ux-design skill on interaction feedback).
- `drag` (with `dragConstraints`) for swipeable/draggable UI. Note this project already uses `react-tinder-card` for the property swipe feed — don't reimplement that swipe behavior with raw `drag`; reserve Framer Motion's `drag` for other draggable UI (e.g. a bottom sheet, a reorderable list) where a dedicated library isn't already in place.

## Staggering children

For lists — property cards, story rows, amenity chips — stagger the children's entrance via a parent variant instead of hand-rolling per-item delays:

```jsx
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="visible">
  {items.map((it) => (
    <motion.div key={it.id} variants={item} />
  ))}
</motion.div>
```

The child's `variants` prop alone is enough — no need to pass `animate` on each child, it inherits from the parent's animation state.

## Performance

- Animate `transform` (`x`, `y`, `scale`, `rotate`) and `opacity` wherever possible — these run on the compositor and don't trigger layout/paint. Avoid animating `width`, `height`, `top`, `left`, `boxShadow`, or other layout-affecting properties directly; use `layout` (above) instead, which computes the same visual effect via transforms under the hood.
- Long lists (property feed, story rail) shouldn't apply expensive animations (e.g. `layout`, blur filters) to every single item at once — this is where jank shows up first on mobile. Prefer simple opacity/transform entrances for list items, and reserve richer effects for a small number of focal elements (hero image, active card).
- Respect `prefers-reduced-motion`. Wrap animation values through Framer Motion's `useReducedMotion()` hook, or scale down/disable non-essential motion (large slides, parallax, autoplay transitions) when it's set — essential feedback (e.g. a button press) can stay, but decorative motion should not.

```jsx
const shouldReduceMotion = useReducedMotion();
<motion.div animate={{ x: shouldReduceMotion ? 0 : 100 }} />
```

## Common pitfalls

- **Animating on every render**: passing a new object literal to `animate` each render can cause unnecessary re-triggers if identity matters for your logic — prefer variants (named strings) over ad-hoc inline objects when the same animation is reused.
- **Missing `AnimatePresence` for exits**: if an element seems to "just disappear" instead of animating out, the parent is missing `<AnimatePresence>` or the child is missing an `exit` prop.
- **Forgetting `key` in animated lists**: without a stable, unique `key`, `AnimatePresence` can't distinguish an item being removed from an item being replaced, producing wrong or missing exit animations.
- **Overusing spring physics everywhere**: springs (the default transition) feel great for gestures and small UI elements, but can feel imprecise for larger layout shifts — consider `transition: { type: "tween", duration: 0.2 }` for more predictable, snappy UI transitions, and reserve springs for touch-driven or playful interactions.
- **Double animation libraries fighting each other**: this project also has GSAP (`gsap`, `@gsap/react`) installed. Don't animate the same element with both GSAP and Framer Motion — pick one per element/component to avoid conflicting transforms.

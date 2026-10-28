# Design tokens

These tokens are exported from the Around Jobs Figma file (`CqYtGTafIxJo5rfRSa6AbJ`). `tokens.css` is the only place raw palette, radius, spacing, and shadow values are written. `typography.ts` is the only place the Inter type scale is written. Tailwind reads both through `tailwind.tokens.ts`.

## Naming

Figma names are lowercased. `/` and spaces become `-`.

- Primitives use `--palette-*`. A ramp step keeps the group and the step: `--palette-orange-orange-50`, `--palette-primary-blue-blue-500`, `--palette-white-white`, `--palette-black-black`, `--palette-dashboard-bg`.
- Themed colours use `--color-*`. Each ramp is `--color-{role}-{role}-{step}`: `--color-primary-primary-500` points at primary blue, `--color-secondary-secondary-500` at orange, and the same pattern for success (green), warning (yellow), error (red), features (violet), info (cyan), and grey.
- Light values live on `:root` and `[data-theme="light"]`. Dark values live on `[data-theme="dark"]`.
- In dark mode, steps 50–400 read the opposite end of the ramp (50→900 … 400→500) and steps 500–900 read the light end (500→400 … 900→50).
- Semantic tokens (`--color-text-primary`, `--color-surface-default`, `--color-brand-primary`, …) point at those ramps, with the dark overrides from the Figma theme.

## Spacing, radius, shadow, type

- Spacing keys are pixel sizes. `--space-16` is 16px, so the utility is `p-16`, not Tailwind’s default 4rem.
- Radius: `none` 0, `xs` 4, `sm` 8, `md` 12, `lg` 16, `xl` 20, `2xl` 32, `3xl` 128, `4xl` 256.
- Shadows: `sm`, `sm-1`, `md`, `md-1`, `lg`, `lg-1`, `xl`, `xl-1`, `2xl`, `3xl`.
- Type is Inter, letter-spacing 0. Keys look like `body-sm-semibold` (14/20, weight 600). `DASHBOARD_MAX_FONT_SIZE` is 24. Marketing sizes 32–80 are not included.

## Wiring

`tailwind.config.ts` extends the theme with `themeExtend` from `tailwind.tokens.ts`. Every key points at a CSS variable (`"16": "var(--space-16)"`, `"brand-primary": "var(--color-brand-primary)"`, font sizes from `fontSizeTuples`).

`app/globals.css` imports `tokens.css` and loads the config:

```css
@import "tailwindcss";
@import "../src/styles/tokens/tokens.css";
@config "../tailwind.config.ts";
```

Set `data-theme="light"` or `data-theme="dark"` on `<html>` to switch the themed tokens. The app defaults to light via `:root`.

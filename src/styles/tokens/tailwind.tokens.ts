import { fontSizeTuples } from "./typography";

const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] as const;
const scales = ["primary", "secondary", "success", "warning", "error", "features", "info", "grey"] as const;

function colorVars() {
  const colors: Record<string, string> = {
    white: "var(--palette-white-white)",
    black: "var(--palette-black-black)",
    "dashboard-bg": "var(--palette-dashboard-bg)",
    "palette-orange-orange-50": "var(--palette-orange-orange-50)",
    "palette-orange-orange-100": "var(--palette-orange-orange-100)",
    "palette-orange-orange-200": "var(--palette-orange-orange-200)",
    "palette-orange-orange-300": "var(--palette-orange-orange-300)",
    "palette-orange-orange-400": "var(--palette-orange-orange-400)",
    "palette-orange-orange-500": "var(--palette-orange-orange-500)",
    "palette-orange-orange-600": "var(--palette-orange-orange-600)",
    "palette-orange-orange-700": "var(--palette-orange-orange-700)",
    "palette-orange-orange-800": "var(--palette-orange-orange-800)",
    "palette-orange-orange-900": "var(--palette-orange-orange-900)",
    "palette-green-green-50": "var(--palette-green-green-50)",
    "palette-green-green-100": "var(--palette-green-green-100)",
    "palette-green-green-200": "var(--palette-green-green-200)",
    "palette-green-green-300": "var(--palette-green-green-300)",
    "palette-green-green-400": "var(--palette-green-green-400)",
    "palette-green-green-500": "var(--palette-green-green-500)",
    "palette-green-green-600": "var(--palette-green-green-600)",
    "palette-green-green-700": "var(--palette-green-green-700)",
    "palette-green-green-800": "var(--palette-green-green-800)",
    "palette-green-green-900": "var(--palette-green-green-900)",
    "palette-yellow-yellow-50": "var(--palette-yellow-yellow-50)",
    "palette-yellow-yellow-100": "var(--palette-yellow-yellow-100)",
    "palette-yellow-yellow-200": "var(--palette-yellow-yellow-200)",
    "palette-yellow-yellow-300": "var(--palette-yellow-yellow-300)",
    "palette-yellow-yellow-400": "var(--palette-yellow-yellow-400)",
    "palette-yellow-yellow-500": "var(--palette-yellow-yellow-500)",
    "palette-yellow-yellow-600": "var(--palette-yellow-yellow-600)",
    "palette-yellow-yellow-700": "var(--palette-yellow-yellow-700)",
    "palette-yellow-yellow-800": "var(--palette-yellow-yellow-800)",
    "palette-yellow-yellow-900": "var(--palette-yellow-yellow-900)",
    "palette-violet-violet-50": "var(--palette-violet-violet-50)",
    "palette-violet-violet-100": "var(--palette-violet-violet-100)",
    "palette-violet-violet-200": "var(--palette-violet-violet-200)",
    "palette-violet-violet-300": "var(--palette-violet-violet-300)",
    "palette-violet-violet-400": "var(--palette-violet-violet-400)",
    "palette-violet-violet-500": "var(--palette-violet-violet-500)",
    "palette-violet-violet-600": "var(--palette-violet-violet-600)",
    "palette-violet-violet-700": "var(--palette-violet-violet-700)",
    "palette-violet-violet-800": "var(--palette-violet-violet-800)",
    "palette-violet-violet-900": "var(--palette-violet-violet-900)",
    "palette-red-red-50": "var(--palette-red-red-50)",
    "palette-red-red-100": "var(--palette-red-red-100)",
    "palette-red-red-200": "var(--palette-red-red-200)",
    "palette-red-red-300": "var(--palette-red-red-300)",
    "palette-red-red-400": "var(--palette-red-red-400)",
    "palette-red-red-500": "var(--palette-red-red-500)",
    "palette-red-red-600": "var(--palette-red-red-600)",
    "palette-red-red-700": "var(--palette-red-red-700)",
    "palette-red-red-800": "var(--palette-red-red-800)",
    "palette-red-red-900": "var(--palette-red-red-900)",
    "palette-primary-blue-blue-50": "var(--palette-primary-blue-blue-50)",
    "palette-primary-blue-blue-100": "var(--palette-primary-blue-blue-100)",
    "palette-primary-blue-blue-200": "var(--palette-primary-blue-blue-200)",
    "palette-primary-blue-blue-300": "var(--palette-primary-blue-blue-300)",
    "palette-primary-blue-blue-400": "var(--palette-primary-blue-blue-400)",
    "palette-primary-blue-blue-500": "var(--palette-primary-blue-blue-500)",
    "palette-primary-blue-blue-600": "var(--palette-primary-blue-blue-600)",
    "palette-primary-blue-blue-700": "var(--palette-primary-blue-blue-700)",
    "palette-primary-blue-blue-800": "var(--palette-primary-blue-blue-800)",
    "palette-primary-blue-blue-900": "var(--palette-primary-blue-blue-900)",
    "palette-cyan-cyan-50": "var(--palette-cyan-cyan-50)",
    "palette-cyan-cyan-100": "var(--palette-cyan-cyan-100)",
    "palette-cyan-cyan-200": "var(--palette-cyan-cyan-200)",
    "palette-cyan-cyan-300": "var(--palette-cyan-cyan-300)",
    "palette-cyan-cyan-400": "var(--palette-cyan-cyan-400)",
    "palette-cyan-cyan-500": "var(--palette-cyan-cyan-500)",
    "palette-cyan-cyan-600": "var(--palette-cyan-cyan-600)",
    "palette-cyan-cyan-700": "var(--palette-cyan-cyan-700)",
    "palette-cyan-cyan-800": "var(--palette-cyan-cyan-800)",
    "palette-cyan-cyan-900": "var(--palette-cyan-cyan-900)",
    "palette-grey-grey-50": "var(--palette-grey-grey-50)",
    "palette-grey-grey-100": "var(--palette-grey-grey-100)",
    "palette-grey-grey-200": "var(--palette-grey-grey-200)",
    "palette-grey-grey-300": "var(--palette-grey-grey-300)",
    "palette-grey-grey-400": "var(--palette-grey-grey-400)",
    "palette-grey-grey-500": "var(--palette-grey-grey-500)",
    "palette-grey-grey-600": "var(--palette-grey-grey-600)",
    "palette-grey-grey-700": "var(--palette-grey-grey-700)",
    "palette-grey-grey-800": "var(--palette-grey-grey-800)",
    "palette-grey-grey-900": "var(--palette-grey-grey-900)",
  };
  for (const scale of scales) {
    for (const step of steps) {
      const token = `${scale}-${scale}-${step}`;
      colors[token] = `var(--color-${token})`;
    }
  }
  colors["surface-primary"] = "var(--color-surface-primary)";
  colors["background-primary"] = "var(--color-background-primary)";
  colors["background-secondary"] = "var(--color-background-secondary)";
  colors["surface-default"] = "var(--color-surface-default)";
  colors["surface-elevated"] = "var(--color-surface-elevated)";
  colors["text-primary"] = "var(--color-text-primary)";
  colors["text-secondary"] = "var(--color-text-secondary)";
  colors["text-tertiary"] = "var(--color-text-tertiary)";
  colors["text-disabled"] = "var(--color-text-disabled)";
  colors["text-on-brand"] = "var(--color-text-on-brand)";
  colors["border-default"] = "var(--color-border-default)";
  colors["border-strong"] = "var(--color-border-strong)";
  colors["brand-primary"] = "var(--color-brand-primary)";
  colors["brand-secondary"] = "var(--color-brand-secondary)";
  colors["success-default"] = "var(--color-success-default)";
  colors["warning-default"] = "var(--color-warning-default)";
  colors["error-default"] = "var(--color-error-default)";
  colors["information-default"] = "var(--color-information-default)";
  colors["overlay-scrim"] = "var(--color-overlay-scrim)";
  return colors;
}

const spacing: Record<string, string> = {};
spacing["4"] = "var(--space-4)";
spacing["8"] = "var(--space-8)";
spacing["12"] = "var(--space-12)";
spacing["16"] = "var(--space-16)";
spacing["20"] = "var(--space-20)";
spacing["24"] = "var(--space-24)";
spacing["32"] = "var(--space-32)";
spacing["40"] = "var(--space-40)";
spacing["48"] = "var(--space-48)";
spacing["64"] = "var(--space-64)";
spacing["80"] = "var(--space-80)";
spacing["96"] = "var(--space-96)";
spacing["128"] = "var(--space-128)";
spacing["160"] = "var(--space-160)";
spacing["192"] = "var(--space-192)";
spacing["224"] = "var(--space-224)";
spacing["256"] = "var(--space-256)";

const borderRadius: Record<string, string> = {};
borderRadius["none"] = "var(--radius-none)";
borderRadius["xs"] = "var(--radius-xs)";
borderRadius["sm"] = "var(--radius-sm)";
borderRadius["md"] = "var(--radius-md)";
borderRadius["lg"] = "var(--radius-lg)";
borderRadius["xl"] = "var(--radius-xl)";
borderRadius["2xl"] = "var(--radius-2xl)";
borderRadius["3xl"] = "var(--radius-3xl)";
borderRadius["4xl"] = "var(--radius-4xl)";

const boxShadow: Record<string, string> = {};
boxShadow["sm"] = "var(--shadow-sm)";
boxShadow["sm-1"] = "var(--shadow-sm-1)";
boxShadow["md"] = "var(--shadow-md)";
boxShadow["md-1"] = "var(--shadow-md-1)";
boxShadow["lg"] = "var(--shadow-lg)";
boxShadow["lg-1"] = "var(--shadow-lg-1)";
boxShadow["xl"] = "var(--shadow-xl)";
boxShadow["xl-1"] = "var(--shadow-xl-1)";
boxShadow["2xl"] = "var(--shadow-2xl)";
boxShadow["3xl"] = "var(--shadow-3xl)";

export const themeExtend = {
  colors: colorVars(),
  spacing,
  borderRadius,
  boxShadow,
  fontSize: fontSizeTuples,
  fontFamily: {
    sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
  },
};

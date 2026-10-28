/** Inter type scale from Figma. Letter-spacing is 0. Display 32–80 is omitted. */
export const DASHBOARD_MAX_FONT_SIZE = 24;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const textStyles = {
  "display-small-regular": { fontFamily: "Inter", fontSize: "24px", lineHeight: "32px", fontWeight: 400, letterSpacing: "0" },
  "display-small-medium": { fontFamily: "Inter", fontSize: "24px", lineHeight: "32px", fontWeight: 500, letterSpacing: "0" },
  "display-small-semibold": { fontFamily: "Inter", fontSize: "24px", lineHeight: "32px", fontWeight: 600, letterSpacing: "0" },
  "display-small-bold": { fontFamily: "Inter", fontSize: "24px", lineHeight: "32px", fontWeight: 700, letterSpacing: "0" },
  "heading-regular": { fontFamily: "Inter", fontSize: "20px", lineHeight: "28px", fontWeight: 400, letterSpacing: "0" },
  "heading-medium": { fontFamily: "Inter", fontSize: "20px", lineHeight: "28px", fontWeight: 500, letterSpacing: "0" },
  "heading-semibold": { fontFamily: "Inter", fontSize: "20px", lineHeight: "28px", fontWeight: 600, letterSpacing: "0" },
  "heading-bold": { fontFamily: "Inter", fontSize: "20px", lineHeight: "28px", fontWeight: 700, letterSpacing: "0" },
  "subheading-regular": { fontFamily: "Inter", fontSize: "18px", lineHeight: "24px", fontWeight: 400, letterSpacing: "0" },
  "subheading-medium": { fontFamily: "Inter", fontSize: "18px", lineHeight: "24px", fontWeight: 500, letterSpacing: "0" },
  "subheading-semibold": { fontFamily: "Inter", fontSize: "18px", lineHeight: "24px", fontWeight: 600, letterSpacing: "0" },
  "subheading-bold": { fontFamily: "Inter", fontSize: "18px", lineHeight: "24px", fontWeight: 700, letterSpacing: "0" },
  "body-regular": { fontFamily: "Inter", fontSize: "16px", lineHeight: "24px", fontWeight: 400, letterSpacing: "0" },
  "body-medium": { fontFamily: "Inter", fontSize: "16px", lineHeight: "24px", fontWeight: 500, letterSpacing: "0" },
  "body-semibold": { fontFamily: "Inter", fontSize: "16px", lineHeight: "24px", fontWeight: 600, letterSpacing: "0" },
  "body-bold": { fontFamily: "Inter", fontSize: "16px", lineHeight: "24px", fontWeight: 700, letterSpacing: "0" },
  "body-sm-regular": { fontFamily: "Inter", fontSize: "14px", lineHeight: "20px", fontWeight: 400, letterSpacing: "0" },
  "body-sm-medium": { fontFamily: "Inter", fontSize: "14px", lineHeight: "20px", fontWeight: 500, letterSpacing: "0" },
  "body-sm-semibold": { fontFamily: "Inter", fontSize: "14px", lineHeight: "20px", fontWeight: 600, letterSpacing: "0" },
  "body-sm-bold": { fontFamily: "Inter", fontSize: "14px", lineHeight: "20px", fontWeight: 700, letterSpacing: "0" },
  "label-regular": { fontFamily: "Inter", fontSize: "12px", lineHeight: "16px", fontWeight: 400, letterSpacing: "0" },
  "label-medium": { fontFamily: "Inter", fontSize: "12px", lineHeight: "16px", fontWeight: 500, letterSpacing: "0" },
  "label-semibold": { fontFamily: "Inter", fontSize: "12px", lineHeight: "16px", fontWeight: 600, letterSpacing: "0" },
  "label-bold": { fontFamily: "Inter", fontSize: "12px", lineHeight: "16px", fontWeight: 700, letterSpacing: "0" },
} as const;

export type TextStyleName = keyof typeof textStyles;

export const fontSizeTuples = Object.fromEntries(
  Object.entries(textStyles).map(([key, style]) => [
    key,
    [style.fontSize, { lineHeight: style.lineHeight, fontWeight: String(style.fontWeight) }],
  ]),
) as {
  [Key in TextStyleName]: [string, { lineHeight: string; fontWeight: string }];
};

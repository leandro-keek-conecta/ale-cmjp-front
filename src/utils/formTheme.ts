import type { ThemeConfig } from "@/types/IProjetoType";
import type { CSSProperties } from "react";

export type FormThemeStyle = CSSProperties & Record<`--${string}`, string>;

const DEFAULT_INPUT_BACKGROUND = "#ffffff";
const DEFAULT_INPUT_BORDER = "rgba(15, 23, 42, 0.16)";

const getText = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const resolveInputBackground = (themeConfig?: Partial<ThemeConfig>) => {
  if (themeConfig?.inputTransparent) {
    return "transparent";
  }

  return getText(themeConfig?.inputBackground) || DEFAULT_INPUT_BACKGROUND;
};

const resolveInputBorderColor = (themeConfig?: Partial<ThemeConfig>) =>
  getText(themeConfig?.inputBorderColor) || DEFAULT_INPUT_BORDER;

export const buildInputThemeStyle = (
  themeConfig?: Partial<ThemeConfig>,
): FormThemeStyle => ({
  "--form-input-background": resolveInputBackground(themeConfig),
  "--form-input-border": resolveInputBorderColor(themeConfig),
});

export const buildPageThemeStyle = (
  themeConfig?: Partial<ThemeConfig>,
): FormThemeStyle => {
  const background = getText(themeConfig?.background);
  const fontFamily = getText(themeConfig?.fontFamily);

  return {
    ...buildInputThemeStyle(themeConfig),
    ...(background ? { background } : {}),
    ...(fontFamily ? { fontFamily } : {}),
  };
};

type InputSxOptions = {
  height?: string;
  minHeight?: string;
  fontSize?: string;
  padding?: string;
  fontWeight?: number | string;
  cursor?: string;
};

export const buildThemedInputSx = ({
  height,
  minHeight,
  fontSize = "0.9rem",
  padding = "12px 14px",
  fontWeight,
  cursor,
}: InputSxOptions = {}) => ({
  "& .MuiInputBase-root, & .MuiOutlinedInput-root": {
    ...(height ? { height } : {}),
    ...(minHeight ? { minHeight } : {}),
    borderRadius: "8px",
    backgroundColor: "var(--form-input-background, #ffffff)",
    transition: "background-color 160ms ease, border-color 160ms ease",
    "& fieldset": {
      borderColor: "var(--form-input-border, rgba(15, 23, 42, 0.16))",
    },
    "&:hover fieldset": {
      borderColor: "var(--form-input-border, rgba(15, 23, 42, 0.16))",
    },
    "&.Mui-focused fieldset": {
      borderColor: "var(--form-input-border, rgba(15, 23, 42, 0.16))",
    },
  },
  "& .MuiInputBase-input": {
    padding,
    borderRadius: "8px",
    fontSize,
    ...(fontWeight ? { fontWeight } : {}),
    ...(cursor ? { cursor } : {}),
  },
  "& .MuiInputBase-input::placeholder": {
    opacity: 1,
  },
});

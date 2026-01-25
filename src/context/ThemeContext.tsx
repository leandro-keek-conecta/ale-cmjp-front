import React, { createContext, useContext, useState, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { createDynamicTheme, defaultTheme } from "@/theme";
import { ensureThemeColor, getActiveProject } from "@/utils/project";

interface ThemeContextProps {
  updateThemeColor: (color: string) => void;
}

const ThemeContext = createContext({} as ThemeContextProps);

export const useDynamicTheme = () => useContext(ThemeContext);

export function DynamicThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    const storedUser = userString ? JSON.parse(userString) : null;
    const activeProject = getActiveProject(storedUser);
    const color = ensureThemeColor(
      activeProject?.corHex,
      defaultTheme.palette.primary.main
    );

    if (storedUser && activeProject && !storedUser.projeto) {
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, projeto: activeProject })
      );
    }

    setTheme(createDynamicTheme(color));
  }, []);

  const updateThemeColor = (color: string) => {
    const validColor = ensureThemeColor(
      color,
      defaultTheme.palette.primary.main
    );
    setTheme(createDynamicTheme(validColor));
  };

  return (
    <ThemeContext.Provider value={{ updateThemeColor }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
}

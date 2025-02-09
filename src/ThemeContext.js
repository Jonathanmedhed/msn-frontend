import { createContext } from "react";

export const ThemeContext = createContext({
  toggleTheme: () => {},
  isDarkMode: false,
});

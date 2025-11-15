"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    // Initialize theme from localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme;
      if (savedTheme) {
        // Add no-transition class on initial load to prevent flash
        document.documentElement.classList.add("no-transition");
        
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
        
        // Remove no-transition class after a brief delay
        setTimeout(() => {
          document.documentElement.classList.remove("no-transition");
        }, 100);
        
        return savedTheme;
      }
    }
    return "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    
    // Ensure no-transition is removed
    document.documentElement.classList.remove("no-transition");
    
    // Function to apply theme
    const applyTheme = () => {
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      setTheme(newTheme);
      localStorage.setItem("theme", newTheme);
    };
    
    // Use View Transitions API if available for smoother transition
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      (document).startViewTransition(() => applyTheme());
    } else {
      // Fallback to regular transition
      applyTheme();
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

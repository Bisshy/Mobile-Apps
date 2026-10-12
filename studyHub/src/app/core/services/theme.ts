import { Injectable } from "@angular/core";

export type ThemeMode = "light" | "dark" | "system";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private readonly storageKey = "study-hub-theme";

  private currentTheme: ThemeMode = "system";

  constructor() {
    // Restore the last selected theme immediately.
    try {
      const savedTheme = localStorage.getItem(this.storageKey);

      if (
        savedTheme === "light" ||
        savedTheme === "dark" ||
        savedTheme === "system"
      ) {
        this.currentTheme = savedTheme;
      }
    } catch (error) {
      console.warn("Unable to restore saved theme:", error);
    }

    this.applyCurrentTheme();

    // Follow system theme changes when System mode is selected.
    if (typeof window !== "undefined") {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", () => {
          if (this.currentTheme === "system") {
            this.applySystemTheme();
          }
        });
    }
  }

  setTheme(theme: ThemeMode): void {
    this.currentTheme = theme;

    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.warn("Unable to save selected theme:", error);
    }

    this.applyCurrentTheme();
  }

  getTheme(): ThemeMode {
    return this.currentTheme;
  }

  private applyCurrentTheme(): void {
    if (this.currentTheme === "system") {
      this.applySystemTheme();
      return;
    }

    this.applyTheme(this.currentTheme);
  }

  private applyTheme(theme: "light" | "dark"): void {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark",
    );
  }

  private applySystemTheme(): void {
    const prefersDark = typeof window !== "undefined" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    document.documentElement.classList.toggle("dark", prefersDark);
  }
}

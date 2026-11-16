import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/quran/components/theme-provider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "تفعيل الوضع النهاري" : "تفعيل الوضع الليلي"}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-md border"
      style={{
        background: isDark ? "hsl(var(--muted) / 0.35)" : "hsl(var(--primary) / 0.12)",
        borderColor: isDark ? "hsl(var(--foreground) / 0.2)" : "hsl(var(--primary) / 0.25)",
      }}
      data-testid="button-theme-toggle"
    >
      {isDark
        ? <Sun className="w-4 h-4 text-accent" />
        : <Moon className="w-4 h-4 text-primary" />
      }
    </button>
  );
}

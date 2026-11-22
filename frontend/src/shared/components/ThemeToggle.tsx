import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';

export default function ThemeToggle() {
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      className="rounded-lg border border-indigo-300 p-2 transition hover:bg-white hover:text-brand"
    >
      {darkMode ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

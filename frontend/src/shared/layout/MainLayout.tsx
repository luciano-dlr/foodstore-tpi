import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useThemeStore } from '@/store/themeStore';
import Navbar from './Navbar';

export default function MainLayout() {
  const darkMode = useThemeStore((state) => state.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100">
      <Navbar />
      <Outlet />
    </div>
  );
}

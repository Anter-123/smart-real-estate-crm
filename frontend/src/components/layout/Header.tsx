import React from "react";
import { useLocation } from "react-router-dom";
import { Languages, Sun, Moon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import NotificationCenter from "./NotificationCenter";

interface HeaderProps {
  activeTab?: string;
  darkMode: boolean;
  setDarkMode: (mode: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, darkMode, setDarkMode }) => {
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();

  const currentTab = activeTab || location.pathname.replace(/^\//, "") || "dashboard";

  return (
    <header className="sticky top-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between z-20 shrink-0">
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        <h1 className="text-base font-bold tracking-tight text-slate-800 dark:text-white">
          {t(currentTab as any) || t("dashboard")}
        </h1>
      </div>

      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        {/* Language switch */}
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition flex items-center space-x-1.5 rtl:space-x-reverse border border-slate-200 dark:border-slate-700"
          title={t("language")}
        >
          <Languages className="w-4 h-4 text-brand-500" />
          <span className="text-xs font-bold">{t("langToggle")}</span>
        </button>

        {/* Dark mode switch */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
          title={darkMode ? t("light") : t("dark")}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Notifications Bell */}
        <NotificationCenter />
      </div>
    </header>
  );
};

export default Header;

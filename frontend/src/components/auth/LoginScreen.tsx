import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, AlertTriangle, Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api";

const LoginScreen: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await api.login(loginEmail, loginPassword);
      login(res.token, res.user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLoginError(err.message || (language === "ar" ? "بيانات الدخول غير صحيحة" : "Login failed"));
    }
  };

  const prefillLogin = (email: string) => {
    setLoginEmail(email);
    const pass = email.split("@")[0] + "123";
    setLoginPassword(pass);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-slate-900 text-slate-100 p-4 relative overflow-hidden ${language === "ar" ? "rtl font-cairo" : "ltr font-sans"}`}>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.2),rgba(255,255,255,0))]"></div>
      
      <div className="absolute top-6 right-6 rtl:right-auto rtl:left-6 z-20">
        <button
          onClick={() => setLanguage(language === "en" ? "ar" : "en")}
          className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse border border-slate-700 transition"
        >
          <Languages className="w-4 h-4 text-brand-400" />
          <span>{t("langToggle")}</span>
        </button>
      </div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-panel relative z-10 border border-slate-700 bg-slate-900/90 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-brand-600 rounded-xl mb-4 shadow-lg shadow-brand-500/20">
            <Building2 className="w-8 h-8 text-white animate-pulse-ring" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">{t("appName")}</h1>
          <p className="text-xs text-slate-400 mt-2">{t("subtitle")}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">{t("emailAddress")}</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-100 text-sm"
              placeholder="example@smartcrm.com"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">{t("password")}</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-100 text-sm"
              placeholder="••••••••"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </div>

          {loginError && (
            <div className="flex items-center space-x-2 rtl:space-x-reverse bg-red-950/50 border border-red-500/50 text-red-200 p-3 rounded-xl text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 px-4 bg-brand-600 hover:bg-brand-500 transition-all font-semibold rounded-xl text-white shadow-lg shadow-brand-500/20 text-sm"
          >
            {t("signIn")}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center mb-4">{t("fastRoles")}</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => prefillLogin("admin@smartcrm.com")}
              className="px-2 py-2 bg-slate-800 hover:bg-slate-700 transition rounded-xl text-xs font-medium text-slate-200 border border-slate-700/60"
            >
              {t("admin")}
            </button>
            <button
              type="button"
              onClick={() => prefillLogin("manager@smartcrm.com")}
              className="px-2 py-2 bg-slate-800 hover:bg-slate-700 transition rounded-xl text-xs font-medium text-slate-200 border border-slate-700/60"
            >
              {t("manager")}
            </button>
            <button
              type="button"
              onClick={() => prefillLogin("agent@smartcrm.com")}
              className="px-2 py-2 bg-slate-800 hover:bg-slate-700 transition rounded-xl text-xs font-medium text-slate-200 border border-slate-700/60"
            >
              {t("agent")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;

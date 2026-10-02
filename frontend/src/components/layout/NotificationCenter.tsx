import React from "react";
import { Bell, CheckCircle2, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import type { AppNotificationItem } from "../../context/AppDataContext";

const NotificationCenter: React.FC = () => {
  const { language, t } = useLanguage();
  const { notifications, showNotifications, setShowNotifications } = useAppData();

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className={`relative p-2.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border ${
          showNotifications
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
            : "border-slate-200 dark:border-slate-700"
        }`}
        title={t("notificationCenter")}
      >
        <Bell className="w-4 h-4" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-600 text-white font-black text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center shadow-md shadow-rose-600/30 border-2 border-white dark:border-slate-900">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div
          className={`absolute top-12 right-0 w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in ${
            language === "ar" ? "right-auto left-0" : ""
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <div className="p-1.5 bg-brand-50 dark:bg-brand-950/40 rounded-lg text-brand-600 dark:text-brand-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t("notificationCenter")}
                </h4>
                <p className="text-[10px] text-slate-400">{t("notificationsDesc")}</p>
              </div>
            </div>
            {notifications.length > 0 && (
              <span className="px-2 py-0.5 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-full border border-rose-200 dark:border-rose-900/40">
                {notifications.length} {language === "ar" ? "تنبيهات" : "alerts"}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto space-y-2.5 pr-0.5">
            {notifications.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {t("allCaughtUp")}
                </p>
              </div>
            ) : (
              notifications.map((n: AppNotificationItem) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border transition-all hover:shadow-md ${n.iconBg} space-y-2`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2.5 rtl:space-x-reverse">
                        <div className={`p-2 rounded-xl shrink-0 ${n.iconColor} bg-white dark:bg-slate-850 shadow-xs`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                            {n.title}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            {n.desc}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${n.badgeColor}`}>
                        {n.badge}
                      </span>
                    </div>

                    {/* Action Button */}
                    <div className="pt-1.5 flex justify-end">
                      <button
                        onClick={n.action}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow-xs transition hover:scale-[1.02]"
                      >
                        <span>{n.actionText}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;

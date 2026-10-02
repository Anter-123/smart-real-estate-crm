import React from "react";
import { Clock, Users, XCircle, Check } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import type { Reminder } from "../../types";

interface DueReminderPopupProps {
  dueReminderAlert: Reminder | null;
  setDueReminderAlert: (rem: Reminder | null) => void;
  setDismissedReminderIds: React.Dispatch<React.SetStateAction<string[]>>;
  handleToggleReminderStatus: (id: string, status: string) => Promise<void>;
}

const DueReminderPopup: React.FC<DueReminderPopupProps> = ({
  dueReminderAlert,
  setDueReminderAlert,
  setDismissedReminderIds,
  handleToggleReminderStatus,
}) => {
  const { language } = useLanguage();

  if (!dueReminderAlert) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce">
      <div className="bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-2xl shadow-2xl p-5 space-y-3.5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2 rtl:space-x-reverse text-rose-600 dark:text-rose-400">
            <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping"></span>
            <Clock className="w-5 h-5 shrink-0" />
            <h4 className="text-xs font-black uppercase tracking-wider">
              {language === "ar" ? "⏰ حان موعد التذكير الآن!" : "⏰ Reminder Due Now!"}
            </h4>
          </div>
          <button
            onClick={() => {
              setDismissedReminderIds((prev) => [...prev, dueReminderAlert.id]);
              setDueReminderAlert(null);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            {dueReminderAlert.title}
          </h3>
          {dueReminderAlert.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {dueReminderAlert.description}
            </p>
          )}
          {dueReminderAlert.client && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-between text-xs mt-2">
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                <Users className="w-3.5 h-3.5 text-brand-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {dueReminderAlert.client.name}
                </span>
              </div>
              <span className="font-mono text-slate-500 text-[11px]">
                {dueReminderAlert.client.phone}
              </span>
            </div>
          )}
          <div className="text-[10px] text-slate-400 font-mono mt-1">
            📅 {new Date(dueReminderAlert.time).toLocaleString()}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => {
              setDismissedReminderIds((prev) => [...prev, dueReminderAlert.id]);
              setDueReminderAlert(null);
            }}
            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {language === "ar" ? "تجاهل" : "Dismiss"}
          </button>
          <button
            onClick={async () => {
              await handleToggleReminderStatus(dueReminderAlert.id, dueReminderAlert.status);
              setDismissedReminderIds((prev) => [...prev, dueReminderAlert.id]);
              setDueReminderAlert(null);
            }}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-emerald-600/20"
          >
            <Check className="w-4 h-4" />
            <span>{language === "ar" ? "إتمام المهمة الآن ✅" : "Mark Done"}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DueReminderPopup;

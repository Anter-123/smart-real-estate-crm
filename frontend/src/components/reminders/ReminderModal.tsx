import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  remTitle: string;
  setRemTitle: (v: string) => void;
  remTime: string;
  setRemTime: (v: string) => void;
  remClientId: string;
  setRemClientId: (v: string) => void;
  remDesc: string;
  setRemDesc: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ReminderModal: React.FC<ReminderModalProps> = ({
  isOpen,
  onClose,
  remTitle,
  setRemTitle,
  remTime,
  setRemTime,
  remClientId,
  setRemClientId,
  remDesc,
  setRemDesc,
  onSubmit,
}) => {
  const { language, t } = useLanguage();
  const { clients } = useAppData();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {t("addReminder")}
        </h3>
        
        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("remindersTitle")}</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              value={remTitle}
              onChange={(e) => setRemTitle(e.target.value)}
              placeholder={language === "ar" ? "مثال: الاتصال بالعميل لمعاينة الفيلا" : "e.g. Call client about villa"}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("scheduleTime")}</label>
            <input
              type="datetime-local"
              required
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              value={remTime}
              onChange={(e) => setRemTime(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("bindClientOptional")}</label>
            <select
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              value={remClientId}
              onChange={(e) => setRemClientId(e.target.value)}
            >
              <option value="">-- {t("all")} --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("descriptionMemo")}</label>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              value={remDesc}
              onChange={(e) => setRemDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReminderModal;

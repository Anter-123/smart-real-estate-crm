import React, { useState } from "react";
import { Check, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import * as api from "../../api";
import type { Reminder } from "../../types";
import ReminderModal from "./ReminderModal";

export const RemindersPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { reminders, fetchAllData, setToastMessage } = useAppData();

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [remTitle, setRemTitle] = useState("");
  const [remTime, setRemTime] = useState("");
  const [remClientId, setRemClientId] = useState("");
  const [remDesc, setRemDesc] = useState("");

  const clearForm = () => {
    setRemTitle("");
    setRemTime("");
    setRemClientId("");
    setRemDesc("");
  };

  const handleCreateReminder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remTitle || !remTime) return;
    try {
      await api.createReminder({
        title: remTitle,
        time: remTime,
        clientId: remClientId || null,
        description: remDesc || null,
      });
      if (setToastMessage) {
        setToastMessage({ text: language === "ar" ? "تمت إضافة التذكير بنجاح" : "Reminder added", type: "success" });
      }
      setIsReminderModalOpen(false);
      clearForm();
      fetchAllData();
    } catch (err: any) {
      alert(err.message || "Failed to create reminder");
    }
  };

  const handleToggleReminderStatus = async (id: string, nextStatus: string) => {
    try {
      await api.updateReminder(id, { status: nextStatus });
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف هذا التذكير؟" : "Are you sure?")) return;
    try {
      await api.deleteReminder(id);
      if (setToastMessage) {
        setToastMessage({ text: language === "ar" ? "تم حذف التذكير" : "Reminder deleted", type: "info" });
      }
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t("scheduledTasks")}</h3>
          <p className="text-xs text-slate-400 mt-1">{t("scheduledTasksDesc")}</p>
        </div>
        <button
          onClick={() => {
            clearForm();
            setIsReminderModalOpen(true);
          }}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addReminder")}</span>
        </button>
      </div>

      {/* REMINDERS LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {reminders.length === 0 ? (
            <p className="text-slate-400 text-center py-8 text-xs">{t("noReminders")}</p>
          ) : (
            reminders.map((rem: Reminder) => {
              const isCompleted = rem.status === "COMPLETED";
              const isOverdue = new Date(rem.time) < new Date() && !isCompleted;
              return (
                <div key={rem.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 text-xs">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <button
                      onClick={() => handleToggleReminderStatus(rem.id, isCompleted ? "PENDING" : "COMPLETED")}
                      className={`p-1.5 rounded-lg border transition ${
                        isCompleted
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-slate-300 dark:border-slate-700 text-slate-400"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div className="space-y-0.5">
                      <h4 className={`font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>
                        {rem.title}
                      </h4>
                      {rem.description && <p className="text-slate-400 text-[10px]">{rem.description}</p>}
                      {rem.client && (
                        <p className="text-[10px] text-brand-500 font-semibold">
                          {t("clients")}: {rem.client.name} ({rem.client.phone})
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 rtl:space-x-reverse shrink-0">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      isCompleted
                        ? "bg-slate-100 text-slate-400 dark:bg-slate-800"
                        : isOverdue
                        ? "bg-rose-50 dark:bg-rose-950/20 text-rose-500"
                        : "bg-blue-50 dark:bg-blue-950/20 text-blue-500"
                    }`}>
                      {new Date(rem.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    <button
                      onClick={() => handleDeleteReminder(rem.id)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition"
                      title={t("delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        remTitle={remTitle}
        setRemTitle={setRemTitle}
        remTime={remTime}
        setRemTime={setRemTime}
        remClientId={remClientId}
        setRemClientId={setRemClientId}
        remDesc={remDesc}
        setRemDesc={setRemDesc}
        onSubmit={handleCreateReminder}
      />
    </div>
  );
};

export default RemindersPage;

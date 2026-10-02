import React, { useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import * as api from "../../api";

export const WhatsAppPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { currentUser } = useAuth();
  const {
    templateAr,
    setTemplateAr,
    templateEn,
    setTemplateEn,
    whatsappLogs,
  } = useAppData();

  const [activeTemplateTab, setActiveTemplateTab] = useState<"ar" | "en">("ar");

  // Save Bilingual Templates
  const handleSaveBilingualTemplates = async () => {
    try {
      await api.saveWhatsAppTemplate({
        templateAr,
        templateEn,
      });
      alert(t("templateUpdated"));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* BILINGUAL TEMPLATE EDITOR */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t("templates")}</h3>
            <p className="text-xs text-slate-400 mt-1">{t("templateVariablesNotice")}</p>
          </div>

          {/* Template Language Selector Tabs */}
          <div className="flex items-center space-x-2 rtl:space-x-reverse bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTemplateTab("ar")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTemplateTab === "ar"
                  ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {t("arabicTemplate")}
            </button>
            <button
              type="button"
              onClick={() => setActiveTemplateTab("en")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTemplateTab === "en"
                  ? "bg-white dark:bg-slate-900 text-brand-600 dark:text-brand-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
              }`}
            >
              {t("englishTemplate")}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {activeTemplateTab === "ar" ? (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t("arabicTemplate")}:</label>
              <textarea
                rows={7}
                dir="rtl"
                className="w-full p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl font-cairo focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700 dark:text-slate-300 leading-relaxed"
                value={templateAr}
                onChange={(e) => setTemplateAr(e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">{t("englishTemplate")}:</label>
              <textarea
                rows={7}
                dir="ltr"
                className="w-full p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-xs rounded-xl font-mono focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-700 dark:text-slate-300 leading-relaxed"
                value={templateEn}
                onChange={(e) => setTemplateEn(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-end">
            {currentUser?.role !== "AGENT" && (
              <button
                onClick={handleSaveBilingualTemplates}
                className="bg-brand-600 hover:bg-brand-500 text-white font-semibold px-4 py-2 rounded-xl text-xs shadow-md"
              >
                {t("saveTemplate")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t("deliveryLogs")}</h3>
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <table className="w-full border-collapse text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase text-[9px] font-bold tracking-wider">
              <tr>
                <th className="p-3 text-left rtl:text-right">{t("timestamp")}</th>
                <th className="p-3 text-left rtl:text-right">{t("clientName")}</th>
                <th className="p-3 text-left rtl:text-right">{t("whatsappPhone")}</th>
                <th className="p-3 text-left rtl:text-right">{t("messageText")}</th>
                <th className="p-3 text-center">{t("deliveryStatus")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {whatsappLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-400">{t("noLogs")}</td>
                </tr>
              ) : (
                whatsappLogs.map((log) => {
                  const phone = log.client?.whatsapp || log.client?.phone || "";
                  let cleanPhone = phone.replace(/\D/g, "");
                  while (cleanPhone.startsWith("00")) {
                    cleanPhone = cleanPhone.substring(2);
                  }
                  if (cleanPhone.startsWith("01") && cleanPhone.length === 11) {
                    cleanPhone = "2" + cleanPhone;
                  }
                  const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(log.message)}` : null;

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(log.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="p-3 font-bold">{log.client?.name}</td>
                      <td className="p-3 font-mono">{phone}</td>
                      <td className="p-3 text-slate-500 font-mono text-[10px] break-all max-w-sm whitespace-pre-line">{log.message}</td>
                      <td className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            {t("sent")}
                          </span>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-brand-600 hover:text-brand-500 dark:text-brand-400 font-semibold hover:underline"
                            >
                              {language === "ar" ? "فتح المحادثة" : "Open Chat"}
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppPage;

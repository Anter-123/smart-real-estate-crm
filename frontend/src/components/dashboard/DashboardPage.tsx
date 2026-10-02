import React, { useState } from "react";
import { Clock } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import * as api from "../../api";
import StatsCards from "./StatsCards";
import RevenueModal from "../deals/RevenueModal";
import AllMatchesModal from "../matching/AllMatchesModal";

export interface DashboardPageProps {
  setActiveTab?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActiveTab }) => {
  const { language, t } = useLanguage();
  const { stats, setToastMessage, fetchAllData } = useAppData();

  const [isRevenueModalOpen, setIsRevenueModalOpen] = useState(false);
  const [isAllMatchesModalOpen, setIsAllMatchesModalOpen] = useState(false);
  const [allMatchesList, setAllMatchesList] = useState<any[]>([]);

  const handleOpenAllMatches = async () => {
    try {
      const matches = await api.getMatchingOpportunities({});
      setAllMatchesList(matches || []);
      setIsAllMatchesModalOpen(true);
    } catch (e: any) {
      alert(e.message || "Failed to load matching opportunities");
    }
  };

  const handleSendWhatsAppNotification = async (clientId: string, propertyId: string) => {
    // Open new tab synchronously to bypass browser popup blockers
    const newWindow = window.open("about:blank", "_blank");
    try {
      const res = await api.sendWhatsAppAlert(clientId, propertyId, language);
      if (res?.waLink) {
        if (newWindow) {
          newWindow.location.href = res.waLink;
        } else {
          window.open(res.waLink, "_blank");
        }
      } else if (newWindow) {
        newWindow.close();
      }
      fetchAllData();
      if (setToastMessage) {
        setToastMessage({
          text: language === "ar" ? "تم فتح محادثة الواتساب وتجهيز الرسالة بنجاح" : "WhatsApp chat opened successfully",
          type: "success",
        });
      }
    } catch (err: any) {
      if (newWindow) newWindow.close();
      if (setToastMessage) {
        setToastMessage({
          text: err.message || (language === "ar" ? "فشل فتح محادثة الواتساب" : "Failed to open WhatsApp"),
          type: "error",
        });
      } else {
        alert(err.message);
      }
    }
  };

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* INTERACTIVE KEY STATS CARDS (CLICKABLE WITH DETAILS ACTION) */}
      <StatsCards
        setActiveTab={setActiveTab}
        handleOpenAllMatches={handleOpenAllMatches}
        setIsRevenueModalOpen={setIsRevenueModalOpen}
      />

      {/* ANALYTICAL LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Chart - Distribution */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">{t("salesStatistics")}</h3>
          
          <div className="space-y-4 pt-2">
            {(stats.typeDistribution || []).map((item: any, idx: number) => {
              const maxVal = Math.max(...(stats.typeDistribution || []).map((tItem: any) => tItem.count), 1);
              const pct = Math.round((item.count / maxVal) * 100);
              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-300">{t(item.name.toLowerCase() as any)}</span>
                    <span className="text-slate-800 dark:text-white font-bold">{item.count} {t("units")}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Areas Analytics */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">{t("topAreas")}</h3>
          <div className="space-y-4">
            {stats.topAreas?.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-xs">{t("noData")}</p>
            ) : (
              stats.topAreas?.map((area: any, idx: number) => {
                const areaTranslations: Record<string, string> = {
                  "Nasr City": "مدينة نصر",
                  "Fifth Settlement": "التجمع الخامس",
                  "New Cairo": "القاهرة الجديدة",
                  "Maadi": "المعادي",
                  "Heliopolis": "مصر الجديدة",
                  "Shorouk City": "مدينة الشروق",
                  "October": "السادس من أكتوبر",
                  "Sheikh Zayed": "الشيخ زايد",
                  "Zamalek": "الزمالك",
                  "Mohandessin": "المهندسين",
                  "Dokki": "الدقي"
                };
                const displayName = language === "ar" ? (areaTranslations[area.name] || area.name) : area.name;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      <span className="w-6 h-6 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{displayName}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">{area.count} {t("listings")}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RECENT ACTIVITIES & TOP AGENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activities Feed */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm lg:col-span-2">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">{t("recentActivities")}</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {stats.recentActivities?.length === 0 ? (
                <p className="text-slate-400 text-center py-6 text-xs">{t("noActivities")}</p>
              ) : (
                stats.recentActivities?.map((log: any, logIdx: number) => (
                  <li key={log.id}>
                    <div className="relative pb-8">
                      {logIdx !== stats.recentActivities.length - 1 ? (
                        <span className={`absolute top-4 ${language === "ar" ? "right-4 -mr-px" : "left-4 -ml-px"} h-full w-0.5 bg-slate-200 dark:bg-slate-800`} aria-hidden="true" />
                      ) : null}
                      <div className="relative flex space-x-3 rtl:space-x-reverse">
                        <div>
                          <span className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-500 flex items-center justify-center ring-8 ring-white dark:ring-slate-900">
                            <Clock className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4 rtl:space-x-reverse">
                          <div>
                            <p className="text-xs text-slate-500">
                              <span className="font-bold text-slate-700 dark:text-slate-300">{log.userName || t("system")}</span>{" "}
                              {t("triggered")}{" "}
                              <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-[10px] text-brand-500 font-bold">{log.action}</code>
                            </p>
                          </div>
                          <div className="text-right rtl:text-left text-[10px] text-slate-400 font-mono">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>

        {/* Top Sales Agents */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 dark:text-white mb-6 uppercase tracking-wider">{t("topAgents")}</h3>
          <div className="space-y-4">
            {stats.topAgents?.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-xs">
                {language === "ar" ? "لا توجد صفقات مغلقة مسجلة بعد" : "No closed deals recorded yet"}
              </p>
            ) : (
              stats.topAgents?.map((ag: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                  <div className="flex items-center space-x-3 rtl:space-x-reverse">
                    <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center text-xs font-bold">
                      {ag.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white">{ag.name}</h4>
                      <span className="text-[10px] text-slate-400">
                        {ag.role === "AGENT" ? t("roleAgent" as any) || t("agent") : ag.role === "MANAGER" ? t("roleManager" as any) || t("manager") : t("roleAdmin" as any) || t("admin")}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/20 px-2.5 py-1 rounded-lg">
                    {ag.dealsClosed} {t("closedDeals")}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Revenue Modal */}
      <RevenueModal
        isOpen={isRevenueModalOpen}
        onClose={() => setIsRevenueModalOpen(false)}
        setActiveTab={setActiveTab || (() => {})}
      />

      {/* All Matches Modal */}
      <AllMatchesModal
        isOpen={isAllMatchesModalOpen}
        onClose={() => setIsAllMatchesModalOpen(false)}
        allMatchesList={allMatchesList}
        handleSendWhatsAppNotification={handleSendWhatsAppNotification}
      />
    </div>
  );
};

export default DashboardPage;

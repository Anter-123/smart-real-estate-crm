import React from "react";
import { useNavigate } from "react-router-dom";
import { XCircle, Briefcase } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { checkPermission } from "../../utils/permissions";

interface RevenueModalProps {
  isOpen: boolean;
  onClose: () => void;
  setActiveTab?: (tab: string) => void;
}

const RevenueModal: React.FC<RevenueModalProps> = ({
  isOpen,
  onClose,
  setActiveTab,
}) => {
  const { language, t } = useLanguage();
  const { dealsList, stats } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">
              {stats?.isAgentPersonalView || currentUser?.role === "AGENT"
                ? language === "ar"
                  ? "أرباحي وعمولات صفقاتي المحققة"
                  : "My Closed Deals & Commissions"
                : t("dealsRevenueDetails")}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats?.isAgentPersonalView || currentUser?.role === "AGENT"
                ? language === "ar"
                  ? "سجل الصفقات التي قمت بإتمامها وحساب عمولاتك وصافي أرباحك"
                  : "List of deals you closed and your earned profits"
                : t("dealsRevenueDetailsDesc")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-brand-50 dark:bg-brand-950/20 p-5 rounded-2xl border border-brand-200 dark:border-brand-900/40 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {stats?.isAgentPersonalView || currentUser?.role === "AGENT"
                  ? language === "ar"
                    ? "إجمالي عمولاتي المحققة"
                    : "My Total Earned Commissions"
                  : t("totalRevenue")}
              </span>
              <h2 className="text-2xl font-black text-brand-600 dark:text-brand-400 mt-1">{stats?.totalRevenue?.toLocaleString()} {t("egp")}</h2>
            </div>
            {checkPermission(currentUser, "brokers_manage") && (
              <button
                onClick={() => {
                  onClose();
                  if (setActiveTab) setActiveTab("brokers");
                  navigate("/brokers");
                }}
                className="bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>{t("commissionReports")}</span>
              </button>
            )}
          </div>

          {/* Deals Breakdown list */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">{t("dealsClosed")}</h4>
            {dealsList.length === 0 ? (
              <p className="text-slate-400 text-center py-6 text-xs">{t("noData")}</p>
            ) : (
              dealsList.map((deal: any, i: number) => {
                const isBroker = deal.soldBy === "EXTERNAL_BROKER" || (deal.brokerShare && deal.brokerShare > 0);
                const netRevenue = deal.netRevenue !== undefined ? deal.netRevenue : Math.max(0, deal.commission - (deal.brokerShare || 0));
                return (
                  <div key={i} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-850 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {deal.dealId}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBroker ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"}`}>
                          {isBroker ? t("brokerSaleBadge") : t("directSaleBadge")}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {new Date(deal.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t("dealAmount")}</span>
                        <span className="font-bold text-slate-700 dark:text-slate-200">{deal.amount?.toLocaleString()} {t("egp")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t("grossCommissionLabel")}</span>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">{deal.commission?.toLocaleString()} {t("egp")}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">{t("brokerPayoutLabel")}</span>
                        <span className={`font-semibold ${deal.brokerShare > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-400"}`}>
                          {deal.brokerShare > 0 ? `-${deal.brokerShare.toLocaleString()} ${t("egp")}` : "—"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">{t("netProfitLabel")}</span>
                        <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">+{netRevenue?.toLocaleString()} {t("egp")}</span>
                      </div>
                    </div>

                    {deal.property && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        🏢 {deal.property.address} ({t(deal.property.type?.toLowerCase() as any)})
                      </p>
                    )}
                    {deal.notes && (
                      <p className="text-[10px] text-slate-400 italic bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                        📝 {deal.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0 bg-slate-50 dark:bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            {t("closeModal")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RevenueModal;

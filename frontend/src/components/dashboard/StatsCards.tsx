import React from "react";
import { useNavigate } from "react-router-dom";
import { Building2, Users, Settings, DollarSign, ArrowUpRight } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { checkPermission } from "../../utils/permissions";

export interface StatsCardsProps {
  setActiveTab?: (tab: string) => void;
  handleOpenAllMatches?: () => void;
  setIsRevenueModalOpen?: (open: boolean) => void;
  onNavigate?: (tab: string) => void;
  onOpenAllMatches?: () => void;
  onOpenRevenueModal?: () => void;
}

const StatsCards: React.FC<StatsCardsProps> = ({
  setActiveTab,
  handleOpenAllMatches,
  setIsRevenueModalOpen,
  onNavigate,
  onOpenAllMatches,
  onOpenRevenueModal,
}) => {
  const { language, t } = useLanguage();
  const { stats } = useAppData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const hasPermission = (permId: string): boolean => {
    return checkPermission(currentUser, permId);
  };

  const navigateTo = (tab: string) => {
    navigate(`/${tab}`);
    if (setActiveTab) setActiveTab(tab);
    else if (onNavigate) onNavigate(tab);
  };

  const openAllMatches = () => {
    if (handleOpenAllMatches) handleOpenAllMatches();
    else if (onOpenAllMatches) onOpenAllMatches();
  };

  const openRevenueModal = () => {
    if (setIsRevenueModalOpen) setIsRevenueModalOpen(true);
    else if (onOpenRevenueModal) onOpenRevenueModal();
  };

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        {
          id: "prop-card",
          label: t("totalProperties"),
          val: stats.totalProperties,
          icon: Building2,
          desc: `${stats.propsForSale} ${t("forSale")} • ${stats.propsForRent} ${t("forRent")}`,
          color: "text-blue-500 bg-blue-50 dark:bg-blue-950/30",
          action: () => navigateTo("properties"),
          badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
        },
        {
          id: "client-card",
          label: t("totalClients"),
          val: stats.totalClients,
          icon: Users,
          desc: `${stats.activeRequests} ${t("activeRequests")}`,
          color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30",
          action: () => navigateTo("clients"),
          badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        },
        {
          id: "matching-card",
          label: t("matchingOpportunities"),
          val: stats.matchingOpportunitiesCount,
          icon: Settings,
          desc: language === "ar" ? "تطابق ذكي تلقائي متاح" : "Automatic match detected",
          color: "text-amber-500 bg-amber-50 dark:bg-amber-950/30",
          action: openAllMatches,
          badgeColor: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        },
        {
          id: "revenue-card",
          label:
            stats.isAgentPersonalView || currentUser?.role === "AGENT"
              ? language === "ar"
                ? "أرباحي وعمولاتي المحققة"
                : "My Earned Commissions"
              : language === "ar"
              ? "إجمالي إيرادات الشركة"
              : t("totalRevenue"),
          val: `${(stats.totalRevenue ?? 0).toLocaleString()} ${t("egp")}`,
          icon: DollarSign,
          desc:
            stats.isAgentPersonalView || currentUser?.role === "AGENT"
              ? language === "ar"
                ? "عمولات صفقاتي المغلقة"
                : "My personal closed deals"
              : t("brokerCommissions"),
          color: "text-purple-500 bg-purple-50 dark:bg-purple-950/30",
          action: openRevenueModal,
          badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
          hidden: !hasPermission("revenue_view"),
        },
      ].map((card: any) => {
        if (card.hidden) return null;
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={card.action}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between cursor-pointer hover:shadow-xl hover:border-brand-500/60 hover:-translate-y-1 transition-all duration-200 group relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 block">{card.label}</span>
                <span className="text-2xl font-bold text-slate-800 dark:text-white mt-1 block group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {card.val}
                </span>
              </div>
              <div className={`p-4 rounded-2xl ${card.color} shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
              <span className="text-slate-400 text-[11px] font-medium">{card.desc}</span>
              <span className={`inline-flex items-center space-x-1 rtl:space-x-reverse text-[10px] font-bold px-2 py-0.5 rounded-md ${card.badgeColor}`}>
                <span>{t("clickForDetails")}</span>
                <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;

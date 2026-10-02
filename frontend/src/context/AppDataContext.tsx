import { createContext, useContext, useState, ReactNode, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Property, Client, Owner, Broker, Reminder, WhatsAppLog, AuditLog, Deal, User } from "../types";
import { useLanguage } from "./LanguageContext";
import { Zap, DollarSign, Clock } from "lucide-react";
import { useAuth } from "./AuthContext";
import {
  usePropertiesQuery,
  useOwnersQuery,
  useClientsQuery,
  useBrokersQuery,
  useRemindersQuery,
  useDashboardStatsQuery,
  useDealsQuery,
  useUsersQuery,
  useAuditLogsQuery,
  useWhatsAppTemplateQuery,
  useWhatsAppLogsQuery,
  QUERY_KEYS,
} from "../hooks/useQueries";

export interface AppNotificationItem {
  id: string;
  type: "MATCH" | "REMINDER" | "CLIENT" | "DEAL";
  title: string;
  desc: string;
  badge: string;
  badgeColor: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  actionText: string;
  action: () => void;
}

interface AppDataContextType {
  stats: any;
  properties: Property[];
  owners: Owner[];
  clients: Client[];
  brokers: Broker[];
  reminders: Reminder[];
  whatsappLogs: WhatsAppLog[];
  auditLogs: AuditLog[];
  dealsList: Deal[];
  usersList: User[];
  templateAr: string;
  templateEn: string;
  setTemplateAr: (v: string) => void;
  setTemplateEn: (v: string) => void;
  notifications: AppNotificationItem[];
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  fetchAllData: (
    onOpenMatches?: () => void,
    onNavigate?: (tab: string) => void,
    onOpenRevenue?: () => void
  ) => Promise<void>;
  toastMessage: { text: string; type: "success" | "error" | "info" } | null;
  setToastMessage: (msg: { text: string; type: "success" | "error" | "info" } | null) => void;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const AppDataProvider = ({ children }: { children: ReactNode }) => {
  const { language, t } = useLanguage();
  const { token, currentUser } = useAuth();
  const queryClient = useQueryClient();

  // ============================================================================
  // TANSTACK REACT QUERY HOOKS (WITH SMART CACHING)
  // ============================================================================
  const { data: properties = [] } = usePropertiesQuery();
  const { data: owners = [] } = useOwnersQuery();
  const { data: clients = [] } = useClientsQuery();
  const { data: brokers = [] } = useBrokersQuery();
  const { data: reminders = [] } = useRemindersQuery();
  const { data: dealsList = [] } = useDealsQuery();
  const { data: usersList = [] } = useUsersQuery();
  const { data: auditLogs = [] } = useAuditLogsQuery();
  const { data: whatsappLogs = [] } = useWhatsAppLogsQuery();
  const { data: waTemplate } = useWhatsAppTemplateQuery();
  const { data: statsData } = useDashboardStatsQuery();

  const defaultStats = useMemo(() => ({
    totalProperties: 0,
    propsForSale: 0,
    propsForRent: 0,
    totalClients: 0,
    activeRequests: 0,
    totalOwners: 0,
    totalRevenue: 0,
    matchingOpportunitiesCount: 0,
    topAreas: [],
    typeDistribution: [],
    topAgents: [],
    recentActivities: [],
    isAgentPersonalView: false,
  }), []);

  const stats = statsData || defaultStats;

  // Local Template and UI States
  const [templateAr, setTemplateAr] = useState("");
  const [templateEn, setTemplateEn] = useState("");

  useEffect(() => {
    if (waTemplate) {
      setTemplateAr((waTemplate as any).templateAr || (waTemplate as any).template || "");
      setTemplateEn((waTemplate as any).templateEn || (waTemplate as any).template || "");
    }
  }, [waTemplate]);

  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Compute Notifications from Cached Queries
  const updateNotifications = (
    onOpenMatches: () => void = () => {},
    onNavigate: (tab: string) => void = () => {},
    onOpenRevenue: () => void = () => {}
  ) => {
    const alerts: AppNotificationItem[] = [];

    // 1. Matches Alert
    if (stats.matchingOpportunitiesCount > 0) {
      alerts.push({
        id: "matches",
        type: "MATCH",
        title: `${t("newMatchesAlertTitle")} (${stats.matchingOpportunitiesCount})`,
        desc: language === "ar"
          ? `تم رصد ${stats.matchingOpportunitiesCount} فرصة تطابق قوية بين رغبات العملاء والوحدات المتاحة.`
          : `Found ${stats.matchingOpportunitiesCount} high-match opportunities between clients and properties.`,
        badge: `${stats.matchingOpportunitiesCount} ${language === "ar" ? "فرص" : "matches"}`,
        badgeColor: "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800",
        icon: Zap,
        iconColor: "text-amber-500",
        iconBg: "bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40",
        actionText: t("viewMatchesAction"),
        action: () => {
          setShowNotifications(false);
          onOpenMatches();
        },
      });
    }

    // 2. Pending Reminders
    const pendingReminders = reminders.filter((rem: Reminder) => rem.status === "PENDING");
    if (pendingReminders.length > 0) {
      alerts.push({
        id: "reminders",
        type: "REMINDER",
        title: `${t("pendingRemindersAlertTitle")} (${pendingReminders.length})`,
        desc: language === "ar"
          ? `لديك ${pendingReminders.length} مهام وتذكيرات قادمة تحتاج إلى متابعة وإنجاز.`
          : `You have ${pendingReminders.length} pending tasks and reminders that need your attention.`,
        badge: `${pendingReminders.length} ${language === "ar" ? "مهام" : "tasks"}`,
        badgeColor: "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800",
        icon: Clock,
        iconColor: "text-rose-500",
        iconBg: "bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40",
        actionText: t("viewRemindersAction"),
        action: () => {
          setShowNotifications(false);
          onNavigate("reminders");
        },
      });
    }

    // 3. Deals Generated
    if (dealsList && dealsList.length > 0) {
      const thisMonthDeals = dealsList.filter((d: any) => {
        const dealDate = new Date(d.createdAt);
        const now = new Date();
        return dealDate.getMonth() === now.getMonth() && dealDate.getFullYear() === now.getFullYear();
      });
      
      if (thisMonthDeals.length > 0) {
        alerts.push({
          id: "deals",
          type: "DEAL",
          title: `${language === "ar" ? "صفقات الشهر الحالي" : "This Month Deals"} (${thisMonthDeals.length})`,
          desc: language === "ar"
            ? `تم إغلاق ${thisMonthDeals.length} صفقات بنجاح خلال هذا الشهر الجاري.`
            : `Successfully closed ${thisMonthDeals.length} deals during the current month.`,
          badge: `${thisMonthDeals.length} ${language === "ar" ? "صفقة" : "deals"}`,
          badgeColor: "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800",
          icon: DollarSign,
          iconColor: "text-emerald-500",
          iconBg: "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40",
          actionText: language === "ar" ? "عرض الأرباح والعمولات" : "View Revenues & Commissions",
          action: () => {
            setShowNotifications(false);
            onOpenRevenue();
          },
        });
      }
    }

    setNotifications(alerts);
  };

  useEffect(() => {
    updateNotifications();
  }, [stats.matchingOpportunitiesCount, reminders, dealsList, language]);

  // fetchAllData invalidates and refreshes the React Query cache
  const fetchAllData = async (
    onOpenMatches: () => void = () => {},
    onNavigate: (tab: string) => void = () => {},
    onOpenRevenue: () => void = () => {}
  ) => {
    if (!token || !currentUser) return;
    try {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owners }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brokers }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reminders }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.whatsappLogs }),
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.auditLogs }),
        queryClient.invalidateQueries({ queryKey: ["matching"] }),
      ]);
      if (currentUser?.role === "ADMIN") {
        await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
      }
      updateNotifications(onOpenMatches, onNavigate, onOpenRevenue);
    } catch (e) {
      console.error("Failed to invalidate queries", e);
    }
  };

  return (
    <AppDataContext.Provider
      value={{
        stats,
        properties,
        owners,
        clients,
        brokers,
        reminders,
        whatsappLogs,
        auditLogs,
        dealsList,
        usersList,
        templateAr,
        templateEn,
        setTemplateAr,
        setTemplateEn,
        notifications,
        showNotifications,
        setShowNotifications,
        fetchAllData,
        toastMessage,
        setToastMessage,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};

import React from "react";
import { NavLink } from "react-router-dom";
import { Building2, UserCheck, Users, Briefcase, Calendar, MessageSquare, User as UserIcon, FileText, TrendingUp, LogOut } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { checkPermission } from "../../utils/permissions";
import { getRoleLabel } from "../../utils/labels";

interface SidebarProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { language, t } = useLanguage();
  const { currentUser, logout } = useAuth();

  const navItems = [
    { id: "dashboard", label: t("dashboard"), icon: TrendingUp },
    { id: "properties", label: t("properties"), icon: Building2, perm: "properties_manage" },
    { id: "owners", label: t("owners"), icon: UserCheck, perm: "owners_manage" },
    { id: "clients", label: t("clients"), icon: Users, perm: "clients_manage" },
    { id: "brokers", label: t("brokers"), icon: Briefcase, perm: "brokers_manage" },
    { id: "reminders", label: t("reminders"), icon: Calendar, perm: "reminders_manage" },
    { id: "whatsapp", label: t("whatsappLogs"), icon: MessageSquare, perm: "whatsapp_manage" },
    { id: "users", label: t("usersManagement"), icon: UserIcon, perm: "users_manage", adminOnlyRole: "ADMIN" },
    { id: "audit", label: t("auditLogs"), icon: FileText, perm: "audit_view", adminOnly: true },
  ];

  return (
    <aside className={`fixed top-0 bottom-0 z-30 transition-all duration-300 w-20 md:w-64 bg-slate-900 text-slate-200 flex flex-col border-r border-slate-800 shrink-0 select-none overflow-hidden ${language === "ar" ? "right-0 border-l border-r-0" : "left-0"}`}>
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3 rtl:space-x-reverse">
        <div className="p-2.5 bg-brand-600 rounded-xl shadow-md shadow-brand-500/20">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">{t("appName")}</h2>
          <span className="text-[10px] text-brand-400 font-semibold block">{t("enterpriseCrm")}</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item: any) => {
          if (item.adminOnlyRole && currentUser?.role !== item.adminOnlyRole) return null;
          if (item.perm && !checkPermission(currentUser, item.perm)) return null;
          if (item.adminOnly && currentUser?.role === "AGENT") return null;
          
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={`/${item.id}`}
              onClick={() => {
                if (setActiveTab) setActiveTab(item.id);
              }}
              className={({ isActive }) => {
                const active = isActive || activeTab === item.id;
                return `w-full flex items-center space-x-3 rtl:space-x-reverse px-4 py-3 rounded-xl text-xs font-semibold transition ${
                  active
                    ? "bg-brand-600 text-white shadow-md shadow-brand-500/10"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`;
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* CURRENT USER DETAILS */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center space-x-3 rtl:space-x-reverse overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-brand-500/15 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-5 h-5 text-brand-400" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{currentUser?.name}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 inline-block font-semibold mt-0.5">
              {getRoleLabel(currentUser?.role || "", t as any)}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          title={t("logout")}
          className="p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded-lg transition"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

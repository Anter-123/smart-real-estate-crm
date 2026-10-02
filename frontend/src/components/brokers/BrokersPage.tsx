import React, { useState, useMemo } from "react";
import { Search, Plus, Briefcase } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import * as api from "../../api";
import type { Broker } from "../../types";
import BrokerModal from "./BrokerModal";

export const BrokersPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { brokers, fetchAllData } = useAppData();

  const [brokerSearch, setBrokerSearch] = useState("");
  const [isBrokerModalOpen, setIsBrokerModalOpen] = useState(false);
  const [editingBroker, setEditingBroker] = useState<Broker | null>(null);

  const filteredBrokers = useMemo(() => {
    return brokers.filter(
      (b) =>
        b.name.toLowerCase().includes(brokerSearch.toLowerCase()) ||
        b.phone.toLowerCase().includes(brokerSearch.toLowerCase())
    );
  }, [brokers, brokerSearch]);

  const handleEditBroker = (b: Broker) => {
    setEditingBroker(b);
    setIsBrokerModalOpen(true);
  };

  const handleDeleteBroker = async (id: string) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف الوسيط؟" : "Are you sure?")) return;
    try {
      await api.deleteBroker(id);
      fetchAllData(() => {}, () => {}, () => {});
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t("commissionReports")}</h3>
            <p className="text-xs text-slate-400 mt-1">{t("externalBrokerWarning")}</p>
          </div>
          <div className="relative w-full max-w-xs md:ml-4 rtl:md:mr-4 rtl:md:ml-0">
            <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-3 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              className={`w-full ${language === "ar" ? "pr-9 pl-4" : "pl-9 pr-4"} py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none`}
              placeholder={t("searchBroker")}
              value={brokerSearch}
              onChange={(e) => setBrokerSearch(e.target.value)}
            />
          </div>
        </div>
        <button
          onClick={() => {
            setEditingBroker(null);
            setIsBrokerModalOpen(true);
          }}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addBroker")}</span>
        </button>
      </div>

      {/* BROKERS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBrokers.map((b) => {
          const dealCount = b.deals?.length || 0;
          const totalEarnings = b.deals?.reduce((acc, curr) => acc + curr.commission, 0) || 0;
          return (
            <div key={b.id} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white">{b.name}</h4>
                  <span className="text-[10px] text-slate-400">{t("commissionRate")}: {b.commissionPct}%</span>
                </div>
                <Briefcase className="w-5 h-5 text-brand-500" />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 dark:border-slate-800 py-3 text-xs">
                <div>
                  <span className="text-slate-400 block">{t("dealsClosed")}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{dealCount} {t("deals")}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">{t("earnings")}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 mt-0.5 block">{totalEarnings.toLocaleString()} {t("egp")}</span>
                </div>
              </div>

              <div className="text-[10px] space-y-1">
                <p><span className="text-slate-400">{t("ownerPhone")}:</span> {b.phone}</p>
                <p><span className="text-slate-400">{t("ownerWhatsapp")}:</span> {b.whatsapp}</p>
              </div>

              <div className="flex space-x-3 rtl:space-x-reverse justify-end pt-2">
                <button
                  onClick={() => handleEditBroker(b)}
                  className="text-brand-600 dark:text-brand-300 text-xs font-bold hover:underline"
                >
                  {t("edit")}
                </button>
                {currentUser?.role !== "AGENT" && (
                  <button
                    onClick={() => handleDeleteBroker(b.id)}
                    className="text-red-500 text-xs font-bold hover:underline"
                  >
                    {t("delete")}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <BrokerModal
        isOpen={isBrokerModalOpen}
        onClose={() => {
          setIsBrokerModalOpen(false);
          setEditingBroker(null);
        }}
        editingBroker={editingBroker}
      />
    </div>
  );
};

export default BrokersPage;

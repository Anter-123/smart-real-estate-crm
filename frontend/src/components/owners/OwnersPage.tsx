import React, { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import * as api from "../../api";
import type { Owner } from "../../types";
import OwnerModal from "./OwnerModal";

export const OwnersPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { owners, fetchAllData } = useAppData();

  const [ownerSearch, setOwnerSearch] = useState("");
  const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

  const filteredOwners = useMemo(() => {
    return owners.filter(
      (o) =>
        o.name.toLowerCase().includes(ownerSearch.toLowerCase()) ||
        o.phone.toLowerCase().includes(ownerSearch.toLowerCase()) ||
        (o.email && o.email.toLowerCase().includes(ownerSearch.toLowerCase()))
    );
  }, [owners, ownerSearch]);

  const handleEditOwner = (o: Owner) => {
    setEditingOwner(o);
    setIsOwnerModalOpen(true);
  };

  const handleDeleteOwner = async (id: string) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف المالك؟" : "Are you sure?")) return;
    try {
      await api.deleteOwner(id);
      fetchAllData(() => {}, () => {}, () => {});
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative w-full max-w-xs">
          <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-3 w-4 h-4 text-slate-400`} />
          <input
            type="text"
            className={`w-full ${language === "ar" ? "pr-9 pl-4" : "pl-9 pr-4"} py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none`}
            placeholder={t("searchOwner")}
            value={ownerSearch}
            onChange={(e) => setOwnerSearch(e.target.value)}
          />
        </div>
        <button
          onClick={() => {
            setEditingOwner(null);
            setIsOwnerModalOpen(true);
          }}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addOwner")}</span>
        </button>
      </div>

      {/* OWNERS TABLE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse text-left rtl:text-right text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4">{t("ownerId")}</th>
              <th className="p-4">{t("ownerName")}</th>
              <th className="p-4">{t("ownerPhone")}</th>
              <th className="p-4">{t("ownerWhatsapp")}</th>
              <th className="p-4">{t("ownerEmail")}</th>
              <th className="p-4">{t("ownedProperties")}</th>
              <th className="p-4 text-right rtl:text-left">{t("actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOwners.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-4 font-mono font-bold text-slate-500">{o.ownerId}</td>
                <td className="p-4 font-bold">{o.name}</td>
                <td className="p-4">{o.phone}</td>
                <td className="p-4">{o.whatsapp}</td>
                <td className="p-4 text-slate-400">{o.email || "-"}</td>
                <td className="p-4">
                  <span className="bg-brand-50 dark:bg-brand-950/20 text-brand-600 dark:text-brand-300 font-bold px-2.5 py-1 rounded-lg">
                    {o.properties?.length || 0} {t("ownedUnits")}
                  </span>
                </td>
                <td className="p-4 text-right rtl:text-left space-x-3 rtl:space-x-reverse">
                  <button
                    onClick={() => handleEditOwner(o)}
                    className="text-brand-600 dark:text-brand-300 font-bold hover:underline"
                  >
                    {t("edit")}
                  </button>
                  {currentUser?.role !== "AGENT" && (
                    <button
                      onClick={() => handleDeleteOwner(o.id)}
                      className="text-red-500 font-bold hover:underline"
                    >
                      {t("delete")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OwnerModal
        isOpen={isOwnerModalOpen}
        onClose={() => {
          setIsOwnerModalOpen(false);
          setEditingOwner(null);
        }}
        editingOwner={editingOwner}
      />
    </div>
  );
};

export default OwnersPage;

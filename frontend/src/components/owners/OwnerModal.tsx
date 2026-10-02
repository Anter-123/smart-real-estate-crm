import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import * as api from "../../api";
import type { Owner } from "../../types";

export interface OwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingOwner: Owner | null;
  onSuccess?: () => void;
}

export const OwnerModal: React.FC<OwnerModalProps> = ({
  isOpen,
  onClose,
  editingOwner,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { fetchAllData } = useAppData();

  const [ownerName, setOwnerName] = useState("");
  const [ownerPhone, setOwnerPhone] = useState("");
  const [ownerWhatsapp, setOwnerWhatsapp] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerAddress, setOwnerAddress] = useState("");
  const [ownerNationalId, setOwnerNationalId] = useState("");
  const [ownerNotes, setOwnerNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const clearOwnerForm = () => {
    setOwnerName("");
    setOwnerPhone("");
    setOwnerWhatsapp("");
    setOwnerEmail("");
    setOwnerAddress("");
    setOwnerNationalId("");
    setOwnerNotes("");
    setErrorMessage("");
  };

  useEffect(() => {
    setErrorMessage("");
    if (editingOwner) {
      setOwnerName(editingOwner.name);
      setOwnerPhone(editingOwner.phone);
      setOwnerWhatsapp(editingOwner.whatsapp);
      setOwnerEmail(editingOwner.email || "");
      setOwnerAddress(editingOwner.address || "");
      setOwnerNationalId(editingOwner.nationalId || "");
      setOwnerNotes(editingOwner.notes || "");
    } else {
      clearOwnerForm();
    }
  }, [editingOwner, isOpen]);

  if (!isOpen) return null;

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const payload = {
      name: ownerName,
      phone: ownerPhone,
      whatsapp: ownerWhatsapp,
      email: ownerEmail || null,
      address: ownerAddress || null,
      nationalId: ownerNationalId || null,
      notes: ownerNotes || null,
    };
    try {
      if (editingOwner) {
        await api.updateOwner(editingOwner.id, payload);
      } else {
        await api.createOwner(payload);
      }
      onClose();
      clearOwnerForm();
      if (onSuccess) {
        onSuccess();
      } else {
        fetchAllData(() => {}, () => {}, () => {});
      }
    } catch (e: any) {
      setErrorMessage(e.message || "حدث خطأ أثناء حفظ بيانات المالك");
    }
  };

  return (
    /* B. Owner Add/Edit Modal */
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {editingOwner ? t("editOwner") : t("addOwner")}
        </h3>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2 rtl:space-x-reverse">
            <span className="shrink-0 font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleOwnerSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("ownerName")}</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("ownerPhone")}</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("ownerWhatsapp")}</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={ownerWhatsapp}
                onChange={(e) => setOwnerWhatsapp(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("ownerEmail")}</label>
            <input
              type="email"
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("nationalId")}</label>
            <input
              type="text"
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={ownerNationalId}
              onChange={(e) => setOwnerNationalId(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("address")}</label>
            <input
              type="text"
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("notes")}</label>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={ownerNotes}
              onChange={(e) => setOwnerNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                clearOwnerForm();
              }}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl"
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

export default OwnerModal;

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import * as api from "../../api";
import type { Broker } from "../../types";

export interface BrokerModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingBroker: Broker | null;
  onSuccess?: () => void;
}

export const BrokerModal: React.FC<BrokerModalProps> = ({
  isOpen,
  onClose,
  editingBroker,
  onSuccess,
}) => {
  const { t } = useLanguage();
  const { fetchAllData } = useAppData();

  const [brokerName, setBrokerName] = useState("");
  const [brokerPhone, setBrokerPhone] = useState("");
  const [brokerWhatsapp, setBrokerWhatsapp] = useState("");
  const [brokerCommission, setBrokerCommission] = useState("2.5");
  const [errorMessage, setErrorMessage] = useState("");

  const clearBrokerForm = () => {
    setBrokerName("");
    setBrokerPhone("");
    setBrokerWhatsapp("");
    setBrokerCommission("2.5");
    setErrorMessage("");
  };

  useEffect(() => {
    setErrorMessage("");
    if (editingBroker) {
      setBrokerName(editingBroker.name);
      setBrokerPhone(editingBroker.phone);
      setBrokerWhatsapp(editingBroker.whatsapp);
      setBrokerCommission(String(editingBroker.commissionPct));
    } else {
      clearBrokerForm();
    }
  }, [editingBroker, isOpen]);

  if (!isOpen) return null;

  const handleBrokerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    const payload = {
      name: brokerName,
      phone: brokerPhone,
      whatsapp: brokerWhatsapp,
      commissionPct: Number(brokerCommission),
    };
    try {
      if (editingBroker) {
        await api.updateBroker(editingBroker.id, payload);
      } else {
        await api.createBroker(payload);
      }
      onClose();
      clearBrokerForm();
      if (onSuccess) {
        onSuccess();
      } else {
        fetchAllData(() => {}, () => {}, () => {});
      }
    } catch (e: any) {
      setErrorMessage(e.message || "حدث خطأ أثناء حفظ بيانات الوسيط");
    }
  };

  return (
    /* D. Broker Add/Edit Modal */
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {editingBroker ? t("editBroker") : t("addBroker")}
        </h3>

        {errorMessage && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center space-x-2 rtl:space-x-reverse">
            <span className="shrink-0 font-bold">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}
        
        <form onSubmit={handleBrokerSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("brokerAgencyName")}</label>
            <input
              type="text"
              required
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={brokerName}
              onChange={(e) => setBrokerName(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("ownerPhone")}</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={brokerPhone}
                onChange={(e) => setBrokerPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("ownerWhatsapp")}</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={brokerWhatsapp}
                onChange={(e) => setBrokerWhatsapp(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("commissionPct")}</label>
            <input
              type="number"
              step="0.1"
              required
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={brokerCommission}
              onChange={(e) => setBrokerCommission(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                clearBrokerForm();
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

export default BrokerModal;

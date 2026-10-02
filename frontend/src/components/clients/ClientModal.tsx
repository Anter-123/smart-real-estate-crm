import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import type { Client, Broker } from "../../types";

export interface ClientModalProps {
  isClientModalOpen?: boolean;
  isOpen?: boolean;
  setIsClientModalOpen: (open: boolean) => void;
  onClose?: () => void;
  editingClient: Client | null;
  setEditingClient: (client: Client | null) => void;
  clearClientForm: () => void;
  handleClientSubmit: (e: React.FormEvent) => void;
  clientName: string;
  setClientName: (name: string) => void;
  clientType: string;
  setClientType: (type: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
  clientWhatsapp: string;
  setClientWhatsapp: (whatsapp: string) => void;
  clientEmail: string;
  setClientEmail: (email: string) => void;
  clientAgentId: string;
  setClientAgentId: (id: string) => void;
  clientBrokerId: string;
  setClientBrokerId: (id: string) => void;
  reqListingType: string;
  setReqListingType: (listingType: string) => void;
  reqType: string;
  setReqType: (type: string) => void;
  reqAreas: string;
  setReqAreas: (areas: string) => void;
  reqMinBudget: string;
  setReqMinBudget: (budget: string) => void;
  reqMaxBudget: string;
  setReqMaxBudget: (budget: string) => void;
  reqMinArea: string;
  setReqMinArea: (area: string) => void;
  reqBedrooms: string;
  setReqBedrooms: (bedrooms: string) => void;
  reqPriority: string;
  setReqPriority: (priority: string) => void;
  reqFurnished: boolean;
  setReqFurnished: (furnished: boolean) => void;
  reqNotes: string;
  setReqNotes: (notes: string) => void;
  brokers?: Broker[];
}

const ClientModal: React.FC<ClientModalProps> = ({
  isClientModalOpen,
  isOpen,
  setIsClientModalOpen,
  onClose,
  editingClient,
  setEditingClient,
  clearClientForm,
  handleClientSubmit,
  clientName,
  setClientName,
  clientType,
  setClientType,
  clientPhone,
  setClientPhone,
  clientWhatsapp,
  setClientWhatsapp,
  clientEmail,
  setClientEmail,
  clientAgentId,
  setClientAgentId,
  clientBrokerId,
  setClientBrokerId,
  reqListingType,
  setReqListingType,
  reqType,
  setReqType,
  reqAreas,
  setReqAreas,
  reqMinBudget,
  setReqMinBudget,
  reqMaxBudget,
  setReqMaxBudget,
  reqMinArea,
  setReqMinArea,
  reqBedrooms,
  setReqBedrooms,
  reqPriority,
  setReqPriority,
  reqFurnished,
  setReqFurnished,
  reqNotes,
  setReqNotes,
  brokers: propBrokers,
}) => {
  const { language, t } = useLanguage();
  const { brokers: contextBrokers } = useAppData();
  const brokers = propBrokers || contextBrokers || [];

  const showModal = isClientModalOpen !== undefined ? isClientModalOpen : (isOpen !== undefined ? isOpen : true);
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {editingClient ? t("editClient") : t("addClient")}
        </h3>
        
        <form onSubmit={handleClientSubmit} className="space-y-4 text-xs">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 font-semibold text-slate-500 uppercase tracking-wider">
            {t("basicInfo")}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("ownerName")}</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("clientType")}</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={clientType}
                onChange={(e) => setClientType(e.target.value)}
              >
                <option value="BUYER">{t("buyer")}</option>
                <option value="TENANT">{t("tenant")}</option>
                <option value="INVESTOR">{t("investor")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("ownerPhone")}</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("ownerWhatsapp")}</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={clientWhatsapp}
                onChange={(e) => setClientWhatsapp(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("ownerEmail")}</label>
            <input
              type="email"
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("topAgents")}</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={clientAgentId}
                onChange={(e) => setClientAgentId(e.target.value)}
              >
                <option value="">{t("autoCurrentUser")}</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("sourceBroker")}</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={clientBrokerId}
                onChange={(e) => setClientBrokerId(e.target.value)}
              >
                <option value="">-- {t("directListing")} --</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="border-b border-slate-100 dark:border-slate-800 pt-2 pb-3 font-semibold text-slate-500 uppercase tracking-wider">
            {t("requirementsProfiling")}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("lookingFor")}</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={reqListingType}
                onChange={(e) => setReqListingType(e.target.value)}
              >
                <option value="SALE">{t("forSale")}</option>
                <option value="RENT">{t("forRent")}</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("targetType")}</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={reqType}
                onChange={(e) => setReqType(e.target.value)}
              >
                <option value="APARTMENT">{t("apartment")}</option>
                <option value="VILLA">{t("villa")}</option>
                <option value="OFFICE">{t("office")}</option>
                <option value="SHOP">{t("shop")}</option>
                <option value="LAND">{t("land")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("preferredAreasHelper")}</label>
            <input
              type="text"
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={reqAreas}
              onChange={(e) => setReqAreas(e.target.value)}
              placeholder={language === "ar" ? "مثال: مدينة نصر، مصر الجديدة، التجمع الخامس" : "e.g. Nasr City, Heliopolis, New Cairo"}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("minBudget")}</label>
              <input
                type="number"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={reqMinBudget}
                onChange={(e) => setReqMinBudget(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("maxBudget")}</label>
              <input
                type="number"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={reqMaxBudget}
                onChange={(e) => setReqMaxBudget(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("minArea")}</label>
              <input
                type="number"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={reqMinArea}
                onChange={(e) => setReqMinArea(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("bedrooms")}</label>
              <input
                type="number"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={reqBedrooms}
                onChange={(e) => setReqBedrooms(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("priority")}</label>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={reqPriority}
                onChange={(e) => setReqPriority(e.target.value)}
              >
                <option value="LOW">{t("low")}</option>
                <option value="MEDIUM">{t("medium")}</option>
                <option value="HIGH">{t("high")}</option>
              </select>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-6">
              <input
                type="checkbox"
                id="reqFurnished"
                className="w-4 h-4 text-brand-600 rounded"
                checked={reqFurnished}
                onChange={(e) => setReqFurnished(e.target.checked)}
              />
              <label htmlFor="reqFurnished" className="text-slate-600 dark:text-slate-300 font-semibold">{t("mustFurnished")}</label>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("additionalPreferences")}</label>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={reqNotes}
              onChange={(e) => setReqNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
            <button
              type="button"
              onClick={() => {
                setIsClientModalOpen(false);
                setEditingClient(null);
                clearClientForm();
                onClose?.();
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

export default ClientModal;

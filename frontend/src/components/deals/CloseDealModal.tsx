import React, { useState, useEffect } from "react";
import { XCircle, DollarSign, Building2, Briefcase } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api";

interface CloseDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealProperty: any;
  onSuccess: () => void;
}

const CloseDealModal: React.FC<CloseDealModalProps> = ({
  isOpen,
  onClose,
  dealProperty,
  onSuccess,
}) => {
  const { language, t } = useLanguage();
  const { clients, brokers, usersList } = useAppData();
  const { currentUser } = useAuth();

  const [dealPrice, setDealPrice] = useState("");
  const [dealSaleChannel, setDealSaleChannel] = useState("DIRECT"); // DIRECT | EXTERNAL_BROKER
  const [dealClientId, setDealClientId] = useState("");
  const [dealClientName, setDealClientName] = useState("");
  const [dealBrokerId, setDealBrokerId] = useState("");
  
  const [dealCommissionType, setDealCommissionType] = useState("PERCENTAGE");
  const [dealCommissionVal, setDealCommissionVal] = useState("");
  
  const [dealBrokerShareType, setDealBrokerShareType] = useState("PERCENTAGE");
  const [dealBrokerShareVal, setDealBrokerShareVal] = useState("");

  const [dealAgentId, setDealAgentId] = useState("");

  useEffect(() => {
    if (isOpen && dealProperty) {
      setDealPrice(dealProperty.price?.toString() || "");
      setDealAgentId(currentUser?.id || "");
    }
  }, [isOpen, dealProperty, currentUser]);

  const handleCloseDealSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealProperty) return;

    try {
      const numPrice = Number(dealPrice);
      let grossComm = 0;
      if (dealCommissionType === "PERCENTAGE") {
        grossComm = numPrice * (Number(dealCommissionVal || 0) / 100);
      } else {
        grossComm = Number(dealCommissionVal || 0);
      }

      let brokerShare = 0;
      if (dealSaleChannel === "EXTERNAL_BROKER") {
        if (dealBrokerShareType === "PERCENTAGE") {
          brokerShare = numPrice * (Number(dealBrokerShareVal || 0) / 100);
        } else {
          brokerShare = Number(dealBrokerShareVal || 0);
        }
      }

      const netRevenue = Math.max(0, grossComm - brokerShare);

      await api.createDeal({
        propertyId: dealProperty.id,
        clientId: dealClientId || undefined,
        brokerId: dealSaleChannel === "EXTERNAL_BROKER" ? dealBrokerId : undefined,
        amount: numPrice,
        commission: grossComm,
        brokerShare: brokerShare,
        netRevenue: netRevenue,
        soldBy: dealSaleChannel,
        agentId: dealAgentId || undefined,
        notes: `Property ${dealProperty.propertyId} marked as SOLD. Client: ${dealClientName}. Channel: ${dealSaleChannel}`,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to close deal.");
    }
  };

  if (!isOpen || !dealProperty) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
              <DollarSign className="w-5 h-5 text-emerald-500" />
              <span>{t("closeDealTitle")}</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{t("closeDealDesc")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Property Summary Pill */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded">
              {dealProperty.propertyId}
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 ml-2 rtl:ml-0 rtl:mr-2">
              {dealProperty.address}
            </span>
          </div>
          <span className="font-bold text-slate-600 dark:text-slate-300">
            {t(dealProperty.listingType === "SALE" ? "forSale" : "forRent")}
          </span>
        </div>

        <form onSubmit={handleCloseDealSubmit} className="space-y-4 text-xs">
          
          {/* Actual Selling Price */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("actualDealPrice")} ({t("egp")}) *</label>
            <input
              type="number"
              required
              min="0"
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 font-bold text-slate-800 dark:text-white"
              value={dealPrice}
              onChange={(e) => setDealPrice(e.target.value)}
            />
          </div>

          {/* Deal Channel Selection */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">{t("saleChannel")} *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDealSaleChannel("DIRECT")}
                className={`p-3 rounded-xl border flex items-center justify-center space-x-2 rtl:space-x-reverse transition ${
                  dealSaleChannel === "DIRECT"
                    ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>{t("directDeal")}</span>
              </button>

              <button
                type="button"
                onClick={() => setDealSaleChannel("EXTERNAL_BROKER")}
                className={`p-3 rounded-xl border flex items-center justify-center space-x-2 rtl:space-x-reverse transition ${
                  dealSaleChannel === "EXTERNAL_BROKER"
                    ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 font-bold"
                    : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Briefcase className="w-4 h-4" />
                <span>{t("externalBrokerDeal")}</span>
              </button>
            </div>
          </div>

          {/* Client Selection (Buyer / Tenant) */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("selectBuyerTenant")}</label>
            <select
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              value={dealClientId}
              onChange={(e) => {
                setDealClientId(e.target.value);
                const selected = clients.find((c) => c.id === e.target.value);
                if (selected) setDealClientName(selected.name);
              }}
            >
              <option value="">-- {t("selectBuyerTenant")} --</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </option>
              ))}
            </select>
          </div>

          {/* Sales Agent Attribution (For Admin & Manager) */}
          {(currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER") && (
            <div className="p-3.5 bg-brand-50/40 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-slate-700 dark:text-slate-200 font-bold text-xs">
                  {t("dealSalesAgent")}
                </label>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {t("dealSalesAgentDesc")}
              </p>
              <select
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                value={dealAgentId}
                onChange={(e) => setDealAgentId(e.target.value)}
              >
                <option value={currentUser?.id}>
                  ★ {t("dealClosedBySelf")} ({currentUser?.name})
                </option>
                {usersList
                  .filter((u) => u.id !== currentUser?.id)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} — ({u.role === "AGENT" ? t("roleAgent") : u.role === "MANAGER" ? t("roleManager") : t("roleAdmin")})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {/* Company Gross Commission */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-slate-700 dark:text-slate-200 font-bold">{t("companyCommissionGross")}</label>
              <div className="flex items-center space-x-1 rtl:space-x-reverse bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setDealCommissionType("PERCENTAGE")}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    dealCommissionType === "PERCENTAGE" ? "bg-white dark:bg-slate-800 text-brand-600 shadow-xs" : "text-slate-500"
                  }`}
                >
                  % {t("percentage")}
                </button>
                <button
                  type="button"
                  onClick={() => setDealCommissionType("FIXED")}
                  className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                    dealCommissionType === "FIXED" ? "bg-white dark:bg-slate-800 text-brand-600 shadow-xs" : "text-slate-500"
                  }`}
                >
                  {t("fixedAmount")}
                </button>
              </div>
            </div>

            <div className="relative">
              <input
                type="number"
                step="any"
                required
                min="0"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                placeholder={dealCommissionType === "PERCENTAGE" ? "2.5" : "50000"}
                value={dealCommissionVal}
                onChange={(e) => setDealCommissionVal(e.target.value)}
              />
              <span className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-2.5 font-bold text-slate-400`}>
                {dealCommissionType === "PERCENTAGE" ? "%" : t("egp")}
              </span>
            </div>
          </div>

          {/* External Broker Share (If External Broker is Selected) */}
          {dealSaleChannel === "EXTERNAL_BROKER" && (
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-amber-800 dark:text-amber-300 font-bold">{t("externalBrokerShare")}</label>
                <div className="flex items-center space-x-1 rtl:space-x-reverse bg-amber-200/60 dark:bg-amber-900/60 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDealBrokerShareType("PERCENTAGE")}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      dealBrokerShareType === "PERCENTAGE" ? "bg-white dark:bg-slate-800 text-amber-600 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    % {t("percentage")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDealBrokerShareType("FIXED")}
                    className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                      dealBrokerShareType === "FIXED" ? "bg-white dark:bg-slate-800 text-amber-600 shadow-xs" : "text-slate-500"
                    }`}
                  >
                    {t("fixedAmount")}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t("selectBroker")}</label>
                  <select
                    className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    value={dealBrokerId}
                    onChange={(e) => {
                      setDealBrokerId(e.target.value);
                    }}
                  >
                    <option value="">-- {t("selectBroker")} --</option>
                    {brokers.map((b) => (
                      <option key={b.id} value={b.id}>{b.name} ({b.phone})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">{t("brokerPayoutLabel")}</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="0"
                      className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                      placeholder={dealBrokerShareType === "PERCENTAGE" ? "1.0" : "20000"}
                      value={dealBrokerShareVal}
                      onChange={(e) => setDealBrokerShareVal(e.target.value)}
                    />
                    <span className={`absolute ${language === "ar" ? "left-3" : "right-3"} top-2.5 font-bold text-slate-400`}>
                      {dealBrokerShareType === "PERCENTAGE" ? "%" : t("egp")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REAL-TIME PROFIT BREAKDOWN CARD (THE CORE REQUIREMENT) */}
          {(() => {
            const numPrice = Number(dealPrice) || 0;
            let grossComm = 0;
            if (dealCommissionType === "PERCENTAGE") {
              grossComm = numPrice * (Number(dealCommissionVal || 0) / 100);
            } else {
              grossComm = Number(dealCommissionVal || 0);
            }

            let brokerShare = 0;
            if (dealSaleChannel === "EXTERNAL_BROKER") {
              if (dealBrokerShareType === "PERCENTAGE") {
                brokerShare = numPrice * (Number(dealBrokerShareVal || 0) / 100);
              } else {
                brokerShare = Number(dealBrokerShareVal || 0);
              }
            }

            const netProfit = Math.max(0, grossComm - brokerShare);

            return (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-500/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">{t("grossCommissionLabel")}:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {grossComm.toLocaleString()} {t("egp")}
                  </span>
                </div>

                {dealSaleChannel === "EXTERNAL_BROKER" && (
                  <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400">
                    <span>{t("brokerPayoutLabel")}:</span>
                    <span className="font-bold">-{brokerShare.toLocaleString()} {t("egp")}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">{t("netCompanyRevenue")}</span>
                    <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">{t("netCompanyRevenueDesc")}</span>
                  </div>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                    {netProfit.toLocaleString()} {t("egp")}
                  </span>
                </div>
              </div>
            );
          })()}

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-white"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/20"
            >
              {(t as any)("confirmDeal")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CloseDealModal;

import React from "react";
import { XCircle, Send } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface AllMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  allMatchesList: any[];
  handleSendWhatsAppNotification: (clientId: string, propertyId: string) => void;
}

const AllMatchesModal: React.FC<AllMatchesModalProps> = ({
  isOpen,
  onClose,
  allMatchesList,
  handleSendWhatsAppNotification,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-white">{t("allMatchingPairs")}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{t("allMatchingPairsDesc")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {allMatchesList.length === 0 ? (
            <p className="text-slate-400 text-center py-12 text-xs">{t("noMatchesFound")}</p>
          ) : (
            allMatchesList.map((item, idx) => {
              const score = item.score || item.match?.score || 85;
              const scoreColor =
                score >= 80
                  ? "text-green-600 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
                  : "text-amber-600 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";

              return (
                <div key={idx} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 space-y-4 hover:border-brand-500/50 transition">
                  <div className="flex items-center justify-between">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                      {/* Client Request */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{t("clientLooking")}</span>
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs">{item.client.name}</h4>
                        <p className="text-[11px] text-slate-500">
                          {t(item.client.clientType.toLowerCase() as any)} • {t("ownerPhone")}: {item.client.phone}
                        </p>
                        {item.client.requirements && (
                          <p className="text-[10px] text-brand-600 dark:text-brand-400 font-semibold">
                            {t("lookingFor")} {item.client.requirements.listingType === 'SALE' ? t("forSale") : t("forRent")} {t(item.client.requirements.type.toLowerCase() as any)} ({item.client.requirements.maxBudget ? `${item.client.requirements.maxBudget.toLocaleString()} ${t("egp")}` : t("openBudget")})
                          </p>
                        )}
                      </div>

                      {/* Matched Property */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400">{t("matchedUnit")}</span>
                        <h4 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-1">{item.property.address}</h4>
                        <p className="text-[11px] text-slate-500">
                          {t(item.property.type.toLowerCase() as any)} • {item.property.area} {t("sqm")}
                        </p>
                        <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300">
                          {t("price")}: {item.property.price.toLocaleString()} {t("egp")}
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className={`p-3 rounded-2xl border flex flex-col items-center justify-center shrink-0 ml-4 rtl:ml-0 rtl:mr-4 ${scoreColor}`}>
                      <span className="text-lg font-black">{score}%</span>
                      <span className="text-[9px] uppercase font-bold">{t("score")}</span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-200/60 dark:border-slate-800">
                    <button
                      onClick={() => handleSendWhatsAppNotification(item.client.id, item.property.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-emerald-500/10"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{t("sendWhatsApp")}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
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

export default AllMatchesModal;

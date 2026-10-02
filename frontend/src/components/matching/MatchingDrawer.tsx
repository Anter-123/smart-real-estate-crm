import React from "react";
import { XCircle, Send } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

interface MatchingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  matchingClient: any | null;
  matchingProperty: any | null;
  matchingOpportunities: any[];
  handleSendWhatsAppNotification: (clientId: string, propertyId: string) => void;
}

const MatchingDrawer: React.FC<MatchingDrawerProps> = ({
  isOpen,
  onClose,
  matchingClient,
  matchingProperty,
  matchingOpportunities,
  handleSendWhatsAppNotification,
}) => {
  const { language, t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-950 h-full p-8 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">{t("matchingOpportunities")}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {matchingClient
                  ? (language === "ar" ? `العقارات المتطابقة مع طلب العميل: ${matchingClient.name}` : `Matching properties for ${matchingClient.name}`)
                  : (language === "ar" ? `العملاء المتطابقون مع كود الوحدة: ${matchingProperty?.propertyId}` : `Matching clients for ${matchingProperty?.propertyId}`)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* LIST MATCH RESULTS */}
          <div className="space-y-4">
            {matchingOpportunities.length === 0 ? (
              <p className="text-slate-400 text-center py-12 text-xs">{t("noMatches")}</p>
            ) : (
              matchingOpportunities.map((item, idx) => {
                const scoreColor =
                  item.match.score >= 80
                    ? "text-green-600 bg-green-50 dark:bg-green-950/20"
                    : item.match.score >= 50
                    ? "text-amber-600 bg-amber-50 dark:bg-amber-950/20"
                    : "text-rose-600 bg-rose-50 dark:bg-rose-950/20";

                return (
                  <div key={idx} className="p-5 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {matchingClient ? (
                          <>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.property.address}</h4>
                            <p className="text-xs text-slate-400">
                              {t(item.property.type.toLowerCase() as any)} • {item.property.area} {t("sqm")} • {item.property.price.toLocaleString()} {t("egp")}
                            </p>
                          </>
                        ) : (
                          <>
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.client.name}</h4>
                            <p className="text-xs text-slate-400">
                              {t("clientType")}: {t(item.client.clientType.toLowerCase() as any)} • {t("ownerPhone")}: {item.client.phone}
                            </p>
                          </>
                        )}
                      </div>

                      <div className={`p-3 rounded-xl flex flex-col items-center shrink-0 ${scoreColor}`}>
                        <span className="text-lg font-black">{item.match.score}%</span>
                        <span className="text-[9px] uppercase tracking-wider font-semibold">{t("score")}</span>
                      </div>
                    </div>

                    {/* MATCH BREAKDOWN */}
                    <div className="p-3 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl space-y-2 text-[10px] text-slate-500">
                      <h5 className="font-bold text-slate-700 dark:text-slate-300">{t("matchReason")}:</h5>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        <div>{t("locationMatch")}: <span className="font-bold text-slate-700 dark:text-slate-200">{item.match.breakdown.location}%</span></div>
                        <div>{t("budgetMatch")}: <span className="font-bold text-slate-700 dark:text-slate-200">{item.match.breakdown.budget}%</span></div>
                        <div>{t("areaMatch")}: <span className="font-bold text-slate-700 dark:text-slate-200">{item.match.breakdown.area}%</span></div>
                        <div>{t("roomsMatch")}: <span className="font-bold text-slate-700 dark:text-slate-200">{item.match.breakdown.bedrooms}%</span></div>
                        <div>{t("furnishedMatch")}: <span className="font-bold text-slate-700 dark:text-slate-200">{item.match.breakdown.furnished}%</span></div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() =>
                          handleSendWhatsAppNotification(
                            matchingClient ? matchingClient.id : item.client.id,
                            matchingProperty ? matchingProperty.id : item.property.id
                          )
                        }
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-emerald-500/10"
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
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 mt-6 shrink-0 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            {t("closeDrawer")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchingDrawer;

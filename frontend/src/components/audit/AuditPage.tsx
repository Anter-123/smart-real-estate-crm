import React from "react";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";
import { useAppData } from "../../context/AppDataContext";
import { exportToCSV } from "../../utils/csv";

export const AuditPage: React.FC = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { auditLogs } = useAppData();

  if (currentUser?.role === "AGENT") {
    return null;
  }

  return (
    <div className="space-y-6">
      
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t("systemAuditTrail")}</h3>
          <p className="text-xs text-slate-400 mt-1">{t("auditTrailDesc")}</p>
        </div>
        <button
          onClick={() => exportToCSV(auditLogs, "audit_trail_export")}
          className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
        >
          {t("exportCsv")}
        </button>
      </div>

      {/* AUDIT LOG LIST */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 uppercase text-[9px] font-bold tracking-wider border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-4 text-left rtl:text-right">{t("timestamp")}</th>
              <th className="p-4 text-left rtl:text-right">{t("userName")}</th>
              <th className="p-4 text-left rtl:text-right">{t("actionCode")}</th>
              <th className="p-4 text-left rtl:text-right">{t("payloadDetails")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditLogs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="p-4 text-slate-400 font-mono">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="p-4 font-bold">{log.userName || t("system")}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-brand-600 dark:text-brand-400 font-mono font-bold">
                    {log.action}
                  </span>
                </td>
                <td className="p-4 text-slate-500 font-mono text-[10px] break-all max-w-lg">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditPage;

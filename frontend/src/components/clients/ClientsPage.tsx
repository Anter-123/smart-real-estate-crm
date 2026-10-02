import React, { useState, useMemo } from "react";
import { Search, Plus } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api";
import type { Client } from "../../types";
import ClientModal from "./ClientModal";
import MatchingDrawer from "../matching/MatchingDrawer";

export const ClientsPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { clients, brokers, fetchAllData, setToastMessage } = useAppData();
  const { currentUser } = useAuth();

  const [clientSearch, setClientSearch] = useState("");
  const [clientTypeFilter, setClientTypeFilter] = useState("ALL");

  // Modal State
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [clientType, setClientType] = useState("BUYER");
  const [clientPhone, setClientPhone] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [clientAgentId, setClientAgentId] = useState("");
  const [clientBrokerId, setClientBrokerId] = useState("");

  // Requirement Fields
  const [reqListingType, setReqListingType] = useState("SALE");
  const [reqType, setReqType] = useState("APARTMENT");
  const [reqAreas, setReqAreas] = useState("");
  const [reqMinBudget, setReqMinBudget] = useState("");
  const [reqMaxBudget, setReqMaxBudget] = useState("");
  const [reqMinArea, setReqMinArea] = useState("");
  const [reqBedrooms, setReqBedrooms] = useState("");
  const [reqPriority, setReqPriority] = useState("MEDIUM");
  const [reqFurnished, setReqFurnished] = useState(false);
  const [reqNotes, setReqNotes] = useState("");

  // Matching Drawer State
  const [matchingClient, setMatchingClient] = useState<Client | null>(null);
  const [matchingOpportunities, setMatchingOpportunities] = useState<any[]>([]);
  const [isMatchingDrawerOpen, setIsMatchingDrawerOpen] = useState(false);

  const clearClientForm = () => {
    setClientName("");
    setClientType("BUYER");
    setClientPhone("");
    setClientWhatsapp("");
    setClientEmail("");
    setClientAgentId("");
    setClientBrokerId("");
    setReqListingType("SALE");
    setReqType("APARTMENT");
    setReqAreas("");
    setReqMinBudget("");
    setReqMaxBudget("");
    setReqMinArea("");
    setReqBedrooms("");
    setReqPriority("MEDIUM");
    setReqFurnished(false);
    setReqNotes("");
  };

  const handleOpenAddModal = () => {
    setEditingClient(null);
    clearClientForm();
    setIsClientModalOpen(true);
  };

  const handleEditClient = (c: Client) => {
    setEditingClient(c);
    setClientName(c.name);
    setClientType(c.clientType);
    setClientPhone(c.phone);
    setClientWhatsapp(c.whatsapp);
    setClientEmail(c.email || "");
    setClientAgentId(c.agentId || "");
    setClientBrokerId(c.brokerId || "");

    if (c.requirements) {
      setReqListingType(c.requirements.listingType);
      setReqType(c.requirements.type);
      try {
        const parsed = JSON.parse(c.requirements.preferredAreas || "[]");
        setReqAreas(Array.isArray(parsed) ? parsed.join(", ") : "");
      } catch {
        setReqAreas(c.requirements.preferredAreas || "");
      }
      setReqMinBudget(c.requirements.minBudget ? String(c.requirements.minBudget) : "");
      setReqMaxBudget(c.requirements.maxBudget ? String(c.requirements.maxBudget) : "");
      setReqMinArea(c.requirements.minArea ? String(c.requirements.minArea) : "");
      setReqBedrooms(c.requirements.bedrooms ? String(c.requirements.bedrooms) : "");
      setReqPriority(c.requirements.priority || "MEDIUM");
      setReqFurnished(Boolean(c.requirements.furnished));
      setReqNotes(c.requirements.notes || "");
    } else {
      setReqListingType("SALE");
      setReqType("APARTMENT");
      setReqAreas("");
      setReqMinBudget("");
      setReqMaxBudget("");
      setReqMinArea("");
      setReqBedrooms("");
      setReqPriority("MEDIUM");
      setReqFurnished(false);
      setReqNotes("");
    }
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const areasArray = reqAreas
      ? reqAreas.split(",").map((a) => a.trim()).filter(Boolean)
      : [];

    const payload = {
      name: clientName,
      phone: clientPhone,
      whatsapp: clientWhatsapp || clientPhone,
      email: clientEmail || null,
      clientType,
      agentId: clientAgentId || null,
      brokerId: clientBrokerId || null,
      requirements: {
        listingType: reqListingType,
        type: reqType,
        preferredAreas: areasArray,
        minBudget: reqMinBudget ? Number(reqMinBudget) : null,
        maxBudget: reqMaxBudget ? Number(reqMaxBudget) : null,
        minArea: reqMinArea ? Number(reqMinArea) : null,
        bedrooms: reqBedrooms ? Number(reqBedrooms) : null,
        furnished: reqFurnished,
        notes: reqNotes,
        priority: reqPriority,
      },
    };

    try {
      if (editingClient) {
        await api.updateClient(editingClient.id, payload);
        if (setToastMessage) setToastMessage({ text: language === "ar" ? "تم تحديث بيانات العميل" : "Client updated", type: "success" });
      } else {
        await api.createClient(payload);
        if (setToastMessage) setToastMessage({ text: language === "ar" ? "تمت إضافة العميل بنجاح" : "Client added", type: "success" });
      }
      setIsClientModalOpen(false);
      clearClientForm();
      fetchAllData();
    } catch (err: any) {
      alert(err.message || "Failed to save client");
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف هذا العميل؟" : "Are you sure?")) return;
    try {
      await api.deleteClient(id);
      if (setToastMessage) setToastMessage({ text: language === "ar" ? "تم حذف العميل" : "Client deleted", type: "info" });
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePipelineStep = async (c: Client, step: any) => {
    try {
      await api.updateClient(c.id, { ...c, pipelineStep: step });
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openMatchingForClient = async (c: Client) => {
    try {
      const matches = await api.getMatchingOpportunities({ clientId: c.id });
      setMatchingClient(c);
      setMatchingOpportunities(matches);
      setIsMatchingDrawerOpen(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendWhatsAppNotification = async (clientId: string, propertyId: string) => {
    // Open new tab synchronously to bypass browser popup blockers
    const newWindow = window.open("about:blank", "_blank");
    try {
      const res = await api.sendWhatsAppAlert(clientId, propertyId, language);
      if (res?.waLink) {
        if (newWindow) {
          newWindow.location.href = res.waLink;
        } else {
          window.open(res.waLink, "_blank");
        }
      } else if (newWindow) {
        newWindow.close();
      }
      fetchAllData();
      if (setToastMessage) {
        setToastMessage({
          text: language === "ar" ? "تم فتح محادثة الواتساب وتجهيز الرسالة بنجاح" : "WhatsApp chat opened successfully",
          type: "success",
        });
      }
    } catch (err: any) {
      if (newWindow) newWindow.close();
      if (setToastMessage) {
        setToastMessage({
          text: err.message || (language === "ar" ? "فشل فتح محادثة الواتساب" : "Failed to open WhatsApp"),
          type: "error",
        });
      } else {
        alert(err.message);
      }
    }
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(clientSearch.toLowerCase()) ||
        c.phone.toLowerCase().includes(clientSearch.toLowerCase()) ||
        (c.email && c.email.toLowerCase().includes(clientSearch.toLowerCase())) ||
        c.clientId.toLowerCase().includes(clientSearch.toLowerCase());

      const matchType = clientTypeFilter === "ALL" || c.clientType === clientTypeFilter;
      return matchSearch && matchType;
    });
  }, [clients, clientSearch, clientTypeFilter]);

  const pipelineStages = [
    { id: "NEW", label: t("newLead"), color: "bg-blue-500" },
    { id: "INTERESTED", label: t("interested"), color: "bg-purple-500" },
    { id: "NEGOTIATING", label: t("negotiating"), color: "bg-amber-500" },
    { id: "CLOSED", label: t("closed"), color: "bg-green-500" },
    { id: "LOST", label: t("lost"), color: "bg-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-3 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              className={`w-full ${language === "ar" ? "pr-9 pl-4" : "pl-9 pr-4"} py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none`}
              placeholder={t("searchClient")}
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
            />
          </div>

          <select
            className="border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
            value={clientTypeFilter}
            onChange={(e) => setClientTypeFilter(e.target.value)}
          >
            <option value="ALL">{t("allTypes")}</option>
            <option value="BUYER">{t("buyer")}</option>
            <option value="TENANT">{t("tenant")}</option>
            <option value="INVESTOR">{t("investor")}</option>
          </select>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>{t("addClient")}</span>
        </button>
      </div>

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {pipelineStages.map((stage) => {
          const stageClients = filteredClients.filter((c) => c.pipelineStep === stage.id);
          return (
            <div key={stage.id} className="bg-slate-100/70 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col space-y-3 min-w-[220px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`}></span>
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs">{stage.label}</h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-500 shadow-xs">
                  {stageClients.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
                {stageClients.length === 0 && (
                  <p className="text-slate-400 text-center py-6 text-[11px]">{t("noData")}</p>
                )}
                {stageClients.map((c) => (
                  <div key={c.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-sm space-y-3 hover:border-brand-500/50 transition">
                    <div className="space-y-1">
                      <h5 className="font-bold text-slate-800 dark:text-white text-xs">{c.name}</h5>
                      <p className="text-[10px] text-slate-400 font-mono">{c.clientId} • {c.clientType === 'BUYER' ? t("buyer") : c.clientType === 'TENANT' ? t("tenant") : t("investor")}</p>
                    </div>

                    {c.requirements && (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg text-[10px] text-slate-500 space-y-1">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">
                          {t("lookingFor")} {c.requirements.listingType === 'SALE' ? t("forSale") : t("forRent")} {t(c.requirements.type.toLowerCase() as any)}
                        </p>
                        <p className="line-clamp-1">
                          {t("preferredAreas")}: {JSON.parse(c.requirements.preferredAreas || "[]").join(", ")}
                        </p>
                        <p className="font-bold text-brand-600 dark:text-brand-400">
                          {t("budget")}: {c.requirements.maxBudget ? `${c.requirements.maxBudget.toLocaleString()} ${t("egp")}` : t("openBudget")}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] font-semibold">
                      <div className="space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEditClient(c)}
                          className="text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        >
                          {t("edit")}
                        </button>
                        {currentUser?.role !== "AGENT" && (
                          <button
                            onClick={() => handleDeleteClient(c.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            {t("delete")}
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-1.5 rtl:space-x-reverse">
                        <select
                          value={c.pipelineStep}
                          onChange={(e) => handleUpdatePipelineStep(c, e.target.value)}
                          className="bg-slate-100 dark:bg-slate-800 text-[9px] border border-slate-200 dark:border-slate-800 rounded px-1.5 py-0.5 font-bold"
                        >
                          <option value="NEW">{t("newLead")}</option>
                          <option value="INTERESTED">{t("interested")}</option>
                          <option value="NEGOTIATING">{t("negotiating")}</option>
                          <option value="CLOSED">{t("closed")}</option>
                          <option value="LOST">{t("lost")}</option>
                        </select>
                        <button
                          onClick={() => openMatchingForClient(c)}
                          className="bg-brand-600 text-white px-2 py-0.5 rounded text-[9px] font-bold hover:bg-brand-500 transition"
                        >
                          {t("viewMatches")}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Client Modal */}
      <ClientModal
        isClientModalOpen={isClientModalOpen}
        setIsClientModalOpen={setIsClientModalOpen}
        editingClient={editingClient}
        setEditingClient={setEditingClient}
        clearClientForm={clearClientForm}
        handleClientSubmit={handleClientSubmit}
        clientName={clientName}
        setClientName={setClientName}
        clientType={clientType}
        setClientType={setClientType}
        clientPhone={clientPhone}
        setClientPhone={setClientPhone}
        clientWhatsapp={clientWhatsapp}
        setClientWhatsapp={setClientWhatsapp}
        clientEmail={clientEmail}
        setClientEmail={setClientEmail}
        clientAgentId={clientAgentId}
        setClientAgentId={setClientAgentId}
        clientBrokerId={clientBrokerId}
        setClientBrokerId={setClientBrokerId}
        reqListingType={reqListingType}
        setReqListingType={setReqListingType}
        reqType={reqType}
        setReqType={setReqType}
        reqAreas={reqAreas}
        setReqAreas={setReqAreas}
        reqMinBudget={reqMinBudget}
        setReqMinBudget={setReqMinBudget}
        reqMaxBudget={reqMaxBudget}
        setReqMaxBudget={setReqMaxBudget}
        reqMinArea={reqMinArea}
        setReqMinArea={setReqMinArea}
        reqBedrooms={reqBedrooms}
        setReqBedrooms={setReqBedrooms}
        reqPriority={reqPriority}
        setReqPriority={setReqPriority}
        reqFurnished={reqFurnished}
        setReqFurnished={setReqFurnished}
        reqNotes={reqNotes}
        setReqNotes={setReqNotes}
        brokers={brokers}
      />

      {/* Matching Drawer */}
      <MatchingDrawer
        isOpen={isMatchingDrawerOpen}
        onClose={() => setIsMatchingDrawerOpen(false)}
        matchingClient={matchingClient}
        matchingProperty={null}
        matchingOpportunities={matchingOpportunities}
        handleSendWhatsAppNotification={handleSendWhatsAppNotification}
      />
    </div>
  );
};

export default ClientsPage;

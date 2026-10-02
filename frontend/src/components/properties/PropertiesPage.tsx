import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Printer, FileSpreadsheet, Plus, Image as ImageIcon } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import * as api from "../../api";
import { exportToCSV, printDocument } from "../../utils/csv";
import type { Property, User } from "../../types";
import PropertyModal from "./PropertyModal";
import MatchingDrawer from "../matching/MatchingDrawer";
import CloseDealModal from "../deals/CloseDealModal";

export interface PropertyCardProps {
  property: Property;
  currentUser?: User | null;
  onEdit?: (property: Property) => void;
  onDelete?: (id: string) => void;
  onToggleStatus?: (property: Property) => void;
  onFindMatches?: (property: Property) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property: p,
  currentUser,
  onEdit,
  onDelete,
  onToggleStatus,
  onFindMatches,
}) => {
  const { t } = useLanguage();

  const getFinishingLabel = (f: string) => {
    if (f === "SUPER_LUX") return t("superLux");
    if (f === "ULTRA_LUX") return t("ultraLux");
    if (f === "SEMI_FINISHED") return t("semiFinished");
    if (f === "UNFINISHED") return t("unfinished");
    return f;
  };

  let imageList: string[] = [];
  try {
    const parsed = JSON.parse(p.images);
    if (Array.isArray(parsed)) imageList = parsed;
  } catch {}

  const hasImages = imageList.length > 0;
  const firstImage = hasImages ? imageList[0] : null;

  return (
    <div key={p.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between">
      <div>
        {/* Image or Clean Placeholder */}
        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex items-center justify-center">
          {hasImages && firstImage ? (
            <img src={firstImage} alt="Unit" className="w-full h-full object-cover hover:scale-105 transition duration-300" />
          ) : (
            <div className="flex flex-col items-center justify-center p-4 text-slate-400">
              <ImageIcon className="w-12 h-12 stroke-[1.2] mb-1.5 text-slate-300 dark:text-slate-600" />
              <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">{t("noImageUploadedNotice")}</span>
            </div>
          )}

          <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 flex space-x-2 rtl:space-x-reverse">
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${p.listingType === 'SALE' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'}`}>
              {p.listingType === 'SALE' ? t("forSale") : t("forRent")}
            </span>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${p.status === 'AVAILABLE' ? 'bg-green-600 text-white' : 'bg-rose-500 text-white'}`}>
              {p.status === 'AVAILABLE' ? t("available") : p.status === 'SOLD' ? t("sold") : t("rented")}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 rtl:right-auto rtl:left-3 bg-slate-900/80 backdrop-blur-xs px-2.5 py-1 rounded-lg text-white text-[10px] font-mono font-semibold">
            {p.propertyId}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-800 dark:text-white line-clamp-1">{p.address}</h3>
            <p className="text-xs text-slate-400 font-medium">{t(p.type.toLowerCase() as any)} • {p.area} {t("sqm")} • {getFinishingLabel(p.finishing)}</p>
          </div>

          <div className="flex items-center justify-between border-t border-b border-slate-100 dark:border-slate-800 py-3 text-xs text-slate-500 font-medium">
            <span>{t("bedrooms")}: <strong className="text-slate-700 dark:text-slate-300">{p.bedrooms ?? "-"}</strong></span>
            <span>{t("bathrooms")}: <strong className="text-slate-700 dark:text-slate-300">{p.bathrooms ?? "-"}</strong></span>
            <span>{t("floorNumber")}: <strong className="text-slate-700 dark:text-slate-300">{p.floorNumber ?? "-"}</strong></span>
          </div>

          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-400 font-medium">{t("totalPrice")}</span>
            <span className="text-lg font-bold text-brand-600 dark:text-brand-300">{p.price.toLocaleString()} {t("egp")}</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800/40 p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex space-x-1.5 rtl:space-x-reverse">
          <button
            onClick={() => onEdit && onEdit(p)}
            className="px-2.5 py-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 transition"
          >
            {t("edit")}
          </button>
          {currentUser?.role !== "AGENT" && onDelete && (
            <button
              onClick={() => onDelete(p.id)}
              className="px-2.5 py-1.5 hover:bg-red-500 hover:text-white rounded-lg text-xs font-semibold text-red-500 transition"
            >
              {t("delete")}
            </button>
          )}
        </div>

        <div className="flex space-x-1.5 rtl:space-x-reverse">
          <button
            onClick={() => onToggleStatus && onToggleStatus(p)}
            className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-bold transition text-slate-700 dark:text-slate-300"
          >
            {t("toggleStatus")}
          </button>
          <button
            onClick={() => onFindMatches && onFindMatches(p)}
            className="bg-brand-600 hover:bg-brand-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md shadow-brand-500/10 transition"
          >
            {t("findMatches")}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PropertiesPage: React.FC = () => {
  const { language, t } = useLanguage();
  const { currentUser } = useAuth();
  const { properties, owners, brokers, fetchAllData, setToastMessage } = useAppData();

  const [searchParams] = useSearchParams();
  const [propertySearch, setPropertySearch] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const q = searchParams.get("search");
    if (q !== null) {
      setPropertySearch(q);
    }
  }, [searchParams]);

  const [propertyTypeFilter, setPropertyTypeFilter] = useState("ALL");
  const [propertyListingFilter, setPropertyListingFilter] = useState("ALL");

  // Modal State
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    propType: "APARTMENT",
    propListingType: "SALE",
    propAddress: "",
    propArea: "",
    propPrice: "",
    propBedrooms: "",
    propBathrooms: "",
    propFloorNumber: "",
    propFinishing: "SUPER_LUX",
    propFurnished: false,
    propOwnerId: "",
    propBrokerId: "",
    propImages: [] as string[],
    propDescription: "",
    propNotes: "",
    isUploadingImages: false,
  });

  // Matching Drawer State
  const [matchingProperty, setMatchingProperty] = useState<Property | null>(null);
  const [matchingOpportunities, setMatchingOpportunities] = useState<any[]>([]);
  const [isMatchingDrawerOpen, setIsMatchingDrawerOpen] = useState(false);

  // Close Deal Modal State
  const [closingDealProperty, setClosingDealProperty] = useState<Property | null>(null);
  const [isCloseDealModalOpen, setIsCloseDealModalOpen] = useState(false);

  const resetForm = () => {
    setFormData({
      propType: "APARTMENT",
      propListingType: "SALE",
      propAddress: "",
      propArea: "",
      propPrice: "",
      propBedrooms: "",
      propBathrooms: "",
      propFloorNumber: "",
      propFinishing: "SUPER_LUX",
      propFurnished: false,
      propOwnerId: owners[0]?.id || "",
      propBrokerId: "",
      propImages: [],
      propDescription: "",
      propNotes: "",
      isUploadingImages: false,
    });
  };

  const handleOpenAddModal = () => {
    setEditingProperty(null);
    resetForm();
    setIsPropertyModalOpen(true);
  };

  const handleEditProperty = (p: Property) => {
    setEditingProperty(p);
    let images: string[] = [];
    try {
      const parsed = JSON.parse(p.images);
      if (Array.isArray(parsed)) images = parsed;
    } catch {}

    setFormData({
      propType: p.type,
      propListingType: p.listingType,
      propAddress: p.address,
      propArea: String(p.area),
      propPrice: String(p.price),
      propBedrooms: p.bedrooms ? String(p.bedrooms) : "",
      propBathrooms: p.bathrooms ? String(p.bathrooms) : "",
      propFloorNumber: p.floorNumber ? String(p.floorNumber) : "",
      propFinishing: p.finishing,
      propFurnished: Boolean(p.furnished),
      propOwnerId: p.ownerId || "",
      propBrokerId: p.brokerId || "",
      propImages: images,
      propDescription: p.description || "",
      propNotes: p.notes || "",
      isUploadingImages: false,
    });
    setIsPropertyModalOpen(true);
  };

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setFormData((prev) => ({ ...prev, isUploadingImages: true }));
    try {
      const urls = await api.uploadImages(Array.from(files));
      setFormData((prev) => ({
        ...prev,
        propImages: [...prev.propImages, ...urls],
        isUploadingImages: false,
      }));
    } catch (err: any) {
      alert(err.message || "Failed to upload images");
      setFormData((prev) => ({ ...prev, isUploadingImages: false }));
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      propImages: prev.propImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmitProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propOwnerId) {
      alert(language === "ar" ? "يرجى اختيار المالك أولاً، أو إضافة مالك جديد إذا لم يوجد ملاك مسجلين." : "Please select an owner first.");
      return;
    }
    const payload = {
      type: formData.propType,
      listingType: formData.propListingType,
      address: formData.propAddress,
      area: Number(formData.propArea),
      bedrooms: formData.propBedrooms ? Number(formData.propBedrooms) : null,
      bathrooms: formData.propBathrooms ? Number(formData.propBathrooms) : null,
      floorNumber: formData.propFloorNumber ? Number(formData.propFloorNumber) : null,
      finishing: formData.propFinishing,
      furnished: formData.propFurnished,
      price: Number(formData.propPrice),
      images: formData.propImages,
      description: formData.propDescription,
      notes: formData.propNotes,
      ownerId: formData.propOwnerId,
      brokerId: formData.propBrokerId || null,
    };

    try {
      if (editingProperty) {
        await api.updateProperty(editingProperty.id, payload);
        if (setToastMessage) setToastMessage({ text: language === "ar" ? "تم تحديث بيانات العقار بنجاح" : "Property updated successfully", type: "success" });
      } else {
        await api.createProperty(payload);
        if (setToastMessage) setToastMessage({ text: language === "ar" ? "تمت إضافة العقار بنجاح" : "Property added successfully", type: "success" });
      }
      setIsPropertyModalOpen(false);
      fetchAllData();
    } catch (err: any) {
      alert(err.message || "Failed to save property");
    }
  };

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف هذا العقار؟" : "Are you sure?")) return;
    try {
      await api.deleteProperty(id);
      if (setToastMessage) setToastMessage({ text: language === "ar" ? "تم حذف العقار" : "Property deleted", type: "info" });
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleTogglePropertyStatus = async (p: Property) => {
    if (p.status === "AVAILABLE") {
      setClosingDealProperty(p);
      setIsCloseDealModalOpen(true);
    } else {
      try {
        await api.updateProperty(p.id, { status: "AVAILABLE" });
        fetchAllData();
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleFindMatches = async (p: Property) => {
    try {
      const matches = await api.getMatchingOpportunities({ propertyId: p.id });
      setMatchingProperty(p);
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

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const matchSearch =
        p.propertyId.toLowerCase().includes(propertySearch.toLowerCase()) ||
        p.address.toLowerCase().includes(propertySearch.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(propertySearch.toLowerCase())) ||
        p.price.toString().includes(propertySearch);

      const matchType = propertyTypeFilter === "ALL" || p.type === propertyTypeFilter;
      const matchListing = propertyListingFilter === "ALL" || p.listingType === propertyListingFilter;

      return matchSearch && matchType && matchListing;
    });
  }, [properties, propertySearch, propertyTypeFilter, propertyListingFilter]);

  return (
    <div className="space-y-6">
      {/* FILTERS & SEARCH HEADER */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 flex flex-wrap items-center gap-3">
          <div className="relative w-full max-w-xs">
            <Search className={`absolute ${language === "ar" ? "right-3" : "left-3"} top-3 w-4 h-4 text-slate-400`} />
            <input
              type="text"
              className={`w-full ${language === "ar" ? "pr-9 pl-4" : "pl-9 pr-4"} py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-brand-500`}
              placeholder={t("search")}
              value={propertySearch}
              onChange={(e) => setPropertySearch(e.target.value)}
            />
          </div>

          <select
            className="border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
            value={propertyTypeFilter}
            onChange={(e) => setPropertyTypeFilter(e.target.value)}
          >
            <option value="ALL">{t("allTypes")}</option>
            <option value="APARTMENT">{t("apartment")}</option>
            <option value="VILLA">{t("villa")}</option>
            <option value="OFFICE">{t("office")}</option>
            <option value="SHOP">{t("shop")}</option>
            <option value="LAND">{t("land")}</option>
          </select>

          <select
            className="border border-slate-200 dark:border-slate-800 px-3 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-800"
            value={propertyListingFilter}
            onChange={(e) => setPropertyListingFilter(e.target.value)}
          >
            <option value="ALL">{t("allListing")}</option>
            <option value="SALE">{t("forSale")}</option>
            <option value="RENT">{t("forRent")}</option>
          </select>
        </div>

        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <button
            onClick={() => printDocument()}
            className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse"
            title={t("print")}
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>{t("print")}</span>
          </button>
          <button
            onClick={() => exportToCSV(properties, "properties_export")}
            className="p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse"
            title={t("exportCsv")}
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>{t("exportCsv")}</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md shadow-brand-500/10"
          >
            <Plus className="w-4 h-4" />
            <span>{t("addProperty")}</span>
          </button>
        </div>
      </div>

      {/* LIST CARD GRID */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 text-sm font-medium">{t("noData")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((p) => (
            <PropertyCard
              key={p.id}
              property={p}
              currentUser={currentUser}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
              onToggleStatus={handleTogglePropertyStatus}
              onFindMatches={handleFindMatches}
            />
          ))}
        </div>
      )}

      {/* Property Modal */}
      <PropertyModal
        isOpen={isPropertyModalOpen}
        onClose={() => setIsPropertyModalOpen(false)}
        isEditing={Boolean(editingProperty)}
        propertyData={formData}
        owners={owners}
        brokers={brokers}
        handlers={{
          onSubmit: handleSubmitProperty,
          onChange: handleFieldChange,
          handleImageFileChange,
          handleRemoveImage,
        }}
      />

      {/* Matching Drawer */}
      <MatchingDrawer
        isOpen={isMatchingDrawerOpen}
        onClose={() => setIsMatchingDrawerOpen(false)}
        matchingClient={null}
        matchingProperty={matchingProperty}
        matchingOpportunities={matchingOpportunities}
        handleSendWhatsAppNotification={handleSendWhatsAppNotification}
      />

      {/* Close Deal Modal */}
      <CloseDealModal
        isOpen={isCloseDealModalOpen}
        onClose={() => setIsCloseDealModalOpen(false)}
        dealProperty={closingDealProperty}
        onSuccess={() => {
          setIsCloseDealModalOpen(false);
          fetchAllData();
        }}
      />
    </div>
  );
};

export default PropertiesPage;

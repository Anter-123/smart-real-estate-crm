import React, { useState } from "react";
import { UploadCloud, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import * as api from "../../api";
import type { Owner, Broker } from "../../types";

export interface PropertyFormData {
  propType?: string;
  type?: string;
  propListingType?: string;
  listingType?: string;
  propAddress?: string;
  address?: string;
  propArea?: string | number;
  area?: string | number;
  propPrice?: string | number;
  price?: string | number;
  propBedrooms?: string | number;
  bedrooms?: string | number;
  propBathrooms?: string | number;
  bathrooms?: string | number;
  propFloorNumber?: string | number;
  floorNumber?: string | number;
  propFinishing?: string;
  finishing?: string;
  propFurnished?: boolean;
  furnished?: boolean;
  propOwnerId?: string;
  ownerId?: string;
  propBrokerId?: string;
  brokerId?: string;
  propImages?: string[];
  images?: string[];
  propDescription?: string;
  description?: string;
  propNotes?: string;
  notes?: string;
  isUploadingImages?: boolean;
}

export interface PropertyModalHandlers {
  onSubmit: (e: React.FormEvent) => void;
  onChange?: (field: any, value?: any) => void;
  handleImageFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImageFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage?: (index: number) => void;
  onRemoveImage?: (index: number) => void;
  [key: string]: any;
}

export interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  propertyData: PropertyFormData;
  handlers: PropertyModalHandlers;
  owners?: Owner[];
  brokers?: Broker[];
}

const PropertyModal: React.FC<PropertyModalProps> = ({
  isOpen,
  onClose,
  isEditing,
  propertyData,
  handlers,
  owners = [],
  brokers = [],
}) => {
  const { language, t } = useLanguage();
  const [localUploading, setLocalUploading] = useState(false);

  if (!isOpen) return null;

  const propType = propertyData.propType ?? propertyData.type ?? "APARTMENT";
  const propListingType = propertyData.propListingType ?? propertyData.listingType ?? "SALE";
  const propAddress = propertyData.propAddress ?? propertyData.address ?? "";
  const propArea = propertyData.propArea ?? propertyData.area ?? "";
  const propPrice = propertyData.propPrice ?? propertyData.price ?? "";
  const propBedrooms = propertyData.propBedrooms ?? propertyData.bedrooms ?? "";
  const propBathrooms = propertyData.propBathrooms ?? propertyData.bathrooms ?? "";
  const propFloorNumber = propertyData.propFloorNumber ?? propertyData.floorNumber ?? "";
  const propFinishing = propertyData.propFinishing ?? propertyData.finishing ?? "SUPER_LUX";
  const propFurnished = propertyData.propFurnished ?? propertyData.furnished ?? false;
  const propOwnerId = propertyData.propOwnerId ?? propertyData.ownerId ?? "";
  const propBrokerId = propertyData.propBrokerId ?? propertyData.brokerId ?? "";
  const propImages = propertyData.propImages ?? propertyData.images ?? [];
  const propDescription = propertyData.propDescription ?? propertyData.description ?? "";
  const propNotes = propertyData.propNotes ?? propertyData.notes ?? "";
  const isUploadingImages = propertyData.isUploadingImages ?? localUploading;

  const handleFieldChange = (field: string, value: any, e?: React.ChangeEvent<any>) => {
    if (handlers.onChange) {
      if (handlers.onChange.length === 1 && e) {
        handlers.onChange(e);
      } else {
        handlers.onChange(field, value);
      }
    }
    const setterName = `set${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (typeof handlers[setterName] === "function") {
      handlers[setterName](value);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (handlers.handleImageFileChange) {
      return handlers.handleImageFileChange(e);
    }
    if (handlers.onImageFileChange) {
      return handlers.onImageFileChange(e);
    }
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLocalUploading(true);
    try {
      const fileList = Array.from(files);
      const urls = await api.uploadImages(fileList);
      const updatedImages = [...propImages, ...urls];
      handleFieldChange("propImages", updatedImages);
      handleFieldChange("images", updatedImages);
    } catch (err: any) {
      alert(err.message || (language === "ar" ? "فشل رفع الصور" : "Failed to upload images"));
    } finally {
      setLocalUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (handlers.handleRemoveImage) {
      return handlers.handleRemoveImage(indexToRemove);
    }
    if (handlers.onRemoveImage) {
      return handlers.onRemoveImage(indexToRemove);
    }
    const updatedImages = propImages.filter((_, idx) => idx !== indexToRemove);
    handleFieldChange("propImages", updatedImages);
    handleFieldChange("images", updatedImages);
  };

  const handlePropertySubmit = (e: React.FormEvent) => {
    handlers.onSubmit(e);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
          {isEditing ? t("editProperty") : t("addProperty")}
        </h3>
        
        <form onSubmit={handlePropertySubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("propertyType")}</label>
              <select
                name="propType"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propType}
                onChange={(e) => handleFieldChange("propType", e.target.value, e)}
              >
                <option value="APARTMENT">{t("apartment")}</option>
                <option value="VILLA">{t("villa")}</option>
                <option value="OFFICE">{t("office")}</option>
                <option value="SHOP">{t("shop")}</option>
                <option value="LAND">{t("land")}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("saleRent")}</label>
              <select
                name="propListingType"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propListingType}
                onChange={(e) => handleFieldChange("propListingType", e.target.value, e)}
              >
                <option value="SALE">{t("forSale")}</option>
                <option value="RENT">{t("forRent")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("address")}</label>
            <input
              type="text"
              name="propAddress"
              required
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={propAddress}
              onChange={(e) => handleFieldChange("propAddress", e.target.value, e)}
              placeholder={language === "ar" ? "مثال: مدينة نصر - شارع عباس العقاد" : "e.g. Nasr City - Abbas El Akkad"}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("area")}</label>
              <input
                type="number"
                name="propArea"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propArea}
                onChange={(e) => handleFieldChange("propArea", e.target.value, e)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("price")} ({t("egp")})</label>
              <input
                type="number"
                name="propPrice"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propPrice}
                onChange={(e) => handleFieldChange("propPrice", e.target.value, e)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("bedrooms")}</label>
              <input
                type="number"
                name="propBedrooms"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propBedrooms}
                onChange={(e) => handleFieldChange("propBedrooms", e.target.value, e)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("bathrooms")}</label>
              <input
                type="number"
                name="propBathrooms"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propBathrooms}
                onChange={(e) => handleFieldChange("propBathrooms", e.target.value, e)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("floorNumber")}</label>
              <input
                type="number"
                name="propFloorNumber"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propFloorNumber}
                onChange={(e) => handleFieldChange("propFloorNumber", e.target.value, e)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("finishing")}</label>
              <select
                name="propFinishing"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propFinishing}
                onChange={(e) => handleFieldChange("propFinishing", e.target.value, e)}
              >
                <option value="SUPER_LUX">{t("superLux")}</option>
                <option value="ULTRA_LUX">{t("ultraLux")}</option>
                <option value="SEMI_FINISHED">{t("semiFinished")}</option>
                <option value="UNFINISHED">{t("unfinished")}</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 rtl:space-x-reverse pt-6">
              <input
                type="checkbox"
                id="propFurnished"
                name="propFurnished"
                className="w-4 h-4 text-brand-600 rounded"
                checked={propFurnished}
                onChange={(e) => handleFieldChange("propFurnished", e.target.checked, e)}
              />
              <label htmlFor="propFurnished" className="text-slate-600 dark:text-slate-300 font-semibold">{t("furnished")}</label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("selectOwner")}</label>
              <select
                name="propOwnerId"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propOwnerId}
                onChange={(e) => handleFieldChange("propOwnerId", e.target.value, e)}
              >
                <option value="">-- {t("selectOwner")} --</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("selectBroker")}</label>
              <select
                name="propBrokerId"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
                value={propBrokerId}
                onChange={(e) => handleFieldChange("propBrokerId", e.target.value, e)}
              >
                <option value="">{t("directListing")}</option>
                {brokers.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DIRECT IMAGE FILE UPLOAD BOX */}
          <div className="space-y-2">
            <label className="block text-slate-400 font-semibold">{t("uploadImages")}</label>
            
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-center hover:border-brand-500 transition bg-slate-50/50 dark:bg-slate-800/40 relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isUploadingImages}
              />
              <div className="flex flex-col items-center justify-center space-y-2 py-2">
                <UploadCloud className="w-8 h-8 text-brand-500 animate-bounce" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {isUploadingImages ? t("uploading") : t("clickToUpload")}
                </p>
                <p className="text-[10px] text-slate-400">{t("maxUploadNotice")}</p>
              </div>
            </div>

            {/* Thumbnails of uploaded images */}
            {propImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2 pt-2">
                {propImages.map((url, idx) => (
                  <div key={idx} className="relative h-20 rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700">
                    <img src={url} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 rtl:right-auto rtl:left-1 bg-red-600/90 text-white p-1 rounded-full opacity-90 hover:opacity-100 transition"
                      title={t("remove")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("description")}</label>
            <textarea
              name="propDescription"
              rows={2}
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={propDescription}
              onChange={(e) => handleFieldChange("propDescription", e.target.value, e)}
            />
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">{t("notes")}</label>
            <input
              type="text"
              name="propNotes"
              className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800"
              value={propNotes}
              onChange={(e) => handleFieldChange("propNotes", e.target.value, e)}
            />
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isUploadingImages}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold disabled:opacity-50"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyModal;

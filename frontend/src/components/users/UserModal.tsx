import React from "react";
import { XCircle } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { usePermissionsInfo, DEFAULT_ROLE_PERMS } from "../../utils/permissions";
import type { User } from "../../types";

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  userNameInput: string;
  setUserNameInput: (v: string) => void;
  userEmailInput: string;
  setUserEmailInput: (v: string) => void;
  userPasswordInput: string;
  setUserPasswordInput: (v: string) => void;
  userPhoneInput: string;
  setUserPhoneInput: (v: string) => void;
  userRoleInput: string;
  setUserRoleInput: (v: string) => void;
  userPermissionsInput: string[];
  setUserPermissionsInput: (v: string[]) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  editingUser,
  userNameInput,
  setUserNameInput,
  userEmailInput,
  setUserEmailInput,
  userPasswordInput,
  setUserPasswordInput,
  userPhoneInput,
  setUserPhoneInput,
  userRoleInput,
  setUserRoleInput,
  userPermissionsInput,
  setUserPermissionsInput,
  onSubmit,
}) => {
  const { t } = useLanguage();
  const { ALL_PERMISSIONS } = usePermissionsInfo();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">
              {editingUser ? t("editUser") : t("addUser")}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{t("usersManagementDesc")}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("userName")} *</label>
              <input
                type="text"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="e.g. Mahmoud Ahmed"
                value={userNameInput}
                onChange={(e) => setUserNameInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("emailAddress")} *</label>
              <input
                type="email"
                required
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="user@smartcrm.com"
                value={userEmailInput}
                onChange={(e) => setUserEmailInput(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                {t("passwordLabel")} {editingUser ? `(${t("passwordEditHint")})` : "*"}
              </label>
              <input
                type="password"
                required={!editingUser}
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="••••••••"
                value={userPasswordInput}
                onChange={(e) => setUserPasswordInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">{t("phoneOptional")}</label>
              <input
                type="text"
                className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                placeholder="01012345678"
                value={userPhoneInput}
                onChange={(e) => setUserPhoneInput(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">{t("userRole")} *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "ADMIN", label: t("roleAdmin"), desc: t("roleAdminDesc") },
                { id: "MANAGER", label: t("roleManager"), desc: t("roleManagerDesc") },
                { id: "AGENT", label: t("roleAgent"), desc: t("roleAgentDesc") },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setUserRoleInput(r.id);
                    setUserPermissionsInput(DEFAULT_ROLE_PERMS[r.id] || []);
                  }}
                  className={`p-2.5 rounded-xl border text-center transition ${
                    userRoleInput === r.id
                      ? "border-brand-500 bg-brand-50/50 dark:bg-brand-950/30 text-brand-600 dark:text-brand-400 font-bold"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="block text-[11px] font-bold">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Granular Permissions Checklist */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{t("customPermissions")}</h4>
                <p className="text-[10px] text-slate-400">{t("customPermissionsDesc")}</p>
              </div>
              <div className="flex items-center space-x-1.5 rtl:space-x-reverse text-[10px]">
                <button
                  type="button"
                  onClick={() => setUserPermissionsInput(ALL_PERMISSIONS.map((p) => p.id))}
                  className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
                >
                  {t("selectAllPerms")}
                </button>
                <span className="text-slate-300 dark:text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => setUserPermissionsInput([])}
                  className="text-slate-400 hover:underline"
                >
                  {t("deselectAllPerms")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
              {ALL_PERMISSIONS.map((perm) => {
                const isChecked = userPermissionsInput.includes(perm.id);
                return (
                  <label
                    key={perm.id}
                    className={`flex items-center space-x-2.5 rtl:space-x-reverse p-2.5 rounded-xl border cursor-pointer select-none transition ${
                      isChecked
                        ? "bg-brand-50/40 dark:bg-brand-950/20 border-brand-300 dark:border-brand-800 text-slate-800 dark:text-slate-200"
                        : "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-800 text-slate-500 opacity-75 hover:opacity-100"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-brand-600 rounded focus:ring-0"
                      checked={isChecked}
                      onChange={() => {
                        if (isChecked) {
                          setUserPermissionsInput(userPermissionsInput.filter((p) => p !== perm.id));
                        } else {
                          setUserPermissionsInput([...userPermissionsInput, perm.id]);
                        }
                      }}
                    />
                    <span className="text-[11px] font-semibold">{t(perm.labelKey as any)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-2 rtl:space-x-reverse pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-semibold shadow-md"
            >
              {t("save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;

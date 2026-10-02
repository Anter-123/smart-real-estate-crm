import React, { useState } from "react";
import { Users, User as UserIcon, Briefcase, UserCheck, Plus, Settings, Trash2 } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useAppData } from "../../context/AppDataContext";
import { useAuth } from "../../context/AuthContext";
import { DEFAULT_ROLE_PERMS } from "../../utils/permissions";
import * as api from "../../api";
import type { User } from "../../types";
import UserModal from "./UserModal";

export const UsersPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { usersList, fetchAllData, setToastMessage } = useAppData();
  const { currentUser } = useAuth();

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [userNameInput, setUserNameInput] = useState("");
  const [userEmailInput, setUserEmailInput] = useState("");
  const [userPasswordInput, setUserPasswordInput] = useState("");
  const [userPhoneInput, setUserPhoneInput] = useState("");
  const [userRoleInput, setUserRoleInput] = useState("AGENT");
  const [userPermissionsInput, setUserPermissionsInput] = useState<string[]>(DEFAULT_ROLE_PERMS["AGENT"]);

  const clearUserForm = () => {
    setEditingUser(null);
    setUserNameInput("");
    setUserEmailInput("");
    setUserPasswordInput("");
    setUserPhoneInput("");
    setUserRoleInput("AGENT");
    setUserPermissionsInput(DEFAULT_ROLE_PERMS["AGENT"]);
  };

  const handleOpenAddModal = () => {
    clearUserForm();
    setIsUserModalOpen(true);
  };

  const handleEditUser = (u: User) => {
    setEditingUser(u);
    setUserNameInput(u.name);
    setUserEmailInput(u.email);
    setUserPasswordInput("");
    setUserPhoneInput(u.phone || "");
    setUserRoleInput(u.role);
    let perms: string[] = [];
    try {
      if (u.permissions) {
        const parsed = JSON.parse(u.permissions);
        if (Array.isArray(parsed)) perms = parsed;
      }
    } catch {
      perms = DEFAULT_ROLE_PERMS[u.role] || [];
    }
    setUserPermissionsInput(perms.length > 0 ? perms : DEFAULT_ROLE_PERMS[u.role] || []);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: userNameInput,
      email: userEmailInput,
      password: userPasswordInput || undefined,
      phone: userPhoneInput || null,
      role: userRoleInput,
      permissions: userPermissionsInput,
    };

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, payload);
        if (setToastMessage) {
          setToastMessage({ text: language === "ar" ? "تم تحديث بيانات المستخدم" : "User updated", type: "success" });
        }
      } else {
        if (!userPasswordInput) {
          alert(language === "ar" ? "كلمة المرور مطلوبة لإضافة مستخدم جديد" : "Password is required for new user");
          return;
        }
        await api.createUser(payload);
        if (setToastMessage) {
          setToastMessage({ text: language === "ar" ? "تمت إضافة المستخدم بنجاح" : "User created", type: "success" });
        }
      }
      setIsUserModalOpen(false);
      clearUserForm();
      fetchAllData();
    } catch (err: any) {
      alert(err.message || "Failed to save user");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      alert(language === "ar" ? "لا يمكنك حذف حسابك الشخصي" : "You cannot delete your own account");
      return;
    }
    if (!window.confirm(language === "ar" ? "هل أنت متأكد من حذف هذا المستخدم؟" : "Are you sure?")) return;
    try {
      await api.deleteUser(id);
      if (setToastMessage) {
        setToastMessage({ text: language === "ar" ? "تم حذف المستخدم" : "User deleted", type: "info" });
      }
      fetchAllData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">{t("totalUsersCount")}</span>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mt-1">{usersList.length}</h3>
          </div>
          <div className="p-3 bg-brand-50 dark:bg-brand-950/40 rounded-xl text-brand-600 dark:text-brand-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">{t("adminsCount")}</span>
            <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mt-1">
              {usersList.filter((u) => u.role === "ADMIN").length}
            </h3>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-purple-600 dark:text-purple-400">
            <UserIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">{t("managersCount")}</span>
            <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {usersList.filter((u) => u.role === "MANAGER").length}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl text-blue-600 dark:text-blue-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">{t("agentsCount")}</span>
            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {usersList.filter((u) => u.role === "AGENT").length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{t("usersManagement" as any)}</h3>
            <p className="text-xs text-slate-400 mt-1">{t("usersManagementDesc" as any)}</p>
          </div>
          {currentUser?.role === "ADMIN" && (
            <button
              onClick={handleOpenAddModal}
              className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 rtl:space-x-reverse shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{t("addUser" as any)}</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                <th className="p-4">{t("userName" as any) || t("name" as any)}</th>
                <th className="p-4">{t("emailAddress")}</th>
                <th className="p-4">{t("userRole" as any) || t("role" as any)}</th>
                <th className="p-4">{t("phoneNumber" as any) || t("phone" as any)}</th>
                <th className="p-4 text-right rtl:text-left">{t("actions" as any)}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {usersList.map((u) => {
                let roleBadgeColor = "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
                let roleName = t("agent");
                if (u.role === "ADMIN") {
                  roleBadgeColor = "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800";
                  roleName = t("admin");
                } else if (u.role === "MANAGER") {
                  roleBadgeColor = "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800";
                  roleName = t("manager");
                }

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-slate-800 dark:text-white flex items-center space-x-2 rtl:space-x-reverse">
                      <span>{u.name}</span>
                      {currentUser?.id === u.id && (
                        <span className="text-[10px] bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 px-1.5 py-0.5 rounded font-bold">
                          {t("you" as any) || "أنت"}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 font-mono text-[11px]">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${roleBadgeColor}`}>
                        {roleName}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">{u.phone || "—"}</td>
                    <td className="p-4 text-right rtl:text-left">
                      <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                        <button
                          onClick={() => handleEditUser(u)}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
                          title={t("edit")}
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-500 transition"
                            title={t("delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        editingUser={editingUser}
        userNameInput={userNameInput}
        setUserNameInput={setUserNameInput}
        userEmailInput={userEmailInput}
        setUserEmailInput={setUserEmailInput}
        userPasswordInput={userPasswordInput}
        setUserPasswordInput={setUserPasswordInput}
        userPhoneInput={userPhoneInput}
        setUserPhoneInput={setUserPhoneInput}
        userRoleInput={userRoleInput}
        setUserRoleInput={(newRole) => {
          setUserRoleInput(newRole);
          setUserPermissionsInput(DEFAULT_ROLE_PERMS[newRole] || []);
        }}
        userPermissionsInput={userPermissionsInput}
        setUserPermissionsInput={setUserPermissionsInput}
        onSubmit={handleSaveUser}
      />
    </div>
  );
};

export default UsersPage;

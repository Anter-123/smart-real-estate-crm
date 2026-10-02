import type { User } from "../types";
import { useMemo } from "react";

export const usePermissionsInfo = () => {
  const ALL_PERMISSIONS = useMemo(
    () => [
      { id: "properties_manage", labelKey: "perm_properties" },
      { id: "clients_manage", labelKey: "perm_clients" },
      { id: "owners_manage", labelKey: "perm_owners" },
      { id: "brokers_manage", labelKey: "perm_brokers" },
      { id: "deals_close", labelKey: "perm_deals" },
      { id: "revenue_view", labelKey: "perm_revenue" },
      { id: "whatsapp_manage", labelKey: "perm_whatsapp" },
      { id: "reminders_manage", labelKey: "perm_reminders" },
      { id: "audit_view", labelKey: "perm_audit" },
      { id: "users_manage", labelKey: "perm_users" },
    ],
    []
  );

  return { ALL_PERMISSIONS };
};

export const DEFAULT_ROLE_PERMS: Record<string, string[]> = {
  ADMIN: [
    "properties_manage",
    "clients_manage",
    "owners_manage",
    "brokers_manage",
    "deals_close",
    "revenue_view",
    "whatsapp_manage",
    "reminders_manage",
    "audit_view",
    "users_manage",
  ],
  MANAGER: [
    "properties_manage",
    "clients_manage",
    "owners_manage",
    "brokers_manage",
    "deals_close",
    "revenue_view",
    "whatsapp_manage",
    "reminders_manage",
  ],
  AGENT: ["properties_manage", "clients_manage", "whatsapp_manage", "reminders_manage"],
};

export const checkPermission = (currentUser: User | null, permId: string): boolean => {
  if (!currentUser) return false;
  if (currentUser.role === "ADMIN") return true;

  // Check custom permissions array if present
  let userPerms: string[] = [];
  if (currentUser.permissions) {
    try {
      userPerms = typeof currentUser.permissions === "string" ? JSON.parse(currentUser.permissions) : currentUser.permissions;
    } catch {}
  } else {
    userPerms = DEFAULT_ROLE_PERMS[currentUser.role] || [];
  }

  return Array.isArray(userPerms) && userPerms.includes(permId);
};

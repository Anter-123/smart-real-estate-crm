import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as api from "../api";
import { useAuth } from "../context/AuthContext";
import type { Property, Client, Owner, Broker, Reminder, Deal, User, WhatsAppLog, AuditLog } from "../types";

// ============================================================================
// QUERY KEYS
// ============================================================================
export const QUERY_KEYS = {
  properties: ["properties"] as const,
  property: (id: string) => ["properties", id] as const,
  owners: ["owners"] as const,
  owner: (id: string) => ["owners", id] as const,
  clients: ["clients"] as const,
  client: (id: string) => ["clients", id] as const,
  brokers: ["brokers"] as const,
  reminders: ["reminders"] as const,
  dashboardStats: ["dashboard", "stats"] as const,
  deals: ["deals"] as const,
  users: ["users"] as const,
  auditLogs: ["auditLogs"] as const,
  whatsappTemplate: ["whatsapp", "template"] as const,
  whatsappLogs: ["whatsapp", "logs"] as const,
  matching: (params: any) => ["matching", params] as const,
};

// ============================================================================
// QUERIES WITH CACHING (staleTime: 5 min default, gcTime: 15 min)
// ============================================================================

export function usePropertiesQuery() {
  const { token } = useAuth();
  return useQuery<Property[]>({
    queryKey: QUERY_KEYS.properties,
    queryFn: () => api.getProperties(),
    enabled: Boolean(token),
  });
}

export function useOwnersQuery() {
  const { token } = useAuth();
  return useQuery<Owner[]>({
    queryKey: QUERY_KEYS.owners,
    queryFn: () => api.getOwners(),
    enabled: Boolean(token),
  });
}

export function useClientsQuery() {
  const { token } = useAuth();
  return useQuery<Client[]>({
    queryKey: QUERY_KEYS.clients,
    queryFn: () => api.getClients(),
    enabled: Boolean(token),
  });
}

export function useBrokersQuery() {
  const { token } = useAuth();
  return useQuery<Broker[]>({
    queryKey: QUERY_KEYS.brokers,
    queryFn: () => api.getBrokers(),
    enabled: Boolean(token),
  });
}

export function useRemindersQuery() {
  const { token } = useAuth();
  return useQuery<Reminder[]>({
    queryKey: QUERY_KEYS.reminders,
    queryFn: () => api.getReminders(),
    enabled: Boolean(token),
  });
}

export function useDashboardStatsQuery() {
  const { token } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats,
    queryFn: () => api.getDashboardStats(),
    enabled: Boolean(token),
  });
}

export function useDealsQuery() {
  const { token } = useAuth();
  return useQuery<Deal[]>({
    queryKey: QUERY_KEYS.deals,
    queryFn: () => api.getDeals(),
    enabled: Boolean(token),
  });
}

export function useUsersQuery() {
  const { token, currentUser } = useAuth();
  return useQuery<User[]>({
    queryKey: QUERY_KEYS.users,
    queryFn: () => api.getUsers(),
    enabled: Boolean(token && currentUser?.role === "ADMIN"),
  });
}

export function useAuditLogsQuery() {
  const { token } = useAuth();
  return useQuery<AuditLog[]>({
    queryKey: QUERY_KEYS.auditLogs,
    queryFn: () => api.getAuditLogs(),
    enabled: Boolean(token),
  });
}

export function useWhatsAppTemplateQuery() {
  const { token } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.whatsappTemplate,
    queryFn: () => api.getWhatsAppTemplate(),
    enabled: Boolean(token),
  });
}

export function useWhatsAppLogsQuery() {
  const { token } = useAuth();
  return useQuery<WhatsAppLog[]>({
    queryKey: QUERY_KEYS.whatsappLogs,
    queryFn: () => api.getWhatsAppLogs(),
    enabled: Boolean(token),
  });
}

export function useMatchingOpportunitiesQuery(params: { clientId?: string; propertyId?: string } = {}) {
  const { token } = useAuth();
  return useQuery({
    queryKey: QUERY_KEYS.matching(params),
    queryFn: () => api.getMatchingOpportunities(params),
    enabled: Boolean(token),
  });
}

// ============================================================================
// MUTATIONS WITH AUTOMATIC CACHE INVALIDATION
// ============================================================================

export function usePropertyMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    queryClient.invalidateQueries({ queryKey: ["matching"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createProperty(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateProperty(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProperty(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, invalidate };
}

export function useOwnerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.owners });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createOwner(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateOwner(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteOwner(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, invalidate };
}

export function useClientMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.clients });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
    queryClient.invalidateQueries({ queryKey: ["matching"] });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createClient(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateClient(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteClient(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, invalidate };
}

export function useBrokerMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.brokers });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createBroker(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateBroker(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteBroker(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, invalidate };
}

export function useReminderMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.reminders });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createReminder(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateReminder(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteReminder(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, invalidate };
}

export function useDealMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.deals });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.properties });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.dashboardStats });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createDeal(data),
    onSuccess: invalidate,
  });

  return { createMutation, invalidate };
}

export function useUserMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.users });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createUser(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.updateUser(id, data),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: invalidate,
  });

  return { createMutation, updateMutation, deleteMutation, invalidate };
}

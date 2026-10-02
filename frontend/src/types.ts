export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'AGENT';
  phone?: string;
  permissions?: string;
}

export interface Owner {
  id: string;
  ownerId: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address?: string;
  nationalId?: string;
  notes?: string;
  createdAt: string;
  properties?: Property[];
}

export interface Broker {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  commissionPct: number;
  createdAt: string;
  properties?: Property[];
  clients?: Client[];
  deals?: Deal[];
}

export interface Property {
  id: string;
  propertyId: string;
  type: 'APARTMENT' | 'VILLA' | 'OFFICE' | 'SHOP' | 'LAND';
  listingType: 'SALE' | 'RENT';
  address: string;
  area: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  floorNumber?: number | null;
  finishing: 'SUPER_LUX' | 'ULTRA_LUX' | 'SEMI_FINISHED' | 'UNFINISHED';
  furnished: boolean;
  price: number;
  images: string; // JSON string representing array of image URLs
  videos?: string | null;
  description?: string;
  status: 'AVAILABLE' | 'SOLD' | 'RENTED';
  notes?: string;
  dateAdded: string;
  agentId?: string | null;
  agent?: User | null;
  ownerId: string;
  owner?: Owner;
  brokerId?: string | null;
  broker?: Broker | null;
}

export interface Requirement {
  id: string;
  clientId: string;
  listingType: 'SALE' | 'RENT';
  type: 'APARTMENT' | 'VILLA' | 'OFFICE' | 'SHOP' | 'LAND';
  preferredAreas: string; // JSON array of strings
  minBudget?: number | null;
  maxBudget?: number | null;
  minArea?: number | null;
  bedrooms?: number | null;
  furnished?: boolean | null;
  notes?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface Client {
  id: string;
  clientId: string;
  name: string;
  phone: string;
  whatsapp: string;
  email?: string;
  clientType: 'BUYER' | 'TENANT' | 'INVESTOR';
  pipelineStep: 'NEW' | 'INTERESTED' | 'NEGOTIATING' | 'CLOSED' | 'LOST';
  createdAt: string;
  agentId?: string | null;
  agent?: User | null;
  brokerId?: string | null;
  broker?: Broker | null;
  requirements?: Requirement | null;
}

export interface Deal {
  id: string;
  dealId: string;
  amount: number;
  commission: number;
  brokerId?: string | null;
  broker?: Broker | null;
  propertyId: string;
  clientId: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  time: string;
  status: 'PENDING' | 'COMPLETED';
  clientId?: string | null;
  client?: Client | null;
  userId: string;
  user?: User;
  createdAt: string;
}

export interface WhatsAppLog {
  id: string;
  clientId: string;
  client?: Client;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  direction: 'OUTBOUND';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  action: string;
  details: string; // JSON string
  createdAt: string;
}

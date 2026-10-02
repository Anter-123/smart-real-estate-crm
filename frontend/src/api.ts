const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

function getHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errMsg = "Request failed";
    try {
      const errData = await response.json();
      errMsg = errData.message || errMsg;
    } catch (e) {
      // ignore
    }
    throw new Error(errMsg);
  }
  return response.json() as Promise<T>;
}


  // Auth
export async function login(email: string, password: string): Promise<{ token: string; user: any }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  }

export async function getMe(): Promise<any> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // Upload Images
export async function uploadImages(files: File[]): Promise<string[]> {
    const formData = new FormData();
    for (const f of files) {
      formData.append("images", f);
    }
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      headers,
      body: formData,
    });
    const data = await handleResponse<{ urls: string[] }>(res);
    return data.urls;
  }

  // Properties
export async function getProperties(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/properties`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function createProperty(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/properties`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function updateProperty(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function deleteProperty(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/properties/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // Owners
export async function getOwners(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/owners`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function createOwner(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/owners`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function updateOwner(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/owners/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function deleteOwner(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/owners/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // Clients
export async function getClients(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/clients`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function createClient(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/clients`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function updateClient(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function deleteClient(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/clients/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // Brokers
export async function getBrokers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/brokers`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function createBroker(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/brokers`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function updateBroker(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/brokers/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function deleteBroker(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/brokers/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // Reminders
export async function getReminders(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/reminders`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function createReminder(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function updateReminder(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function deleteReminder(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // Smart Matching Opportunities
export async function getMatchingOpportunities(params: { clientId?: string; propertyId?: string }): Promise<any[]> {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_BASE}/matching/opportunities?${query}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // WhatsApp
export async function getWhatsAppTemplate(): Promise<{ templateAr: string; templateEn: string; template: string }> {
    const res = await fetch(`${API_BASE}/whatsapp/templates`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function saveWhatsAppTemplate(data: { templateAr?: string; templateEn?: string; template?: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/whatsapp/templates`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function getWhatsAppLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/whatsapp/logs`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function sendWhatsAppAlert(clientId: string, propertyId: string, lang: string = "ar"): Promise<{ success: boolean; waLink: string; log: any }> {
    const res = await fetch(`${API_BASE}/whatsapp/send-alert`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ clientId, propertyId, lang }),
    });
    return handleResponse(res);
  }

  // Dashboard Stats
export async function getDashboardStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // User Management (Admin)
export async function getUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/users`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function createUser(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function updateUser(id: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

export async function deleteUser(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

  // Deals & Commissions
export async function getDeals(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/deals`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }

export async function createDeal(data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/deals`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }

  // Audit Logs
export async function getAuditLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  }


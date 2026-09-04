const API_BASE = (import.meta.env.VITE_BACKEND_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '') + '/api/v1'
let accessToken: string | null = localStorage.getItem('repair-link-access-token')
export const setAccessToken = (token: string | null) => { accessToken = token; if (token) localStorage.setItem('repair-link-access-token', token); else localStorage.removeItem('repair-link-access-token') }

export const developmentActors = {
  consumer: { id: '00000000-0000-4000-8000-000000000001', name: 'Nimal Fernando' },
  technician: { id: '00000000-0000-4000-8000-000000000002', name: 'Kamal Device Care' },
  seller: { id: '00000000-0000-4000-8000-000000000003', name: 'Ruwan Perera' },
  admin: { id: '00000000-0000-4000-8000-000000000004', name: 'Repair Link Admin' },
} as const

export async function apiRequest<T>(path: string, options: RequestInit = {}, role?: keyof typeof developmentActors): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  else if (role) {
    const actor = developmentActors[role]
    headers.set('x-dev-actor-id', actor.id)
    headers.set('x-dev-actor-name', actor.name)
    headers.set('x-dev-actor-role', role)
  }
  const response = await fetch(`${API_BASE}${path}`, { ...options, headers })
  const payload = await response.json() as { success?: boolean; data?: T; message?: string; errors?: string[] }
  if (!response.ok || payload.success === false) throw new Error(payload.message ?? payload.errors?.join(', ') ?? 'API request failed')
  return payload.data as T
}

export type AuthUser = { id: string; email: string; name: string; role: keyof typeof developmentActors }
export type AuthResult = { token: string; user: AuthUser }
export const register = (input: { email: string; password: string; displayName: string; role: 'consumer' | 'technician' | 'seller' }) => apiRequest<AuthResult>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
export const login = (input: { email: string; password: string }) => apiRequest<AuthResult>('/auth/login', { method: 'POST', body: JSON.stringify(input) })
export const getCurrentUser = () => apiRequest<{ user: AuthUser }>('/auth/me')

export type ApiPart = { id: string; name: string; sku: string; price: number; quantity: number; condition: 'new' | 'compatible' | 'refurbished' | 'used'; isActive: boolean }
export const listParts = (query = '') => apiRequest<{ total: number; parts: ApiPart[] }>(`/parts${query ? `?query=${encodeURIComponent(query)}` : ''}`)
export const placePartOrder = (listingId: string, quantity: number, role: keyof typeof developmentActors = 'consumer') => apiRequest(`/orders`, { method: 'POST', body: JSON.stringify({ listingId, quantity, shippingAddress: 'Colombo, Sri Lanka', contactPhone: '0770000000' }) }, role)
export const createRepairRequest = (input: { categoryId: string; deviceBrand?: string; deviceModel?: string; issueDescription: string; preferredMethod: 'on_site' | 'pickup_dropoff' | 'shop_visit'; locationText: string; preferredAt?: string; budgetAmount?: number }) => apiRequest<{ id: string }>('/repair-requests', { method: 'POST', body: JSON.stringify(input) }, 'consumer')
export const listRepairRequests = () => apiRequest<Array<{ id: string; deviceBrand?: string | null; deviceModel?: string | null; issueDescription: string; locationText: string; preferredMethod: string; budgetAmount?: string | null; status: RepairStatus }>>('/repair-requests', {}, 'consumer')
type RepairStatus = 'requested' | 'quoted' | 'booked' | 'in_progress' | 'waiting_for_parts' | 'completed' | 'cancelled' | 'disputed'
export const createRepairQuote = (requestId: string, amount: number) => apiRequest(`/repair-requests/${requestId}/quotes`, { method: 'POST', body: JSON.stringify({ amount, message: 'Quote sent from the technician workspace.', estimatedDurationHours: 3 }) }, 'technician')
export const acceptRepairQuote = (requestId: string, quoteId: string) => apiRequest(`/repair-requests/${requestId}/accept-quote/${quoteId}`, { method: 'POST', body: JSON.stringify({ scheduledAt: new Date(Date.now() + 86400000).toISOString() }) }, 'consumer')
export const updateRepairStatus = (requestId: string, status: RepairStatus) => apiRequest(`/repair-requests/${requestId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, 'technician')
export const updatePartOrderStatus = (orderId: string, status: string) => apiRequest(`/orders/${orderId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, 'seller')
export const createPartListing = (input: { name: string; sku: string; price: number; quantity: number; condition: string }) => apiRequest<ApiPart>('/parts', { method: 'POST', body: JSON.stringify({ ...input, categoryId: '00000000-0000-4000-8000-000000000010', compatibleDevices: 'General compatible devices', condition: input.condition.toLowerCase(), deliveryOptions: ['Courier'], images: [] }) }, 'seller')
export const updatePartListing = (id: string, input: Record<string, unknown>) => apiRequest<ApiPart>(`/parts/${id}`, { method: 'PATCH', body: JSON.stringify(input) }, 'seller')
export const archivePartListing = (id: string) => apiRequest(`/parts/${id}`, { method: 'DELETE' }, 'seller')
export const verifyTechnician = (id: string, status: 'verified' | 'rejected') => apiRequest(`/admin/technicians/${id}/verification`, { method: 'PATCH', body: JSON.stringify({ status }) }, 'admin')
export const listAdminReports = () => apiRequest<Array<{ id: string; status: string; reason: string; targetType: string; targetId: string }>>('/admin/reports', {}, 'admin')
export const resolveAdminReport = (id: string, status: 'resolved' | 'dismissed', resolutionNote?: string) => apiRequest(`/admin/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status, resolutionNote }) }, 'admin')
export const updateTechnicianProfile = (id: string, input: Record<string, unknown>) => apiRequest(`/technician-profiles/${id}`, { method: 'PATCH', body: JSON.stringify(input) }, 'technician')
export const updateSellerProfile = (id: string, input: Record<string, unknown>) => apiRequest(`/seller-profiles/${id}`, { method: 'PATCH', body: JSON.stringify(input) }, 'seller')
export type ApiCategory = { id: string; name: string; slug: string; isActive: boolean }
export const listCategories = () => apiRequest<ApiCategory[]>('/categories')
export const createCategory = (input: { name: string; slug: string }) => apiRequest<ApiCategory>('/categories', { method: 'POST', body: JSON.stringify(input) }, 'admin')
export const updateCategory = (id: string, input: Record<string, unknown>) => apiRequest<ApiCategory>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(input) }, 'admin')
export const deleteCategory = (id: string) => apiRequest<ApiCategory>(`/categories/${id}`, { method: 'DELETE' }, 'admin')

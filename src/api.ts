const BASE_URL = 'https://omatek-backend.onrender.com'

// ── Core fetch helper ────────────────────────────────────────────────────────

const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token')

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    'Authorization': `bearer ${token}`,
  }

  // Never manually set Content-Type for FormData
  // Browser sets it automatically with the correct boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  })
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export const login = async (email: string, password: string) => {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Login failed')
  }
  const data = await res.json()

  // Backend returns accessToken (camelCase) or access_token (snake_case)
  localStorage.setItem('token', data.accessToken ?? data.access_token)
  localStorage.setItem('user', JSON.stringify(data.user))

  return data
}

export const logout = async () => {
  try {
    await authFetch('/api/auth/logout', { method: 'POST' })
  } catch (_) {
    // Swallow — clear local state regardless
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// Backward-compat alias
export const logoutApi = logout

export const getMe = async () => {
  const res = await authFetch('/api/auth/me')
  if (!res.ok) throw new Error('Failed to get user')
  return res.json()
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardMetrics = async () => {
  const res = await authFetch('/api/dashboard/metrics')
  if (!res.ok) throw new Error('Failed to fetch metrics')
  return res.json()
  // Returns: { revenue, expenses, newClients, sharePrice,
  //            marketCap, totalDocuments, totalReports,
  //            latestHealthScore, anomalyCount }
}

export const getDashboardCharts = async () => {
  const res = await authFetch('/api/dashboard/charts')
  if (!res.ok) throw new Error('Failed to fetch chart data')
  return res.json()
  // Returns: { revenueTrend, expenseTrend, healthScores }
}

export const getDashboardTrends = async () => {
  const res = await authFetch('/api/dashboard/trends')
  if (!res.ok) throw new Error('Failed to fetch trends')
  return res.json()
}

// ── Documents ────────────────────────────────────────────────────────────────

export const getDocuments = async (params?: {
  search?: string
  type?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}) => {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
  const res = await authFetch(`/api/documents${query ? `?${query}` : ''}`)
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json()
}

export const getDocument = async (id: number) => {
  const res = await authFetch(`/api/documents/${id}`)
  if (!res.ok) throw new Error('Failed to fetch document')
  return res.json()
}

export const uploadDocument = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  // authFetch handles FormData detection and skips Content-Type
  const res = await authFetch('/api/documents/upload', {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as Record<string, string>).detail || 'Upload failed')
  }
  return res.json()
  // Returns: { jobId, documentId }
}

export const pollJobStatus = async (jobId: string) => {
  // No auth header needed for this endpoint
  const res = await fetch(`${BASE_URL}/api/documents/upload/${jobId}/status`)
  if (!res.ok) throw new Error('Failed to poll job status')
  return res.json()
  // Returns: { status, currentStep, progress (0-100), result, error }
  // Steps: parsing_structure → extracting_metrics →
  //        identifying_discrepancies → generating_summary → complete
}

export const downloadDocument = async (id: number) => {
  const res = await authFetch(`/api/documents/${id}/download`)
  if (!res.ok) throw new Error('Download failed')
  const data = await res.json()
  // Backend returns a presigned S3 URL — open it directly
  window.open(data.downloadUrl, '_blank')
}

// Backward-compat alias
export const openDocument = downloadDocument

export const deleteDocument = async (id: number) => {
  const res = await authFetch(`/api/documents/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete document')
  return res.json()
}

// ── Analysis ─────────────────────────────────────────────────────────────────

export const getAnalysisMetrics = async () => {
  const res = await authFetch('/api/analysis/metrics')
  if (!res.ok) throw new Error('Failed to fetch analysis metrics')
  return res.json()
  // Returns: { profit, market, operations, debt } — arrays of { period, value }
}

export const getDiscrepancies = async (params?: {
  level?: string
  dateFrom?: string
  dateTo?: string
  confidence?: number
  page?: number
  limit?: number
}) => {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
  const res = await authFetch(`/api/analysis/discrepancies${query ? `?${query}` : ''}`)
  if (!res.ok) throw new Error('Failed to fetch discrepancies')
  return res.json()
}

export const getDiscrepancy = async (id: string) => {
  // ID format: FR-0001-2  (report 1, anomaly index 2)
  const res = await authFetch(`/api/analysis/discrepancies/${id}`)
  if (!res.ok) throw new Error('Failed to fetch discrepancy')
  return res.json()
}

export const resolveDiscrepancy = async (id: string, note: string) => {
  const res = await authFetch(`/api/analysis/discrepancies/${id}/resolve`, {
    method: 'PUT',
    body: JSON.stringify({ resolution_note: note }),
  })
  if (!res.ok) throw new Error('Failed to resolve discrepancy')
  return res.json()
}

export const getIngestionLog = async () => {
  const res = await authFetch('/api/analysis/ingestion-log')
  if (!res.ok) throw new Error('Failed to fetch ingestion log')
  return res.json()
}

// ── Reports ───────────────────────────────────────────────────────────────────

export const getReports = async (params?: {
  search?: string
  status?: string // 'Finalized' | 'Needs Approval'
  confidence?: number
  dateCreatedFrom?: string
  dateCreatedTo?: string
  page?: number
  limit?: number
}) => {
  const query = params ? new URLSearchParams(params as Record<string, string>).toString() : ''
  const res = await authFetch(`/api/reports/${query ? `?${query}` : ''}`)
  if (!res.ok) throw new Error('Failed to fetch reports')
  return res.json()
}

export const getReport = async (id: number) => {
  const res = await authFetch(`/api/reports/${id}`)
  if (!res.ok) throw new Error('Failed to fetch report')
  return res.json()
}

export const editReport = async (id: number, body: Record<string, unknown>) => {
  const res = await authFetch(`/api/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to edit report')
  return res.json()
}

export const finalizeReport = async (id: number) => {
  const res = await authFetch(`/api/reports/${id}/finalize`, {
    method: 'PUT',
  })
  if (!res.ok) throw new Error('Failed to finalize report')
  return res.json()
  // After this, report is permanently locked — edit returns 403
}

export const getScorecard = async (id: number) => {
  const res = await authFetch(`/api/reports/${id}/scorecard`)
  if (!res.ok) throw new Error('Failed to fetch scorecard')
  return res.json()
}

export const getFraudScore = async (id: number) => {
  const res = await authFetch(`/api/reports/${id}/fraud-score`)
  if (!res.ok) throw new Error('Failed to fetch fraud score')
  return res.json()
}

export const exportReportCSV = async (id: number) => {
  const res = await authFetch(`/api/reports/${id}/export/csv`)
  if (!res.ok) throw new Error('Failed to export CSV')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `report-${id}.csv`
  a.click()
}

export const exportReportPresentation = async (id: number) => {
  const res = await authFetch(`/api/reports/${id}/export/presentation`)
  if (!res.ok) throw new Error('Failed to export presentation')
  const html = await res.text()
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  // Open in new tab — revoke after a delay to allow the tab to load
  const tab = window.open(url, '_blank')
  if (!tab) {
    // Popup blocked — fallback to download
    const a = document.createElement('a')
    a.href = url
    a.download = `omatek-report-${id}.html`
    a.click()
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

export const downloadReportPresentation = async (id: number) => {
  const res = await authFetch(`/api/reports/${id}/export/presentation`)
  if (!res.ok) throw new Error('Failed to download presentation')
  const html = await res.text()
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `omatek-report-${id}.html`
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

export const generateCustomReport = async (body: {
  documentId: number
  customInstructions: string
  startPeriod?: string
  endPeriod?: string
  title?: string
}) => {
  const res = await authFetch('/api/reports/custom-generate', {
    method: 'POST',
    body: JSON.stringify({
      document_id: body.documentId,
      custom_instructions: body.customInstructions,
      start_period: body.startPeriod,
      end_period: body.endPeriod,
      title: body.title,
    }),
  })
  if (!res.ok) throw new Error('Failed to generate report')
  return res.json()
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = async () => {
  const res = await authFetch('/api/users')
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

export const createUser = async (name: string, email: string, password: string, role: string, companyName?: string) => {
  const res = await authFetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role, company_name: companyName }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as Record<string, string>).detail || 'Failed to create user')
  }
  return res.json()
}

export const updateUserRole = async (userId: number, role: string) => {
  const res = await authFetch(`/api/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  if (!res.ok) throw new Error('Failed to update role')
  return res.json()
}

export const deactivateUser = async (userId: number) => {
  const res = await authFetch(`/api/users/${userId}/deactivate`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to deactivate user')
  return res.json()
}

export const activateUser = async (userId: number) => {
  const res = await authFetch(`/api/users/${userId}/activate`, { method: 'PATCH' })
  if (!res.ok) throw new Error('Failed to activate user')
  return res.json()
}

// ── Settings ──────────────────────────────────────────────────────────────────

export const changePassword = async (
  currentPassword: string,
  newPassword: string
) => {
  const res = await authFetch('/api/settings/password', {
    method: 'PUT',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error((data as Record<string, string>).detail || 'Failed to update password')
  }
  return res.json()
}

// ── Phase 2 — UI not built yet but endpoints are live ────────────────────────

export const multiAnalyze = async (documentIds: number[]) => {
  const res = await authFetch('/api/analysis/multi-analyze', {
    method: 'POST',
    body: JSON.stringify({ document_ids: documentIds }),
  })
  if (!res.ok) throw new Error('Failed to run multi-analysis')
  return res.json()
}

export const getMultiReports = async () => {
  const res = await authFetch('/api/analysis/multi-reports')
  if (!res.ok) throw new Error('Failed to fetch multi-reports')
  return res.json()
}

export const getMultiReport = async (id: number) => {
  const res = await authFetch(`/api/analysis/multi-reports/${id}`)
  if (!res.ok) throw new Error('Failed to fetch multi-report')
  return res.json()
}

export const askPlatform = async (question: string, documentIds: number[]) => {
  const res = await authFetch('/api/ask', {
    method: 'POST',
    body: JSON.stringify({
      question,
      document_ids: documentIds,
    }),
  })
  if (!res.ok) throw new Error('Failed to get answer')
  return res.json()
}

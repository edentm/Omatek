export const API_BASE_URL = 'https://omatek-backend.onrender.com'

// Use this for every protected request
export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token')
  const headers = {
    ...options.headers,
    'Authorization': `bearer ${token}`,
  }
  // Don't set Content-Type for FormData — fetch sets it automatically with boundary
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  })
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export const login = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Login failed')
  }
  return res.json() // { access_token, user }
}

export const logoutApi = async () => {
  try {
    await authFetch('/api/auth/logout', { method: 'POST' })
  } catch (_) {
    // Swallow errors — clear local state regardless
  }
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

// ── Documents ─────────────────────────────────────────────────────────────────

export const getDocuments = async () => {
  const res = await authFetch('/api/documents/')
  if (!res.ok) throw new Error('Failed to fetch documents')
  return res.json()
}

export const uploadDocument = async (file) => {
  const token = localStorage.getItem('token')
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: 'POST',
    headers: { 'Authorization': `bearer ${token}` },
    body: formData,
  })
  if (!res.ok) throw new Error('Upload failed')
  return res.json()
}

export const openDocument = async (documentId) => {
  const res = await authFetch(`/api/documents/${documentId}/download`)
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  window.open(url, '_blank')
}

// ── Reports ───────────────────────────────────────────────────────────────────

export const getReports = async () => {
  const res = await authFetch('/api/reports/')
  if (!res.ok) throw new Error('Failed to fetch reports')
  return res.json()
}

export const finalizeReport = async (reportId) => {
  const res = await authFetch(`/api/reports/${reportId}/finalize`, { method: 'PUT' })
  if (!res.ok) throw new Error('Failed to finalize report')
  return res.json()
}

export const editReport = async (reportId, body) => {
  const res = await authFetch(`/api/reports/${reportId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error('Failed to save report')
  return res.json()
}

// ── Users ─────────────────────────────────────────────────────────────────────

export const getUsers = async () => {
  const res = await authFetch('/api/users')
  if (!res.ok) throw new Error('Failed to fetch users')
  return res.json()
}

// ── Settings ──────────────────────────────────────────────────────────────────

export const changePassword = async (currentPassword, newPassword) => {
  const res = await authFetch('/api/settings/password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Failed to update password')
  }
  return res.json()
}

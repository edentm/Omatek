# API Endpoints Specification

This document defines all backend API endpoints required to replace the current mock/hardcoded data in the Omatek frontend application. The app is a React/Vite SPA with no backend — all data is faked with hardcoded arrays and `setTimeout` delays.

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [User Management](#2-user-management)
3. [Dashboard](#3-dashboard)
4. [Documents](#4-documents)
5. [AI Analysis](#5-ai-analysis)
6. [Reports](#6-reports)
7. [Settings](#7-settings)
8. [Full Endpoint Reference](#8-full-endpoint-reference)
9. [Files to Update](#9-files-to-update)
10. [Implementation Notes](#10-implementation-notes)

---

## 1. Authentication

### `POST /api/auth/login`

**Triggered by**: Submit button in `Login.tsx` (currently just navigates with no validation)

**Request**
```json
{ "email": "user@example.com", "password": "secret" }
```

**Response**
```json
{
  "token": "eyJhbGci...",
  "user": { "id": "u-001", "name": "Oladosu Teyibo", "role": "Administrator", "email": "..." }
}
```

---

### `POST /api/auth/signup`

**Triggered by**: Submit button in `Signup.tsx` (currently navigates with no account creation)

**Request**
```json
{
  "firstName": "Oladosu",
  "lastName": "Teyibo",
  "email": "user@example.com",
  "password": "secret"
}
```

**Response**
```json
{ "token": "eyJhbGci...", "user": { "id": "u-002", ... } }
```

---

### `POST /api/auth/logout`

**Triggered by**: Logout button in `DashboardLayout.tsx:154`

Invalidates the server-side session/token. No body required.

---

## 2. User Management

### `GET /api/users`

**Triggered by**: Users page (`Users.tsx`) — currently shows 1 hardcoded user

**Query Parameters**
```
search    string    Filter by name or email
role      string    Filter by role (Administrator, Analyst, etc.)
page      number    Page number (default 1)
limit     number    Results per page (default 20)
```

**Response**
```json
{
  "users": [
    { "id": "u-001", "name": "Oladosu Teyibo", "position": "Administrator", "email": "..." }
  ],
  "total": 1
}
```

---

### `GET /api/users/:id`

Get a single user's full details.

---

### `POST /api/users`

Create a new user (admin action).

**Request**: `{ "name", "email", "role", "password" }`

---

### `PUT /api/users/:id`

Update user info (name, role, email).

---

### `DELETE /api/users/:id`

Delete a user. The Users table has an empty action column implying this.

---

### `GET /api/user/me`

**Triggered by**: `DashboardLayout.tsx:178` shows hardcoded name "Teyibo" and initials "OT"; `Dashboard.tsx:47` shows "Welcome, User"

Returns the currently authenticated user's profile.

**Response**
```json
{ "id": "u-001", "name": "Oladosu Teyibo", "initials": "OT", "role": "Administrator", "email": "..." }
```

---

## 3. Dashboard

### `GET /api/dashboard/metrics`

**Triggered by**: `Dashboard.tsx` — 5 KPI cards are fully hardcoded (lines 1–40)

**Hardcoded values being replaced**:
- Revenue: ₦18.2B
- Expenses: ₦12.6B
- New Clients: 142
- Share Price: ₦2.47
- Market Cap: ₦6.94B

**Response**
```json
{
  "revenue":    { "value": "₦18.2B", "change": "+4.2%", "trend": "up" },
  "expenses":   { "value": "₦12.6B", "change": "-1.1%", "trend": "down" },
  "newClients": { "value": 142,       "change": "+12",    "trend": "up" },
  "sharePrice": { "value": "₦2.47",  "change": "+8.91%", "trend": "up" },
  "marketCap":  { "value": "₦6.94B", "change": "+0.3%",  "trend": "up" }
}
```

---

### `GET /api/dashboard/charts`

**Triggered by**: Two empty chart placeholder `<div>`s in `Dashboard.tsx:114–115`

Returns time-series data for the two charts (shape TBD once chart library is wired up).

---

## 4. Documents

### `GET /api/documents`

**Triggered by**: Documents page (`Documents.tsx`) — currently shows 6 hardcoded documents; also feeds the Ingestion Log tab in `AIAnalysis.tsx`

**Query Parameters**
```
search      string    Full-text search on title/uploader
type        string    "PDF" | "Excel"
dateFrom    string    ISO date — upload date range start
dateTo      string    ISO date — upload date range end
page        number
limit       number
```

**Response**
```json
{
  "documents": [
    {
      "id": "DOC-0001",
      "name": "Financial Report 2026",
      "type": "PDF",
      "uploadDate": "2026-03-31",
      "uploadedBy": "Oladosu Teyibo",
      "role": "Administrator",
      "numberOfDocs": 12
    }
  ],
  "total": 6
}
```

---

### `POST /api/documents/upload`

**Triggered by**:
- "Upload & Analyze" button in `Documents.tsx` modal
- "Upload & Analyze Documents" button in `AIAnalysis.tsx` modal

Both modals collect files via drag-and-drop then fake a 3-second analysis with `setTimeout`.

**Request**: `multipart/form-data` with `files[]`

**Response** (or stream via SSE — see notes)
```json
{
  "jobId": "job-abc-123",
  "documents": [{ "id": "DOC-0042", "name": "...", "uploadDate": "..." }],
  "status": "analyzing"
}
```

**Notes**: The upload modal in both pages shows 4 sequential steps. Use SSE to push step updates, or poll `/api/documents/upload/:jobId/status`.

---

### `GET /api/documents/upload/:jobId/status`

Poll the progress of a document analysis job.

**Response**
```json
{
  "jobId": "job-abc-123",
  "step": "extracting_metrics",
  "status": "in_progress" | "complete" | "failed",
  "result": { ... }
}
```

Step values map to UI labels in `AIAnalysis.tsx:718` and `Documents.tsx`:
- `parsing_structure` → "Parsing document structure"
- `extracting_metrics` → "Extracting financial metrics"
- `identifying_discrepancies` → "Identifying discrepancies"
- `generating_summary` → "Generating summary"

---

### `GET /api/documents/:id`

Get full details for a single document.

---

### `GET /api/documents/:id/download`

Stream the original file or redirect to a signed storage URL.

**Response**: `application/pdf` binary or `302` redirect.

---

### `DELETE /api/documents/:id`

Delete a document. The Documents table has an action column implying this.

---

## 5. AI Analysis

### `GET /api/analysis/metrics`

**Triggered by**: Key Metrics tab in `AIAnalysis.tsx` — all four subtab tables (Profit, Market, Operations, Debt) are fully hardcoded

**Query Parameters**
```
documentId   string    (optional) Scope to a specific document
```

**Response**
```json
{
  "profit": [
    { "label": "Revenue",        "value": "₦2.2M",   "confidence": "94%", "source": "https://..." },
    { "label": "Admin Expenses", "value": "₦50.52M", "confidence": "96%", "source": "https://..." },
    { "label": "Net Loss",       "value": "₦48.32M", "confidence": "95%", "source": "https://..." }
  ],
  "market": [
    { "label": "Market Cap",      "value": "₦6.94B", "confidence": "98%", "source": "https://..." },
    { "label": "Share Price",     "value": "₦2.47",  "confidence": "99%", "source": "https://..." },
    { "label": "24h Price Change","value": "+8.91%", "confidence": "99%", "source": "https://..." }
  ],
  "operations": [
    { "label": "Headcount",           "value": "~80 employees", "confidence": "82%", "source": "https://..." },
    { "label": "Admin Expenses FY25", "value": "₦50.52M",       "confidence": "91%", "source": "https://..." }
  ],
  "debt": [
    { "label": "Short-term Borrowings", "value": "₦1.009B", "confidence": "95%", "source": "https://..." },
    { "label": "Long-term Loans",       "value": "₦0",      "confidence": "97%", "source": "https://..." },
    { "label": "Trade & Other Payables","value": "₦3.47B",  "confidence": "93%", "source": "https://..." }
  ]
}
```

---

### `GET /api/analysis/discrepancies`

**Triggered by**: Discrepancies tab in `AIAnalysis.tsx` — 4 hardcoded issues (lines 62–95)

**Query Parameters**
```
level           string[]   "High" | "Medium" | "Low"
dateFrom        string     ISO date
dateTo          string     ISO date
confidence      string[]   Confidence band filter
page            number
limit           number
```

**Response**
```json
{
  "discrepancies": [
    {
      "id": "FR-0001-2026",
      "title": "Q1 2026 Financial Summary",
      "level": "High",
      "type": "Quarterly Report",
      "aiConfidence": "95%",
      "dateFlagged": "2026-03-31"
    }
  ],
  "total": 4
}
```

---

### `GET /api/analysis/discrepancies/:id`

Get full details of a single discrepancy (for a detail/drill-down view).

---

### `PUT /api/analysis/discrepancies/:id/resolve`

Mark a flagged discrepancy as resolved.

**Request**: `{ "resolution": "Confirmed accurate after manual review" }`

---

### `GET /api/analysis/ingestion-log`

**Triggered by**: Ingestion Log tab in `AIAnalysis.tsx` — 4 hardcoded batches (lines 105–139)

**Response**
```json
{
  "batches": [
    {
      "id": "ING-0001",
      "name": "Financial Report 2026",
      "numberOfDocs": 12,
      "uploadDate": "2026-03-31",
      "uploadedBy": "Oladosu Teyibo",
      "role": "Administrator"
    }
  ],
  "total": 4
}
```

---

## 6. Reports

### `GET /api/reports`

**Triggered by**: Reports page (`Reports.tsx`) — 7 hardcoded reports (lines 76–84)

**Query Parameters**
```
search              string    Full-text search
status              string    "Finalized" | "Needs Approval"
dateCreatedFrom     string    ISO date
dateCreatedTo       string    ISO date
dateFinalizedFrom   string    ISO date
dateFinalizedTo     string    ISO date
confidence          string    AI confidence band
page                number
limit               number
```

**Response**
```json
{
  "reports": [
    {
      "id": "RPT-0001",
      "title": "Q1 2026 Financial Summary",
      "status": "Finalized",
      "aiConfidence": "95%",
      "dateCreated": "2026-03-31",
      "dateFinalized": "2026-04-01",
      "content": "..."
    }
  ],
  "total": 7
}
```

---

### `GET /api/reports/:id`

**Triggered by**: Clicking a report to open the side panel in `Reports.tsx:235`

Returns full report content (replaces the Lorem ipsum placeholder at `Reports.tsx:32–37`).

---

### `POST /api/reports/generate`

**Triggered by**: "Generate Report" modal in `Reports.tsx` (`handleGenerate`, line 70) — currently fakes a 3.5s delay

**Request**
```json
{
  "title": "Q1 2026 Analysis",
  "dateRange": { "from": "2026-01-01", "to": "2026-03-31" },
  "metrics": ["Revenue", "Net Loss", "Market Cap"],
  "discrepancyLevels": ["High", "Medium"],
  "format": "pdf"
}
```

**Response**
```json
{
  "reportId": "RPT-0012",
  "title": "Q1 2026 Analysis",
  "status": "Needs Approval",
  "aiConfidence": "94%",
  "dateCreated": "2026-04-12T10:00:00Z",
  "downloadUrl": "/api/reports/RPT-0012/download"
}
```

---

### `PUT /api/reports/:id`

**Triggered by**: Edit → Save flow in the report side panel (`Reports.tsx:381–407`)

**Request**: `{ "content": "Updated report text..." }`

---

### `PUT /api/reports/:id/finalize`

**Triggered by**: "Finalize Report" button in side panel (`Reports.tsx:409–416`)

Updates status from `"Needs Approval"` to `"Finalized"` and records `dateFinalized`.

---

### `GET /api/reports/:id/download`

**Triggered by**: Download button in the report side panel (`Reports.tsx:305`)

**Response**: `application/pdf` binary or `302` redirect to signed storage URL.

---

## 7. Settings

### `PUT /api/settings/password`

**Triggered by**: "Update password" button in `Settings.tsx:95–100` — currently shows a success toast with no actual validation

**Request**
```json
{
  "currentPassword": "old-secret",
  "newPassword": "new-secret"
}
```

**Response**
```json
{ "success": true }
```

**Error responses**: `400` if current password is wrong; `422` if new password fails validation.

---

## 8. Full Endpoint Reference

| # | Method | Endpoint | Purpose | Source file |
|---|--------|----------|---------|-------------|
| 1 | POST | `/api/auth/login` | Authenticate user | `Login.tsx` |
| 2 | POST | `/api/auth/signup` | Register new user | `Signup.tsx` |
| 3 | POST | `/api/auth/logout` | Invalidate session | `DashboardLayout.tsx:154` |
| 4 | GET | `/api/user/me` | Get current user profile | `DashboardLayout.tsx:178`, `Dashboard.tsx:47` |
| 5 | GET | `/api/users` | List all users | `Users.tsx` |
| 6 | POST | `/api/users` | Create user | `Users.tsx` (implied) |
| 7 | GET | `/api/users/:id` | Get user details | `Users.tsx` |
| 8 | PUT | `/api/users/:id` | Update user | `Users.tsx` (action column) |
| 9 | DELETE | `/api/users/:id` | Delete user | `Users.tsx` (action column) |
| 10 | GET | `/api/dashboard/metrics` | KPI card data | `Dashboard.tsx:1–40` |
| 11 | GET | `/api/dashboard/charts` | Chart data | `Dashboard.tsx:114–115` |
| 12 | GET | `/api/documents` | List documents (with filters) | `Documents.tsx`, `AIAnalysis.tsx:105` |
| 13 | POST | `/api/documents/upload` | Upload & analyze documents | `Documents.tsx`, `AIAnalysis.tsx:33` |
| 14 | GET | `/api/documents/upload/:jobId/status` | Poll analysis job progress | Both upload modals |
| 15 | GET | `/api/documents/:id` | Get document details | `Documents.tsx` |
| 16 | GET | `/api/documents/:id/download` | Download document file | `Documents.tsx:186` |
| 17 | DELETE | `/api/documents/:id` | Delete document | `Documents.tsx` (action column) |
| 18 | GET | `/api/analysis/metrics` | AI-extracted financial metrics | `AIAnalysis.tsx:421–598` |
| 19 | GET | `/api/analysis/discrepancies` | Flagged discrepancies (filtered) | `AIAnalysis.tsx:62–95` |
| 20 | GET | `/api/analysis/discrepancies/:id` | Single discrepancy details | `AIAnalysis.tsx` |
| 21 | PUT | `/api/analysis/discrepancies/:id/resolve` | Resolve a discrepancy | `AIAnalysis.tsx` (implied) |
| 22 | GET | `/api/analysis/ingestion-log` | Ingestion batch history | `AIAnalysis.tsx:105–139` |
| 23 | GET | `/api/reports` | List reports (with filters) | `Reports.tsx:76–84` |
| 24 | GET | `/api/reports/:id` | Get report content | `Reports.tsx:235` |
| 25 | POST | `/api/reports/generate` | Generate new report | `Reports.tsx:70` |
| 26 | PUT | `/api/reports/:id` | Update report content | `Reports.tsx:381` |
| 27 | PUT | `/api/reports/:id/finalize` | Finalize/approve report | `Reports.tsx:409` |
| 28 | GET | `/api/reports/:id/download` | Download report PDF | `Reports.tsx:305` |
| 29 | PUT | `/api/settings/password` | Change password | `Settings.tsx:95` |

---

## 9. Files to Update

| File | Line(s) | Change needed |
|------|---------|---------------|
| `src/app/pages/Login.tsx` | submit handler | Replace navigation with `fetch('/api/auth/login')`, store token |
| `src/app/pages/Signup.tsx` | submit handler | Replace navigation with `fetch('/api/auth/signup')` |
| `src/app/components/DashboardLayout.tsx` | 154, 178 | Call `POST /auth/logout`; replace hardcoded "Teyibo" / "OT" with `GET /user/me` |
| `src/app/pages/Dashboard.tsx` | 1–40, 47 | Replace `cards` array and "Welcome, User" with API data |
| `src/app/pages/Users.tsx` | 2–5 | Replace `mockUsers` with `GET /users` |
| `src/app/pages/Documents.tsx` | 54–61, 36–38 | Replace `mockDocuments` and `setTimeout` with API calls |
| `src/app/pages/AIAnalysis.tsx` | 33–35 | Replace `setTimeout` with `POST /documents/upload` |
| `src/app/pages/AIAnalysis.tsx` | 62–138 | Replace hardcoded issues/ingestion arrays with API data |
| `src/app/pages/AIAnalysis.tsx` | 421–598 | Replace hardcoded metric tables with `GET /analysis/metrics` |
| `src/app/pages/Reports.tsx` | 70–72, 76–84, 32–37 | Replace `setTimeout` and hardcoded reports/content with API calls |
| `src/app/pages/Settings.tsx` | 95–100 | Replace always-passing toast with real `PUT /settings/password` |

---

## 10. Implementation Notes

| Concern | Recommendation |
|---------|---------------|
| Backend runtime | Vercel Functions (Node.js) for serverless, or a standalone Express/FastAPI service |
| AI provider | Anthropic Claude or OpenAI GPT-4o for document parsing and metric extraction |
| Document storage | Vercel Blob (private) for uploaded PDFs; return signed URLs for downloads |
| Auth | JWT stored in `httpOnly` cookie; send on every request via cookie or `Authorization: Bearer` header |
| Streaming | Use SSE on the upload endpoint to drive the 4-step progress animation in real time |
| Search & filters | Accept all filter params as query strings; apply server-side — do not rely on client-side filtering |
| Roles & permissions | Return `role` from `/api/user/me` and gate the Users page (and destructive actions) to `Administrator` only |

import { useState, useEffect, useRef } from "react";
import FilterButton from "../components/FilterButton";
import { getDocuments, getReports, getReport, uploadDocument, openDocument, pollJobStatus, deleteDocument, editDocumentData, approveDocument, multiAnalyze } from "../../api";

type Document = {
  id: number;
  title: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  uploadedByRole: string;
  status: "Approved" | "Needs Review";
  approvalDate: string;
  aiConfidence: string;
  processing?: boolean;
};

const getConfidencePill = (confidence: string) => {
  const value = parseInt(confidence);
  if (isNaN(value)) return { label: "—", classes: "bg-[#f2f4f7] text-[#667085]" };
  if (value >= 90) return { label: `${confidence} - Very High`, classes: "bg-[#ecfdf3] text-[#027a48]" };
  if (value >= 80) return { label: `${confidence} - High`, classes: "bg-[#e8f0fe] text-[#1a56db]" };
  if (value >= 60) return { label: `${confidence} - Moderate`, classes: "bg-[#fef0c7] text-[#dc6803]" };
  return { label: `${confidence} - Low`, classes: "bg-[#fef3f2] text-[#b42318]" };
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Side panel state
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [activeDocTab, setActiveDocTab] = useState<'summary' | 'metrics' | 'discrepancies'>('summary');

  // Full document data fetched on panel open
  const [fullDocData, setFullDocData] = useState<Record<string, unknown> | null>(null);
  const [docLoading, setDocLoading] = useState(false);
  const [docLoadError, setDocLoadError] = useState<string | null>(null);
  const docDataCache = useRef<Map<number, Record<string, unknown>>>(new Map());

  // Editing key metrics
  const [isEditing, setIsEditing] = useState(false);
  const [editedMetrics, setEditedMetrics] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);
  const [editSaveError, setEditSaveError] = useState<string | null>(null);
  const [finalizeError, setFinalizeError] = useState<string | null>(null);
  // Tracks which metric keys were user-edited per document (persists for the session)
  const docEditedFields = useRef<Map<number, Set<string>>>(new Map());

  // Comparison panel state
  const [showComparePanel, setShowComparePanel] = useState(false);
  const [compareIsFullWidth, setCompareIsFullWidth] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [compareResult, setCompareResult] = useState<Record<string, unknown> | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [confidenceFilter, setConfidenceFilter] = useState<string[]>([]);
  const [uploadDateFrom, setUploadDateFrom] = useState("");
  const [uploadDateTo, setUploadDateTo] = useState("");

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [modalStep, setModalStep] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [uploadError, setUploadError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [docToast, setDocToast] = useState("");
  const showDocToast = (msg: string) => { setDocToast(msg); setTimeout(() => setDocToast(""), 3000); };

  useEffect(() => {
    getDocuments()
      .then((data: unknown[]) => {
        const mapped = (data as Record<string, unknown>[]).map((d) => {
          const isLocked = d.isLocked as boolean | undefined;
          const confidence = d.confidenceScore as number | null | undefined;
          const confidenceStr = confidence != null
            ? `${Math.round(Number(confidence) * (Number(confidence) <= 1 ? 100 : 1))}%`
            : "—";
          const approvedAt = (d.signedAt ?? d.finalizedAt ?? d.signed_at ?? d.finalized_at ?? null) as string | null;
          const formatDate = (iso: string) => {
            const dt = new Date(iso);
            if (isNaN(dt.getTime())) return iso;
            return dt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
          };
          return {
            id: d.id as number,
            title: (d.originalFilename ?? d.filename ?? "Untitled") as string,
            type: ((d.fileType ?? d.file_type ?? "") as string).toUpperCase() || "—",
            uploadDate: d.createdAt ? formatDate(d.createdAt as string) : "—",
            uploadedBy: (d.uploadedByName ?? d.uploadedBy ?? "Admin") as string,
            uploadedByRole: "",
            status: (isLocked ? "Approved" : "Needs Review") as "Approved" | "Needs Review",
            approvalDate: approvedAt ? formatDate(approvedAt) : "—",
            aiConfidence: confidenceStr,
          };
        });
        setDocuments(mapped);
      })
      .catch((err: Error) => setDocsError(err.message))
      .finally(() => setLoadingDocs(false));
  }, []);

  const refreshDocuments = () => {
    getDocuments()
      .then((data: unknown[]) => {
        const mapped = (data as Record<string, unknown>[]).map((d) => {
          const isLocked = d.isLocked as boolean | undefined;
          const confidence = d.confidenceScore as number | null | undefined;
          const confidenceStr = confidence != null
            ? `${Math.round(Number(confidence) * (Number(confidence) <= 1 ? 100 : 1))}%`
            : "—";
          const approvedAt = (d.signedAt ?? d.finalizedAt ?? d.signed_at ?? d.finalized_at ?? null) as string | null;
          const formatDate = (iso: string) => {
            const dt = new Date(iso);
            if (isNaN(dt.getTime())) return iso;
            return dt.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" });
          };
          return {
            id: d.id as number,
            title: (d.originalFilename ?? d.filename ?? "Untitled") as string,
            type: ((d.fileType ?? d.file_type ?? "") as string).toUpperCase() || "—",
            uploadDate: d.createdAt ? formatDate(d.createdAt as string) : "—",
            uploadedBy: (d.uploadedByName ?? d.uploadedBy ?? "Admin") as string,
            uploadedByRole: "",
            status: (isLocked ? "Approved" : "Needs Review") as "Approved" | "Needs Review",
            approvalDate: approvedAt ? formatDate(approvedAt) : "—",
            aiConfidence: confidenceStr,
          };
        });
        setDocuments(mapped);
      })
      .catch(() => {});
  };

  const closeModal = () => {
    setShowUploadModal(false);
    setUploadedFiles([]);
    setModalStep('idle');
    setUploadError("");
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const incoming = Array.from(e.dataTransfer.files);
    setUploadedFiles(prev => [...prev, ...incoming].slice(0, 20));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const incoming = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...incoming].slice(0, 20));
  };

  const handleUpload = async () => {
    setModalStep('analyzing');
    setUploadError("");
    try {
      const uploadPromises = uploadedFiles.map(async (file) => {
        const { jobId, documentId } = await uploadDocument(file);

        const optimisticEntry: Document = {
          id: documentId,
          title: file.name,
          type: (file.name.split('.').pop() ?? '').toUpperCase() || '—',
          uploadDate: 'Today',
          uploadedBy: '…',
          uploadedByRole: '',
          status: "Needs Review",
          approvalDate: "—",
          aiConfidence: "—",
          processing: true,
        };
        setDocuments(prev => {
          if (prev.some(d => d.id === documentId)) return prev;
          return [optimisticEntry, ...prev];
        });
        setProcessingIds(prev => new Set(prev).add(documentId));

        await new Promise<void>((resolve, reject) => {
          const interval = setInterval(async () => {
            try {
              const status = await pollJobStatus(jobId);
              if (status.status === "complete") { clearInterval(interval); resolve(); }
              else if (status.status === "failed") { clearInterval(interval); reject(new Error(status.error ?? "Analysis failed")); }
            } catch (e) { clearInterval(interval); reject(e); }
          }, 2000);
        });

        setProcessingIds(prev => { const next = new Set(prev); next.delete(documentId); return next; });
        refreshDocuments();
        window.dispatchEvent(new CustomEvent('omatek:notify', { detail: { text: `Document "${file.name}" finished processing and is ready for analysis.` } }));
      });

      setModalStep('complete');
      await Promise.allSettled(uploadPromises);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setModalStep('idle');
    }
  };

  useEffect(() => {
    if (!showUploadModal) setModalStep('idle');
  }, [showUploadModal]);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
      setSelectedIds(prev => { const next = new Set(prev); next.delete(id); return next; });
      setConfirmDelete(null);
      showDocToast("Document deleted.");
    } catch { showDocToast("Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const handleCompare = async () => {
    setShowComparePanel(true);
    setSelectedDocument(null);
    setCompareLoading(true);
    setCompareError(null);
    setCompareResult(null);
    try {
      const ids = Array.from(selectedIds);
      const result = await multiAnalyze(ids) as Record<string, unknown>;
      setCompareResult(result);
    } catch (err) {
      setCompareError(err instanceof Error ? err.message : 'Failed to compare documents.');
    } finally {
      setCompareLoading(false);
    }
  };

  const openDocPanel = async (doc: Document) => {
    setSelectedDocument(doc);
    setIsPanelExpanded(true);
    setActiveDocTab('summary');
    setIsEditing(false);
    setEditedMetrics({});
    setEditSaveError(null);
    setFinalizeError(null);

    const cached = docDataCache.current.get(doc.id);
    if (cached) { setFullDocData(cached); setDocLoading(false); setDocLoadError(null); return; }

    setDocLoading(true);
    setDocLoadError(null);
    setFullDocData(null);
    try {
      // The /api/documents/{id} endpoint only returns file metadata.
      // Analysis data (summary, key metrics) lives in the associated report.
      const allReports = await getReports() as Record<string, unknown>[];
      const list = Array.isArray(allReports) ? allReports : [];
      const docBase = doc.title.toLowerCase().replace(/\.[^/.]+$/, ''); // strip extension

      // Match by document name — report titles typically include the source filename
      const matched = list.find(r => {
        const rName = String(r.documentName ?? r.document_name ?? r.title ?? '').toLowerCase().replace(/\.[^/.]+$/, '');
        return rName === docBase || rName.includes(docBase) || docBase.includes(rName);
      });

      if (matched) {
        const full = await getReport(matched.id as number) as Record<string, unknown>;
        docDataCache.current.set(doc.id, full);
        setFullDocData(full);
      } else {
        // No report found yet — cache empty so panel shows the placeholder messages
        docDataCache.current.set(doc.id, {});
        setFullDocData({});
      }
    } catch (err) {
      setDocLoadError(err instanceof Error ? err.message : 'Failed to load document data.');
    } finally {
      setDocLoading(false);
    }
  };

  const toggleFilter = (name: string) => setOpenFilter(prev => prev === name ? null : name);

  const parseDate = (dateStr: string) => {
    if (!dateStr || dateStr === "—") return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
  };

  const getFilteredDocs = () => documents.filter(doc => {
    if (searchQuery && ![doc.title, doc.type, doc.uploadedBy].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
    if (typeFilter.length > 0 && !typeFilter.includes(doc.type)) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(doc.status)) return false;
    if (confidenceFilter.length > 0) {
      const v = parseInt(doc.aiConfidence);
      const band = v >= 90 ? "veryHigh" : v >= 80 ? "high" : v >= 60 ? "moderate" : "low";
      if (!confidenceFilter.includes(band)) return false;
    }
    if (uploadDateFrom || uploadDateTo) {
      const d = parseDate(doc.uploadDate);
      if (d && uploadDateFrom && d < new Date(uploadDateFrom)) return false;
      if (d && uploadDateTo && d > new Date(uploadDateTo)) return false;
    }
    return true;
  });

  const toggleSelect = (id: number) =>
    setSelectedIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const toggleSelectAll = (filtered: Document[]) => {
    const allSelected = filtered.every(d => selectedIds.has(d.id));
    if (allSelected) {
      setSelectedIds(prev => { const next = new Set(prev); filtered.forEach(d => next.delete(d.id)); return next; });
    } else {
      setSelectedIds(prev => { const next = new Set(prev); filtered.forEach(d => next.add(d.id)); return next; });
    }
  };

  return (
    <div className="bg-white h-full w-full p-8 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            AI Document Analysis
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
            View and search for uploaded documents
          </p>
        </div>

        <div className="flex items-center gap-3">
          {selectedIds.size >= 2 && (
            <button
              onClick={handleCompare}
              className="bg-black h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-[#222] transition-colors"
            >
              <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="white">
                <path d="M10 0 C10.2 2.5 11 5.5 16 7 C11 8.5 10.2 11.5 10 14 C9.8 11.5 9 8.5 4 7 C9 5.5 9.8 2.5 10 0Z"/>
                <path d="M17 10 C17.1 11.3 17.6 12 20 12.5 C17.6 13 17.1 13.7 17 15 C16.9 13.7 16.4 13 14 12.5 C16.4 12 16.9 11.3 17 10Z"/>
              </svg>
              <p className="font-['Figtree:Regular',sans-serif] font-normal text-[14px] text-white whitespace-nowrap">
                Compare Documents
              </p>
            </button>
          )}
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <svg className="size-5" fill="none" viewBox="0 0 20 20">
              <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p className="font-['Figtree:Regular',sans-serif] font-normal text-[14px] text-[#344054] whitespace-nowrap">
              Upload and Analyze Documents
            </p>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[44px] px-4 pl-10 border border-[#d0d5dd] rounded-lg text-[14px]"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" fill="none" viewBox="0 0 20 20">
            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <FilterButton
          label="Type"
          type="checkbox"
          options={[
            { value: "PDF", label: "PDF" },
            { value: "XLSX", label: "Excel" },
            { value: "DOCX", label: "Word" },
            { value: "CSV", label: "CSV" },
          ]}
          selected={typeFilter}
          onChange={setTypeFilter}
          isOpen={openFilter === "type"}
          onToggle={() => toggleFilter("type")}
          onClose={() => setOpenFilter(null)}
        />
        <FilterButton
          label="Status"
          type="checkbox"
          options={[
            { value: "Approved", label: "Approved" },
            { value: "Needs Review", label: "Needs Review" },
          ]}
          selected={statusFilter}
          onChange={setStatusFilter}
          isOpen={openFilter === "status"}
          onToggle={() => toggleFilter("status")}
          onClose={() => setOpenFilter(null)}
        />
        <FilterButton
          label="Upload Date"
          type="daterange"
          from={uploadDateFrom}
          to={uploadDateTo}
          onFromChange={setUploadDateFrom}
          onToChange={setUploadDateTo}
          isOpen={openFilter === "uploadDate"}
          onToggle={() => toggleFilter("uploadDate")}
          onClose={() => setOpenFilter(null)}
        />
        <FilterButton
          label="AI Confidence"
          type="checkbox"
          options={[
            { value: "veryHigh", label: "Very High (90% - 100%)" },
            { value: "high", label: "High (80% - 89%)" },
            { value: "moderate", label: "Moderate (60% - 79%)" },
            { value: "low", label: "Low (Below 60%)" },
          ]}
          selected={confidenceFilter}
          onChange={setConfidenceFilter}
          isOpen={openFilter === "confidence"}
          onToggle={() => toggleFilter("confidence")}
          onClose={() => setOpenFilter(null)}
        />
      </div>

      {loadingDocs && <p className="text-[14px] text-[#667085] mb-4">Loading documents…</p>}
      {docsError && <p className="text-[14px] text-[#b42318] mb-4">{docsError}</p>}

      {/* Table or empty state */}
      {!loadingDocs && (
        <>
          {documents.length === 0 ? (
            <div className="border border-dashed border-[#d0d5dd] rounded-[12px] flex flex-col items-center justify-center py-20 gap-4">
              <div className="size-14 bg-[#f9fafb] border border-[#eaecf0] rounded-full flex items-center justify-center">
                <svg className="size-7 text-[#98a2b3]" fill="none" viewBox="0 0 24 24">
                  <path d="M12 16V8M12 8L8.5 11.5M12 8L15.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 15v2a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-center">
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">No documents yet</p>
                <p className="text-[13px] text-[#667085] mt-1 max-w-[280px]">Upload your first document to start extracting financial insights.</p>
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="h-[40px] px-5 bg-[#144430] rounded-[10px] text-[14px] text-white hover:bg-[#0f3324] transition-colors flex items-center gap-2"
              >
                <svg className="size-4" fill="none" viewBox="0 0 20 20">
                  <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Upload Document
              </button>
            </div>
          ) : (
            (() => {
              const filtered = getFilteredDocs();
              const allSelected = filtered.length > 0 && filtered.every(d => selectedIds.has(d.id));
              const someSelected = filtered.some(d => selectedIds.has(d.id));

              return (
                <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        {/* Select-all checkbox */}
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                            onChange={() => toggleSelectAll(filtered)}
                            className="size-4 rounded border-[#d0d5dd] text-[#144430] cursor-pointer"
                          />
                        </th>
                        {["Title", "Type", "Upload Date", "Uploaded By", "Status", "Approval Date", "AI Confidence in Extraction"].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                        <th className="px-4 py-3" />
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filtered.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-[14px] text-[#667085]">
                            No documents match your filters.
                          </td>
                        </tr>
                      ) : filtered.map((doc) => {
                        const isProcessing = doc.processing || processingIds.has(doc.id);
                        const isSelected = selectedIds.has(doc.id);
                        const confPill = getConfidencePill(doc.aiConfidence);
                        return (
                          <tr
                            key={doc.id}
                            className={`cursor-pointer hover:bg-gray-50 ${isSelected ? "bg-[#f0f9f4]" : ""} ${selectedDocument?.id === doc.id ? "bg-[#f0f9f4]" : ""}`}
                            onClick={() => openDocPanel(doc)}
                          >
                            <td className="px-4 py-4 w-10" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelect(doc.id)}
                                className="size-4 rounded border-[#d0d5dd] text-[#144430] cursor-pointer"
                              />
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center flex-wrap gap-1">
                                <span className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                                  {doc.title}
                                </span>
                                {isProcessing && (
                                  <span className="inline-flex items-center gap-1 text-[11px] bg-[#fef0c7] text-[#dc6803] px-2 py-0.5 rounded-full font-medium ml-2">
                                    <svg className="animate-spin" style={{ width: 10, height: 10 }} viewBox="0 0 10 10" fill="none">
                                      <circle cx="5" cy="5" r="4" stroke="#dc6803" strokeWidth="1.5" strokeOpacity="0.3"/>
                                      <path d="M5 1a4 4 0 0 1 4 4" stroke="#dc6803" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                    Processing
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-[14px] text-gray-600">
                              {doc.type}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-[14px] text-gray-600">
                              {doc.uploadDate}
                            </td>
                            <td className="px-4 py-4">
                              <div className="text-[14px] text-gray-900">{doc.uploadedBy}</div>
                              {doc.uploadedByRole && <div className="text-[12px] text-gray-500">{doc.uploadedByRole}</div>}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${
                                doc.status === "Approved"
                                  ? "bg-[#ecfdf3] text-[#027a48]"
                                  : "bg-[#e8f0fe] text-[#1a56db]"
                              }`}>
                                {doc.status}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-[14px] text-gray-600">
                              {doc.approvalDate}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {doc.aiConfidence === "—" ? (
                                <span className="text-[14px] text-gray-400">—</span>
                              ) : (
                                <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${confPill.classes}`}>
                                  {confPill.label}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right" onClick={e => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openDocument(doc.id)}
                                  disabled={isProcessing}
                                  className="flex items-center gap-1.5 h-[32px] px-3 border border-[#d0d5dd] rounded-lg text-[12px] text-[#344054] hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <svg className="size-3.5" fill="none" viewBox="0 0 20 20"><path d="M10.8333 2.5H17.5M17.5 2.5V9.16667M17.5 2.5L9.16667 10.8333M8.33333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H14.1667C15.0871 17.5 15.8333 16.7538 15.8333 15.8333V11.6667" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Open
                                </button>
                                <button
                                  onClick={() => setConfirmDelete(doc.id)}
                                  disabled={isProcessing}
                                  className="flex items-center gap-1.5 h-[32px] px-3 border border-[#fecdca] rounded-lg text-[12px] text-[#b42318] hover:bg-[#fef3f2] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <svg className="size-3.5" fill="none" viewBox="0 0 20 20"><path d="M2.5 5H17.5M15.8333 5L15 16.6667C15 17.1269 14.8127 17.5681 14.4794 17.8933C14.1461 18.2185 13.6938 18.4007 13.2222 18.4007H6.77778C6.30618 18.4007 5.85395 18.2185 5.52063 17.8933C5.1873 17.5681 5 17.1269 5 16.6667L4.16667 5M7.5 5V3.33333C7.5 3.11232 7.5878 2.90036 7.74408 2.74408C7.90036 2.5878 8.11232 2.5 8.33333 2.5H11.6667C11.8877 2.5 12.0996 2.5878 12.2559 2.74408C12.4122 2.90036 12.5 3.11232 12.5 3.33333V5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      {confirmDelete !== null && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-white rounded-[16px] shadow-xl p-8 max-w-[400px] w-full mx-4 flex flex-col gap-4">
            <h3 className="font-['Figtree:Medium',sans-serif] font-medium text-[18px] text-black">Delete Document?</h3>
            <p className="text-[14px] text-[#475467]">This will permanently delete the document and its report. This action cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="h-[40px] px-5 border border-[#d0d5dd] rounded-[10px] text-[14px] text-[#344054] hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={deletingId === confirmDelete} className="h-[40px] px-5 bg-[#b42318] rounded-[10px] text-[14px] text-white hover:bg-[#922012] disabled:opacity-60">
                {deletingId === confirmDelete ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Side Panel */}
      {selectedDocument && (
        <div
          className={`fixed top-0 right-0 h-screen bg-white border-l border-[#eaecf0] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all duration-300 ${
            isPanelExpanded ? (isFullWidth ? 'w-[calc(100vw-187px)]' : 'w-[500px]') : 'w-0'
          }`}
          style={{ zIndex: 1000 }}
        >
          {isPanelExpanded && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="border-b border-[#eaecf0] px-6 py-3 flex items-center justify-between">
                <button
                  onClick={() => setIsFullWidth(!isFullWidth)}
                  title={isFullWidth ? "Collapse panel" : "Expand panel"}
                  className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
                >
                  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
                    {isFullWidth ? (
                      <>
                        <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                        <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(9, 5)"/>
                      </>
                    ) : (
                      <>
                        <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                        <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(10, 5)"/>
                      </>
                    )}
                  </svg>
                </button>
                <button
                  onClick={() => { setSelectedDocument(null); setIsFullWidth(false); setIsEditing(false); }}
                  title="Close"
                  className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
                >
                  <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 pt-6 pb-24" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Title + meta */}
                <div className="mb-4">
                  <h2 className="font-['Figtree:Medium',sans-serif] text-[20px] leading-[30px] text-black mb-2">
                    {selectedDocument.title}
                  </h2>
                  <div className="flex gap-2 text-[12px] text-[#52565c] mb-3">
                    <span>Uploaded: {selectedDocument.uploadDate}</span>
                    {selectedDocument.uploadedBy && <span>· By: {selectedDocument.uploadedBy}</span>}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${
                      selectedDocument.status === "Approved" ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#e8f0fe] text-[#1a56db]"
                    }`}>
                      {selectedDocument.status}
                    </span>
                    {selectedDocument.type !== "—" && (
                      <span className="inline-block px-2 py-1 rounded-full text-[12px] bg-[#f2f4f7] text-[#344054]">
                        {selectedDocument.type}
                      </span>
                    )}
                    <button
                      onClick={() => openDocument(selectedDocument.id)}
                      className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[12px] bg-[#f2f4f7] text-[#344054] border border-[#d0d5dd] hover:bg-[#e4e7ec] transition-colors"
                    >
                      <svg className="size-3 shrink-0" fill="none" viewBox="0 0 20 20">
                        <path d="M10.8333 2.5H17.5M17.5 2.5V9.16667M17.5 2.5L9.16667 10.8333M8.33333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H14.1667C15.0871 17.5 15.8333 16.7538 15.8333 15.8333V11.6667" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Open Document
                    </button>
                    {selectedDocument.aiConfidence !== "—" && (() => {
                      const p = getConfidencePill(selectedDocument.aiConfidence);
                      return (
                        <span className={`inline-block px-2 py-1 rounded-full text-[12px] ${p.classes}`}>
                          {p.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-[#eaecf0] mb-4">
                  <div className="flex gap-1">
                    <button
                      onClick={() => setActiveDocTab('summary')}
                      className={`flex items-center gap-1.5 text-[13px] px-3 py-2 font-['Figtree:Medium',sans-serif] ${activeDocTab === 'summary' ? 'border-b-2 border-black font-semibold text-black' : 'text-[#667085]'}`}
                    >
                      <svg className="size-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 0 C8.3 2.8 9.5 6.5 16 8 C9.5 9.5 8.3 13.2 8 16 C7.7 13.2 6.5 9.5 0 8 C6.5 6.5 7.7 2.8 8 0Z"/>
                      </svg>
                      AI Summary
                    </button>
                    <button
                      onClick={() => setActiveDocTab('metrics')}
                      className={`text-[13px] px-3 py-2 font-['Figtree:Medium',sans-serif] ${activeDocTab === 'metrics' ? 'border-b-2 border-black font-semibold text-black' : 'text-[#667085]'}`}
                    >
                      Key Metrics
                    </button>
                    <button
                      onClick={() => setActiveDocTab('discrepancies')}
                      className={`text-[13px] px-3 py-2 font-['Figtree:Medium',sans-serif] ${activeDocTab === 'discrepancies' ? 'border-b-2 border-black font-semibold text-black' : 'text-[#667085]'}`}
                    >
                      Discrepancies
                    </button>
                  </div>
                </div>

                {/* Loading */}
                {docLoading && (
                  <div className="flex items-center gap-2 py-4">
                    <div className="size-4 rounded-full border-2 border-[#144430] border-t-transparent animate-spin shrink-0" />
                    <p className="text-[13px] text-[#667085]">Loading document data…</p>
                  </div>
                )}
                {docLoadError && !docLoading && (
                  <div className="px-3 py-2 bg-[#fef3f2] border border-[#fca5a5] rounded-[8px] mb-4">
                    <p className="text-[12px] text-[#b42318]">{docLoadError}</p>
                  </div>
                )}

                {/* Summary tab */}
                {activeDocTab === 'summary' && !docLoading && (
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const raw = String(
                        fullDocData?.summary ??
                        fullDocData?.executiveSummary ??
                        fullDocData?.executive_summary ??
                        fullDocData?.documentSummary ??
                        ''
                      ).trim();
                      if (!raw) return (
                        <p className="text-[13px] text-[#667085] italic">
                          {docLoadError ? '' : 'No summary available for this document yet.'}
                        </p>
                      );
                      return raw.split(/\n\n+/).filter(Boolean).slice(0, 3).map((para, i) => (
                        <p key={i} className="text-[13px] text-[#475467] leading-[22px]">{para}</p>
                      ));
                    })()}
                  </div>
                )}

                {/* Key Metrics tab */}
                {activeDocTab === 'metrics' && !docLoading && (
                  <div className="flex flex-col gap-3">
                    {editSaveError && (
                      <div className="px-3 py-2 bg-[#fef3f2] border border-[#fca5a5] rounded-[8px]">
                        <p className="text-[12px] text-[#b42318]">{editSaveError}</p>
                      </div>
                    )}
                    {(() => {
                      // Fields that are structural/narrative — not metrics to display as cards
                      const SKIP = new Set([
                        'id','title','documentName','document_name','documentId','document_id',
                        'executiveSummary','executive_summary','summary','documentSummary','document_summary',
                        'anomalies','recommendations','healthScore','healthRating','health_score','health_rating',
                        'confidenceScore','confidence_score','isLocked','is_locked','reportNumber','report_number',
                        'type','report_type','category','status','createdAt','created_at','updatedAt','updated_at',
                        'signedAt','signed_at','finalizedAt','finalized_at','performanceIndicators','performance_indicators',
                      ]);

                      // Collect all metrics: start with keyMetrics, then scan other object fields
                      const seen = new Set<string>();
                      const entries: Array<[string, unknown]> = [];
                      const add = (k: string, v: unknown) => { if (!seen.has(k)) { seen.add(k); entries.push([k, v]); } };

                      const primary = (fullDocData?.keyMetrics ?? fullDocData?.extractedMetrics) as Record<string, unknown> | undefined;
                      if (primary) Object.entries(primary).forEach(([k, v]) => add(k, v));

                      if (fullDocData) {
                        Object.entries(fullDocData).forEach(([k, v]) => {
                          if (SKIP.has(k) || k === 'keyMetrics' || k === 'extractedMetrics') return;
                          if (v && typeof v === 'object' && !Array.isArray(v)) {
                            Object.entries(v as Record<string, unknown>).forEach(([subK, subV]) => add(subK, subV));
                          }
                        });
                      }

                      // camelCase / snake_case → "Title Case With Spaces"
                      const fmtKey = (k: string) =>
                        k.replace(/([a-z])([A-Z])/g, '$1 $2')
                         .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
                         .replace(/_/g, ' ')
                         .replace(/\b\w/g, c => c.toUpperCase())
                         .trim();

                      if (entries.length === 0) return (
                        <p className="text-[13px] text-[#667085] italic">No key metrics extracted from this document.</p>
                      );

                      return entries.map(([key, val]) => {
                        let value: string;
                        let page: string | number | undefined;
                        if (val && typeof val === 'object' && !Array.isArray(val)) {
                          const obj = val as Record<string, unknown>;
                          value = String(obj.value ?? obj.val ?? '—');
                          page = obj.page as string | number | undefined;
                        } else {
                          value = String(val ?? '—');
                        }
                        const wasEdited = docEditedFields.current.get(selectedDocument.id)?.has(key) ?? false;
                        const displayValue = isEditing ? (editedMetrics[key] ?? value) : value;
                        return (
                          <div key={key} className="border border-[#eaecf0] rounded-[8px] p-3">
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] text-[#667085] uppercase tracking-wider">{fmtKey(key)}</span>
                                {wasEdited && (
                                  <span className="text-[9px] bg-[#fef0c7] text-[#dc6803] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wide">Edited</span>
                                )}
                              </div>
                              {page != null && (
                                <span className="text-[10px] text-[#98a2b3]">p. {page}</span>
                              )}
                            </div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={displayValue}
                                onChange={e => setEditedMetrics(prev => ({ ...prev, [key]: e.target.value }))}
                                className="w-full px-2 py-1.5 border border-[#144430] rounded-[6px] text-[13px] text-[#475467] leading-[22px] focus:outline-none focus:ring-1 focus:ring-[#144430]"
                              />
                            ) : (
                              <div className="text-[13px] text-[#475467] leading-[22px]">{displayValue}</div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}

                {/* Discrepancies tab */}
                {activeDocTab === 'discrepancies' && !docLoading && (
                  <div className="flex flex-col gap-3">
                    {(() => {
                      const raw = fullDocData?.anomalies ?? fullDocData?.discrepancies ?? fullDocData?.flags;
                      const items: Record<string, unknown>[] = Array.isArray(raw)
                        ? (raw as Record<string, unknown>[])
                        : [];

                      if (items.length === 0) return (
                        <p className="text-[13px] text-[#667085] italic">No discrepancies flagged for this document.</p>
                      );

                      const severityStyles: Record<string, string> = {
                        high:    'bg-[#fff1f2] text-[#e11d48]',
                        medium:  'bg-[#fffbeb] text-[#d97706]',
                        warning: 'bg-[#fffbeb] text-[#d97706]',
                        low:     'bg-[#f8fafc] text-[#64748b]',
                      };

                      const fmtKey = (k: string) =>
                        k.replace(/([a-z])([A-Z])/g, '$1 $2')
                         .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
                         .replace(/_/g, ' ')
                         .replace(/\b\w/g, c => c.toUpperCase())
                         .trim();

                      return items.map((item, i) => {
                        const title = String(item.type ?? item.title ?? item.name ?? `Discrepancy ${i + 1}`);
                        const description = String(item.description ?? item.detail ?? item.message ?? '');
                        const severity = String(item.severity ?? item.level ?? item.impact ?? 'low').toLowerCase();
                        const confidence = item.confidence != null
                          ? `${Math.round(Number(item.confidence) * (Number(item.confidence) <= 1 ? 100 : 1))}%`
                          : null;
                        const page = item.page ?? item.pageNumber ?? item.page_number;

                        const sStyle = severityStyles[severity] ?? severityStyles.low;

                        return (
                          <div key={i} className="border border-[#eaecf0] rounded-[8px] p-3">
                            <div className="flex justify-between items-start mb-1.5">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[11px] text-[#667085] uppercase tracking-wider">{fmtKey(title)}</span>
                                <span className={`text-[12px] px-3 py-1 rounded-full font-medium ${sStyle}`}>
                                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0 ml-2">
                                {confidence && (
                                  <span className="text-[10px] text-[#98a2b3]">{confidence}</span>
                                )}
                                {page != null && (
                                  <span className="text-[10px] text-[#98a2b3]">p. {page}</span>
                                )}
                              </div>
                            </div>
                            {description && (
                              <div className="text-[13px] text-[#475467] leading-[22px]">{description}</div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>

              {/* Footer — hidden for approved documents */}
              {selectedDocument.status !== "Approved" && (
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t-2 border-[#eaecf0]">
                  {finalizeError && (
                    <div className="mb-3 px-3 py-2 bg-[#fef3f2] border border-[#fca5a5] rounded-[8px] flex items-start gap-2">
                      <svg className="size-4 text-[#b42318] shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16"><path d="M8 5v4M8 11h.01M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      <p className="text-[11px] text-[#b42318] flex-1">{finalizeError}</p>
                      <button onClick={() => setFinalizeError(null)} className="text-[#b42318] shrink-0"><svg className="size-3" fill="none" viewBox="0 0 12 12"><path d="M9 3L3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/></svg></button>
                    </div>
                  )}
                  <div className="flex gap-4 justify-center items-center">
                    {/* Edit / Save */}
                    <button
                      disabled={editSaving}
                      onClick={async () => {
                        if (isEditing) {
                          const raw = (fullDocData?.keyMetrics ?? fullDocData?.extractedMetrics ?? {}) as Record<string, unknown>;
                          const changed = new Set<string>();
                          Object.entries(raw).forEach(([key, val]) => {
                            const orig = val && typeof val === 'object' && !Array.isArray(val)
                              ? String((val as Record<string, unknown>).value ?? (val as Record<string, unknown>).val ?? '')
                              : String(val ?? '');
                            if (editedMetrics[key] !== undefined && editedMetrics[key] !== orig) changed.add(key);
                          });
                          if (changed.size === 0) { setIsEditing(false); return; }
                          setEditSaving(true);
                          setEditSaveError(null);
                          try {
                            const updatedMetrics: Record<string, unknown> = {};
                            Object.entries(raw).forEach(([key, val]) => {
                              const newVal = editedMetrics[key] !== undefined ? editedMetrics[key] : val;
                              if (val && typeof val === 'object' && !Array.isArray(val)) {
                                updatedMetrics[key] = { ...(val as Record<string, unknown>), value: newVal };
                              } else {
                                updatedMetrics[key] = newVal;
                              }
                            });
                            await editDocumentData(selectedDocument.id, { keyMetrics: updatedMetrics });
                            const updated = { ...(fullDocData ?? {}), keyMetrics: updatedMetrics };
                            docDataCache.current.set(selectedDocument.id, updated);
                            setFullDocData(updated);
                            const existing = docEditedFields.current.get(selectedDocument.id) ?? new Set<string>();
                            changed.forEach(k => existing.add(k));
                            docEditedFields.current.set(selectedDocument.id, existing);
                            setIsEditing(false);
                          } catch (err) {
                            setEditSaveError(err instanceof Error ? err.message : 'Failed to save changes.');
                          } finally {
                            setEditSaving(false);
                          }
                        } else {
                          const raw = (fullDocData?.keyMetrics ?? fullDocData?.extractedMetrics ?? {}) as Record<string, unknown>;
                          const initial: Record<string, string> = {};
                          Object.entries(raw).forEach(([key, val]) => {
                            initial[key] = val && typeof val === 'object' && !Array.isArray(val)
                              ? String((val as Record<string, unknown>).value ?? (val as Record<string, unknown>).val ?? '')
                              : String(val ?? '');
                          });
                          setEditedMetrics(initial);
                          setEditSaveError(null);
                          setIsEditing(true);
                        }
                      }}
                      className="h-[53px] px-4 w-[124px] border border-[#c9cdd6] rounded-[10px] flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isEditing ? (
                        <>
                          <svg className="size-5" viewBox="0 0 20 20" fill="none">
                            <path d="M15.833 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V4.167A1.667 1.667 0 0 1 4.167 2.5h9.166L17.5 6.667v9.166A1.667 1.667 0 0 1 15.833 17.5Z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.167 17.5V10.833H5.833V17.5M5.833 2.5v4.167h6.667" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-black">{editSaving ? 'Saving…' : 'Save'}</span>
                        </>
                      ) : (
                        <>
                          <svg className="size-6" viewBox="0 0 24 24" fill="none">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-black">Edit</span>
                        </>
                      )}
                    </button>
                    {/* Approve */}
                    <button
                      onClick={async () => {
                        setFinalizeError(null);
                        try {
                          await approveDocument(selectedDocument.id);
                          setDocuments(prev => prev.map(d => d.id === selectedDocument.id ? { ...d, status: 'Approved' as const } : d));
                          setSelectedDocument(prev => prev ? { ...prev, status: 'Approved' as Document['status'] } : prev);
                        } catch (err) {
                          setFinalizeError(err instanceof Error ? err.message : 'Failed to approve document. Please try again.');
                        }
                      }}
                      className="h-[53px] px-4 w-[217px] bg-[#144430] rounded-[10px] flex items-center justify-center gap-2 hover:bg-[#0f3324] transition-colors"
                    >
                      <div className="flex items-center justify-center size-6">
                        <svg className="size-4" viewBox="0 0 20 15" fill="none">
                          <path d="M18 2L7 13L2 8" stroke="#EAECF0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"/>
                        </svg>
                      </div>
                      <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-white">Approve Document</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comparison Side Panel */}
      {showComparePanel && (
        <div
          className={`fixed top-0 right-0 h-screen bg-white border-l border-[#eaecf0] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all duration-300 ${
            compareIsFullWidth ? 'w-[calc(100vw-187px)]' : 'w-[500px]'
          }`}
          style={{ zIndex: 1000 }}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="border-b border-[#eaecf0] px-6 py-3 flex items-center justify-between">
              <button
                onClick={() => setCompareIsFullWidth(!compareIsFullWidth)}
                title={compareIsFullWidth ? "Collapse panel" : "Expand panel"}
                className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
              >
                <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
                  {compareIsFullWidth ? (
                    <>
                      <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                      <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(9, 5)"/>
                    </>
                  ) : (
                    <>
                      <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                      <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(10, 5)"/>
                    </>
                  )}
                </svg>
              </button>
              <button
                onClick={() => { setShowComparePanel(false); setCompareIsFullWidth(false); }}
                title="Close"
                className="flex items-center justify-center size-[32px] rounded-lg text-[#667085] hover:text-black hover:bg-gray-50 transition-colors"
              >
                <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20">
                  <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 pt-6 pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {/* Title */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-1">
                  <svg className="size-4 shrink-0" viewBox="0 0 16 16" fill="#144430">
                    <path d="M8 0 C8.3 2.8 9.5 6.5 16 8 C9.5 9.5 8.3 13.2 8 16 C7.7 13.2 6.5 9.5 0 8 C6.5 6.5 7.7 2.8 8 0Z"/>
                  </svg>
                  <h2 className="font-['Figtree:Medium',sans-serif] text-[20px] leading-[30px] text-black">
                    Document Comparison
                  </h2>
                </div>
                <p className="text-[13px] text-[#667085]">
                  {selectedIds.size} document{selectedIds.size !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Loading */}
              {compareLoading && (
                <div className="flex flex-col items-center gap-4 py-12">
                  <svg className="size-12 animate-spin" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="#e5e7eb" strokeWidth="4"/>
                    <path d="M24 4a20 20 0 0 1 20 20" stroke="#144430" strokeWidth="4" strokeLinecap="round"/>
                  </svg>
                  <div className="text-center">
                    <p className="font-['Figtree:Medium',sans-serif] text-[15px] text-black">Comparing documents…</p>
                    <p className="text-[13px] text-[#667085] mt-1">AI is analyzing and comparing the selected documents.</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {compareError && !compareLoading && (
                <div className="px-4 py-3 bg-[#fef3f2] border border-[#fca5a5] rounded-[8px] flex items-start gap-2 mb-4">
                  <svg className="size-4 text-[#b42318] shrink-0 mt-0.5" fill="none" viewBox="0 0 16 16">
                    <path d="M8 5v4M8 11h.01M2 8a6 6 0 1 0 12 0A6 6 0 0 0 2 8z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <p className="text-[13px] text-[#b42318]">{compareError}</p>
                </div>
              )}

              {/* Results */}
              {compareResult && !compareLoading && (
                <div className="flex flex-col gap-5">
                  {/* AI Insights card */}
                  {(() => {
                    const insight = String(
                      compareResult.aiInsights ??
                      compareResult.ai_insights ??
                      compareResult.insights ??
                      compareResult.findings ??
                      compareResult.observations ??
                      compareResult.analysis ??
                      compareResult.comparativeSummary ??
                      compareResult.comparative_summary ??
                      compareResult.summary ??
                      compareResult.comparison ??
                      ''
                    ).trim();
                    if (!insight) return (
                      <div className="bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="size-3.5 shrink-0" viewBox="0 0 14 14" fill="#144430">
                            <path d="M7 0 C7.2 2.4 8.1 5.3 13 7 C8.1 8.7 7.2 11.6 7 14 C6.8 11.6 5.9 8.7 1 7 C5.9 5.3 6.8 2.4 7 0Z"/>
                          </svg>
                          <p className="text-[11px] font-semibold text-[#144430] uppercase tracking-wider">AI Insights</p>
                        </div>
                        <p className="text-[13px] text-[#667085] italic">No comparative insights were returned for these documents.</p>
                      </div>
                    );
                    return (
                      <div className="bg-[#f0f7f4] border border-[#a9d4be] rounded-[10px] p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <svg className="size-3.5 shrink-0" viewBox="0 0 14 14" fill="#144430">
                            <path d="M7 0 C7.2 2.4 8.1 5.3 13 7 C8.1 8.7 7.2 11.6 7 14 C6.8 11.6 5.9 8.7 1 7 C5.9 5.3 6.8 2.4 7 0Z"/>
                          </svg>
                          <p className="text-[11px] font-semibold text-[#144430] uppercase tracking-wider">AI Insights</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          {insight.split(/\n\n+/).filter(Boolean).map((para, i) => (
                            <p key={i} className="text-[13px] text-[#1a3d2e] leading-[22px]">{para}</p>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Key differences */}
                  {(() => {
                    const diffs = compareResult.keyDifferences ?? compareResult.key_differences ?? compareResult.differences;
                    if (!Array.isArray(diffs) || diffs.length === 0) return null;
                    return (
                      <div>
                        <p className="text-[11px] text-[#667085] uppercase tracking-wider mb-2">Key Differences</p>
                        <div className="flex flex-col gap-2">
                          {(diffs as unknown[]).map((d, i) => (
                            <div key={i} className="border border-[#eaecf0] rounded-[8px] px-3 py-2.5 text-[13px] text-[#475467] leading-[22px]">
                              {typeof d === 'string' ? d : String((d as Record<string, unknown>).description ?? (d as Record<string, unknown>).text ?? JSON.stringify(d))}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Individual documents */}
                  <div>
                    <p className="text-[11px] text-[#667085] uppercase tracking-wider mb-2">Documents Compared</p>
                    <div className="flex flex-col gap-2">
                      {documents
                        .filter(d => selectedIds.has(d.id))
                        .map(doc => (
                          <div key={doc.id} className="border border-[#eaecf0] rounded-[8px] p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <svg className="size-4 shrink-0 text-[#667085]" fill="none" viewBox="0 0 20 20">
                                <path d="M11.667 1.667H5A1.667 1.667 0 0 0 3.333 3.333v13.334A1.667 1.667 0 0 0 5 18.333h10A1.667 1.667 0 0 0 16.667 16.667V6.667L11.667 1.667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M11.667 1.667v5h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <div className="min-w-0">
                                <p className="text-[13px] text-black font-['Figtree:Medium',sans-serif] truncate">{doc.title}</p>
                                <p className="text-[11px] text-[#667085]">{doc.type} · {doc.uploadDate}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => { setShowComparePanel(false); setCompareIsFullWidth(false); openDocPanel(doc); }}
                              className="shrink-0 h-[32px] px-3 border border-[#d0d5dd] rounded-lg text-[12px] text-[#344054] hover:bg-gray-50 transition-colors"
                            >
                              View Details
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Collapsed panel indicator */}
      {selectedDocument && !isPanelExpanded && (
        <button
          onClick={() => setIsPanelExpanded(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 bg-white border border-[#eaecf0] rounded-l-lg p-2 shadow-lg hover:bg-gray-50"
          style={{ zIndex: 1000 }}
        >
          <svg className="size-5 text-[#667085]" fill="none" viewBox="0 0 16 16">
            <path d="M10 3L5 8L10 13" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
          </svg>
        </button>
      )}

      {/* Doc Toast */}
      <div className={`fixed top-6 right-6 z-[2000] transition-all duration-300 ${docToast ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}>
        <div className="bg-[#ecfdf3] border border-[#a9efc5] rounded-[12px] shadow-lg px-5 py-3 flex items-center gap-3 min-w-[260px]">
          <svg className="size-4 text-[#027a48] shrink-0" fill="none" viewBox="0 0 20 20"><path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p className="text-[13px] text-black">{docToast}</p>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={modalStep === 'analyzing' ? undefined : closeModal} />
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[680px] mx-4 p-8 flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[22px] text-black leading-tight">
                  Upload & Analyze Documents
                </h2>
                <p className="text-[14px] text-[#667085] mt-1">
                  AI will extract key metrics and flag discrepancies from your documents.
                </p>
              </div>
              {modalStep !== 'analyzing' && (
                <button onClick={closeModal} className="text-[#667085] hover:text-black ml-4 shrink-0">
                  <svg className="size-5" fill="none" viewBox="0 0 20 20">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}
            </div>

            {modalStep === 'idle' && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-[12px] px-6 py-10 flex flex-col items-center gap-3 transition-colors ${
                    isDragging ? "border-black bg-gray-50" : "border-[#d0d5dd] bg-[#f9fafb]"
                  }`}
                >
                  <div className="size-12 bg-white border border-[#d0d5dd] rounded-full flex items-center justify-center shadow-sm">
                    <svg className="size-5 text-[#667085]" fill="none" viewBox="0 0 20 20">
                      <path d="M10 13.333V3.333M10 3.333L6.667 6.667M10 3.333L13.333 6.667" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.333 13.333v1.334A2.333 2.333 0 0 0 5.667 17h8.666a2.333 2.333 0 0 0 2.334-2.333v-1.334" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-[14px] text-black font-['Figtree:Medium',sans-serif]">Drag and drop files here</p>
                    <p className="text-[13px] text-[#667085] mt-0.5">or</p>
                  </div>
                  <label className="cursor-pointer h-[36px] px-5 border border-[#d0d5dd] rounded-lg text-[14px] text-[#344054] bg-white hover:bg-gray-50 transition-colors flex items-center">
                    Browse files
                    <input type="file" multiple accept=".pdf,.xlsx,.xls,.doc,.docx,.csv" className="hidden" onChange={handleFileInput} />
                  </label>
                  <p className="text-[12px] text-[#98a2b3]">PDF, Excel, Word, CSV · Max 20 documents</p>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="flex flex-col gap-2 max-h-[160px] overflow-y-auto">
                    <p className="text-[12px] text-[#667085]">{uploadedFiles.length} / 20 files selected</p>
                    {uploadedFiles.map((file, i) => (
                      <div key={i} className="flex items-center justify-between px-3 py-2 bg-[#f9fafb] border border-[#eaecf0] rounded-lg">
                        <span className="text-[13px] text-black truncate">{file.name}</span>
                        <button onClick={() => setUploadedFiles(prev => prev.filter((_, idx) => idx !== i))} className="text-[#98a2b3] hover:text-[#b42318] ml-3 shrink-0">
                          <svg className="size-4" fill="none" viewBox="0 0 16 16"><path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {uploadError && <p className="text-[13px] text-[#b42318] text-center">{uploadError}</p>}

                <div className="flex justify-center">
                  <button onClick={handleUpload} disabled={uploadedFiles.length === 0} className="h-[43px] px-6 bg-[#144430] rounded-[10px] flex items-center gap-2 hover:bg-[#0f3324] transition-colors disabled:opacity-60">
                    <svg className="size-4" fill="none" viewBox="0 0 20 20">
                      <path d="M10 13.333V3.333M10 3.333L6.667 6.667M10 3.333L13.333 6.667" stroke="#EAECF0" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M3.333 13.333v1.334A2.333 2.333 0 0 0 5.667 17h8.666a2.333 2.333 0 0 0 2.334-2.333v-1.334" stroke="#EAECF0" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">Upload & Analyze</span>
                  </button>
                </div>
              </>
            )}

            {modalStep === 'analyzing' && (
              <div className="flex flex-col items-center gap-5 py-8">
                <svg className="size-16 animate-spin" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6"/>
                  <path d="M32 4a28 28 0 0 1 28 28" stroke="#144430" strokeWidth="6" strokeLinecap="round"/>
                </svg>
                <div className="text-center">
                  <p className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">Analyzing documents…</p>
                  <p className="text-[13px] text-[#667085] mt-1">AI is extracting key metrics and flagging discrepancies. This may take a moment.</p>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {["Parsing document structure", "Extracting financial metrics", "Identifying discrepancies", "Generating summary"].map((step, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-[#f9fafb] rounded-lg">
                      <div className="size-4 rounded-full border-2 border-[#144430] border-t-transparent animate-spin shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
                      <span className="text-[13px] text-[#344054]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {modalStep === 'complete' && (
              <>
                <div className="flex items-center gap-2 text-[#027a48]">
                  <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-['Figtree:Medium',sans-serif] font-medium text-[14px]">Upload started. Documents are being analyzed in the background — watch for the Processing badge in the table.</span>
                </div>
                <div className="flex justify-center">
                  <button onClick={closeModal} className="h-[43px] px-6 bg-[#144430] rounded-[10px] flex items-center gap-2 hover:bg-[#0f3324] transition-colors">
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">Done</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

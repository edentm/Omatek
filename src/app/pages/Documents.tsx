import { useState, useEffect } from "react";
import FilterButton from "../components/FilterButton";
import { getDocuments, uploadDocument, openDocument, pollJobStatus, deleteDocument } from "../../api";

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
                          <tr key={doc.id} className={`hover:bg-gray-50 ${isSelected ? "bg-[#f0f9f4]" : ""}`}>
                            <td className="px-4 py-4 w-10">
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
                            <td className="px-4 py-4 whitespace-nowrap text-right">
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

import { useState, useEffect } from "react";
import FilterButton from "../components/FilterButton";
import { getDocuments, uploadDocument, openDocument } from "../../api";

type Document = {
  id: number;
  title: string;
  type: string;
  uploadDate: string;
  uploadedBy: string;
  uploadedByRole: string;
};

export default function Documents() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [docsError, setDocsError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [uploadDateFrom, setUploadDateFrom] = useState("");
  const [uploadDateTo, setUploadDateTo] = useState("");

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [modalStep, setModalStep] = useState<'idle' | 'analyzing' | 'complete'>('idle');
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    getDocuments()
      .then((data: unknown[]) => {
        const mapped = (data as Record<string, unknown>[]).map((d) => ({
          id: d.id as number,
          title: (d.filename ?? d.title ?? d.name ?? "Untitled") as string,
          type: ((d.file_type ?? d.type ?? "") as string).toUpperCase() || "—",
          uploadDate: d.created_at
            ? new Date(d.created_at as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
            : (d.upload_date as string) || "—",
          uploadedBy: (d.uploaded_by ?? d.uploader_name ?? "") as string,
          uploadedByRole: (d.uploader_role ?? d.role ?? "") as string,
        }));
        setDocuments(mapped);
      })
      .catch((err: Error) => setDocsError(err.message))
      .finally(() => setLoadingDocs(false));
  }, []);

  const refreshDocuments = () => {
    getDocuments()
      .then((data: unknown[]) => {
        const mapped = (data as Record<string, unknown>[]).map((d) => ({
          id: d.id as number,
          title: (d.filename ?? d.title ?? d.name ?? "Untitled") as string,
          type: ((d.file_type ?? d.type ?? "") as string).toUpperCase() || "—",
          uploadDate: d.created_at
            ? new Date(d.created_at as string).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
            : (d.upload_date as string) || "—",
          uploadedBy: (d.uploaded_by ?? d.uploader_name ?? "") as string,
          uploadedByRole: (d.uploader_role ?? d.role ?? "") as string,
        }));
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
      for (const file of uploadedFiles) {
        await uploadDocument(file);
      }
      refreshDocuments();
      setModalStep('complete');
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
      setModalStep('idle');
    }
  };

  useEffect(() => {
    if (!showUploadModal) setModalStep('idle');
  }, [showUploadModal]);

  const toggleFilter = (name: string) => setOpenFilter(prev => prev === name ? null : name);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
  };

  return (
    <div className="bg-white h-full w-full p-8 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Documents
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
            <path
              d="M10 4.16667V15.8333M4.16667 10H15.8333"
              stroke="#344054"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
      <div className="flex gap-2 mb-6">
        <FilterButton
          label="Type"
          type="checkbox"
          options={[
            { value: "PDF", label: "PDF" },
            { value: "Excel", label: "Excel" },
          ]}
          selected={typeFilter}
          onChange={setTypeFilter}
          isOpen={openFilter === "type"}
          onToggle={() => toggleFilter("type")}
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
      </div>

      {loadingDocs && <p className="text-[14px] text-[#667085] mb-4">Loading documents…</p>}
      {docsError && <p className="text-[14px] text-[#b42318] mb-4">{docsError}</p>}

      {/* Table */}
      {!loadingDocs && (
        <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Document Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Upload Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uploaded By
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.filter(doc => {
                if (searchQuery && ![doc.title, doc.type, doc.uploadedBy].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
                if (typeFilter.length > 0 && !typeFilter.includes(doc.type)) return false;
                if (uploadDateFrom || uploadDateTo) {
                  const d = parseDate(doc.uploadDate);
                  if (d && uploadDateFrom && d < new Date(uploadDateFrom)) return false;
                  if (d && uploadDateTo && d > new Date(uploadDateTo)) return false;
                }
                return true;
              }).map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                      {doc.title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                    {doc.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                    {doc.uploadDate}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-900">{doc.uploadedBy}</div>
                    <div className="text-[12px] text-gray-500">{doc.uploadedByRole}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openDocument(doc.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="size-5" fill="none" viewBox="0 0 20 20">
                        <path d="M10.8333 2.5H17.5M17.5 2.5V9.16667M17.5 2.5L9.16667 10.8333M8.33333 4.16667H4.16667C3.24619 4.16667 2.5 4.91286 2.5 5.83333V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H14.1667C15.0871 17.5 15.8333 16.7538 15.8333 15.8333V11.6667" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={modalStep === 'analyzing' ? undefined : closeModal}
          />

          {/* Modal card */}
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[680px] mx-4 p-8 flex flex-col gap-6">
            {/* Header */}
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

            {/* ── IDLE: drop zone + file list + upload button ── */}
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

                {uploadError && (
                  <p className="text-[13px] text-[#b42318] text-center">{uploadError}</p>
                )}

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

            {/* ── ANALYZING: loading spinner ── */}
            {modalStep === 'analyzing' && (
              <div className="flex flex-col items-center gap-5 py-8">
                <div className="relative size-16">
                  <svg className="size-16 animate-spin" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6"/>
                    <path d="M32 4a28 28 0 0 1 28 28" stroke="#144430" strokeWidth="6" strokeLinecap="round"/>
                  </svg>
                </div>
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

            {/* ── COMPLETE ── */}
            {modalStep === 'complete' && (
              <>
                <div className="flex items-center gap-2 text-[#027a48]">
                  <svg className="size-4 shrink-0" viewBox="0 0 20 20" fill="none">
                    <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-['Figtree:Medium',sans-serif] font-medium text-[14px]">Analysis complete. Extracted metrics and any flagged discrepancies will appear in their respective tabs.</span>
                </div>

                <div className="bg-[#f9fafb] border border-[#eaecf0] rounded-[10px] p-5 flex flex-col gap-4">
                  <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black">Key Findings</p>
                  <p className="text-[13px] text-[#475467] leading-[20px]">
                    The AI identified several critical financial metrics across the uploaded documents. Revenue for FY 2025 stands at ₦2.2M — a significant decline of 64.9% compared to the ₦6.27M recorded in FY 2024. Administrative expenses decreased by 26.2% to ₦50.52M, suggesting ongoing cost-reduction measures. Net loss for the period is ₦48.32M. Market cap is currently ₦6.94B with a share price of ₦2.47 on the NGX, reflecting a recent 8.91% uptick.
                  </p>
                  <p className="text-[13px] text-[#475467] leading-[20px]">
                    Three high-confidence discrepancies were flagged for review. A ₦1.9B gap was detected between reported short-term borrowings and reconciled payables across two documents, consistent with previously reported accounting inconsistencies. Additionally, accrued expenses of ₦2.76B appear understated relative to prior period adjustments, and one revenue line item could not be cross-referenced to a supporting invoice. These findings have been surfaced in the Discrepancies tab for further action.
                  </p>
                </div>

                <div className="flex justify-center">
                  <button onClick={closeModal} className="h-[43px] px-6 bg-[#144430] rounded-[10px] flex items-center gap-2 hover:bg-[#0f3324] transition-colors">
                    <svg className="size-4" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="7.5" stroke="#EAECF0" strokeWidth="1.5"/>
                      <path d="M6.5 10L9 12.5L13.5 7.5" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="font-['Figtree:Bold',sans-serif] text-[14px] text-white">Complete Analysis</span>
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

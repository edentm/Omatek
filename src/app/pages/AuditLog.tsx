import { useState, useEffect } from "react";
import { getDocuments, getReports } from "../../api";

type AuditEntry = {
  id: string;
  action: string;
  actor: string;
  target: string;
  timestamp: string;
  category: "document" | "report";
};

export default function AuditLog() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<"all" | "document" | "report">("all");

  useEffect(() => {
    Promise.all([
      getDocuments().catch(() => []),
      getReports().catch(() => []),
    ]).then(([docs, reports]) => {
      const docEntries: AuditEntry[] = (docs as Record<string, unknown>[]).map((d) => ({
        id: `doc-${d.id}`,
        action: "Document Uploaded",
        actor: (d.uploadedByName ?? d.uploadedBy ?? "Unknown") as string,
        target: (d.originalFilename ?? d.filename ?? `Document #${d.id}`) as string,
        timestamp: (d.createdAt ?? "") as string,
        category: "document",
      }));

      const reportEntries: AuditEntry[] = (reports as Record<string, unknown>[]).flatMap((r) => {
        const entries: AuditEntry[] = [];
        const title = (r.title ?? r.documentName ?? `Report #${r.id}`) as string;
        if (r.createdAt) {
          entries.push({
            id: `report-created-${r.id}`,
            action: "Report Generated",
            actor: (r.createdByName ?? r.uploadedByName ?? "System") as string,
            target: title,
            timestamp: r.createdAt as string,
            category: "report",
          });
        }
        if (r.isLocked && r.updatedAt) {
          entries.push({
            id: `report-finalized-${r.id}`,
            action: "Report Finalized",
            actor: (r.finalizedByName ?? r.createdByName ?? "Admin") as string,
            target: title,
            timestamp: r.updatedAt as string,
            category: "report",
          });
        }
        return entries;
      });

      const all = [...docEntries, ...reportEntries].sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setEntries(all);
    }).finally(() => setLoading(false));
  }, []);

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleString("en-US", {
      month: "2-digit", day: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  };

  const filtered = entries.filter((e) => {
    if (categoryFilter !== "all" && e.category !== categoryFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (![e.action, e.actor, e.target].some((f) => f.toLowerCase().includes(q))) return false;
    }
    return true;
  });

  const actionColor = (action: string) => {
    if (action.includes("Uploaded")) return "bg-[#e8f0fe] text-[#1a56db]";
    if (action.includes("Finalized")) return "bg-[#ecfdf3] text-[#027a48]";
    if (action.includes("Generated")) return "bg-[#fef0c7] text-[#dc6803]";
    return "bg-[#f2f4f7] text-[#344054]";
  };

  return (
    <div className="bg-white h-full w-full p-8 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Audit Log
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-[#475467]">
            Activity history — document uploads, report generation, and finalizations
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by action, user, or file…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[40px] w-[280px] px-4 pl-9 border border-[#d0d5dd] rounded-lg text-[13px]"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" fill="none" viewBox="0 0 20 20">
            <path d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex gap-1">
          {(["all", "document", "report"] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`h-[40px] px-4 rounded-lg text-[13px] font-medium border transition-colors ${
                categoryFilter === cat
                  ? "bg-[#144430] text-white border-[#144430]"
                  : "bg-white text-[#344054] border-[#d0d5dd] hover:bg-gray-50"
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="text-[14px] text-[#667085]">Loading activity…</p>}

      {!loading && (
        <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <svg className="size-10 text-[#d0d5dd]" fill="none" viewBox="0 0 24 24">
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-[14px] font-medium text-[#344054]">No activity found</p>
                      <p className="text-[13px] text-[#667085]">
                        {entries.length === 0
                          ? "Activity will appear here once documents are uploaded and reports are generated."
                          : "No records match your current filters."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[12px] font-medium ${actionColor(entry.action)}`}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-[#344054]">
                      {entry.actor}
                    </td>
                    <td className="px-6 py-4 text-[14px] text-[#475467] max-w-[300px] truncate">
                      {entry.target}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#667085]">
                      {formatDate(entry.timestamp)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <p className="text-[12px] text-[#98a2b3] mt-3">
          Showing {filtered.length} of {entries.length} entries
        </p>
      )}
    </div>
  );
}

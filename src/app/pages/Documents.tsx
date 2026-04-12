import { useState } from "react";
import FilterButton from "../components/FilterButton";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [uploadDateFrom, setUploadDateFrom] = useState("");
  const [uploadDateTo, setUploadDateTo] = useState("");

  const toggleFilter = (name: string) => setOpenFilter(prev => prev === name ? null : name);

  const parseDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return null;
    return new Date(`${parts[2]}-${parts[0].padStart(2, "0")}-${parts[1].padStart(2, "0")}`);
  };

  const mockDocuments = [
    { title: "Q1 Financial Report 2026", type: "PDF", uploadDate: "03/31/2026", uploadedBy: "Oladosu Teyibo", uploadedByRole: "Administrator" },
    { title: "Annual Budget Proposal", type: "Excel", uploadDate: "03/28/2026", uploadedBy: "Oladosu Teyibo", uploadedByRole: "Administrator" },
    { title: "Expense Report - March", type: "PDF", uploadDate: "03/25/2026", uploadedBy: "Oladosu Teyibo", uploadedByRole: "Administrator"},
    { title: "Tax Compliance Documents",  type: "PDF", uploadDate: "03/30/2026", uploadedBy: "Oladosu Teyibo", uploadedByRole: "Administrator" },
    { title: "Revenue Analysis Report", type: "Excel", uploadDate: "03/27/2026", uploadedBy: "Oladosu Teyibo", uploadedByRole: "Administrator"},
    { title: "Cash Flow Statement", type: "PDF", uploadDate: "03/26/2026", uploadedBy: "Oladosu Teyibo", uploadedByRole: "Administrator"},
  ];

  return (
    <div className="bg-white h-full w-full p-8">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Documents
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
            View and search for uploaded documents
          </p>
        </div>

        <button className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-gray-50 transition-colors">
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
            Upload Documents
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

      {/* Table */}
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
            {mockDocuments.filter(doc => {
              if (searchQuery && ![doc.title, doc.type, doc.uploadedBy].some(f => f.toLowerCase().includes(searchQuery.toLowerCase()))) return false;
              if (typeFilter.length > 0 && !typeFilter.includes(doc.type)) return false;
              if (uploadDateFrom || uploadDateTo) {
                const d = parseDate(doc.uploadDate);
                if (d && uploadDateFrom && d < new Date(uploadDateFrom)) return false;
                if (d && uploadDateTo && d > new Date(uploadDateTo)) return false;
              }
              return true;
            }).map((doc, index) => (
              <tr key={index} className="hover:bg-gray-50">
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
                  <button className="text-gray-400 hover:text-gray-600">
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
    </div>
  );
}
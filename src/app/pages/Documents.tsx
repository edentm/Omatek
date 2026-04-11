import { useState } from "react";

export default function Documents() {
  const [searchQuery, setSearchQuery] = useState("");

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
        <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
          Type
          <svg className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
          Upload Date
          <svg className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
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
            {mockDocuments.filter(doc =>
              [doc.title, doc.type, doc.uploadedBy].some(field =>
                field.toLowerCase().includes(searchQuery.toLowerCase())
              )
            ).map((doc, index) => (
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
                      <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M5.83333 8.33333L10 12.5M10 12.5L14.1667 8.33333M10 12.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
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
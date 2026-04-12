import { useState } from "react";
import svgPaths from "../../imports/DocumentIntelligencePrototype/svg-9a8cfnzrn9";

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [reportContent, setReportContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  const defaultContent = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.\n\nLorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.\n\nLorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos.`;

  const openReport = (report: typeof mockReports[0]) => {
    setSelectedReport(report);
    setIsEditing(false);
    setReportContent(defaultContent);
  };

  const getConfidencePill = (confidence: string) => {
    const value = parseInt(confidence);
    if (value >= 90) return { label: `${confidence} - Very High`, classes: "bg-[#ecfdf3] text-[#027a48]" };
    if (value >= 80) return { label: `${confidence} - High`, classes: "bg-[#e8f0fe] text-[#1a56db]" };
    if (value >= 60) return { label: `${confidence} - Moderate`, classes: "bg-[#fef0c7] text-[#dc6803]" };
    return { label: `${confidence} - Low`, classes: "bg-[#fef3f2] text-[#b42318]" };
  };

  const mockReports = [
    { title: "Q1 2026 Financial Summary", id: "FR-0001-2026", type: "Quarterly Report", category: "Financial Overview", date: "03/31/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "95%" },
    { title: "Annual Budget Forecast", id: "FR-0002-2026", type: "Budget Analysis", category: "Financial Planning", date: "03/28/2026", status: "Needs Approval", aiConfidence: "87%" },
    { title: "Expense Reconciliation Report", id: "FR-0003-2026", type: "Expense Report", category: "Accounting", date: "03/25/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "92%" },
    { title: "Revenue Analysis - March", id: "FR-0004-2026", type: "Revenue Report", category: "Financial Analysis", date: "03/30/2026", status: "Needs Approval", aiConfidence: "78%" },
    { title: "Cash Flow Statement", id: "FR-0005-2026", type: "Financial Statement", category: "Treasury", date: "03/27/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "98%" },
    { title: "Tax Compliance Review", id: "FR-0006-2026", type: "Compliance Report", category: "Tax & Legal", date: "03/26/2026", status: "Needs Approval", aiConfidence: "83%" },
    { title: "Profit & Loss Statement", id: "FR-0007-2026", type: "Financial Statement", category: "Accounting", date: "03/29/2026", status: "Finalized", finalizedDate: "04/04/26", aiConfidence: "91%" },
  ];

  return (
    <div className="bg-white h-full w-full p-8 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            Reports
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
            Instructions on report viewing and generation
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
            Generate Report
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
          Status
          <svg className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
          Date Created
          <svg className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
          Date Finalized
          <svg className="size-4" fill="none" viewBox="0 0 16 16">
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
          Initial AI Confidence
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
                Report Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Initial AI Confidence
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date Finalized
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockReports.filter(report =>
              [report.title, report.status].some(field =>
                field.toLowerCase().includes(searchQuery.toLowerCase())
              )
            ).map((report, index) => (
              <tr 
                key={index} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => openReport(report)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                    {report.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${
                    report.status === "Finalized"
                      ? "bg-[#ecfdf3] text-[#027a48]"
                      : "bg-[#e8f0fe] text-[#1a56db]"
                  }`}>
                    {report.status === "Finalized" ? "Finalized" : "Needs Approval"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {(() => { const p = getConfidencePill(report.aiConfidence); return (
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${p.classes}`}>
                      {p.label}
                    </span>
                  ); })()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                  {report.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                  {report.finalizedDate ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Side Panel */}
      {selectedReport && (
        <div 
          className={`fixed top-0 right-0 h-screen bg-white border-l border-[#eaecf0] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] transition-all duration-300 ${
            isPanelExpanded ? (isFullWidth ? 'w-[calc(100vw-187px)]' : 'w-[500px]') : 'w-0'
          }`}
          style={{ zIndex: 1000 }}
        >
          {isPanelExpanded && (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="h-[68.8px] border-b border-[#eaecf0] px-6 flex items-center justify-between">
                <div className="flex gap-3">
                  {/* Double chevron expand/collapse button */}
                  <button
                    onClick={() => setIsFullWidth(!isFullWidth)}
                    className="size-5 text-[#667085] hover:text-gray-800"
                  >
                    <svg className="size-full" fill="none" viewBox="0 0 20 20">
                      {isFullWidth ? (
                        <>
                          {/* Double chevron right — collapse */}
                          <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                          <path d="M0 9.16667L4.16667 5L0 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(9, 5)"/>
                        </>
                      ) : (
                        <>
                          {/* Double chevron left — expand */}
                          <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(5, 5)"/>
                          <path d="M5 9.16667L0.833333 5L5 0.833333" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.66667" transform="translate(10, 5)"/>
                        </>
                      )}
                    </svg>
                  </button>
                  {/* Download button */}
                  <button className="size-5 text-[#667085] hover:text-gray-800">
                    <svg className="size-full" fill="none" viewBox="0 0 20 20">
                      <path d="M17.5 12.5V15.8333C17.5 16.2754 17.3244 16.6993 17.0118 17.0118C16.6993 17.3244 16.2754 17.5 15.8333 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V12.5M5.83333 8.33333L10 12.5M10 12.5L14.1667 8.33333M10 12.5V2.5" stroke="currentColor" strokeWidth="1.66667" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                {/* Close button */}
                <button
                  onClick={() => { setSelectedReport(null); setIsFullWidth(false); setIsEditing(false); }}
                  className="size-5 text-[#667085] hover:text-gray-800"
                >
                  <svg className="size-full" fill="none" viewBox="0 0 20 20">
                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div
                className="flex-1 overflow-y-auto px-6 pt-6 pb-24"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Report Title and Status */}
                <div className="mb-6">
                  <h2 className="font-['Figtree:Medium',sans-serif] text-[20px] leading-[30px] text-black mb-2">
                    {selectedReport.title}
                  </h2>
                  <div className="flex gap-2 text-[12px] text-[#52565c] mb-3">
                    <span>Date Generated: {selectedReport.date}</span>
                    <span>Type: {selectedReport.type}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[12px] text-[#52565c]">AI Confidence:</span>
                    {(() => { const p = getConfidencePill(selectedReport.aiConfidence); return (
                      <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${p.classes}`}>
                        {p.label}
                      </span>
                    ); })()}
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Bold',sans-serif] font-bold ${
                      selectedReport.status === "Finalized"
                        ? "bg-[#ecfdf3] text-[#027a48]"
                        : "bg-[#e8f0fe] text-[#1a56db]"
                    }`}>
                      {selectedReport.status === "Finalized" ? "Finalized" : "Needs Approval"}
                    </span>
                    {selectedReport.status === "Finalized" && selectedReport.finalizedDate && (
                      <span className="text-[12px] text-[#027a48]">
                        Date Finalized: {selectedReport.finalizedDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Body content */}
                {isEditing ? (
                  <textarea
                    value={reportContent}
                    onChange={(e) => setReportContent(e.target.value)}
                    className="w-full h-full min-h-[400px] text-[14px] text-[#475467] leading-[22.75px] border border-[#d0d5dd] rounded-lg px-4 py-3 resize-none focus:outline-none focus:border-[#667085] bg-[#f9fafb]"
                    style={{ height: 'calc(100vh - 320px)' }}
                  />
                ) : (
                  <div className="text-[14px] text-[#475467] space-y-4 leading-[22.75px]">
                    {reportContent.split("\n\n").map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Buttons — hidden for approved reports */}
              {selectedReport.status !== "Finalized" && (
                <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white border-t-2 border-[#eaecf0]">
                  <div className="flex gap-4 justify-center items-center">
                    {/* Edit / Save Button */}
                    <button
                      onClick={() => {
                        if (isEditing) {
                          setIsEditing(false);
                          setShowSaveConfirmation(true);
                        } else {
                          setIsEditing(true);
                        }
                      }}
                      className="h-[53px] px-4 w-[124px] border border-[#c9cdd6] rounded-[10px] flex items-center justify-center gap-2"
                    >
                      {isEditing ? (
                        <>
                          <svg className="size-5" viewBox="0 0 20 20" fill="none">
                            <path d="M15.833 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V4.167A1.667 1.667 0 0 1 4.167 2.5h9.166L17.5 6.667v9.166A1.667 1.667 0 0 1 15.833 17.5Z" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M14.167 17.5V10.833H5.833V17.5M5.833 2.5v4.167h6.667" stroke="#667085" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-black">Save</span>
                        </>
                      ) : (
                        <>
                          <svg className="size-6" viewBox="0 0 24 24" fill="none">
                            <path clipRule="evenodd" d={svgPaths.p3d4e8980} fill="#667085" fillRule="evenodd" />
                          </svg>
                          <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-black">Edit</span>
                        </>
                      )}
                    </button>
                    {/* Sign Off Button */}
                    <button className="h-[53px] px-4 w-[217px] bg-[#144430] rounded-[10px] flex items-center justify-center gap-2">
                      <div className="flex items-center justify-center size-6">
                        <svg className="size-4" viewBox="0 0 20 15" fill="none">
                          <path d="M18 2L7 13L2 8" stroke="#EAECF0" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
                        </svg>
                      </div>
                      <span className="font-['Figtree:Bold',sans-serif] text-[16px] text-white text-center">Finalize Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save confirmation toast */}
      <div
        className={`fixed top-6 right-6 z-[2000] transition-all duration-300 ease-out ${
          showSaveConfirmation ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white border border-[#d0d5dd] rounded-[12px] shadow-lg px-5 py-4 flex items-start gap-4 min-w-[300px]">
          <div className="flex items-center justify-center size-9 bg-[#ecfdf3] rounded-full shrink-0 mt-0.5">
            <svg className="size-5" viewBox="0 0 20 20" fill="none">
              <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black leading-[20px]">Changes saved</p>
            <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085] leading-[18px] mt-0.5">Your edits to the report have been saved successfully.</p>
          </div>
          <button
            onClick={() => setShowSaveConfirmation(false)}
            className="text-[#667085] hover:text-gray-900 shrink-0 mt-0.5"
          >
            <svg className="size-4" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Collapsed panel indicator */}
      {selectedReport && !isPanelExpanded && (
        <button
          onClick={() => setIsPanelExpanded(true)}
          className="fixed top-1/2 right-0 -translate-y-1/2 bg-white border border-[#eaecf0] rounded-l-lg p-2 shadow-lg hover:bg-gray-50"
          style={{ zIndex: 1000 }}
        >
          <svg className="size-5 text-[#667085]" fill="none" viewBox="0 0 16 16">
            <path d={svgPaths.p14ca9100} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </svg>
        </button>
      )}
    </div>
  );
}
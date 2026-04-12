import { useState } from "react";

export default function AIAnalysis() {
  const [activeTab, setActiveTab] = useState<'keyMetrics' | 'discrepancies' | 'ingestion'>('discrepancies');
  const [activeMetricsTab, setActiveMetricsTab] = useState<'profit' | 'market' | 'operations' | 'debt'>('profit');

  const mockIssues = [
    { 
      title: "Q1 2026 Financial Summary", 
      id: "FR-0001-2026", 
      level: "High", 
      dateFlagged: "03/31/2026", 
      type: "Quarterly Report", 
      aiConfidence: "95%" 
    },
    { 
      title: "Annual Budget Forecast", 
      id: "FR-0002-2026", 
      level: "Warning", 
      dateFlagged: "03/28/2026", 
      type: "Budget Analysis", 
      aiConfidence: "87%" 
    },
    { 
      title: "Expense Reconciliation Report", 
      id: "FR-0003-2026", 
      level: "Warning", 
      dateFlagged: "03/25/2026", 
      type: "Expense Report", 
      aiConfidence: "92%" 
    },
    { 
      title: "Revenue Analysis - March", 
      id: "FR-0004-2026", 
      level: "High", 
      dateFlagged: "03/30/2026", 
      type: "Revenue Report", 
      aiConfidence: "98%" 
    },
  ];

  const getConfidencePill = (confidence: string) => {
    const value = parseInt(confidence);
    if (value >= 90) return { label: `${confidence} - Very High`, classes: "bg-[#ecfdf3] text-[#027a48]" };
    if (value >= 80) return { label: `${confidence} - High`, classes: "bg-[#e8f0fe] text-[#1a56db]" };
    if (value >= 60) return { label: `${confidence} - Moderate`, classes: "bg-[#fef0c7] text-[#dc6803]" };
    return { label: `${confidence} - Low`, classes: "bg-[#fef3f2] text-[#b42318]" };
  };

  const mockIngestionData = [
    {
      name: "Financial Report 2026",
      id: "DOC-0001",
      numberOfDocs: "12",
      uploadDate: "03/31/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
    {
      name: "Annual Budget Proposal",
      id: "DOC-0002",
      numberOfDocs: "8",
      uploadDate: "03/28/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
    {
      name: "Expense Report - March & April",
      id: "DOC-0003",
      numberOfDocs: "15",
      uploadDate: "03/25/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
    {
      name: "Initial Upload - All Existing Docs",
      id: "DOC-0004",
      numberOfDocs: "24",
      uploadDate: "03/30/2026",
      uploadedBy: "Oladosu Teyibo",
      role: "Administrator"
    },
   
  ];

  return (
    <div className="bg-white h-full w-full p-8">
      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
            AI Analysis
          </h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">Extract key findings from uploaded documents with AI</p>
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
            Upload & Analyze Documents
          </p>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#e8eef7] mb-6">
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('keyMetrics')}
            className={`font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 ${
              activeTab === 'keyMetrics' ? 'border-b-[2.4px] border-black' : ''
            }`}
          >
            Key Metrics
          </button>
          <button 
            onClick={() => setActiveTab('discrepancies')}
            className={`font-['Public_Sans:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 ${
              activeTab === 'discrepancies' ? 'border-b-[2.4px] border-black' : ''
            }`}
          >
            Discrepancies/ Issues
          </button>
          <button 
            onClick={() => setActiveTab('ingestion')}
            className={`font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 ${
              activeTab === 'ingestion' ? 'border-b-[2.4px] border-black' : ''
            }`}
          >
            Ingestion Log
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'discrepancies' ? (
        <div>
          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
              Issue Level
              <svg className="size-4" fill="none" viewBox="0 0 16 16">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
              Date
              <svg className="size-4" fill="none" viewBox="0 0 16 16">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="h-[36px] px-4 border border-[#d0d5dd] rounded-lg flex items-center gap-2 text-[14px]">
              AI Confidence
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
                    Issue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    AI Confidence
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Flagged
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockIssues.map((issue, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                        {issue.title}
                      </div>
                      
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${
                        issue.level === "High"
                          ? "bg-[#fef3f2] text-[#b42318]"
                          : "bg-[#fef0c7] text-[#dc6803]"
                      }`}>
                        {issue.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => { const p = getConfidencePill(issue.aiConfidence); return (
                        <span className={`inline-block px-2 py-1 rounded-full text-[12px] font-['Inter:Regular',sans-serif] ${p.classes}`}>
                          {p.label}
                        </span>
                      ); })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {issue.dateFlagged}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'ingestion' ? (
        <div>
          {/* Ingestion Log Table */}
          <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingestion Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Number of Docs
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Upload Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uploaded By
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockIngestionData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {item.numberOfDocs}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                      {item.uploadDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                        {item.uploadedBy}
                      </div>
                      <div className="text-[12px] text-gray-500">{item.role}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="w-full">
          {/* Sub-navigation */}
          <div className="border-b border-[#e8eef7] mb-6">
            <div className="flex gap-4">
              {(['profit', 'market', 'operations', 'debt'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveMetricsTab(tab)}
                  className={`font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black pb-3 px-2 capitalize ${
                    activeMetricsTab === tab ? 'border-b-[2.4px] border-black' : ''
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Placeholder content boxes */}
          <div className="relative w-full">
            {/* Top row - 3 boxes */}
            <div className="flex gap-[25px] mb-[32px]">
              <div className="bg-white border-[#d0d5dd] border-[0.5px] border-solid h-[127px] rounded-[10px] w-[319px]" />
              <div className="bg-white border-[#d0d5dd] border-[0.5px] border-solid h-[127px] rounded-[10px] w-[312px]" />
              <div className="bg-white border-[#d0d5dd] border-[0.5px] border-solid h-[127px] rounded-[10px] w-[339px]" />
            </div>

            {/* Middle row - 2 boxes */}
            <div className="flex gap-[26px] mb-[32px]">
              <div className="bg-white border-[#d0d5dd] border-[0.5px] border-solid h-[127px] rounded-[10px] w-[444px]" />
              <div className="bg-white border-[#d0d5dd] border-[0.5px] border-solid h-[127px] rounded-[10px] w-[549px]" />
            </div>

            {/* Bottom row - 1 large box */}
            <div className="bg-white border-[#d0d5dd] border-[0.5px] border-solid h-[174px] rounded-[10px] w-full" />
          </div>
        </div>
      )}
    </div>
  );
}
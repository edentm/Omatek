const cards = [
  {
    label: "Revenue",
    value: "₦18.2B",
    subtext: "FY 2025",
    change: "+11.4%",
    positive: true,
  },
  {
    label: "Expenses",
    value: "₦12.6B",
    subtext: "FY 2025",
    change: "+6.8%",
    positive: false,
  },
  {
    label: "New Clients",
    value: "142",
    subtext: "This quarter",
    change: "+23 vs last quarter",
    positive: true,
  },
  {
    label: "Share Price",
    value: "₦2.47",
    subtext: "NGX · Apr 8, 2026",
    change: "+8.91%",
    positive: true,
  },
  {
    label: "Market Cap",
    value: "₦6.94B",
    subtext: "NGX · Apr 8, 2026",
    change: "Rank #125 on NGX",
    positive: true,
    noArrow: true,
  },
];

export default function Dashboard() {
  return (
    <div className="bg-white h-full w-full p-8">
      <div className="flex flex-col gap-[8px] mb-8">
        <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
          Welcome, User
        </h1>
        <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
          View latest insights and complete needed tasks.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white border border-[#d0d5dd] rounded-[10px] p-5 flex flex-col gap-3"
          >
            <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085]">
              {card.label}
            </p>
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[24px] text-black leading-tight">
              {card.value}
            </p>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {!card.noArrow && (
                  <svg
                    className={`size-3.5 shrink-0 ${card.positive ? "text-[#027a48]" : "text-[#b42318]"}`}
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    {card.positive ? (
                      <path d="M7 11V3M7 3L3 7M7 3L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    ) : (
                      <path d="M7 3V11M7 11L3 7M7 11L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    )}
                  </svg>
                )}
                <span
                  className={`text-[12px] font-['Figtree:Medium',sans-serif] font-medium ${
                    card.noArrow
                      ? "text-[#667085]"
                      : card.positive
                      ? "text-[#027a48]"
                      : "text-[#b42318]"
                  }`}
                >
                  {card.change}
                </span>
              </div>
              <p className="text-[11px] text-[#98a2b3] font-['Figtree:Regular',sans-serif]">
                {card.subtext}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[253px] rounded-[10px]" />
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[253px] rounded-[10px]" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[294px] rounded-[10px]" />
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[294px] rounded-[10px]" />
      </div>
    </div>
  );
}

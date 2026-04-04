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

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Top left placeholder */}
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[253px] rounded-[10px]" />
        
        {/* Top right placeholder */}
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[253px] rounded-[10px]" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Bottom left placeholder */}
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[294px] rounded-[10px]" />
        
        {/* Bottom right placeholder */}
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid h-[294px] rounded-[10px]" />
      </div>
    </div>
  );
}

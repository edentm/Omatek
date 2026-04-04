export default function Settings() {
  return (
    <div className="bg-white h-full w-full p-8">
      <div className="flex flex-col gap-[8px] mb-8">
        <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
          Settings
        </h1>
        <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
          Configure your application settings
        </p>
      </div>

      <div className="max-w-3xl">
        {/* Placeholder content boxes */}
        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid rounded-[10px] p-6 mb-6">
          <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[18px] text-black mb-2">
            Account Settings
          </h2>
          <p className="text-[14px] text-gray-600">
            Manage your account preferences and profile information.
          </p>
        </div>

        <div className="bg-white border-[#d0d5dd] border-[0.8px] border-solid rounded-[10px] p-6 mb-6">
          <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[18px] text-black mb-2">
            Security Settings
          </h2>
          <p className="text-[14px] text-gray-600">
            Update your password and security preferences.
          </p>
        </div>

        
      </div>
    </div>
  );
}
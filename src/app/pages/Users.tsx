export default function Users() {
  const mockUsers = [
    { name: "Oladosu Teyibo", position: "Administrator", email: "oladosu.teyibo@company.com" },
  
  ];

  return (
    <div className="bg-white h-full w-full p-8">
      <div className="flex flex-col gap-[8px] mb-6">
        <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
          Users
        </h1>
        <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
          View and users registered for platform
        </p>
      </div>

      {/* Table */}
      <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mockUsers.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                    {user.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                  {user.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
            
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
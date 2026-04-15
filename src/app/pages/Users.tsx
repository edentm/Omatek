import { useState, useEffect } from "react";
import { getUsers } from "../../api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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

      {loading && (
        <p className="text-[14px] text-[#667085]">Loading users…</p>
      )}
      {error && (
        <p className="text-[14px] text-[#b42318]">{error}</p>
      )}

      {!loading && !error && (
        <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600 capitalize">
                    {user.role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] ${
                      user.is_active
                        ? "bg-[#ecfdf3] text-[#027a48]"
                        : "bg-[#fef3f2] text-[#b42318]"
                    }`}>
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

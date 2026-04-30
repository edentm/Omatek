import { useState, useEffect } from "react";
import { getUsers, createUser, updateUserRole, deactivateUser, activateUser } from "../../api";

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  companyName?: string;
};

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "auditor", companyName: "" });

  const refresh = () => {
    getUsers().then(setUsers).catch((e: Error) => setError(e.message)).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(""), 3500); };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    setCreating(true);
    try {
      await createUser(form.name, form.email, form.password, form.role, form.companyName || undefined);
      setShowModal(false);
      setForm({ name: "", email: "", password: "", role: "auditor", companyName: "" });
      refresh();
      showToast("User created successfully.");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await updateUserRole(userId, newRole);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      showToast("Role updated.");
    } catch { showToast("Failed to update role."); }
  };

  const handleToggleActive = async (user: User) => {
    try {
      if (user.isActive) {
        await deactivateUser(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: false } : u));
        showToast(`${user.name} deactivated.`);
      } else {
        await activateUser(user.id);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: true } : u));
        showToast(`${user.name} activated.`);
      }
    } catch { showToast("Failed to update status."); }
  };

  return (
    <div className="bg-white h-full w-full p-8 relative">
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col gap-[8px]">
          <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">Users</h1>
          <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">Manage users registered on the platform</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#144430] h-[43px] rounded-[10px] px-6 flex items-center gap-2 hover:bg-[#0f3324] transition-colors"
        >
          <svg className="size-4" fill="none" viewBox="0 0 20 20"><path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="#EAECF0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p className="font-['Figtree:Regular',sans-serif] font-normal text-[14px] text-white">Create User</p>
        </button>
      </div>

      {loading && <p className="text-[14px] text-[#667085]">Loading users…</p>}
      {error && <p className="text-[14px] text-[#b42318]">{error}</p>}

      {!loading && !error && (
        <div className="border border-[#eaecf0] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Name", "Email", "Role", "Status", "Actions"].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-[14px] text-[#667085]">No users found. Create one to get started.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-['Figtree:Medium',sans-serif] text-[14px] text-black">{user.name}</div>
                    {user.companyName && <div className="text-[12px] text-gray-500">{user.companyName}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-600">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-[13px] border border-[#d0d5dd] rounded-lg px-2 py-1 focus:outline-none focus:border-[#667085] capitalize"
                    >
                      <option value="admin">Admin</option>
                      <option value="auditor">Auditor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-2 py-1 rounded-full text-[12px] ${user.isActive ? "bg-[#ecfdf3] text-[#027a48]" : "bg-[#fef3f2] text-[#b42318]"}`}>
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user)}
                      className={`text-[12px] font-medium px-3 py-1 rounded-lg border transition-colors ${user.isActive ? "border-[#fecdca] text-[#b42318] hover:bg-[#fef3f2]" : "border-[#a9efc5] text-[#027a48] hover:bg-[#ecfdf3]"}`}
                    >
                      {user.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-[16px] shadow-xl w-full max-w-[480px] mx-4 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[20px] text-black">Create User</h2>
              <button onClick={() => setShowModal(false)} className="text-[#667085] hover:text-black">
                <svg className="size-5" fill="none" viewBox="0 0 20 20"><path d="M15 5L5 15M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {[
                { label: "Full Name", key: "name", type: "text", required: true },
                { label: "Email", key: "email", type: "email", required: true },
                { label: "Password", key: "password", type: "password", required: true },
                { label: "Company Name (optional)", key: "companyName", type: "text", required: false },
              ].map(({ label, key, type, required }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">{label}</label>
                  <input
                    type={type}
                    value={form[key as keyof typeof form]}
                    onChange={(e) => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                    required={required}
                    className="h-[44px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] focus:outline-none focus:border-[#667085]"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value }))}
                  className="h-[44px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] focus:outline-none focus:border-[#667085]"
                >
                  <option value="auditor">Auditor</option>
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {createError && <p className="text-[13px] text-[#b42318] bg-[#fef3f2] border border-[#fecdca] rounded-lg px-3 py-2">{createError}</p>}
              <button
                type="submit"
                disabled={creating}
                className="h-[43px] bg-[#144430] rounded-[10px] text-[14px] font-['Figtree:Bold',sans-serif] text-white hover:bg-[#0f3324] transition-colors disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create User"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      <div className={`fixed top-6 right-6 z-[2000] transition-all duration-300 ${toast ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}>
        <div className="bg-[#ecfdf3] border border-[#a9efc5] rounded-[12px] shadow-lg px-5 py-3 flex items-center gap-3 min-w-[260px]">
          <svg className="size-4 text-[#027a48] shrink-0" fill="none" viewBox="0 0 20 20"><path d="M16.667 5L7.5 14.167 3.333 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <p className="text-[13px] text-black">{toast}</p>
        </div>
      </div>
    </div>
  );
}

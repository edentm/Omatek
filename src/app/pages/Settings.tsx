import { useState } from "react";
import { changePassword } from "../../api";

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

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

      {(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        return (
          <div className="max-w-[480px] mb-6">
            <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6">
              <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[18px] text-black mb-4">Profile</h2>
              <div className="flex items-center gap-4 mb-4">
                <div className="size-12 rounded-full bg-[#ecf3ec] flex items-center justify-center shrink-0">
                  <span className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">
                    {(storedUser?.name ?? "U").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0,2)}
                  </span>
                </div>
                <div>
                  <div className="font-['Figtree:Medium',sans-serif] font-medium text-[16px] text-black">{storedUser?.name ?? "—"}</div>
                  <div className="text-[13px] text-[#667085]">{storedUser?.email ?? "—"}</div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { label: "Role", value: storedUser?.role ? (storedUser.role.charAt(0).toUpperCase() + storedUser.role.slice(1)) : "—" },
                  { label: "Company", value: storedUser?.companyName ?? "—" },
                  { label: "Account Status", value: storedUser?.isActive ? "Active" : "Inactive" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[#eaecf0] last:border-0">
                    <span className="text-[13px] text-[#667085]">{label}</span>
                    <span className="text-[13px] font-medium text-black">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="max-w-[480px]">
        <div className="bg-white border border-[#d0d5dd] rounded-[10px] p-6">
          <h2 className="font-['Figtree:Medium',sans-serif] font-medium text-[18px] text-black mb-1">
            Change Password
          </h2>
          <p className="text-[14px] text-[#667085] mb-6">
            Choose a strong password at least 8 characters long.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="h-[44px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] focus:outline-none focus:border-[#667085]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="h-[44px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] focus:outline-none focus:border-[#667085]"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[14px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-[44px] px-3 border border-[#d0d5dd] rounded-lg text-[14px] focus:outline-none focus:border-[#667085]"
              />
            </div>

            {error && (
              <p className="text-[13px] text-[#b42318]">{error}</p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="h-[43px] px-6 bg-[#144430] rounded-[10px] text-[14px] font-['Figtree:Bold',sans-serif] text-white hover:bg-[#0f3324] transition-colors disabled:opacity-60"
              >
                {loading ? "Updating…" : "Update password"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Success toast */}
      <div
        className={`fixed top-6 right-6 z-[2000] transition-all duration-300 ease-out ${
          showSuccess ? "translate-x-0 opacity-100" : "translate-x-[120%] opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-[#ecfdf3] border border-[#a9efc5] rounded-[12px] shadow-lg px-5 py-4 flex items-start gap-4 min-w-[300px]">
          <div className="flex items-center justify-center size-9 bg-[#ecfdf3] rounded-full shrink-0 mt-0.5">
            <svg className="size-5" viewBox="0 0 20 20" fill="none">
              <path d="M16.667 5L7.5 14.167 3.333 10" stroke="#027a48" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black leading-[20px]">Password updated</p>
            <p className="font-['Figtree:Regular',sans-serif] text-[13px] text-[#667085] leading-[18px] mt-0.5">Your password has been changed successfully.</p>
          </div>
          <button
            onClick={() => setShowSuccess(false)}
            className="text-[#667085] hover:text-gray-900 shrink-0 mt-0.5"
          >
            <svg className="size-4" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

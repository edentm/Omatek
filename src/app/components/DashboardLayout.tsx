import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Brain, FileText, Files, Users, Settings, LogOut, MessageSquare } from "lucide-react";
import imgUntitledDesign41 from "figma:asset/f3bfc5197c2b5c175bc0831b10ffdf71cbe9c3a3.png";
import { logoutApi, getDashboardMetrics } from "../../api";
import { useTokenLedger } from "../../contexts/TokenLedgerContext";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [anomalyCount, setAnomalyCount] = useState(0);
  const { isExhausted } = useTokenLedger();

  const isActive = (path: string) => location.pathname === path;

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName: string = storedUser.name || "User";
  const userRole: string = (storedUser.role || "").toLowerCase();
  const isAdmin = userRole === "admin" || userRole === "superadmin";

  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const displayName = userName.split(" ")[0];

  useEffect(() => {
    getDashboardMetrics()
      .then((m: unknown) => {
        const metrics = m as Record<string, unknown>;
        setAnomalyCount(Number(metrics.anomalyCount ?? 0));
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logoutApi();
    navigate("/login");
  };

  // Helper: returns Tailwind classes + icon color for a given path
  const navBtn = (path: string) => ({
    btn: `h-[45px] rounded-[10px] w-full text-left transition-colors ${isActive(path) ? "bg-[#e7e7e7]" : "hover:bg-[#f0f0f0]"}`,
    icon: isActive(path) ? "#101828" : "#344054",
    text: `font-['Figtree:Regular',sans-serif] font-normal leading-[21px] text-[14px] ${isActive(path) ? "text-[#101828] font-semibold" : "text-[#344054]"}`,
  });

  return (
    <div className="bg-white flex h-screen w-full overflow-hidden">
      {/* Sidebar */}
      <div className="bg-[#f9fafb] h-full relative shrink-0 w-[187px]">
        <div className="border-[#eaecf0] border-r-[0.8px] border-solid absolute inset-0 pointer-events-none" />
        <div className="flex flex-col h-full pr-[0.8px]">

          {/* Logo */}
          <div className="h-[77px] relative shrink-0 border-[#eaecf0] border-b-[0.8px] border-solid">
            <div className="absolute h-[59px] left-[20px] top-[8px] w-[108px]">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  alt="Omatek Logo"
                  className="absolute h-[340%] left-[-41.03%] max-w-none top-[-117.06%] w-[185.26%]"
                  src={imgUntitledDesign41}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex flex-col gap-[4px] pt-[16px] px-[8px]">

              {/* Dashboard */}
              <button onClick={() => navigate("/dashboard")} className={navBtn("/dashboard").btn}>
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Home className="size-[20px] shrink-0" strokeWidth={1.66667} color={navBtn("/dashboard").icon} />
                  <p className={navBtn("/dashboard").text}>Dashboard</p>
                </div>
              </button>

              {/* AI Analysis — shows anomaly badge when there are unresolved anomalies */}
              <button onClick={() => navigate("/ai-analysis")} className={navBtn("/ai-analysis").btn}>
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Brain className="size-[20px] shrink-0" strokeWidth={1.66667} color={navBtn("/ai-analysis").icon} />
                  <p className={navBtn("/ai-analysis").text}>AI Analysis</p>
                  {anomalyCount > 0 && (
                    <span className="ml-auto mr-3 min-w-[18px] h-[18px] px-1 bg-[#b42318] rounded-full text-white text-[10px] font-semibold flex items-center justify-center">
                      {anomalyCount > 99 ? "99+" : anomalyCount}
                    </span>
                  )}
                </div>
              </button>

              {/* Reports */}
              <button onClick={() => navigate("/reports")} className={navBtn("/reports").btn}>
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <FileText className="size-[20px] shrink-0" strokeWidth={1.66667} color={navBtn("/reports").icon} />
                  <p className={navBtn("/reports").text}>Reports</p>
                </div>
              </button>

              {/* Documents */}
              <button onClick={() => navigate("/documents")} className={navBtn("/documents").btn}>
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Files className="size-[20px] shrink-0" strokeWidth={1.66667} color={navBtn("/documents").icon} />
                  <p className={navBtn("/documents").text}>Documents</p>
                </div>
              </button>

              {/* Ask AI */}
              <button onClick={() => navigate("/chat")} className={navBtn("/chat").btn}>
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <MessageSquare className="size-[20px] shrink-0" strokeWidth={1.66667} color={navBtn("/chat").icon} />
                  <p className={navBtn("/chat").text}>Ask AI</p>
                </div>
              </button>

              {/* Users — admin only */}
              {isAdmin && (
                <button onClick={() => navigate("/users")} className={navBtn("/users").btn}>
                  <div className="flex items-center gap-[12px] pl-[16px]">
                    <Users className="size-[20px] shrink-0" strokeWidth={1.66667} color={navBtn("/users").icon} />
                    <p className={navBtn("/users").text}>Users</p>
                  </div>
                </button>
              )}

              {/* Settings */}
              <button onClick={() => navigate("/settings")} className={navBtn("/settings").btn}>
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Settings className="size-[20px] shrink-0" strokeWidth={1.66667} color={navBtn("/settings").icon} />
                  <p className={navBtn("/settings").text}>Settings</p>
                </div>
              </button>

            </div>
          </div>

          {/* Bottom Section */}
          <div className="shrink-0 border-[#eaecf0] border-t-[0.8px] border-solid">
            {/* Token Balance Warning */}
            {isExhausted && (
              <div className="px-[8px] pb-[4px] pt-[8px]">
                <div className="bg-[#fef3f2] border border-[#fca5a5] rounded-[8px] px-3 py-2 text-[11px] text-[#b42318] font-medium">
                  API Balance Empty
                </div>
              </div>
            )}
            {/* Log out */}
            <div className="px-[8px] pt-[8px] pb-[4px]">
              <button
                onClick={handleLogout}
                className="flex gap-[12px] h-[45px] items-center pl-[16px] rounded-[10px] w-full hover:bg-[#f0f0f0] transition-colors"
              >
                <LogOut className="size-[20px] shrink-0" strokeWidth={1.66667} color="#344054" />
                <p className="font-['Figtree:Medium',sans-serif] font-medium leading-[21px] text-[#344054] text-[14px]">
                  Log out
                </p>
              </button>
            </div>

            {/* User */}
            <div className="flex items-center gap-[8px] px-[16px] py-[12px]">
              <div className="bg-[#ecf3ec] rounded-full size-[32px] flex items-center justify-center shrink-0">
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black">
                  {initials}
                </p>
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[14px] text-black truncate">
                  {displayName}
                </p>
                {userRole && (
                  <p className="text-[11px] text-[#667085] capitalize truncate">{userRole}</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}

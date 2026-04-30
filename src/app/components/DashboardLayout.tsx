import { Outlet, useNavigate, useLocation } from "react-router";
import { Home, Brain, FileText, Files, Users, Settings, LogOut, MessageSquare } from "lucide-react";
import imgUntitledDesign41 from "figma:asset/f3bfc5197c2b5c175bc0831b10ffdf71cbe9c3a3.png";
import { logoutApi } from "../../api";

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Read user from localStorage (set on login)
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userName: string = storedUser.name || "User";
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const displayName = userName.split(" ")[0];

  const handleLogout = async () => {
    await logoutApi();
    navigate("/login");
  };

  return (
    <div className="bg-white flex h-screen w-full">
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
          <div className="flex-1 relative">
            <div className="flex flex-col gap-[4px] pt-[16px] px-[8px]">
              {/* Dashboard */}
              <button
                onClick={() => navigate("/dashboard")}
                className={`h-[45px] rounded-[10px] w-full ${
                  isActive("/dashboard") ? "bg-[#e7e7e7]" : ""
                }`}
              >
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Home
                    className="size-[20px]"
                    strokeWidth={1.66667}
                    color={isActive("/dashboard") ? "black" : "#344054"}
                  />
                  <p className={`font-['Figtree:Regular',sans-serif] font-normal leading-[21px] text-[14px] ${
                    isActive("/dashboard") ? "text-black" : "text-[#344054]"
                  }`}>
                    Dashboard
                  </p>
                </div>
              </button>

              {/* AI Analysis */}
              <button
                onClick={() => navigate("/ai-analysis")}
                className={`h-[45px] rounded-[10px] w-full ${
                  isActive("/ai-analysis") ? "bg-[#e7e7e7]" : ""
                }`}
              >
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Brain
                    className="size-[20px]"
                    strokeWidth={1.66667}
                    color="#344054"
                  />
                  <p className="font-['Inter:Regular',sans-serif] font-normal leading-[21px] text-[#344054] text-[14px]">
                    AI Analysis
                  </p>
                </div>
              </button>

              {/* Reports */}
              <button
                onClick={() => navigate("/reports")}
                className={`h-[45px] rounded-[10px] w-full ${
                  isActive("/reports") ? "bg-[#e7e7e7]" : ""
                }`}
              >
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <FileText
                    className="size-[20px]"
                    strokeWidth={1.66667}
                    color="#344054"
                  />
                  <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[21px] text-[#344054] text-[14px]">
                    Reports
                  </p>
                </div>
              </button>

              {/* Documents */}
              <button
                onClick={() => navigate("/documents")}
                className={`h-[45px] rounded-[10px] w-full ${
                  isActive("/documents") ? "bg-[#e7e7e7]" : ""
                }`}
              >
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Files
                    className="size-[20px]"
                    strokeWidth={1.66667}
                    color="#344054"
                  />
                  <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[21px] text-[#344054] text-[14px]">
                    Documents
                  </p>
                </div>
              </button>

              {/* Chat */}
              <button
                onClick={() => navigate("/chat")}
                className={`h-[45px] rounded-[10px] w-full ${
                  isActive("/chat") ? "bg-[#e7e7e7]" : ""
                }`}
              >
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <MessageSquare
                    className="size-[20px]"
                    strokeWidth={1.66667}
                    color={isActive("/chat") ? "black" : "#344054"}
                  />
                  <p className={`font-['Figtree:Regular',sans-serif] font-normal leading-[21px] text-[14px] ${isActive("/chat") ? "text-black" : "text-[#344054]"}`}>
                    Ask AI
                  </p>
                </div>
              </button>

              {/* Users */}
              <button
                onClick={() => navigate("/users")}
                className={`h-[45px] rounded-[10px] w-full ${
                  isActive("/users") ? "bg-[#e7e7e7]" : ""
                }`}
              >
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Users
                    className="size-[20px]"
                    strokeWidth={1.66667}
                    color="#344054"
                  />
                  <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[21px] text-[#344054] text-[14px]">
                    Users
                  </p>
                </div>
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate("/settings")}
                className={`h-[45px] rounded-[10px] w-full ${
                  isActive("/settings") ? "bg-[#e7e7e7]" : ""
                }`}
              >
                <div className="flex items-center gap-[12px] pl-[16px]">
                  <Settings
                    className="size-[20px]"
                    strokeWidth={1.66667}
                    color="#344054"
                  />
                  <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[21px] text-[#344054] text-[14px]">
                    Settings
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="h-[187.6px] relative shrink-0">
            {/* Log out button */}
            <button
              onClick={handleLogout}
              className="absolute flex gap-[12px] h-[45px] items-center left-[8px] pl-[16px] rounded-[10px] top-[61.8px] w-[171.2px] hover:bg-[#e7e7e7]"
            >
              <LogOut
                className="size-[20px]"
                strokeWidth={1.66667}
                color="#344054"
              />
              <p className="font-['Figtree:Medium',sans-serif] font-medium leading-[21px] text-[#344054] text-[14px]">
                Log out
              </p>
            </button>

            {/* User section */}
            <div className="absolute flex flex-col h-[72.8px] items-start left-0 pt-[12.8px] px-[12px] top-[114.8px] w-[187.2px] border-[#eaecf0] border-t-[0.8px] border-solid">
              <div className="h-[48px] rounded-[10px] w-full">
                <div className="flex items-center gap-[8px] px-[8px] h-full">
                  <div className="bg-[#ecf3ec] rounded-full size-[32px] flex items-center justify-center shrink-0">
                    <p className="font-['Figtree:Medium',sans-serif] font-medium leading-[21px] text-[14px] text-black">
                      {initials}
                    </p>
                  </div>
                  <p className="flex-1 font-['Figtree:Medium',sans-serif] font-medium leading-[21px] text-[14px] text-black truncate">
                    {displayName}
                  </p>
                </div>
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

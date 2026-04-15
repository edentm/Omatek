import { useState } from "react";
import { useNavigate } from "react-router";
import { login } from "../../api";
import imgUntitledDesign41 from "figma:asset/f3bfc5197c2b5c175bc0831b10ffdf71cbe9c3a3.png";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a204c] relative size-full min-h-screen">
      <div className="absolute bg-white h-full left-0 overflow-clip top-0 w-full">
        <div className="absolute h-[65px] left-[27px] top-[32px] w-[111px]">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              alt="Omatek Logo"
              className="absolute h-[352.94%] left-[-53.81%] max-w-none top-[-130%] w-[207.61%]"
              src={imgUntitledDesign41}
            />
          </div>
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[589px]">
        <p className="font-['Figtree:Bold',sans-serif] font-bold leading-[normal] text-[32px] text-black mb-[23px]">
          Sign In
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-[30px]">
          <div className="flex flex-col gap-[8px]">
            <label className="font-['Figtree:Bold',sans-serif] font-bold leading-[normal] text-[#344054] text-[16px]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-[55px] rounded-[10px] border border-[#d0d5dd] px-4 text-[16px]"
              required
            />
          </div>

          <div className="flex flex-col gap-[8px]">
            <label className="font-['Figtree:Bold',sans-serif] font-bold leading-[normal] text-[#344054] text-[16px]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-[55px] rounded-[8px] border border-[#d0d5dd] px-4 text-[16px]"
              required
            />
          </div>

          {error && (
            <p className="text-[14px] text-[#b42318] -mt-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-black h-[53px] rounded-[10px] w-full disabled:opacity-60"
          >
            <p className="font-['Figtree:Bold',sans-serif] font-bold leading-[normal] text-[16px] text-center text-white">
              {loading ? "Signing in…" : "Sign In"}
            </p>
          </button>
        </form>
      </div>
    </div>
  );
}

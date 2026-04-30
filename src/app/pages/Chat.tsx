import { useState, useEffect, useRef } from "react";
import { askPlatform, getDocuments } from "../../api";

type Message = { role: "user" | "assistant"; text: string };

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your Omatek financial analyst. Ask me anything about your uploaded documents — financial metrics, anomalies, trends, or anything from the reports." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [documentIds, setDocumentIds] = useState<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDocuments()
      .then((data: unknown) => {
        const ids = (data as Record<string, unknown>[]).map((d) => d.id as number);
        setDocumentIds(ids);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await askPlatform(text, documentIds) as Record<string, unknown>;
      const answer = (res.answer ?? res.response ?? res.message ?? JSON.stringify(res)) as string;
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, I couldn't get a response. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="bg-white h-full w-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-[#eaecf0] shrink-0">
        <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">
          Ask the Platform
        </h1>
        <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">
          Ask questions about your uploaded financial documents
          {documentIds.length > 0 && (
            <span className="text-[#667085]"> · {documentIds.length} document{documentIds.length !== 1 ? "s" : ""} loaded</span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="size-8 rounded-full bg-[#144430] flex items-center justify-center shrink-0 mr-3 mt-0.5">
                <svg className="size-4" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2.5L12.09 7.26L17.5 7.64L13.63 11L14.82 16.25L10 13.5L5.18 16.25L6.37 11L2.5 7.64L7.91 7.26L10 2.5Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            )}
            <div
              className={`max-w-[70%] px-4 py-3 rounded-[12px] text-[14px] leading-[22px] whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#144430] text-white rounded-br-[4px]"
                  : "bg-[#f9fafb] border border-[#eaecf0] text-[#1d2939] rounded-bl-[4px]"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="size-8 rounded-full bg-[#144430] flex items-center justify-center shrink-0 mr-3">
              <svg className="size-4" viewBox="0 0 20 20" fill="none">
                <path d="M10 2.5L12.09 7.26L17.5 7.64L13.63 11L14.82 16.25L10 13.5L5.18 16.25L6.37 11L2.5 7.64L7.91 7.26L10 2.5Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="bg-[#f9fafb] border border-[#eaecf0] px-4 py-3 rounded-[12px] rounded-bl-[4px] flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="size-2 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="size-2 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-8 py-4 border-t border-[#eaecf0] shrink-0">
        {documentIds.length === 0 && (
          <p className="text-[12px] text-[#dc6803] mb-2">No documents uploaded yet. Upload documents first so I have data to analyze.</p>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your financial data… (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="flex-1 px-4 py-3 border border-[#d0d5dd] rounded-[10px] text-[14px] text-[#344054] resize-none focus:outline-none focus:border-[#667085] placeholder:text-[#98a2b3]"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="h-[44px] w-[44px] bg-[#144430] rounded-[10px] flex items-center justify-center hover:bg-[#0f3324] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            <svg className="size-5" viewBox="0 0 20 20" fill="none">
              <path d="M17.5 10L2.5 2.5L6.25 10L2.5 17.5L17.5 10Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

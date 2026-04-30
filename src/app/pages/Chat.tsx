import { useState, useEffect, useRef } from "react";
import { askPlatform, getDocuments } from "../../api";

type Message = { role: "user" | "assistant"; text: string; tokensUsed?: number; sourceRef?: string };
type Doc = { id: number; title: string };

const TOKEN_BUDGET = 50000;

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your Omatek financial analyst. Select one or more documents below, then ask me anything about your financial data — metrics, anomalies, trends, or anything from the reports." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [sessionTokens, setSessionTokens] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDocuments()
      .then((data: unknown) => {
        const docs = (data as Record<string, unknown>[]).map((d) => ({
          id: d.id as number,
          title: (d.originalFilename ?? d.filename ?? `Document #${d.id}`) as string,
        }));
        setDocuments(docs);
        // Start with no docs selected — user must explicitly choose
      })
      .catch(() => {});
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const toggleDoc = (id: number) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]
    );
  };

  const allSelected = documents.length > 0 && selectedDocIds.length === documents.length;

  const toggleAll = () => {
    setSelectedDocIds(allSelected ? [] : documents.map(d => d.id));
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || selectedDocIds.length === 0) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await askPlatform(text, selectedDocIds) as Record<string, unknown>;
      const answer = (res.answer ?? res.response ?? res.message ?? JSON.stringify(res)) as string;
      const tokensUsed = res.tokensUsed as number | undefined;
      const sourceRef = res.source_reference as string | undefined;
      setMessages(prev => [...prev, { role: "assistant", text: answer, tokensUsed, sourceRef }]);
      if (tokensUsed) setSessionTokens(prev => prev + tokensUsed);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: err instanceof Error ? `Error: ${err.message}` : "Sorry, I couldn't get a response. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const tokensRemaining = TOKEN_BUDGET - sessionTokens;
  const tokenPct = Math.min((sessionTokens / TOKEN_BUDGET) * 100, 100);
  const tokenColor = tokenPct > 80 ? "#b42318" : tokenPct > 50 ? "#dc6803" : "#027a48";

  return (
    <div className="bg-white h-full w-full flex flex-col">
      {/* Header */}
      <div className="px-8 pt-8 pb-5 border-b border-[#eaecf0] shrink-0">
        <div className="flex justify-between items-start mb-5">
          <div>
            <h1 className="font-['Figtree:Medium',sans-serif] font-medium leading-[48px] text-[32px] text-black">Ask AI</h1>
            <p className="font-['Figtree:Regular',sans-serif] font-normal leading-[22.5px] text-[15px] text-black">Ask questions about your uploaded financial documents</p>
          </div>
          {/* Token meter */}
          <div className="text-right">
            <div className="text-[11px] text-[#667085] uppercase tracking-wider mb-1">Session Token Budget</div>
            <div className="w-[180px] bg-[#eaecf0] rounded-full h-2 mb-1">
              <div className="h-2 rounded-full transition-all" style={{ width: `${tokenPct}%`, background: tokenColor }} />
            </div>
            <div className="text-[12px]" style={{ color: tokenColor }}>
              {tokensRemaining.toLocaleString()} / {TOKEN_BUDGET.toLocaleString()} tokens remaining
            </div>
            <div className="text-[10px] text-[#98a2b3] mt-0.5">Short questions ~200–500 tokens · Detailed analysis ~500–800</div>
          </div>
        </div>

        {/* Document selector — always-visible chips */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] font-['Figtree:Medium',sans-serif] font-medium text-[#344054]">Source Documents</span>
            <span className="text-[12px] text-[#98a2b3]">
              {selectedDocIds.length === 0
                ? "— select at least one to ask questions"
                : `${selectedDocIds.length} of ${documents.length} selected`}
            </span>
          </div>

          {documents.length === 0 ? (
            <p className="text-[13px] text-[#667085]">No documents uploaded yet. Go to Documents to upload one.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {/* Select All chip */}
              <button
                onClick={toggleAll}
                className={`h-[32px] px-3 rounded-full border text-[12px] font-['Figtree:Medium',sans-serif] font-medium transition-colors ${
                  allSelected
                    ? "bg-[#144430] border-[#144430] text-white"
                    : "bg-white border-[#d0d5dd] text-[#344054] hover:bg-gray-50"
                }`}
              >
                {allSelected ? "✓ All" : "All"}
              </button>

              {/* Individual doc chips */}
              {documents.map(doc => {
                const selected = selectedDocIds.includes(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    title={doc.title}
                    className={`h-[32px] px-3 rounded-full border text-[12px] font-['Figtree:Medium',sans-serif] font-medium transition-colors max-w-[220px] truncate ${
                      selected
                        ? "bg-[#144430] border-[#144430] text-white"
                        : "bg-white border-[#d0d5dd] text-[#344054] hover:bg-gray-50"
                    }`}
                  >
                    {selected && <span className="mr-1">✓</span>}
                    {doc.title}
                  </button>
                );
              })}
            </div>
          )}
        </div>
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
            <div className="flex flex-col gap-1">
              <div className={`max-w-[600px] px-4 py-3 rounded-[12px] text-[14px] leading-[22px] whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#144430] text-white rounded-br-[4px]"
                  : "bg-[#f9fafb] border border-[#eaecf0] text-[#1d2939] rounded-bl-[4px]"
              }`}>
                {msg.text}
              </div>
              {(msg.tokensUsed || msg.sourceRef) && (
                <div className="flex flex-col gap-0.5 px-1">
                  {msg.tokensUsed && (
                    <div className="text-[10px] text-[#98a2b3]">~{msg.tokensUsed.toLocaleString()} tokens used</div>
                  )}
                  {msg.sourceRef && (
                    <div className="text-[10px] text-[#667085]">Source: {msg.sourceRef}</div>
                  )}
                </div>
              )}
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
        {selectedDocIds.length === 0 && (
          <p className="text-[12px] text-[#dc6803] mb-2">Select at least one document above to ask questions about it.</p>
        )}
        {tokensRemaining <= 5000 && (
          <p className="text-[12px] text-[#b42318] mb-2">Running low on session tokens ({tokensRemaining.toLocaleString()} remaining). Keep questions short and specific.</p>
        )}
        <div className="flex gap-3 items-end">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={selectedDocIds.length === 0 ? "Select documents above first…" : `Asking about ${selectedDocIds.length} document${selectedDocIds.length !== 1 ? "s" : ""}… (Enter to send)`}
            rows={2}
            disabled={selectedDocIds.length === 0}
            className="flex-1 px-4 py-3 border border-[#d0d5dd] rounded-[10px] text-[14px] text-[#344054] resize-none focus:outline-none focus:border-[#667085] placeholder:text-[#98a2b3] disabled:bg-[#f9fafb] disabled:cursor-not-allowed"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading || selectedDocIds.length === 0}
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

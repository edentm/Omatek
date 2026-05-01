import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { askPlatform, getDocuments, generateCustomReport, getChatHistory, deleteConversation } from "../../api";
import { useTokenLedger } from "../../contexts/TokenLedgerContext";

type Message = { role: "user" | "assistant"; text: string; tokensUsed?: number; sourceRef?: string; id?: number };
type Doc = { id: number; title: string };
type HistoryItem = { id: number; sessionId: string | null; question: string; answer: string | null; tokensUsed: number | null; createdAt: string };
type Session = { sessionId: string | null; title: string; date: string; items: HistoryItem[] };

export default function Chat() {
  const navigate = useNavigate();
  const { balance, totalBudget, deductTokens, isExhausted } = useTokenLedger();

  const [currentSessionId, setCurrentSessionId] = useState<string>(() => crypto.randomUUID());
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", text: "Hi! I'm your Omatek financial analyst. Select one or more documents below, then ask me anything about your financial data." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // History sidebar
  const [history, setHistory] = useState<Session[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Generate Report state
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<number | null>(null);
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [pickerDocId, setPickerDocId] = useState<number | null>(null);
  const docPickerRef = useRef<HTMLDivElement>(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getChatHistory() as HistoryItem[];
      // Group by session_id
      const sessionMap = new Map<string, Session>();
      for (const item of data) {
        const key = item.sessionId ?? `solo-${item.id}`;
        if (!sessionMap.has(key)) {
          sessionMap.set(key, {
            sessionId: item.sessionId,
            title: item.question.slice(0, 50) + (item.question.length > 50 ? "…" : ""),
            date: new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            items: [],
          });
        }
        sessionMap.get(key)!.items.push(item);
      }
      setHistory(Array.from(sessionMap.values()));
    } catch {}
    setHistoryLoading(false);
  }, []);

  useEffect(() => {
    getDocuments()
      .then((data: unknown) => {
        const docs = (data as Record<string, unknown>[]).map((d) => ({
          id: d.id as number,
          title: (d.originalFilename ?? d.filename ?? `Document #${d.id}`) as string,
        }));
        setDocuments(docs);
      })
      .catch(() => {});
    loadHistory();
  }, [loadHistory]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
      if (docPickerRef.current && !docPickerRef.current.contains(e.target as Node)) setShowDocPicker(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const startNewChat = () => {
    setCurrentSessionId(crypto.randomUUID());
    setMessages([{ role: "assistant", text: "Hi! I'm your Omatek financial analyst. Select one or more documents below, then ask me anything about your financial data." }]);
    setInput("");
    setReportSuccess(null);
  };

  const loadSession = (session: Session) => {
    setCurrentSessionId(session.sessionId ?? crypto.randomUUID());
    const msgs: Message[] = [{ role: "assistant", text: "Hi! I'm your Omatek financial analyst. Select one or more documents below, then ask me anything about your financial data." }];
    for (const item of [...session.items].reverse()) {
      msgs.push({ role: "user", text: item.question });
      if (item.answer) msgs.push({ role: "assistant", text: item.answer, tokensUsed: item.tokensUsed ?? undefined, id: item.id });
    }
    setMessages(msgs);
  };

  const handleDeleteSession = async (session: Session, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      for (const item of session.items) {
        await deleteConversation(item.id);
      }
      setHistory(prev => prev.filter(s => s.sessionId !== session.sessionId));
      if (session.sessionId === currentSessionId) startNewChat();
    } catch {}
  };

  const toggleDoc = (id: number) => {
    setSelectedDocIds(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  };
  const allSelected = documents.length > 0 && selectedDocIds.length === documents.length;
  const toggleAll = () => setSelectedDocIds(allSelected ? [] : documents.map(d => d.id));

  const dropdownLabel = () => {
    if (documents.length === 0) return "No documents uploaded";
    if (selectedDocIds.length === 0) return "Select documents to query…";
    if (selectedDocIds.length === documents.length) return `All ${documents.length} documents selected`;
    if (selectedDocIds.length === 1) {
      const doc = documents.find(d => d.id === selectedDocIds[0]);
      return doc?.title ?? "1 document selected";
    }
    return `${selectedDocIds.length} documents selected`;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || selectedDocIds.length === 0 || isExhausted) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    setLoading(true);
    try {
      const res = await askPlatform(text, selectedDocIds, currentSessionId) as Record<string, unknown>;
      const answer = (res.answer ?? res.response ?? res.message ?? JSON.stringify(res)) as string;
      const rawTokens = res.tokensUsed ?? res.tokens_used;
      const tokensUsed = rawTokens != null ? Number(rawTokens) : undefined;
      const sourceRef = (res.sourceReference ?? res.source_reference) as string | undefined;
      const convId = res.id as number | undefined;
      setMessages(prev => [...prev, { role: "assistant", text: answer, tokensUsed, sourceRef, id: convId }]);
      if (tokensUsed != null && tokensUsed > 0) {
        deductTokens(tokensUsed);
      }
      loadHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", text: msg.includes("402") ? "API balance exhausted. Please recharge to continue." : `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const saveChat = () => {
    const lines = messages
      .filter(m => m.role !== "assistant" || messages.indexOf(m) > 0)
      .map(m => `**${m.role === "user" ? "You" : "AI Analyst"}**: ${m.text}${m.sourceRef ? `\n*Source: ${m.sourceRef}*` : ""}`)
      .join("\n\n---\n\n");
    const md = `# Omatek AI Chat Export\n*Exported: ${new Date().toLocaleString()}*\n\n---\n\n${lines}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omatek-chat-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  const buildConversationContext = () => {
    const convo = messages
      .filter((m, i) => i > 0)
      .map(m => `${m.role === "user" ? "User" : "AI Analyst"}: ${m.text}`)
      .join("\n\n");
    return `Generate a structured financial audit report based on the following AI analysis conversation:\n\n${convo}`;
  };

  const doGenerateReport = async (docId: number) => {
    setGeneratingReport(true);
    setReportSuccess(null);
    setShowDocPicker(false);
    try {
      const doc = documents.find(d => d.id === docId);
      const res = await generateCustomReport({
        documentId: docId,
        customInstructions: buildConversationContext(),
        title: `Chat Report — ${doc?.title ?? `Document #${docId}`}`,
      }) as Record<string, unknown>;
      setReportSuccess(res.id as number);
    } catch {
      alert("Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleGenerateReport = () => {
    if (selectedDocIds.length === 0) return;
    if (selectedDocIds.length === 1) { doGenerateReport(selectedDocIds[0]); }
    else { setPickerDocId(selectedDocIds[0]); setShowDocPicker(true); }
  };

  const balancePct = Math.min((balance / totalBudget) * 100, 100);
  const balanceColor = balancePct > 30 ? "#027a48" : balancePct > 10 ? "#dc6803" : "#b42318";
  const conversationTurns = messages.filter(m => m.role === "user").length;

  return (
    <div className="bg-white h-full w-full flex overflow-hidden">
      {/* ── History Sidebar ─────────────────────────────────────────── */}
      <div className="w-[220px] shrink-0 border-r border-[#eaecf0] flex flex-col bg-[#f9fafb]">
        <div className="p-3 border-b border-[#eaecf0]">
          <button
            onClick={startNewChat}
            className="w-full flex items-center gap-2 h-[36px] px-3 bg-[#144430] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#0f3324] transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {historyLoading && <p className="text-[11px] text-[#98a2b3] px-3 py-2">Loading…</p>}
          {!historyLoading && history.length === 0 && (
            <p className="text-[11px] text-[#98a2b3] px-3 py-2">No chat history yet</p>
          )}
          {history.map((session, i) => (
            <div key={i} className="group relative">
              <button
                onClick={() => loadSession(session)}
                className={`w-full text-left px-3 py-2.5 hover:bg-[#eaecf0] transition-colors ${session.sessionId === currentSessionId ? "bg-[#e7e7e7]" : ""}`}
              >
                <p className="text-[12px] text-[#344054] font-medium truncate pr-5">{session.title}</p>
                <p className="text-[10px] text-[#98a2b3] mt-0.5">{session.date} · {session.items.length} msg{session.items.length !== 1 ? "s" : ""}</p>
              </button>
              <button
                onClick={(e) => handleDeleteSession(session, e)}
                className="absolute right-2 top-1/2 -translate-y-1/2 size-5 flex items-center justify-center rounded opacity-0 group-hover:opacity-100 hover:bg-[#fef3f2] text-[#98a2b3] hover:text-[#b42318] transition-all"
              >
                <svg className="size-3.5" fill="none" viewBox="0 0 14 14"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          ))}
        </div>

        {/* Token Balance */}
        <div className="p-3 border-t border-[#eaecf0]">
          <div className="text-[10px] text-[#667085] uppercase tracking-wider mb-1">API Balance</div>
          <div className="w-full bg-[#eaecf0] rounded-full h-1.5 mb-1">
            <div className="h-1.5 rounded-full transition-all" style={{ width: `${balancePct}%`, background: balanceColor }} />
          </div>
          <div className="text-[11px] font-medium" style={{ color: balanceColor }}>
            {balance.toLocaleString()} / {totalBudget.toLocaleString()}
          </div>
          {isExhausted && <div className="text-[10px] text-[#b42318] mt-1 font-semibold">Recharge Required</div>}
        </div>
      </div>

      {/* ── Main Chat Panel ─────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-[#eaecf0] shrink-0">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="font-['Figtree:Medium',sans-serif] font-medium text-[28px] text-black leading-tight">Ask AI</h1>
              <p className="text-[14px] text-[#667085] mt-0.5">Ask questions about your uploaded financial documents</p>
            </div>
            <div className="flex items-center gap-2">
              {conversationTurns > 0 && (
                <button onClick={saveChat} className="flex items-center gap-1.5 h-[34px] px-3 border border-[#d0d5dd] rounded-[8px] text-[12px] text-[#344054] hover:bg-gray-50 transition-colors">
                  <svg className="size-4" fill="none" viewBox="0 0 20 20"><path d="M13.333 17.5H6.667A1.667 1.667 0 015 15.833V4.167A1.667 1.667 0 016.667 2.5h5.833L15 5.833v10A1.667 1.667 0 0113.333 17.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M11.667 2.5v3.333H15M6.667 10h6.666M6.667 13.333h4.166" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Save Chat
                </button>
              )}
            </div>
          </div>

          {/* Recharge banner */}
          {isExhausted && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-[#fef3f2] border border-[#fca5a5] rounded-[10px]">
              <svg className="size-5 text-[#b42318] shrink-0" fill="none" viewBox="0 0 20 20"><path d="M10 6v4M10 14h.01M2.93 17.07A10 10 0 1117.07 2.93 10 10 0 012.93 17.07z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              <p className="text-[13px] text-[#b42318] font-medium flex-1">API Balance Exhausted — AI features are locked. Please recharge your account to continue.</p>
            </div>
          )}

          {/* Report success */}
          {reportSuccess && (
            <div className="mb-3 flex items-center gap-3 px-4 py-3 bg-[#f0f9f4] border border-[#abefc6] rounded-[10px]">
              <svg className="size-5 text-[#17b26a] shrink-0" fill="none" viewBox="0 0 20 20"><path d="M6.667 10l2.222 2.222L13.333 7.778" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/></svg>
              <p className="text-[13px] text-[#144430] flex-1">Report generated successfully!</p>
              <button onClick={() => navigate("/reports")} className="text-[12px] font-semibold text-[#144430] underline shrink-0">View Reports →</button>
              <button onClick={() => setReportSuccess(null)} className="text-[#667085]"><svg className="size-4" fill="none" viewBox="0 0 20 20"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg></button>
            </div>
          )}

          {/* Document dropdown row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[13px] font-medium text-[#344054] shrink-0">Source Documents</span>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                disabled={documents.length === 0}
                className={`flex items-center gap-2 h-[36px] px-3 border rounded-[8px] text-[13px] transition-colors min-w-[240px] max-w-[380px] ${selectedDocIds.length > 0 ? "border-[#144430] bg-[#f0f9f4] text-[#144430]" : "border-[#d0d5dd] bg-white text-[#667085] hover:bg-gray-50"} disabled:opacity-50`}
              >
                <svg className="size-4 shrink-0" fill="none" viewBox="0 0 20 20"><path d="M4.167 5H15.833M4.167 10H15.833M4.167 15H10" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round"/></svg>
                <span className="flex-1 text-left truncate">{dropdownLabel()}</span>
                {selectedDocIds.length > 0 && <span className="shrink-0 bg-[#144430] text-white text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center">{selectedDocIds.length}</span>}
                <svg className={`size-4 shrink-0 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 20 20"><path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>

              {dropdownOpen && documents.length > 0 && (
                <div className="absolute top-[40px] left-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl min-w-[300px] max-w-[460px] overflow-hidden">
                  <div className="border-b border-[#eaecf0]">
                    <button onClick={toggleAll} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                      <div className={`size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${allSelected ? "bg-[#144430] border-[#144430]" : selectedDocIds.length > 0 ? "border-[#144430]" : "border-[#d0d5dd]"}`}>
                        {allSelected && <svg className="size-2.5" viewBox="0 0 10 10" fill="none"><path d="M8 2L4 8L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        {!allSelected && selectedDocIds.length > 0 && <div className="w-2 h-0.5 bg-[#144430] rounded" />}
                      </div>
                      <span className="text-[13px] font-semibold text-[#344054]">{allSelected ? "Deselect all" : "Select all documents"}</span>
                      <span className="ml-auto text-[11px] text-[#98a2b3]">{documents.length} total</span>
                    </button>
                  </div>
                  <div className="max-h-[240px] overflow-y-auto py-1">
                    {documents.map(doc => {
                      const checked = selectedDocIds.includes(doc.id);
                      return (
                        <button key={doc.id} onClick={() => toggleDoc(doc.id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left">
                          <div className={`size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-[#144430] border-[#144430]" : "border-[#d0d5dd]"}`}>
                            {checked && <svg className="size-2.5" viewBox="0 0 10 10" fill="none"><path d="M8 2L4 8L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <span className="text-[13px] text-[#344054] truncate flex-1">{doc.title}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-[#eaecf0] px-4 py-2.5 flex justify-between items-center bg-gray-50">
                    <span className="text-[12px] text-[#667085]">{selectedDocIds.length === 0 ? "No documents selected" : `${selectedDocIds.length} selected`}</span>
                    <button onClick={() => setDropdownOpen(false)} className="text-[12px] font-semibold text-[#144430] hover:underline">Done</button>
                  </div>
                </div>
              )}
            </div>

            {selectedDocIds.length > 0 && <button onClick={() => setSelectedDocIds([])} className="text-[12px] text-[#667085] hover:text-[#b42318] transition-colors">Clear</button>}

            {/* Generate Report */}
            {conversationTurns > 0 && selectedDocIds.length > 0 && (
              <div className="relative ml-auto" ref={docPickerRef}>
                <button
                  onClick={handleGenerateReport}
                  disabled={generatingReport}
                  className="flex items-center gap-2 h-[36px] px-4 bg-[#144430] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#0f3324] transition-colors disabled:opacity-50"
                >
                  {generatingReport ? (
                    <><svg className="size-4 animate-spin" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" strokeDasharray="25 50"/></svg>Generating…</>
                  ) : (
                    <><svg className="size-4" fill="none" viewBox="0 0 20 20"><path d="M10.5 3H5a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V9.5M10.5 3L16 8.5M10.5 3v5.5H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>Generate Report</>
                  )}
                </button>
                {showDocPicker && (
                  <div className="absolute top-[40px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl w-[280px] overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#eaecf0]">
                      <p className="text-[13px] font-semibold text-[#344054]">Select document for report</p>
                    </div>
                    <div className="max-h-[200px] overflow-y-auto py-1">
                      {selectedDocIds.map(id => {
                        const doc = documents.find(d => d.id === id);
                        return (
                          <button key={id} onClick={() => setPickerDocId(id)} className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left ${pickerDocId === id ? "bg-[#f0f9f4]" : ""}`}>
                            <div className={`size-4 rounded-full border-2 shrink-0 flex items-center justify-center ${pickerDocId === id ? "border-[#144430] bg-[#144430]" : "border-[#d0d5dd]"}`}>
                              {pickerDocId === id && <div className="size-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-[13px] text-[#344054] truncate">{doc?.title ?? `Document #${id}`}</span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="px-4 py-3 border-t border-[#eaecf0] flex justify-end gap-2 bg-gray-50">
                      <button onClick={() => setShowDocPicker(false)} className="text-[12px] text-[#667085] px-3 py-1.5">Cancel</button>
                      <button onClick={() => pickerDocId && doGenerateReport(pickerDocId)} disabled={!pickerDocId} className="text-[12px] font-semibold bg-[#144430] text-white px-4 py-1.5 rounded-[8px] hover:bg-[#0f3324] disabled:opacity-50">Generate</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="size-8 rounded-full bg-[#144430] flex items-center justify-center shrink-0 mr-3 mt-0.5">
                  <svg className="size-4" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L12.09 7.26L17.5 7.64L13.63 11L14.82 16.25L10 13.5L5.18 16.25L6.37 11L2.5 7.64L7.91 7.26L10 2.5Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <div className={`max-w-[560px] px-4 py-3 rounded-[12px] text-[14px] leading-[22px] whitespace-pre-wrap ${msg.role === "user" ? "bg-[#144430] text-white rounded-br-[4px]" : "bg-[#f9fafb] border border-[#eaecf0] text-[#1d2939] rounded-bl-[4px]"}`}>
                  {msg.text}
                </div>
                {(msg.tokensUsed != null || msg.sourceRef) && (
                  <div className="flex flex-col gap-0.5 px-1">
                    {msg.tokensUsed != null && msg.tokensUsed > 0 && <div className="text-[10px] text-[#98a2b3]">~{msg.tokensUsed.toLocaleString()} tokens</div>}
                    {msg.sourceRef && <div className="text-[10px] text-[#667085]">Source: {msg.sourceRef}</div>}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="size-8 rounded-full bg-[#144430] flex items-center justify-center shrink-0 mr-3">
                <svg className="size-4" viewBox="0 0 20 20" fill="none"><path d="M10 2.5L12.09 7.26L17.5 7.64L13.63 11L14.82 16.25L10 13.5L5.18 16.25L6.37 11L2.5 7.64L7.91 7.26L10 2.5Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
        <div className="px-6 py-4 border-t border-[#eaecf0] shrink-0">
          {selectedDocIds.length === 0 && !isExhausted && <p className="text-[12px] text-[#dc6803] mb-2">Select at least one document above to ask questions.</p>}
          {balance > 0 && balance < 50000 && <p className="text-[12px] text-[#dc6803] mb-2">Low balance: {balance.toLocaleString()} tokens remaining.</p>}
          <div className="flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={isExhausted ? "API balance exhausted — recharge required" : selectedDocIds.length === 0 ? "Select documents above first…" : `Ask about ${selectedDocIds.length === 1 ? (documents.find(d => d.id === selectedDocIds[0])?.title ?? "your document") : `${selectedDocIds.length} documents`}… (Enter to send)`}
              rows={2}
              disabled={selectedDocIds.length === 0 || isExhausted}
              className="flex-1 px-4 py-3 border border-[#d0d5dd] rounded-[10px] text-[14px] text-[#344054] resize-none focus:outline-none focus:border-[#667085] placeholder:text-[#98a2b3] disabled:bg-[#f9fafb] disabled:cursor-not-allowed"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || loading || selectedDocIds.length === 0 || isExhausted}
              className="h-[44px] w-[44px] bg-[#144430] rounded-[10px] flex items-center justify-center hover:bg-[#0f3324] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <svg className="size-5" viewBox="0 0 20 20" fill="none"><path d="M17.5 10L2.5 2.5L6.25 10L2.5 17.5L17.5 10Z" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

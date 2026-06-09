import { useState, useEffect, useRef, useCallback } from "react";
import { askPlatform, getChatHistory, getDocuments } from "../../api";
import { useTokenLedger } from "../../contexts/TokenLedgerContext";
import { useChatPanel } from "../../contexts/ChatPanelContext";
import chatbotIcon from "../../assets/chatbot.svg";
import { Tooltip } from "./Tooltip";

type Message = { role: "user" | "assistant"; text: string; tokensUsed?: number };
type HistoryItem = { id: number; sessionId: string | null; question: string; answer: string | null; tokensUsed: number | null; createdAt: string };
type Session = { sessionId: string | null; title: string; date: string; items: HistoryItem[] };
type DocOption = { id: number; title: string };

const GREETING = "How can I help you today?";
const DEFAULT_TITLE = "New AI Chat";

export default function ChatBotWidget() {
  const { isExhausted, deductTokens, balance, totalBudget } = useTokenLedger();
  const { chatOpen: isOpen, setChatOpen: setIsOpen, sidePanelOpen } = useChatPanel();
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [chatTitle, setChatTitle] = useState(DEFAULT_TITLE);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Session[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [showDocPicker, setShowDocPicker] = useState(false);
  const [docOptions, setDocOptions] = useState<DocOption[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const docPickerRef = useRef<HTMLDivElement>(null);

  const isDefaultTitle = chatTitle === DEFAULT_TITLE;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (!showHistory) return;
    const handler = (e: MouseEvent) => {
      if (historyRef.current && !historyRef.current.contains(e.target as Node)) {
        setShowHistory(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showHistory]);

  useEffect(() => {
    if (!showOptions) return;
    const handler = (e: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target as Node)) {
        setShowOptions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showOptions]);

  useEffect(() => {
    if (isRenaming && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenaming]);

  useEffect(() => {
    if (!showDocPicker) return;
    const handler = (e: MouseEvent) => {
      if (docPickerRef.current && !docPickerRef.current.contains(e.target as Node)) {
        setShowDocPicker(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDocPicker]);

  const openDocPicker = async () => {
    if (showDocPicker) { setShowDocPicker(false); return; }
    if (docOptions.length === 0) {
      try {
        const data = await getDocuments({ limit: 100 }) as Record<string, unknown>[];
        const list = (Array.isArray(data) ? data : []) as Record<string, unknown>[];
        setDocOptions(list.map(d => ({ id: Number(d.id), title: String(d.originalFilename ?? d.filename ?? d.title ?? `Document #${d.id}`) })));
      } catch {
        setDocOptions([]);
      }
    }
    setShowDocPicker(true);
  };

  const toggleDoc = (id: number) => setSelectedDocIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAllDocs = () => setSelectedDocIds(selectedDocIds.length === docOptions.length ? [] : docOptions.map(d => d.id));
  const allDocsSelected = docOptions.length > 0 && selectedDocIds.length === docOptions.length;

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getChatHistory() as HistoryItem[];
      const sessionMap = new Map<string, Session>();
      for (const item of data) {
        const key = item.sessionId ?? `solo-${item.id}`;
        if (!sessionMap.has(key)) {
          sessionMap.set(key, {
            sessionId: item.sessionId,
            title: item.question.slice(0, 45) + (item.question.length > 45 ? "…" : ""),
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

  const handleOpen = () => {
    setIsOpen(true);
    loadHistory();
  };

  const startNewChat = () => {
    setSessionId(crypto.randomUUID());
    setMessages([{ role: "assistant", text: GREETING }]);
    setInput("");
    setChatTitle(DEFAULT_TITLE);
    setShowHistory(false);
    setShowOptions(false);
    setIsRenaming(false);
  };

  const loadSession = (session: Session) => {
    setSessionId(session.sessionId ?? crypto.randomUUID());
    setChatTitle(session.title);
    const msgs: Message[] = [{ role: "assistant", text: GREETING }];
    for (const item of [...session.items].reverse()) {
      msgs.push({ role: "user", text: item.question });
      if (item.answer) msgs.push({ role: "assistant", text: item.answer, tokensUsed: item.tokensUsed ?? undefined });
    }
    setMessages(msgs);
    setShowHistory(false);
  };

  const handleStartRename = () => {
    setRenameValue(chatTitle);
    setIsRenaming(true);
    setShowOptions(false);
  };

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (trimmed) setChatTitle(trimmed);
    setIsRenaming(false);
  };

  const handleRenameKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setIsRenaming(false);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading || isExhausted) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text }]);
    if (isDefaultTitle) {
      setChatTitle(text.slice(0, 45) + (text.length > 45 ? "…" : ""));
    }
    setLoading(true);
    try {
      const res = await askPlatform(text, selectedDocIds, sessionId) as Record<string, unknown>;
      const answer = (res.answer ?? res.response ?? res.message ?? JSON.stringify(res)) as string;
      const rawTokens = res.tokensUsed ?? res.tokens_used;
      const tokensUsed = rawTokens != null ? Number(rawTokens) : undefined;
      setMessages(prev => [...prev, { role: "assistant", text: answer, tokensUsed }]);
      if (tokensUsed != null && tokensUsed > 0) deductTokens(tokensUsed);
      loadHistory();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sorry, I couldn't get a response.";
      setMessages(prev => [...prev, { role: "assistant", text: `Error: ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const downloadChat = () => {
    const turns = messages.filter((_, i) => i > 0);
    if (turns.length === 0) return;
    const lines = turns
      .map(m => `**${m.role === "user" ? "You" : "AI Assistant"}**: ${m.text}`)
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

  const isGreetingOnly = messages.length === 1;

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-[1100] size-12 bg-white border border-[#d0d5dd] rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
          title="Open AI Assistant"
        >
          <img src={chatbotIcon} className="size-10" alt="" />
        </button>
      )}

      {/* Side panel */}
      {isOpen && (
        <div className={`fixed top-0 right-0 h-screen w-[420px] bg-white border-l border-[#eaecf0] z-[900] flex flex-col${sidePanelOpen ? "" : " shadow-2xl"}`}>

          {/* Header */}
          <div className="px-4 py-3 border-b border-[#eaecf0] flex items-center gap-1 shrink-0">

            {/* Left: [bot avatar for named chats] title + history chevron */}
            <div className="relative flex items-center gap-1.5 min-w-0 flex-1" ref={historyRef}>
              {/* Bot avatar — only shown for named (non-default) chats */}
              {!isDefaultTitle && !isRenaming && (
                <div className="size-[26px] rounded-full bg-[#f2f4f7] flex items-center justify-center shrink-0">
                  <img src={chatbotIcon} className="size-[60px]" alt="" />
                </div>
              )}

              {/* Inline rename input */}
              {isRenaming ? (
                <input
                  ref={renameInputRef}
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onKeyDown={handleRenameKey}
                  onBlur={commitRename}
                  className="flex-1 min-w-0 font-medium text-[14px] text-black bg-transparent border-b border-[#667085] focus:outline-none px-1 py-0.5"
                />
              ) : (
                <button
                  onClick={() => setShowHistory(o => !o)}
                  className="flex items-center gap-1 hover:bg-gray-100 rounded-lg px-1.5 py-1 transition-colors min-w-0"
                >
                  <span className="font-medium text-[14px] text-black truncate max-w-[160px]">{chatTitle}</span>
                  <svg className={`size-4 text-[#667085] shrink-0 transition-transform ${showHistory ? "rotate-180" : ""}`} fill="none" viewBox="0 0 16 16">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              )}

              {/* History dropdown */}
              {showHistory && (
                <div className="absolute top-[38px] left-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl w-[300px] overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-[#eaecf0]">
                    <span className="text-[13px] font-semibold text-[#344054]">Chat History</span>
                  </div>
                  <div className="max-h-[320px] overflow-y-auto py-1">
                    {historyLoading && <p className="text-[12px] text-[#98a2b3] px-4 py-2">Loading…</p>}
                    {!historyLoading && history.length === 0 && (
                      <p className="text-[12px] text-[#98a2b3] px-4 py-3">No chat history yet.</p>
                    )}
                    {history.map((session, i) => (
                      <button
                        key={i}
                        onClick={() => loadSession(session)}
                        className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      >
                        <p className="text-[13px] text-[#344054] font-medium truncate">{session.title}</p>
                        <p className="text-[11px] text-[#98a2b3] mt-0.5">{session.date} · {session.items.length} msg{session.items.length !== 1 ? "s" : ""}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: new chat + download + 3-dots + hide */}
            <div className="flex items-center gap-0.5 shrink-0">

              <Tooltip label="New chat" position="bottom">
                <button
                  onClick={startNewChat}
                  className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 20 20">
                    <path d="M10 4H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14.5 2.5a1.414 1.414 0 0 1 2 2L10 11l-3 1 1-3 6.5-6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Tooltip>

              <Tooltip label="Download chat" position="bottom">
                <button
                  onClick={downloadChat}
                  className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 20 20">
                    <path d="M17.5 12.5v3.333A1.667 1.667 0 0 1 15.833 17.5H4.167A1.667 1.667 0 0 1 2.5 15.833V12.5M5.833 8.333 10 12.5l4.167-4.167M10 12.5v-10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Tooltip>

              {/* 3-dots options menu */}
              <div className="relative" ref={optionsRef}>
                <Tooltip label="Options" position="bottom">
                  <button
                    onClick={() => setShowOptions(o => !o)}
                    className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
                  >
                    <svg className="size-4" fill="currentColor" viewBox="0 0 20 20">
                      <circle cx="4" cy="10" r="1.5"/>
                      <circle cx="10" cy="10" r="1.5"/>
                      <circle cx="16" cy="10" r="1.5"/>
                    </svg>
                  </button>
                </Tooltip>

                {showOptions && (
                  <div className="absolute top-[36px] right-0 z-50 bg-white border border-[#d0d5dd] rounded-[10px] shadow-xl w-[160px] overflow-hidden py-1">
                    <button
                      onClick={handleStartRename}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-[#344054] hover:bg-gray-50 transition-colors flex items-center gap-2.5"
                    >
                      <svg className="size-4 text-[#667085]" fill="none" viewBox="0 0 20 20">
                        <path d="M14.5 2.5a1.414 1.414 0 0 1 2 2L10 11l-3 1 1-3 6.5-6.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Rename
                    </button>
                    <button
                      onClick={startNewChat}
                      className="w-full text-left px-4 py-2.5 text-[13px] text-[#b42318] hover:bg-[#fef3f2] transition-colors flex items-center gap-2.5"
                    >
                      <svg className="size-4" fill="none" viewBox="0 0 20 20">
                        <path d="M3.333 5h13.334M8.333 9.167v5M11.667 9.167v5M4.167 5l.833 10a1.667 1.667 0 0 0 1.667 1.667h6.666A1.667 1.667 0 0 0 15 15L15.833 5M7.5 5V3.333a.833.833 0 0 1 .833-.833h3.334a.833.833 0 0 1 .833.833V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete chat
                    </button>
                  </div>
                )}
              </div>

              <Tooltip label="Hide chat" position="bottom">
                <button
                  onClick={() => setIsOpen(false)}
                  className="size-8 flex items-center justify-center rounded-lg text-[#667085] hover:text-black hover:bg-gray-100 transition-colors"
                >
                  <svg className="size-4" fill="none" viewBox="0 0 20 20">
                    <path d="M11 5l5 5-5 5M4 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </Tooltip>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 flex flex-col">
            {isGreetingOnly ? (
              <div className="flex-1 flex flex-col justify-end pb-5">
                <img src={chatbotIcon} className="size-20 mb-3" alt="" />
                <p className="font-['Figtree:Medium',sans-serif] font-medium text-[20px] text-black leading-tight">
                  {GREETING}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 py-5">
                {messages.slice(1).map((msg, i) => {
                  if (msg.role === "user") {
                    return (
                      <div key={i} className="flex justify-end">
                        <div className="bg-[#f2f4f7] text-[#344054] px-3.5 py-2.5 rounded-[14px] rounded-tr-[4px] text-[13px] leading-[20px] max-w-[300px] whitespace-pre-wrap">
                          {msg.text}
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={i} className="flex justify-start">
                      <div className="bg-white border border-[#eaecf0] text-[#1d2939] px-3.5 py-2.5 rounded-[14px] rounded-tl-[4px] text-[13px] leading-[22px] max-w-[320px] whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="size-1.5 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="size-1.5 rounded-full bg-[#667085] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
                <div ref={bottomRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="px-4 pb-4 pt-0 shrink-0 flex flex-col gap-2">

            {/* Token balance — no border, sits above the bordered textarea */}
            {isExhausted ? (
              <div className="flex items-center gap-2.5 bg-[#1d2939] rounded-[12px] px-3 py-2.5">
                <div className="shrink-0 size-[18px] rounded-full bg-[#344054] flex items-center justify-center">
                  <svg className="size-3 text-white" fill="none" viewBox="0 0 12 12">
                    <path d="M6 1.5A4.5 4.5 0 1 0 10.5 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                    <path d="M10.5 2v4h-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <p className="text-[12px] text-[#d0d5dd] leading-[18px]">
                  You've run out of API balance.{" "}
                  <span className="text-[#7dd3fc] font-medium">Contact your admin.</span>
                </p>
              </div>
            ) : (
              <div className="bg-[#f2f4f7] rounded-[12px] px-3 pt-2.5 pb-2.5">
                <p className="text-[12px] text-[#344054] font-medium mb-1.5">
                  {balance.toLocaleString()} tokens left
                </p>
                <div className="h-[4px] rounded-full bg-[#e4e7ec] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#144430] transition-all duration-500"
                    style={{ width: `${totalBudget > 0 ? Math.max(2, (balance / totalBudget) * 100) : 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Bordered textarea card */}
            <div className="border border-[#d0d5dd] rounded-[12px] bg-white relative">
              {/* Selected docs chips */}
              {selectedDocIds.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap px-3 pt-2.5">
                  {selectedDocIds.length === 1 ? (
                    <div className="inline-flex items-center gap-1.5 bg-[#f0f9f4] border border-[#a9efc5] rounded-full px-2.5 py-1">
                      <svg className="size-3 text-[#027a48] shrink-0" fill="none" viewBox="0 0 14 14">
                        <path d="M8 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[11px] text-[#027a48] font-medium truncate max-w-[220px]">
                        {docOptions.find(d => d.id === selectedDocIds[0])?.title ?? "1 document"}
                      </span>
                      <button onClick={() => setSelectedDocIds([])} className="text-[#667085] hover:text-[#b42318] ml-0.5 shrink-0">
                        <svg className="size-3" fill="none" viewBox="0 0 12 12"><path d="M9 3 3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1.5 bg-[#f0f9f4] border border-[#a9efc5] rounded-full px-2.5 py-1">
                      <svg className="size-3 text-[#027a48] shrink-0" fill="none" viewBox="0 0 14 14">
                        <path d="M8 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L8 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="text-[11px] text-[#027a48] font-medium">{selectedDocIds.length} documents selected</span>
                      <button onClick={() => setSelectedDocIds([])} className="text-[#667085] hover:text-[#b42318] ml-0.5 shrink-0">
                        <svg className="size-3" fill="none" viewBox="0 0 12 12"><path d="M9 3 3 9M3 3l6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                  )}
                </div>
              )}

              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={isExhausted ? "API balance exhausted" : "Ask anything…"}
                disabled={isExhausted}
                className="w-full px-3 pt-2.5 resize-none focus:outline-none text-[13px] text-[#344054] placeholder:text-[#98a2b3] disabled:bg-[#f9fafb] disabled:cursor-not-allowed leading-[20px] bg-transparent"
                style={{ minHeight: "80px", maxHeight: "180px", paddingBottom: "44px" }}
              />

              {/* Bottom row: doc picker + send */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 pb-2">
                {/* Doc picker */}
                <div className="relative" ref={docPickerRef}>
                  <button
                    onClick={openDocPicker}
                    title="Select source documents"
                    className={`size-8 flex items-center justify-center rounded-lg transition-colors text-[18px] font-light leading-none ${selectedDocIds.length > 0 ? "text-[#144430] bg-[#f0f9f4]" : "text-[#667085] hover:text-black hover:bg-gray-100"}`}
                  >
                    +
                  </button>

                  {showDocPicker && (
                    <div className="absolute bottom-full mb-2 left-0 z-50 bg-white border border-[#d0d5dd] rounded-[12px] shadow-xl w-[300px] overflow-hidden">
                      <div className="border-b border-[#eaecf0]">
                        <button onClick={toggleAllDocs} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left">
                          <div className={`size-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${allDocsSelected ? "bg-[#144430] border-[#144430]" : selectedDocIds.length > 0 ? "border-[#144430]" : "border-[#d0d5dd]"}`}>
                            {allDocsSelected && <svg className="size-2.5" viewBox="0 0 10 10" fill="none"><path d="M8 2L4 8L2 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            {!allDocsSelected && selectedDocIds.length > 0 && <div className="w-2 h-0.5 bg-[#144430] rounded" />}
                          </div>
                          <span className="text-[13px] font-semibold text-[#344054]">{allDocsSelected ? "Deselect all" : "Select all documents"}</span>
                          <span className="ml-auto text-[11px] text-[#98a2b3]">{docOptions.length} total</span>
                        </button>
                      </div>
                      <div className="max-h-[240px] overflow-y-auto py-1">
                        {docOptions.length === 0 && (
                          <p className="text-[12px] text-[#98a2b3] px-4 py-3">No documents found.</p>
                        )}
                        {docOptions.map(doc => {
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
                        <button onClick={() => setShowDocPicker(false)} className="text-[12px] font-semibold text-[#144430] hover:underline">Done</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Send button */}
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || loading || isExhausted}
                  className="size-8 bg-[#144430] rounded-[8px] flex items-center justify-center hover:bg-[#0f3324] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  <svg className="size-4" viewBox="0 0 20 20" fill="none">
                    <path d="M10 16.667V3.333M4 9.333 10 3.333l6 6" stroke="#EAECF0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

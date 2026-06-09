import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type ChatPanelContextType = {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  sidePanelOpen: boolean;
  setSidePanelOpen: (open: boolean) => void;
};

const ChatPanelContext = createContext<ChatPanelContextType>({
  chatOpen: false,
  setChatOpen: () => {},
  sidePanelOpen: false,
  setSidePanelOpen: () => {},
});

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  return (
    <ChatPanelContext.Provider value={{ chatOpen, setChatOpen, sidePanelOpen, setSidePanelOpen }}>
      {children}
    </ChatPanelContext.Provider>
  );
}

export function useChatPanel() {
  return useContext(ChatPanelContext);
}

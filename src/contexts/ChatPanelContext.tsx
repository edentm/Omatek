import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type ChatPanelContextType = {
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
};

const ChatPanelContext = createContext<ChatPanelContextType>({
  chatOpen: false,
  setChatOpen: () => {},
});

export function ChatPanelProvider({ children }: { children: ReactNode }) {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <ChatPanelContext.Provider value={{ chatOpen, setChatOpen }}>
      {children}
    </ChatPanelContext.Provider>
  );
}

export function useChatPanel() {
  return useContext(ChatPanelContext);
}

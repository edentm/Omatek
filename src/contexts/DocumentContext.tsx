import { createContext, useContext, useState } from "react";

export type ActiveDocument = {
  id: number;
  name: string;
  uploadedAt: string; // ISO string
};

type DocumentContextType = {
  activeDocument: ActiveDocument | null;
  setActiveDocument: (doc: ActiveDocument | null) => void;
};

const DocumentContext = createContext<DocumentContextType>({
  activeDocument: null,
  setActiveDocument: () => {},
});

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [activeDocument, setActiveDocument] = useState<ActiveDocument | null>(null);
  return (
    <DocumentContext.Provider value={{ activeDocument, setActiveDocument }}>
      {children}
    </DocumentContext.Provider>
  );
}

export const useDocumentContext = () => useContext(DocumentContext);

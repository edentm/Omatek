import { createContext, useContext, useState } from "react";

export type ActiveDocument = {
  id: number;
  name: string;
  uploadedAt: string; // ISO string
};

type DocumentContextType = {
  activeDocument: ActiveDocument | null;       // primary (first in selection) — for backwards compat
  activeDocuments: ActiveDocument[];           // full multi-selection
  setActiveDocument: (doc: ActiveDocument | null) => void;  // sets exactly one
  setActiveDocuments: (docs: ActiveDocument[]) => void;
  toggleDocument: (doc: ActiveDocument) => void;
};

const DocumentContext = createContext<DocumentContextType>({
  activeDocument: null,
  activeDocuments: [],
  setActiveDocument: () => {},
  setActiveDocuments: () => {},
  toggleDocument: () => {},
});

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [activeDocuments, setActiveDocuments] = useState<ActiveDocument[]>([]);

  const activeDocument = activeDocuments[0] ?? null;

  const setActiveDocument = (doc: ActiveDocument | null) => {
    setActiveDocuments(doc ? [doc] : []);
  };

  const toggleDocument = (doc: ActiveDocument) => {
    setActiveDocuments(prev => {
      const exists = prev.some(d => d.id === doc.id);
      if (exists) return prev.filter(d => d.id !== doc.id);
      return [...prev, doc];
    });
  };

  return (
    <DocumentContext.Provider value={{ activeDocument, activeDocuments, setActiveDocument, setActiveDocuments, toggleDocument }}>
      {children}
    </DocumentContext.Provider>
  );
}

export const useDocumentContext = () => useContext(DocumentContext);

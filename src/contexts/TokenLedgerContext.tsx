import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getTokenBalance } from "../api";

const DEFAULT_BUDGET = 1_000_000;

type TokenLedgerContextType = {
  balance: number;
  totalBudget: number;
  deductTokens: (n: number) => void;
  refreshBalance: () => Promise<void>;
  isExhausted: boolean;
};

const TokenLedgerContext = createContext<TokenLedgerContextType>({
  balance: DEFAULT_BUDGET,
  totalBudget: DEFAULT_BUDGET,
  deductTokens: () => {},
  refreshBalance: async () => {},
  isExhausted: false,
});

export function TokenLedgerProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState<number>(() => {
    const stored = localStorage.getItem("token_balance");
    return stored ? Number(stored) : DEFAULT_BUDGET;
  });
  const [totalBudget, setTotalBudget] = useState(DEFAULT_BUDGET);

  const refreshBalance = useCallback(async () => {
    try {
      const data = await getTokenBalance() as Record<string, unknown>;
      const b = Number(data.balance ?? DEFAULT_BUDGET);
      const t = Number(data.totalBudget ?? DEFAULT_BUDGET);
      setBalance(b);
      setTotalBudget(t);
      localStorage.setItem("token_balance", String(b));
    } catch {}
  }, []);

  useEffect(() => { refreshBalance(); }, [refreshBalance]);

  const deductTokens = useCallback((n: number) => {
    setBalance(prev => {
      const next = Math.max(0, prev - n);
      localStorage.setItem("token_balance", String(next));
      return next;
    });
  }, []);

  return (
    <TokenLedgerContext.Provider value={{
      balance,
      totalBudget,
      deductTokens,
      refreshBalance,
      isExhausted: balance <= 0,
    }}>
      {children}
    </TokenLedgerContext.Provider>
  );
}

export const useTokenLedger = () => useContext(TokenLedgerContext);

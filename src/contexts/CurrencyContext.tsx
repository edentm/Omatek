import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type CurrencyCode = "NGN" | "USD" | "GHS" | "KES" | "ZAR" | "TZS"

export const CURRENCIES = [
  { code: "NGN" as CurrencyCode, fullName: "Nigerian Naira",     symbol: "₦",   flag: "🇳🇬" },
  { code: "USD" as CurrencyCode, fullName: "US Dollar",          symbol: "$",   flag: "🇺🇸" },
  { code: "GHS" as CurrencyCode, fullName: "Ghana Cedis",        symbol: "GH₵", flag: "🇬🇭" },
  { code: "KES" as CurrencyCode, fullName: "Kenya Shillings",    symbol: "KSh", flag: "🇰🇪" },
  { code: "ZAR" as CurrencyCode, fullName: "South African Rand", symbol: "R",   flag: "🇿🇦" },
  { code: "TZS" as CurrencyCode, fullName: "Tanzanian Shilling", symbol: "TSh", flag: "🇹🇿" },
]

// Fallback rates (NGN → other) used if API is unavailable
const FALLBACK_RATES: Record<string, number> = {
  ngn: 1, usd: 0.000625, ghs: 0.0085, kes: 0.09, zar: 0.012, tzs: 1.625,
}

type CurrencyCtx = {
  currency: CurrencyCode
  setCurrency: (c: CurrencyCode) => void
  fmtNGN: (ngnValue: number) => string
  currencyInfo: typeof CURRENCIES[number]
}

const CurrencyContext = createContext<CurrencyCtx | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("NGN")
  const [rates, setRates] = useState<Record<string, number>>(FALLBACK_RATES)

  useEffect(() => {
    fetch("https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/ngn.json")
      .then(r => r.json())
      .then(d => { if (d?.ngn) setRates({ ...FALLBACK_RATES, ...d.ngn, ngn: 1 }) })
      .catch(() => {})
  }, [])

  const currencyInfo = CURRENCIES.find(c => c.code === currency) ?? CURRENCIES[0]

  function fmtNGN(ngnValue: number): string {
    const rate = rates[currency.toLowerCase()] ?? 1
    const converted = ngnValue * rate
    const sym = currencyInfo.symbol
    const abs = Math.abs(converted)
    if (abs >= 1e9)  return `${sym}${(converted / 1e9).toFixed(2)}B`
    if (abs >= 1e6)  return `${sym}${(converted / 1e6).toFixed(1)}M`
    if (abs >= 1e3)  return `${sym}${(converted / 1e3).toFixed(0)}K`
    if (abs < 0.001) return `${sym}${converted.toFixed(5)}`
    if (abs < 0.1)   return `${sym}${converted.toFixed(4)}`
    if (abs < 10)    return `${sym}${converted.toFixed(3)}`
    return `${sym}${converted.toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmtNGN, currencyInfo }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider")
  return ctx
}

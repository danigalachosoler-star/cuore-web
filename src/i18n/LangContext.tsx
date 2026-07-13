import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { copy, type Copy, type Lang } from './copy'

interface LangValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Copy
}

const LangContext = createContext<LangValue | null>(null)

export function LangProvider({ children }: { children: ReactNode }) {
  // Estado solo en memoria, a propósito (sin localStorage): el idioma se
  // resetea en cada visita y arranca en ES.
  const [lang, setLang] = useState<Lang>('es')
  const value = useMemo<LangValue>(() => ({ lang, setLang, t: copy[lang] }), [lang])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang(): LangValue {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Size } from '../i18n/copy'

/**
 * Talla compartida entre la ficha del Drop 04 y el formulario de la lista:
 * "Notificar" en el producto y la sección #lista son la MISMA captura.
 */
interface SignupValue {
  size: Size | null
  setSize: (size: Size | null) => void
}

const SignupContext = createContext<SignupValue | null>(null)

export function SignupProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<Size | null>(null)
  const value = useMemo(() => ({ size, setSize }), [size])
  return <SignupContext.Provider value={value}>{children}</SignupContext.Provider>
}

export function useSignup(): SignupValue {
  const ctx = useContext(SignupContext)
  if (!ctx) throw new Error('useSignup must be used within SignupProvider')
  return ctx
}

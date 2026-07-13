import { useEffect } from 'react'
import { LangProvider, useLang } from './i18n/LangContext'
import { SignupProvider } from './state/SignupContext'
import { initSmoothScroll } from './lib/smoothScroll'
import { TopBar } from './components/TopBar'
import { HudFrame } from './components/HudFrame'
import { Hero } from './components/Hero'
import { Marquee } from './components/Marquee'
import { Drop04 } from './components/Drop04'
import { Lookbook } from './components/Lookbook'
import { Manifesto } from './components/Manifesto'
import { ListSection } from './components/ListSection'
import { Footer } from './components/Footer'

function Page() {
  const { t, lang } = useLang()

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  useEffect(() => initSmoothScroll(), [])

  return (
    <div id="top">
      <a className="skip-link" href="#main">
        {t.skipToContent}
      </a>
      <TopBar />
      <HudFrame />
      <div className="film-grain" aria-hidden="true" />
      <main id="main">
        <Hero />
        <Marquee />
        <Drop04 />
        <Lookbook />
        <Manifesto />
        <ListSection />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <LangProvider>
      <SignupProvider>
        <Page />
      </SignupProvider>
    </LangProvider>
  )
}

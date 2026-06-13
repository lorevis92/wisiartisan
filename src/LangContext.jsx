import { createContext, useContext, useState } from 'react'
import { translations, LANGS, LANG_LABELS } from './i18n.js'

const LangContext = createContext(null)

export function LangProvider({ children }) {
  const [lang, setLang] = useState('en')
  const t = key => translations[lang]?.[key] ?? key
  return <LangContext.Provider value={{ lang, setLang, t }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

export function LangSwitcher() {
  const { lang, setLang } = useLang()
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {LANGS.map(l => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            background: lang === l ? '#E8352A' : 'transparent',
            color: lang === l ? '#fff' : '#AAAAAA',
            border: 'none',
            borderRadius: 3,
            padding: '4px 7px',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            fontFamily: 'Syne, sans-serif',
            textTransform: 'uppercase',
          }}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  )
}

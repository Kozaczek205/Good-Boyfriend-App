import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTheme } from '../context/ThemeContext'
import { t } from '../theme'

const LOVE_LANGUAGES = [
  { id: 'gifts',                icon: '🎁', label: 'Receiving Gifts'      },
  { id: 'words of affirmation', icon: '💬', label: 'Words of Affirmation' },
  { id: 'acts of service',      icon: '🛠️', label: 'Acts of Service'      },
  { id: 'quality time',         icon: '⏰', label: 'Quality Time'          },
  { id: 'physical touch',       icon: '🤗', label: 'Physical Touch'        },
]

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [, setPartnerName] = useLocalStorage('partnerName', '')
  const [, setLoveLanguage] = useLocalStorage('loveLanguage', '')
  const [, setBudget] = useLocalStorage('budget', { min: 0, max: 60 })
  const { darkMode } = useTheme()
  const th = t(darkMode)

  const [name, setName] = useState('')
  const [lang, setLang] = useState('')
  const [budgetMax, setBudgetMax] = useState(60)

  const finish = () => {
    if (name.trim()) setPartnerName(name.trim())
    if (lang) setLoveLanguage(lang)
    setBudget({ min: 0, max: budgetMax })
    onDone()
  }

  const dot = (i) => (
    <div key={i} style={{
      height: 8, borderRadius: 100,
      width: i === step ? 22 : 8,
      background: i <= step ? '#f43f5e' : darkMode ? '#3d2040' : '#ffe4e6',
      transition: 'all 0.3s',
    }} />
  )

  const steps = [
    /* ── Step 0: Welcome ── */
    <div key={0} style={{ textAlign: 'center', padding: '48px 28px 32px' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>💝</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: th.text, marginBottom: 10 }}>Good Boyfriend</h1>
      <p style={{ fontSize: 15, color: th.textMuted, lineHeight: 1.7, marginBottom: 36 }}>
        Your daily companion for being a more thoughtful partner — gift ideas, occasion reminders, date nights, and more.
      </p>
      <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: '14px', marginBottom: 12 }} onClick={() => setStep(1)}>
        Get Started →
      </button>
      <button className="btn btn-ghost btn-full" onClick={onDone}>
        Skip — just show me the app
      </button>
    </div>,

    /* ── Step 1: Her name ── */
    <div key={1} style={{ padding: '16px 28px 32px' }}>
      <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>👩</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: th.text, textAlign: 'center', marginBottom: 6 }}>
        What's her name?
      </h2>
      <p style={{ fontSize: 13, color: th.textFaint, textAlign: 'center', marginBottom: 24 }}>
        We'll use it to personalise suggestions throughout the app.
      </p>
      <div className="form-group">
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Emma"
          autoFocus
          onKeyDown={e => e.key === 'Enter' && setStep(2)}
        />
      </div>
      <button className="btn btn-primary btn-full" style={{ marginBottom: 10 }} onClick={() => setStep(2)}>
        Next →
      </button>
      <button className="btn btn-ghost btn-full" onClick={() => setStep(2)}>Skip this step</button>
    </div>,

    /* ── Step 2: Love language ── */
    <div key={2} style={{ padding: '16px 28px 32px' }}>
      <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>💬</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: th.text, textAlign: 'center', marginBottom: 6 }}>
        Her love language?
      </h2>
      <p style={{ fontSize: 13, color: th.textFaint, textAlign: 'center', marginBottom: 20 }}>
        This biases your daily suggestions toward what resonates most with her.
      </p>
      {LOVE_LANGUAGES.map(ll => (
        <div
          key={ll.id}
          className={`ll-card ${lang === ll.id ? 'selected' : ''}`}
          onClick={() => setLang(lang === ll.id ? '' : ll.id)}
        >
          <span className="ll-icon">{ll.icon}</span>
          <div className="ll-info"><h4>{ll.label}</h4></div>
          {lang === ll.id && <span style={{ marginLeft: 'auto', color: '#f43f5e', fontWeight: 700, flexShrink: 0 }}>✓</span>}
        </div>
      ))}
      <button className="btn btn-primary btn-full" style={{ marginTop: 16, marginBottom: 10 }} onClick={() => setStep(3)}>
        Next →
      </button>
      <button className="btn btn-ghost btn-full" onClick={() => setStep(3)}>Skip this step</button>
    </div>,

    /* ── Step 3: Budget ── */
    <div key={3} style={{ padding: '16px 28px 32px' }}>
      <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>💰</div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: th.text, textAlign: 'center', marginBottom: 6 }}>
        Typical gift budget?
      </h2>
      <p style={{ fontSize: 13, color: th.textFaint, textAlign: 'center', marginBottom: 28 }}>
        You can always adjust this later on the home screen.
      </p>
      <div style={{ textAlign: 'center', fontSize: 36, fontWeight: 800, color: '#f43f5e', marginBottom: 16 }}>
        Up to ${budgetMax}
      </div>
      <input
        type="range" min={5} max={200} step={5}
        value={budgetMax}
        onChange={e => setBudgetMax(Number(e.target.value))}
        style={{ marginBottom: 6 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: th.textFaint, marginBottom: 32 }}>
        <span>$5</span><span>$200</span>
      </div>
      <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: '14px', marginBottom: 10 }} onClick={finish}>
        Let's go! 💝
      </button>
      <button className="btn btn-ghost btn-full" onClick={finish}>Skip & use defaults</button>
    </div>,
  ]

  return (
    <div style={{
      maxWidth: 430, margin: '0 auto', minHeight: '100vh',
      background: darkMode ? '#18111a' : '#fff',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      {step > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '20px 0 0' }}>
          {[1, 2, 3].map(i => dot(i))}
        </div>
      )}
      {steps[step]}
    </div>
  )
}

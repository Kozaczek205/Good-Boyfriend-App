import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { bigGestureIdeas } from '../data/suggestions'
import { useTheme } from '../context/ThemeContext'
import { t } from '../theme'

const LOVE_LANGUAGES = [
  { id: 'gifts',                icon: '🎁', label: 'Receiving Gifts',      desc: 'Thoughtful presents mean the world to her' },
  { id: 'words of affirmation', icon: '💬', label: 'Words of Affirmation', desc: 'Compliments and kind words fill her cup' },
  { id: 'acts of service',      icon: '🛠️', label: 'Acts of Service',      desc: 'Actions speak louder than words for her' },
  { id: 'quality time',         icon: '⏰', label: 'Quality Time',          desc: 'Your undivided attention is her love language' },
  { id: 'physical touch',       icon: '🤗', label: 'Physical Touch',        desc: 'Hugs, cuddles, and closeness matter most' },
]

const todayStr = () => new Date().toISOString().split('T')[0]

export default function Profile() {
  const [partnerName, setPartnerName] = useLocalStorage('partnerName', '')
  const [loveLanguage, setLoveLanguage] = useLocalStorage('loveLanguage', '')
  const [lastBigGesture, setLastBigGesture] = useLocalStorage('lastBigGesture', null)
  const [anniversaryDate, setAnniversaryDate] = useLocalStorage('anniversaryDate', '')

  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notificationsEnabled', false)
  const [monthlyBudget, setMonthlyBudget] = useLocalStorage('monthlyBudget', 0)
  const [nameInput, setNameInput] = useState(partnerName)
  const [nameSaved, setNameSaved] = useState(false)
  const [annivInput, setAnnivInput] = useState(anniversaryDate)
  const [annivSaved, setAnnivSaved] = useState(false)
  const [selectedGesture, setSelectedGesture] = useState(null)
  const [importError, setImportError] = useState('')
  const { darkMode, setDarkMode } = useTheme()
  const th = t(darkMode)

  const monthSinceGesture = !lastBigGesture ||
    Date.now() - new Date(lastBigGesture).getTime() > 30 * 24 * 60 * 60 * 1000

  const saveName = () => {
    setPartnerName(nameInput.trim())
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 1800)
  }

  const saveAnniversary = () => {
    const val = annivInput.trim()
    if (!val || /^\d{2}-\d{2}$/.test(val)) {
      setAnniversaryDate(val)
      setAnnivSaved(true)
      setTimeout(() => setAnnivSaved(false), 1800)
    }
  }

  const markGestureDone = () => {
    setLastBigGesture(todayStr())
    setSelectedGesture(null)
  }

  const enableNotifications = async () => {
    if (!('Notification' in window)) return alert('Notifications are not supported on this device.')
    const perm = await Notification.requestPermission()
    setNotificationsEnabled(perm === 'granted')
  }

  const exportData = () => {
    const keys = ['partnerName','loveLanguage','budget','monthlyBudget','recentGestures','memoryBank','wishlist','occasions','lastBigGesture','darkMode','customGifts','customGestures','notificationsEnabled','spinMode']
    const data = {}
    keys.forEach(k => { const v = localStorage.getItem(k); if (v !== null) data[k] = JSON.parse(v) })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'good-boyfriend-backup.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        Object.entries(data).forEach(([k, v]) => localStorage.setItem(k, JSON.stringify(v)))
        window.location.reload()
      } catch {
        setImportError('Invalid backup file — please try again.')
        setTimeout(() => setImportError(''), 3000)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Relationship Profile</div>
        <div className="section-subtitle">Personalize every suggestion for her</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Dark mode toggle */}
        <div className="card" style={{ marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: th.text }}>{darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}</div>
            <div style={{ fontSize: 12, color: th.textFaint, marginTop: 2 }}>Tap to switch</div>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              width: 52, height: 28, borderRadius: 100,
              background: darkMode ? '#f43f5e' : '#e5e7eb',
              border: 'none', cursor: 'pointer', position: 'relative',
              transition: 'background 0.25s',
              flexShrink: 0,
            }}
          >
            <span style={{
              position: 'absolute', top: 3,
              left: darkMode ? 26 : 3,
              width: 22, height: 22, borderRadius: '50%',
              background: '#fff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              transition: 'left 0.25s',
              display: 'block',
            }} />
          </button>
        </div>

        {/* Partner name */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 8 }}>Her Name</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="e.g. Emma"
              onKeyDown={e => e.key === 'Enter' && saveName()}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={saveName}
              style={{ whiteSpace: 'nowrap', minWidth: 72 }}
            >
              {nameSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
          {partnerName && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#fb7185', opacity: darkMode ? 0.9 : 1 }}>
              All suggestions will be personalized for {partnerName} 💕
            </div>
          )}
        </div>

        {/* Anniversary date */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 8 }}>Anniversary Date</div>
          <div style={{ fontSize: 12, color: th.textFaint, marginBottom: 10 }}>
            Enter your anniversary date (MM-DD) — a countdown will appear on the home screen 60 days before.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="input"
              value={annivInput}
              onChange={e => setAnnivInput(e.target.value)}
              placeholder="e.g. 06-15"
              pattern="\d{2}-\d{2}"
              onKeyDown={e => e.key === 'Enter' && saveAnniversary()}
            />
            <button className="btn btn-primary btn-sm" onClick={saveAnniversary}
              style={{ whiteSpace: 'nowrap', minWidth: 72 }}>
              {annivSaved ? '✓ Saved' : 'Save'}
            </button>
          </div>
          {anniversaryDate && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#fb7185' }}>
              💍 Countdown shows on home screen when within 60 days
            </div>
          )}
        </div>

        {/* Monthly budget cap */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 8 }}>Monthly Gift Budget</div>
          <div style={{ fontSize: 12, color: th.textFaint, marginBottom: 10 }}>
            Set a monthly spending cap — tracked on the home screen.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, color: th.textMuted }}>$</span>
            <input
              type="number" className="input" min={0}
              value={monthlyBudget || ''}
              onChange={e => setMonthlyBudget(Math.max(0, Number(e.target.value)))}
              placeholder="e.g. 100"
              style={{ textAlign: 'center' }}
            />
            {monthlyBudget > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={() => setMonthlyBudget(0)}>Clear</button>
            )}
          </div>
        </div>

        {/* Love language */}
        <div style={{ marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 10 }}>Her Love Language</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
            This biases daily gift & gesture suggestions to what resonates most with her.
          </div>
          {LOVE_LANGUAGES.map(ll => (
            <div
              key={ll.id}
              className={`ll-card ${loveLanguage === ll.id ? 'selected' : ''}`}
              onClick={() => setLoveLanguage(loveLanguage === ll.id ? '' : ll.id)}
            >
              <span className="ll-icon">{ll.icon}</span>
              <div className="ll-info">
                <h4>{ll.label}</h4>
                <p>{ll.desc}</p>
              </div>
              {loveLanguage === ll.id && (
                <span style={{ marginLeft: 'auto', color: '#f43f5e', fontSize: 18, fontWeight: 700, flexShrink: 0 }}>✓</span>
              )}
            </div>
          ))}
        </div>

        {/* Monthly big gesture */}
        <div style={{ marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 10 }}>Monthly Big Gesture</div>

          {monthSinceGesture ? (
            <div style={{
              ...th.softPurple,
              border: `1px solid ${th.softPurple.borderColor}`,
              borderRadius: 14, padding: '14px',
              marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 28 }}>🌟</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: th.purpleTitle }}>Time for a big gesture!</div>
                <div style={{ fontSize: 12, color: th.purpleText, marginTop: 2 }}>
                  Choose one below and follow the step-by-step plan.
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              ...th.softGreen,
              border: `1px solid ${th.softGreen.borderColor}`,
              borderRadius: 12, padding: '10px 14px', marginBottom: 14,
              fontSize: 12,
            }}>
              ✅ You did a big gesture this month — she's lucky to have you! 💚
              {lastBigGesture && (
                <span style={{ color: '#9ca3af' }}>
                  {' '}({new Date(lastBigGesture).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </span>
              )}
            </div>
          )}

          {selectedGesture ? (
            <div className="card bounce-in" style={{ borderColor: '#e9d5ff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
                <span style={{ fontSize: 36, lineHeight: 1 }}>{selectedGesture.emoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#1f2937' }}>{selectedGesture.name}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, lineHeight: 1.4 }}>{selectedGesture.description}</div>
                </div>
              </div>

              <div className="label" style={{ marginBottom: 10 }}>Step-by-step plan</div>
              {selectedGesture.steps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <span style={{
                    width: 24, height: 24, minWidth: 24, borderRadius: '50%',
                    background: '#f43f5e', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{i + 1}</span>
                  <span style={{ fontSize: 13, color: '#374151', lineHeight: 1.55, paddingTop: 2 }}>{step}</span>
                </div>
              ))}

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={markGestureDone}>
                  ✓ I did this!
                </button>
                <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setSelectedGesture(null)}>
                  ← Back
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {bigGestureIdeas.map((g, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', ...th.gestureItem,
                    borderRadius: 12, border: `1px solid ${th.gestureItem.borderColor}`,
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onClick={() => setSelectedGesture(g)}
                >
                  <span style={{ fontSize: 28 }}>{g.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: th.textFaint, marginTop: 2, lineHeight: 1.4 }}>{g.description}</div>
                  </div>
                  <span style={{ color: '#fda4af', fontSize: 20, flexShrink: 0 }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Notifications */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: notificationsEnabled ? 0 : 8 }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: th.text }}>🔔 Notifications</div>
              <div style={{ fontSize: 12, color: th.textFaint, marginTop: 2 }}>Daily spin reminder + occasion alerts</div>
            </div>
            <button
              onClick={() => notificationsEnabled ? setNotificationsEnabled(false) : enableNotifications()}
              style={{
                width: 52, height: 28, borderRadius: 100,
                background: notificationsEnabled ? '#f43f5e' : (darkMode ? '#3d2040' : '#e5e7eb'),
                border: 'none', cursor: 'pointer', position: 'relative',
                transition: 'background 0.25s', flexShrink: 0,
              }}
            >
              <span style={{
                position: 'absolute', top: 3,
                left: notificationsEnabled ? 26 : 3,
                width: 22, height: 22, borderRadius: '50%',
                background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                transition: 'left 0.25s', display: 'block',
              }} />
            </button>
          </div>
          {!notificationsEnabled && (
            <div style={{ fontSize: 11, color: th.textFaint }}>
              Notifications show when you open the app (no backend required).
            </div>
          )}
        </div>

        {/* Export / Import */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: th.text, marginBottom: 4 }}>💾 Backup & Restore</div>
          <div style={{ fontSize: 12, color: th.textFaint, marginBottom: 12 }}>
            Export your data as a JSON file so you don't lose it if you switch browsers or devices.
          </div>
          <button className="btn btn-outline btn-full" style={{ marginBottom: 8 }} onClick={exportData}>
            ↓ Export backup
          </button>
          <label className="btn btn-ghost btn-full" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            ↑ Import backup
            <input type="file" accept=".json" onChange={importData} style={{ display: 'none' }} />
          </label>
          {importError && <div style={{ marginTop: 8, fontSize: 12, color: '#ef4444' }}>{importError}</div>}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { bigGestureIdeas } from '../data/suggestions'

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

  const [nameInput, setNameInput] = useState(partnerName)
  const [nameSaved, setNameSaved] = useState(false)
  const [selectedGesture, setSelectedGesture] = useState(null)

  const monthSinceGesture = !lastBigGesture ||
    Date.now() - new Date(lastBigGesture).getTime() > 30 * 24 * 60 * 60 * 1000

  const saveName = () => {
    setPartnerName(nameInput.trim())
    setNameSaved(true)
    setTimeout(() => setNameSaved(false), 1800)
  }

  const markGestureDone = () => {
    setLastBigGesture(todayStr())
    setSelectedGesture(null)
  }

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Relationship Profile</div>
        <div className="section-subtitle">Personalize every suggestion for her</div>
      </div>

      <div style={{ padding: '0 16px' }}>
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
            <div style={{ marginTop: 8, fontSize: 12, color: '#fb7185' }}>
              All suggestions will be personalized for {partnerName} 💕
            </div>
          )}
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
              background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
              border: '1px solid #e9d5ff',
              borderRadius: 14, padding: '14px',
              marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 28 }}>🌟</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed' }}>Time for a big gesture!</div>
                <div style={{ fontSize: 12, color: '#9333ea', marginTop: 2 }}>
                  Choose one below and follow the step-by-step plan.
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#f0fdf4', border: '1px solid #bbf7d0',
              borderRadius: 12, padding: '10px 14px', marginBottom: 14,
              fontSize: 12, color: '#16a34a',
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
                    padding: '12px 14px', background: '#fff',
                    borderRadius: 12, border: '1px solid #ffe4e6',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onClick={() => setSelectedGesture(g)}
                >
                  <span style={{ fontSize: 28 }}>{g.emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, lineHeight: 1.4 }}>{g.description}</div>
                  </div>
                  <span style={{ color: '#fda4af', fontSize: 20, flexShrink: 0 }}>›</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

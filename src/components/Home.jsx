import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { giftSuggestions, gestureSuggestions } from '../data/suggestions'
import { useTheme } from '../context/ThemeContext'
import { t } from '../theme'

const todayStr = () => new Date().toISOString().split('T')[0]
const DAYS_MS = 24 * 60 * 60 * 1000

const MOODS = [
  { id: '',             icon: '😊', label: 'Good vibes'   },
  { id: 'stressed',     icon: '😰', label: 'Stressed'     },
  { id: 'tired',        icon: '😴', label: 'Low energy'   },
  { id: 'celebrating',  icon: '🥳', label: 'Celebrating'  },
  { id: 'reconnecting', icon: '💔', label: 'Reconnecting' },
]

const MOOD_CATEGORIES = {
  stressed:     { gift: ['beauty', 'snacks'], gesture: ['acts of service', 'physical touch'] },
  tired:        { gift: ['snacks', 'playlist'], gesture: ['quality time'] },
  celebrating:  { gift: ['flowers', 'beauty'], gesture: ['quality time', 'gifts'] },
  reconnecting: { gift: ['note', 'playlist'], gesture: ['quality time', 'words of affirmation'] },
}

function daysUntilAnniversary(mmdd) {
  if (!mmdd) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [month, day] = mmdd.split('-').map(Number)
  let next = new Date(today.getFullYear(), month - 1, day)
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day)
  return Math.ceil((next - today) / DAYS_MS)
}

function calcStreak(recentGestures) {
  if (!recentGestures.length) return 0
  const doneDates = new Set(recentGestures.map(g => g.date))
  let d = new Date()
  d.setHours(0, 0, 0, 0)
  if (!doneDates.has(d.toISOString().split('T')[0])) {
    d = new Date(d.getTime() - DAYS_MS)
  }
  let streak = 0
  while (doneDates.has(d.toISOString().split('T')[0])) {
    streak++
    d = new Date(d.getTime() - DAYS_MS)
  }
  return streak
}

function getMonthlyStats(recentGestures) {
  const now = new Date()
  const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const thisMonth = recentGestures.filter(g => g.date?.startsWith(monthStr))
  const totalSpent = thisMonth.reduce((sum, g) => sum + (Number(g.cost) || 0), 0)
  return { count: thisMonth.length, totalSpent }
}

function pickGift({ budget, loveLanguage, recentGestures, wishlist, memoryBank, customGifts }) {
  const personal = [...(wishlist || []), ...(memoryBank || [])].filter(item =>
    (item.estimatedCost || 0) >= budget.min && (item.estimatedCost || 0) <= budget.max
  )
  if (personal.length > 0 && Math.random() < 0.3) {
    const item = personal[Math.floor(Math.random() * personal.length)]
    return { name: `Get her: ${item.name}`, cost: item.estimatedCost || 25, category: 'custom', emoji: '⭐', isPersonalized: true, note: item.notes || '' }
  }

  const builtIn = giftSuggestions.filter(g => g.cost >= budget.min && g.cost <= budget.max)
  const custom  = (customGifts || []).filter(g => (g.cost || 0) >= budget.min && (g.cost || 0) <= budget.max)
  let pool = [...builtIn, ...custom]
  if (pool.length === 0) pool = [...giftSuggestions, ...(customGifts || [])]

  if (loveLanguage) {
    const biased = pool.filter(g => g.loveLanguages?.includes(loveLanguage))
    if (biased.length >= 3) pool = biased
  }

  const cutoff = Date.now() - 14 * DAYS_MS
  const recentNames = (recentGestures || []).filter(g => new Date(g.date).getTime() > cutoff).map(g => g.name)
  const fresh = pool.filter(g => !recentNames.includes(g.name))
  if (fresh.length > 0) pool = fresh

  return pool[Math.floor(Math.random() * pool.length)]
}

function pickGesture({ loveLanguage, recentGestures, customGestures, mood }) {
  let pool = [...gestureSuggestions, ...(customGestures || [])]

  if (mood && MOOD_CATEGORIES[mood]) {
    const moodLLs = MOOD_CATEGORIES[mood].gesture
    const biased = pool.filter(g => g.loveLanguages?.some(ll => moodLLs.includes(ll)))
    if (biased.length >= 2) pool = biased
  } else if (loveLanguage) {
    const biased = pool.filter(g => g.loveLanguages?.includes(loveLanguage))
    if (biased.length >= 3) pool = biased
  }

  const cutoff = Date.now() - 7 * DAYS_MS
  const recentNames = (recentGestures || []).filter(g => new Date(g.date).getTime() > cutoff).map(g => g.name)
  const fresh = pool.filter(g => !recentNames.includes(g.name))
  if (fresh.length > 0) pool = fresh

  return pool[Math.floor(Math.random() * pool.length)]
}

export default function Home() {
  const [mode, setMode]                   = useLocalStorage('spinMode', 'gift')
  const [budget, setBudget]               = useLocalStorage('budget', { min: 0, max: 60 })
  const [todaySpin, setTodaySpin]         = useLocalStorage('todaySpin', null)
  const [recentGestures, setRecentGestures] = useLocalStorage('recentGestures', [])
  const [wishlist]                        = useLocalStorage('wishlist', [])
  const [memoryBank]                      = useLocalStorage('memoryBank', [])
  const [loveLanguage]                    = useLocalStorage('loveLanguage', '')
  const [partnerName]                     = useLocalStorage('partnerName', '')
  const [lastBigGesture]                  = useLocalStorage('lastBigGesture', null)
  const [customGifts]                     = useLocalStorage('customGifts', [])
  const [customGestures]                  = useLocalStorage('customGestures', [])
  const [monthlyBudget]                   = useLocalStorage('monthlyBudget', 0)
  const [anniversaryDate]                 = useLocalStorage('anniversaryDate', '')
  const [mood, setMood]                   = useLocalStorage('currentMood', '')
  const [isSpinning, setIsSpinning]       = useState(false)
  const [toast, setToast]                 = useState('')
  const { darkMode }                      = useTheme()
  const th                                = t(darkMode)

  const alreadySpunToday  = todaySpin?.date === todayStr()
  const streak            = calcStreak(recentGestures)
  const monthStats        = getMonthlyStats(recentGestures)
  const herName           = partnerName || 'her'
  const monthSinceGesture = !lastBigGesture || Date.now() - new Date(lastBigGesture).getTime() > 30 * DAYS_MS
  const daysToAnniversary = daysUntilAnniversary(anniversaryDate)

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const handleSpin = () => {
    setIsSpinning(true)
    setTimeout(() => {
      const result = mode === 'gift'
        ? pickGift({ budget, loveLanguage, recentGestures, wishlist, memoryBank, customGifts })
        : pickGesture({ loveLanguage, recentGestures, customGestures, mood })
      setTodaySpin({ ...result, date: todayStr(), mode })
      setIsSpinning(false)
    }, 650)
  }

  const handleDone = () => {
    if (!todaySpin) return
    setRecentGestures(prev => [{
      name: todaySpin.name, date: todayStr(), mode: todaySpin.mode || mode,
      cost: todaySpin.cost, category: todaySpin.category, emoji: todaySpin.emoji,
    }, ...prev.slice(0, 49)])
    showToast("✅ Logged! She's lucky to have you 💕")
  }

  const wasRecentlyDone = todaySpin && recentGestures.some(g =>
    g.name === todaySpin.name && g.date !== todayStr() &&
    new Date(g.date).getTime() > Date.now() - 14 * DAYS_MS
  )

  const budgetRemaining = monthlyBudget > 0 ? monthlyBudget - monthStats.totalSpent : null

  return (
    <div className="page">
      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
        padding: '28px 20px 24px', color: '#fff',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ position: 'absolute', bottom: -30, right: 40, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ fontSize: 11, opacity: 0.8, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, lineHeight: 1.15 }}>Good Boyfriend 💝</div>
        <div style={{ fontSize: 13, opacity: 0.85, marginTop: 4 }}>
          {alreadySpunToday ? `Today's suggestion for ${herName}` : `Ready to make ${herName} feel loved?`}
        </div>
        {streak > 1 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'rgba(255,255,255,0.22)', borderRadius: 100,
            padding: '4px 12px', fontSize: 12, fontWeight: 700, marginTop: 10,
          }}>
            🔥 {streak} day streak
          </div>
        )}
      </div>

      {/* Monthly stats row */}
      {(monthStats.count > 0 || monthStats.totalSpent > 0) && (
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px 0' }}>
          <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#f43f5e' }}>{monthStats.count}</div>
            <div style={{ fontSize: 10, color: th.textFaint, marginTop: 1 }}>gestures this month</div>
          </div>
          {monthStats.totalSpent > 0 && (
            <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#f43f5e' }}>${monthStats.totalSpent}</div>
              <div style={{ fontSize: 10, color: th.textFaint, marginTop: 1 }}>spent this month</div>
            </div>
          )}
          {budgetRemaining !== null && (
            <div className="card" style={{ flex: 1, textAlign: 'center', padding: '10px 8px' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: budgetRemaining >= 0 ? '#16a34a' : '#ef4444' }}>
                {budgetRemaining >= 0 ? `$${budgetRemaining}` : `-$${Math.abs(budgetRemaining)}`}
              </div>
              <div style={{ fontSize: 10, color: th.textFaint, marginTop: 1 }}>budget left</div>
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '16px 16px 0' }}>
        {/* Monthly big gesture nudge */}
        {monthSinceGesture && (
          <div style={{ ...th.softPurple, border: `1px solid ${th.softPurple.borderColor}`, borderRadius: 14, padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>🌟</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.purpleTitle }}>Monthly Big Gesture Due!</div>
              <div style={{ fontSize: 12, color: th.purpleText, marginTop: 1 }}>Check the Profile tab to plan something meaningful.</div>
            </div>
          </div>
        )}

        {/* Anniversary countdown */}
        {daysToAnniversary !== null && daysToAnniversary <= 60 && (
          <div style={{ ...th.softPurple, border: `1px solid ${th.softPurple.borderColor}`, borderRadius: 14, padding: '12px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{daysToAnniversary === 0 ? '🎊' : '💍'}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: th.purpleTitle }}>
                {daysToAnniversary === 0 ? 'Happy Anniversary! 🎉' : `Anniversary in ${daysToAnniversary} day${daysToAnniversary === 1 ? '' : 's'}!`}
              </div>
              <div style={{ fontSize: 12, color: th.purpleText, marginTop: 1 }}>
                {daysToAnniversary <= 7 ? 'Time is running out — plan something special!' : 'Start planning something meaningful.'}
              </div>
            </div>
          </div>
        )}

        {/* Mode toggle */}
        <div className="toggle-group" style={{ marginBottom: 14 }}>
          <button className={`toggle-btn ${mode === 'gift' ? 'active' : ''}`} onClick={() => setMode('gift')}>🎁 Buy Something</button>
          <button className={`toggle-btn ${mode === 'gesture' ? 'active' : ''}`} onClick={() => setMode('gesture')}>💫 Do Something</button>
        </div>

        {/* Budget (gift mode only) */}
        {mode === 'gift' && (
          <div className="card" style={{ marginBottom: 14 }}>
            <div className="label" style={{ marginBottom: 10 }}>Budget Range</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <span style={{ fontSize: 13, color: th.textMuted, whiteSpace: 'nowrap' }}>$</span>
                <input type="number" className="input" value={budget.min} min={0}
                  onChange={e => setBudget(p => ({ ...p, min: Math.max(0, Number(e.target.value)) }))}
                  style={{ textAlign: 'center' }} placeholder="0" />
              </div>
              <span style={{ color: '#fda4af', fontWeight: 700 }}>–</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                <span style={{ fontSize: 13, color: th.textMuted, whiteSpace: 'nowrap' }}>$</span>
                <input type="number" className="input" value={budget.max} min={0}
                  onChange={e => setBudget(p => ({ ...p, max: Math.max(0, Number(e.target.value)) }))}
                  style={{ textAlign: 'center' }} placeholder="60" />
              </div>
            </div>
            {loveLanguage && <div style={{ marginTop: 8, fontSize: 12, color: '#fb7185' }}>✨ Biasing for her love language</div>}
          </div>
        )}

        {/* Mood picker (gesture mode only) */}
        {mode === 'gesture' && (
          <div style={{ marginBottom: 14 }}>
            <div className="label" style={{ marginBottom: 8 }}>Her vibe today</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {MOODS.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMood(mood === m.id ? '' : m.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '5px 11px', borderRadius: 100,
                    border: `1.5px solid ${mood === m.id ? '#f43f5e' : (darkMode ? '#3d2040' : '#fce7f3')}`,
                    background: mood === m.id ? (darkMode ? '#3d1a2c' : '#fce7f3') : 'transparent',
                    cursor: 'pointer', fontSize: 12, fontWeight: mood === m.id ? 700 : 500,
                    color: mood === m.id ? '#f43f5e' : th.textMuted,
                    transition: 'all 0.15s',
                  }}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spin result */}
        {alreadySpunToday ? (
          <div className="card bounce-in" style={{ marginBottom: 14, ...th.roseCard }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 40, lineHeight: 1 }}>{todaySpin.emoji || '🎁'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="chip">{todaySpin.category}</span>
                  {todaySpin.cost > 0 && <span className="chip chip-green">${todaySpin.cost}</span>}
                  {todaySpin.isPersonalized && <span className="chip chip-purple">⭐ Personal pick</span>}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: th.text, lineHeight: 1.25 }}>{todaySpin.name}</div>
                {todaySpin.note && <div style={{ fontSize: 12, color: th.textMuted, marginTop: 6, fontStyle: 'italic' }}>"{todaySpin.note}"</div>}
              </div>
            </div>
            {wasRecentlyDone && (
              <div style={{ marginTop: 10, padding: '8px 12px', ...th.softAmber, borderRadius: 10, fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                ⚠️ You did this recently — consider something different!
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleDone}>✓ Done it!</button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setTodaySpin(null)}>↺ Re-roll</button>
            </div>
            <div style={{ textAlign: 'center', marginTop: 10, fontSize: 12, color: th.textFaint }}>New spin available tomorrow 🌙</div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
            <div style={{ fontSize: 80, marginBottom: 10, display: 'inline-block', animation: isSpinning ? 'spinAnim 0.5s linear infinite' : 'none' }}>
              {isSpinning ? '🎲' : mode === 'gift' ? '🎁' : '✨'}
            </div>
            <p style={{ color: th.textFaint, fontSize: 14, marginBottom: 18 }}>
              {mode === 'gift' ? `What should you get ${herName} today?` : `What sweet thing can you do for ${herName}?`}
            </p>
            <button className="btn btn-primary btn-full" style={{ fontSize: 16, padding: '15px 20px', borderRadius: 16 }} onClick={handleSpin} disabled={isSpinning}>
              {isSpinning ? '✨ Picking something special...' : `Spin for Today's ${mode === 'gift' ? 'Gift' : 'Gesture'}`}
            </button>
          </div>
        )}

        {/* Recent history */}
        {recentGestures.length > 0 && (
          <div style={{ paddingBottom: 8 }}>
            <div className="label" style={{ marginBottom: 10 }}>Recent History</div>
            {recentGestures.slice(0, 5).map((g, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', ...th.plainItem, borderRadius: 12, marginBottom: 6, border: `1px solid ${th.plainItem.borderColor}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 22 }}>{g.emoji || (g.mode === 'gesture' ? '💫' : '🎁')}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: th.textSub, lineHeight: 1.3 }}>{g.name}</div>
                    <div style={{ fontSize: 11, color: th.textFaint }}>{new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                  </div>
                </div>
                {g.cost > 0 && <span className="chip chip-green">${g.cost}</span>}
              </div>
            ))}
          </div>
        )}
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}

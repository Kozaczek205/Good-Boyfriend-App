import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTheme } from '../context/ThemeContext'
import { t } from '../theme'

const MILESTONE_EMOJIS = ['💝','🥂','✈️','🏠','💍','🐾','🎂','🌟','💋','🤝','🎓','🏖️','🎉','🌈','🔑','🐶','🍕','🎬','🏃','💼']

function calcLongestStreak(recentGestures) {
  if (!recentGestures.length) return 0
  const doneDates = [...new Set(recentGestures.map(g => g.date))].sort()
  let longest = 1, current = 1
  for (let i = 1; i < doneDates.length; i++) {
    const diff = (new Date(doneDates[i]) - new Date(doneDates[i - 1])) / 86400000
    if (diff === 1) { current++; longest = Math.max(longest, current) }
    else current = 1
  }
  return longest
}

function calcCurrentStreak(recentGestures) {
  if (!recentGestures.length) return 0
  const doneDates = new Set(recentGestures.map(g => g.date))
  let d = new Date(); d.setHours(0, 0, 0, 0)
  if (!doneDates.has(d.toISOString().split('T')[0])) d = new Date(d - 86400000)
  let streak = 0
  while (doneDates.has(d.toISOString().split('T')[0])) { streak++; d = new Date(d - 86400000) }
  return streak
}

function AddMilestoneForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [emoji, setEmoji] = useState('💝')
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim() || !date) return
    onAdd({ id: Date.now(), title: title.trim(), date, emoji, note: note.trim() })
    setTitle(''); setDate(''); setEmoji('💝'); setNote('')
    setOpen(false)
  }

  if (!open) return (
    <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
      + Add Milestone
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>🌟 New Milestone</div>
      <div className="form-group">
        <label className="label">What happened?</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)}
          placeholder="e.g. Our first trip together" autoFocus required />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div className="form-group" style={{ width: 110 }}>
          <label className="label">Emoji</label>
          <select className="input" value={emoji} onChange={e => setEmoji(e.target.value)}>
            {MILESTONE_EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Note (optional)</label>
        <input className="input" value={note} onChange={e => setNote(e.target.value)} placeholder="A short description..." />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

export default function Stats() {
  const [tab, setTab] = useState('stats')
  const [milestones, setMilestones] = useLocalStorage('milestones', [])
  const [recentGestures]            = useLocalStorage('recentGestures', [])
  const [search, setSearch]         = useState('')
  const { darkMode }                = useTheme()
  const th                          = t(darkMode)

  const addMilestone    = (m)  => setMilestones(prev => [...prev, m].sort((a, b) => new Date(b.date) - new Date(a.date)))
  const deleteMilestone = (id) => setMilestones(prev => prev.filter(m => m.id !== id))

  const totalGestures  = recentGestures.length
  const totalSpent     = recentGestures.reduce((s, g) => s + (Number(g.cost) || 0), 0)
  const currentStreak  = calcCurrentStreak(recentGestures)
  const longestStreak  = calcLongestStreak(recentGestures)

  const categoryCounts = recentGestures.reduce((acc, g) => {
    const k = g.category || 'other'; acc[k] = (acc[k] || 0) + 1; return acc
  }, {})
  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

  const uniqueMonths  = new Set(recentGestures.map(g => g.date?.slice(0, 7))).size
  const avgPerMonth   = uniqueMonths > 0 ? (totalGestures / uniqueMonths).toFixed(1) : 0
  const giftCount     = recentGestures.filter(g => g.mode === 'gift').length
  const gestureCount  = recentGestures.filter(g => g.mode === 'gesture').length

  const filtered = recentGestures.filter(g =>
    !search || g.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Journey</div>
        <div className="section-subtitle">Your relationship story in numbers and moments</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="toggle-group" style={{ marginBottom: 16 }}>
          <button className={`toggle-btn ${tab === 'stats'    ? 'active' : ''}`} onClick={() => setTab('stats')}>📊 Stats</button>
          <button className={`toggle-btn ${tab === 'timeline' ? 'active' : ''}`} onClick={() => setTab('timeline')}>🌟 Timeline</button>
          <button className={`toggle-btn ${tab === 'history'  ? 'active' : ''}`} onClick={() => setTab('history')}>📋 History</button>
        </div>

        {/* ── Stats ── */}
        {tab === 'stats' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { label: 'Total gestures', value: totalGestures,    icon: '💝' },
                { label: 'Total spent',    value: `$${totalSpent}`, icon: '💰' },
                { label: 'Current streak', value: `${currentStreak}d`, icon: '🔥' },
                { label: 'Longest streak', value: `${longestStreak}d`, icon: '🏆' },
              ].map(s => (
                <div key={s.label} className="card" style={{ textAlign: 'center', padding: '14px 8px' }}>
                  <div style={{ fontSize: 22 }}>{s.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: '#f43f5e', marginTop: 4 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: th.textFaint, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {totalGestures > 0 ? (
              <div className="card" style={{ marginBottom: 14 }}>
                <div className="label" style={{ marginBottom: 12 }}>Breakdown</div>
                {[
                  topCategory && { label: 'Top category', value: `${topCategory[0]} (${topCategory[1]}×)`, cls: 'chip chip-purple' },
                  { label: 'Monthly average', value: `${avgPerMonth} gestures`, cls: 'chip' },
                  { label: 'Gifts bought',    value: `${giftCount}`,   cls: 'chip chip-green' },
                  { label: 'Gestures done',   value: `${gestureCount}`, cls: 'chip chip-blue' },
                ].filter(Boolean).map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: th.text }}>{row.label}</span>
                    <span className={row.cls}>{row.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <p>Start logging gestures on the home screen and your stats will appear here.</p>
              </div>
            )}
          </>
        )}

        {/* ── Timeline ── */}
        {tab === 'timeline' && (
          <>
            <AddMilestoneForm onAdd={addMilestone} />
            {milestones.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🌟</div>
                <p>Log your relationship milestones — first date, first trip, moving in together. Anything worth remembering.</p>
              </div>
            ) : (
              <div style={{ position: 'relative', paddingLeft: 36 }}>
                <div style={{ position: 'absolute', left: 15, top: 8, bottom: 8, width: 2, background: darkMode ? '#3d2040' : '#fecdd3', borderRadius: 2 }} />
                {milestones.map(m => (
                  <div key={m.id} style={{ position: 'relative', marginBottom: 18 }}>
                    <div style={{
                      position: 'absolute', left: -29, top: 12,
                      width: 26, height: 26, borderRadius: '50%',
                      background: '#f43f5e', border: '3px solid ' + (darkMode ? '#18111a' : '#fff'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                    }}>
                      {m.emoji}
                    </div>
                    <div className="card" style={{ padding: '12px 14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: th.textFaint, marginTop: 2 }}>
                            {new Date(m.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                          {m.note && <div style={{ fontSize: 12, color: th.textMuted, marginTop: 4, fontStyle: 'italic' }}>{m.note}</div>}
                        </div>
                        <button onClick={() => deleteMilestone(m.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fda4af', fontSize: 20, padding: '0 0 0 8px', flexShrink: 0 }}>×</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── History ── */}
        {tab === 'history' && (
          <>
            <input className="input" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search history..." style={{ marginBottom: 14 }} />
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>{search ? 'No results found.' : 'No gestures logged yet. Start on the home screen!'}</p>
              </div>
            ) : (
              <>
                <div className="label" style={{ marginBottom: 10 }}>{filtered.length} entries</div>
                {filtered.map((g, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', ...th.plainItem, borderRadius: 12, marginBottom: 6, border: `1px solid ${th.plainItem.borderColor}` }}>
                    <span style={{ fontSize: 22 }}>{g.emoji || (g.mode === 'gesture' ? '💫' : '🎁')}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: th.textSub, lineHeight: 1.3 }}>{g.name}</div>
                      <div style={{ fontSize: 11, color: th.textFaint }}>
                        {new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {g.category && ` · ${g.category}`}
                      </div>
                    </div>
                    {g.cost > 0 && <span className="chip chip-green">${g.cost}</span>}
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { dateNightIdeas } from '../data/suggestions'
import { useTheme } from '../context/ThemeContext'
import { t } from '../theme'

export default function DateNight() {
  const [filter, setFilter] = useLocalStorage('dateFilter', 'all')
  const [maxCost, setMaxCost] = useLocalStorage('dateMaxCost', 100)
  const [savedDates, setSavedDates] = useLocalStorage('savedDates', [])
  const [picked, setPicked] = useState(null)
  const [isSpinning, setIsSpinning] = useState(false)

  const pool = dateNightIdeas.filter(d => {
    if (filter !== 'all' && d.type !== filter) return false
    if (d.cost > maxCost) return false
    return true
  })

  const spin = () => {
    if (pool.length === 0) return
    setIsSpinning(true)
    setTimeout(() => {
      setPicked(pool[Math.floor(Math.random() * pool.length)])
      setIsSpinning(false)
    }, 600)
  }

  const saveIdea = () => {
    if (!picked) return
    setSavedDates(prev => [{ ...picked, savedAt: new Date().toISOString() }, ...prev.slice(0, 19)])
    setPicked(null)
  }

  const removeSaved = (i) =>
    setSavedDates(prev => prev.filter((_, j) => j !== i))

  const { darkMode } = useTheme()
  const th = t(darkMode)

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Date Night Planner</div>
        <div className="section-subtitle">Spin for your next adventure together</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Filters */}
        <div className="card" style={{ marginBottom: 14 }}>
          <div className="label" style={{ marginBottom: 10 }}>Vibe</div>
          <div className="toggle-group" style={{ marginBottom: 14 }}>
            {[
              { id: 'all',     label: '✨ All'      },
              { id: 'indoor',  label: '🏠 Indoor'   },
              { id: 'outdoor', label: '🌿 Outdoor'  },
            ].map(f => (
              <button
                key={f.id}
                className={`toggle-btn ${filter === f.id ? 'active' : ''}`}
                onClick={() => { setFilter(f.id); setPicked(null) }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="label" style={{ marginBottom: 8 }}>
            Max budget: <span style={{ color: '#f43f5e', fontWeight: 700 }}>
              {maxCost === 0 ? 'Free only' : `$${maxCost}`}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={150}
            step={5}
            value={maxCost}
            onChange={e => { setMaxCost(Number(e.target.value)); setPicked(null) }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
            <span>Free</span><span>$150+</span>
          </div>
        </div>

        {/* Result */}
        {picked ? (
          <div className="card bounce-in" style={{ marginBottom: 14, ...th.roseCard }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 44, lineHeight: 1 }}>{picked.emoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
                  <span className="chip">{picked.type}</span>
                  <span className="chip chip-green">{picked.cost === 0 ? 'Free' : `~$${picked.cost}`}</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: th.text, lineHeight: 1.25 }}>
                  {picked.name}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveIdea}>
                💾 Save idea
              </button>
              <button className="btn btn-ghost" style={{ flex: 1 }} onClick={spin}>
                ↺ Re-roll
              </button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '12px 0 18px' }}>
            <div style={{
              fontSize: 80, marginBottom: 10, display: 'inline-block',
              animation: isSpinning ? 'spinAnim 0.5s linear infinite' : 'none',
            }}>
              {isSpinning ? '🎲' : '🌙'}
            </div>
            <p style={{ color: '#9ca3af', fontSize: 14, marginBottom: 18 }}>
              {pool.length === 0
                ? 'No ideas match your filters — try loosening them!'
                : `${pool.length} idea${pool.length === 1 ? '' : 's'} available`}
            </p>
            <button
              className="btn btn-primary btn-full"
              style={{ fontSize: 16, padding: '15px 20px', borderRadius: 16 }}
              onClick={spin}
              disabled={isSpinning || pool.length === 0}
            >
              {isSpinning ? '✨ Finding the perfect date...' : 'Spin for a Date Night'}
            </button>
          </div>
        )}

        {/* Saved ideas */}
        {savedDates.length > 0 && (
          <div style={{ paddingBottom: 8 }}>
            <div className="label" style={{ marginBottom: 10 }}>Saved Ideas</div>
            {savedDates.map((d, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', ...th.plainItem,
                borderRadius: 12, marginBottom: 6, border: `1px solid ${th.plainItem.borderColor}`,
              }}>
                <span style={{ fontSize: 22 }}>{d.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: th.textSub }}>{d.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {d.cost === 0 ? 'Free' : `~$${d.cost}`} · {d.type}
                  </div>
                </div>
                <button
                  onClick={() => removeSaved(i)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fda4af', fontSize: 20, padding: '0 4px' }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

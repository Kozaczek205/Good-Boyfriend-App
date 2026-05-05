import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { occasionGiftIdeas } from '../data/suggestions'
import { useTheme } from '../context/ThemeContext'
import { t } from '../theme'

const OCCASION_TYPES = ['birthday', 'anniversary', 'valentines', 'christmas', 'other']

const occasionEmojis = {
  birthday:    '🎂',
  anniversary: '💍',
  valentines:  '💝',
  christmas:   '🎄',
  other:       '🎉',
}

function daysUntil(mmdd) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [month, day] = mmdd.split('-').map(Number)
  let next = new Date(today.getFullYear(), month - 1, day)
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day)
  return Math.ceil((next - today) / (24 * 60 * 60 * 1000))
}

function AddOccasionForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('birthday')
  const [date, setDate] = useState('')
  const [leadTime, setLeadTime] = useState(14)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !date) return
    onAdd({ id: Date.now(), name: name.trim(), type, date, leadTime: Number(leadTime) })
    setName(''); setDate(''); setType('birthday'); setLeadTime(14)
    setOpen(false)
  }

  if (!open) return (
    <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
      + Add Important Date
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>🎉 New Occasion</div>

      <div className="form-group">
        <label className="label">Label</label>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Her Birthday"
          autoFocus
          required
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            {OCCASION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Date (MM-DD)</label>
          <input
            className="input"
            type="text"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="06-15"
            pattern="\d{2}-\d{2}"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label className="label">Remind me {leadTime} days before</label>
        <input
          type="range"
          min={1}
          max={60}
          value={leadTime}
          onChange={e => setLeadTime(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
          <span>1 day</span>
          <span style={{ color: '#f43f5e', fontWeight: 700 }}>{leadTime} days</span>
          <span>60 days</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

function OccasionCard({ occ, onDelete }) {
  const { darkMode } = useTheme()
  const th = t(darkMode)
  const days = daysUntil(occ.date)
  const isUrgent = days <= occ.leadTime
  const gifts = occasionGiftIdeas[occ.type] || occasionGiftIdeas.default

  return (
    <div className="card" style={{ marginBottom: 10, borderColor: isUrgent ? '#fda4af' : '#ffe4e6' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 30 }}>{occasionEmojis[occ.type] || '🎉'}</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1f2937' }}>{occ.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
              {occ.date.replace('-', '/')} ·{' '}
              <strong style={{ color: isUrgent ? '#f43f5e' : '#374151' }}>
                {days === 0 ? 'Today!' : `${days} day${days === 1 ? '' : 's'} away`}
              </strong>
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(occ.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fda4af', fontSize: 20, padding: '0 4px' }}
        >
          ×
        </button>
      </div>

      {isUrgent && (
        <div style={{ marginTop: 12 }}>
          <div style={{
            ...th.urgentBanner, borderRadius: 10, padding: '8px 12px',
            fontSize: 12, fontWeight: 600, marginBottom: 10,
          }}>
            ⏰ Coming up soon — here are some gift ideas:
          </div>
          {gifts.map((g, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 10px', ...th.subItem,
              borderRadius: 8, marginBottom: 6, border: `1px solid ${th.subItem.borderColor}`,
            }}>
              <span style={{ fontSize: 13, color: th.textSub, fontWeight: 500 }}>{g.name}</span>
              <span className="chip chip-green">~${g.cost}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Occasions() {
  const [occasions, setOccasions] = useLocalStorage('occasions', [])

  const addOccasion = (occ) =>
    setOccasions(prev => [...prev, occ].sort((a, b) => daysUntil(a.date) - daysUntil(b.date)))

  const deleteOccasion = (id) =>
    setOccasions(prev => prev.filter(o => o.id !== id))

  const sorted = [...occasions].sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
  const urgent   = sorted.filter(o => daysUntil(o.date) <= o.leadTime)
  const upcoming = sorted.filter(o => daysUntil(o.date) > o.leadTime)

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Important Dates</div>
        <div className="section-subtitle">Never miss a moment that matters</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <AddOccasionForm onAdd={addOccasion} />

        {urgent.length > 0 && (
          <>
            <div className="label" style={{ marginBottom: 10 }}>⚡ Coming Up Soon</div>
            {urgent.map(o => <OccasionCard key={o.id} occ={o} onDelete={deleteOccasion} />)}
          </>
        )}

        {upcoming.length > 0 && (
          <>
            <div className="label" style={{ marginBottom: 10, marginTop: urgent.length ? 16 : 0 }}>📅 On the Calendar</div>
            {upcoming.map(o => <OccasionCard key={o.id} occ={o} onDelete={deleteOccasion} />)}
          </>
        )}

        {occasions.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <p>Add her birthday, anniversary, or any date worth remembering. We'll remind you with gift ideas well in advance.</p>
          </div>
        )}
      </div>
    </div>
  )
}

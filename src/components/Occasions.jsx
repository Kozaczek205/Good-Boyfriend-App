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

const HER_EVENT_CATEGORIES = ['work', 'school', 'health', 'personal', 'social']
const herEventIcons = { work: '💼', school: '📚', health: '🏥', personal: '✨', social: '🥂' }

function daysUntil(mmdd) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [month, day] = mmdd.split('-').map(Number)
  let next = new Date(today.getFullYear(), month - 1, day)
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day)
  return Math.ceil((next - today) / (24 * 60 * 60 * 1000))
}

function daysFromNow(dateStr) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target - today) / (24 * 60 * 60 * 1000))
}

function generateICS(occasions) {
  const year = new Date().getFullYear()
  const pad = n => String(n).padStart(2, '0')
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0',
    'PRODID:-//Good Boyfriend//EN', 'CALSCALE:GREGORIAN',
  ]
  occasions.forEach(occ => {
    const [m, d] = occ.date.split('-').map(Number)
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${year}${pad(m)}${pad(d)}`,
      `DTEND;VALUE=DATE:${year}${pad(m)}${pad(d + 1)}`,
      `SUMMARY:${occ.name}`,
      'RRULE:FREQ=YEARLY',
      'END:VEVENT',
    )
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
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
        <input className="input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Her Birthday" autoFocus required />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Type</label>
          <select className="input" value={type} onChange={e => setType(e.target.value)}>
            {OCCASION_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Date (MM-DD)</label>
          <input className="input" type="text" value={date} onChange={e => setDate(e.target.value)}
            placeholder="06-15" pattern="\d{2}-\d{2}" required />
        </div>
      </div>
      <div className="form-group">
        <label className="label">Remind me {leadTime} days before</label>
        <input type="range" min={1} max={60} value={leadTime}
          onChange={e => setLeadTime(Number(e.target.value))} />
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
            <div style={{ fontWeight: 700, fontSize: 15, color: th.text }}>{occ.name}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 1 }}>
              {occ.date.replace('-', '/')} ·{' '}
              <strong style={{ color: isUrgent ? '#f43f5e' : th.textMuted }}>
                {days === 0 ? 'Today!' : `${days} day${days === 1 ? '' : 's'} away`}
              </strong>
            </div>
          </div>
        </div>
        <button onClick={() => onDelete(occ.id)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fda4af', fontSize: 20, padding: '0 4px' }}>×</button>
      </div>
      {isUrgent && (
        <div style={{ marginTop: 12 }}>
          <div style={{ ...th.urgentBanner, borderRadius: 10, padding: '8px 12px', fontSize: 12, fontWeight: 600, marginBottom: 10 }}>
            ⏰ Coming up soon — here are some gift ideas:
          </div>
          {gifts.map((g, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', ...th.subItem, borderRadius: 8, marginBottom: 6, border: `1px solid ${th.subItem.borderColor}` }}>
              <span style={{ fontSize: 13, color: th.textSub, fontWeight: 500 }}>{g.name}</span>
              <span className="chip chip-green">~${g.cost}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AddHerEventForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('work')
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !date) return
    onAdd({ id: Date.now(), name: name.trim(), date, category, note: note.trim() })
    setName(''); setDate(''); setCategory('work'); setNote('')
    setOpen(false)
  }

  if (!open) return (
    <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
      + Add Her Event
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>✨ Her Event</div>
      <div className="form-group">
        <label className="label">What's happening?</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Big presentation at work" autoFocus required />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div className="form-group" style={{ width: 120 }}>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            {HER_EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label className="label">Note (optional)</label>
        <input className="input" value={note} onChange={e => setNote(e.target.value)}
          placeholder="How can you support her?" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

function AddSurpriseForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || !date) return
    onAdd({ id: Date.now(), name: name.trim(), date, note: note.trim() })
    setName(''); setDate(''); setNote('')
    setOpen(false)
  }

  if (!open) return (
    <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
      + Plan a Surprise
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>🎁 New Surprise</div>
      <div className="form-group">
        <label className="label">What's the surprise?</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. Weekend trip to the coast" autoFocus required />
      </div>
      <div className="form-group">
        <label className="label">When?</label>
        <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div className="form-group">
        <label className="label">Planning notes (only you see this)</label>
        <input className="input" value={note} onChange={e => setNote(e.target.value)}
          placeholder="What do you need to arrange?" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

export default function Occasions() {
  const [tab, setTab] = useState('occasions')
  const [occasions, setOccasions] = useLocalStorage('occasions', [])
  const [herEvents, setHerEvents] = useLocalStorage('herEvents', [])
  const [surprises, setSurprises] = useLocalStorage('surprises', [])
  const { darkMode } = useTheme()
  const th = t(darkMode)

  const addOccasion    = (o)  => setOccasions(prev => [...prev, o].sort((a, b) => daysUntil(a.date) - daysUntil(b.date)))
  const deleteOccasion = (id) => setOccasions(prev => prev.filter(o => o.id !== id))
  const addHerEvent    = (ev) => setHerEvents(prev => [...prev, ev].sort((a, b) => new Date(a.date) - new Date(b.date)))
  const deleteHerEvent = (id) => setHerEvents(prev => prev.filter(e => e.id !== id))
  const addSurprise    = (s)  => setSurprises(prev => [...prev, s].sort((a, b) => new Date(a.date) - new Date(b.date)))
  const deleteSurprise = (id) => setSurprises(prev => prev.filter(s => s.id !== id))

  const sorted       = [...occasions].sort((a, b) => daysUntil(a.date) - daysUntil(b.date))
  const urgent       = sorted.filter(o => daysUntil(o.date) <= o.leadTime)
  const upcoming     = sorted.filter(o => daysUntil(o.date) > o.leadTime)
  const futureEvents = herEvents.filter(e => daysFromNow(e.date) >= 0)
  const pastEvents   = herEvents.filter(e => daysFromNow(e.date) < 0).slice(0, 5)

  const exportICS = () => {
    const ics  = generateICS(occasions)
    const blob = new Blob([ics], { type: 'text/calendar' })
    const url  = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'occasions.ics'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Important Dates</div>
        <div className="section-subtitle">Never miss a moment that matters</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="toggle-group" style={{ marginBottom: 16 }}>
          <button className={`toggle-btn ${tab === 'occasions' ? 'active' : ''}`} onClick={() => setTab('occasions')}>🎉 Events</button>
          <button className={`toggle-btn ${tab === 'hers'      ? 'active' : ''}`} onClick={() => setTab('hers')}>💼 Hers</button>
          <button className={`toggle-btn ${tab === 'surprise'  ? 'active' : ''}`} onClick={() => setTab('surprise')}>🎁 Surprise</button>
          <button className={`toggle-btn ${tab === 'export'    ? 'active' : ''}`} onClick={() => setTab('export')}>📅 Export</button>
        </div>

        {/* Occasions tab */}
        {tab === 'occasions' && (
          <>
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
          </>
        )}

        {/* Her Events tab */}
        {tab === 'hers' && (
          <>
            <div style={{ ...th.softBlue, border: `1px solid ${th.softBlue.borderColor}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
              💼 Track events in her life so you remember to check in and be supportive at the right moment.
            </div>
            <AddHerEventForm onAdd={addHerEvent} />
            {futureEvents.length === 0 && pastEvents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💼</div>
                <p>Log her upcoming events — a big presentation, exam, or job interview. You'll know exactly when to send an encouraging message.</p>
              </div>
            ) : (
              <>
                {futureEvents.length > 0 && (
                  <>
                    <div className="label" style={{ marginBottom: 10 }}>Upcoming</div>
                    {futureEvents.map(ev => {
                      const days = daysFromNow(ev.date)
                      return (
                        <div key={ev.id} className="card" style={{ marginBottom: 10, padding: '12px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 18 }}>{herEventIcons[ev.category] || '✨'}</span>
                                <span className="chip">{ev.category}</span>
                              </div>
                              <div style={{ fontSize: 14, fontWeight: 700, color: th.text }}>{ev.name}</div>
                              <div style={{ fontSize: 12, color: th.textFaint, marginTop: 2 }}>
                                {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                {' · '}
                                <strong style={{ color: days <= 3 ? '#f43f5e' : th.textMuted }}>
                                  {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow!' : `${days} days away`}
                                </strong>
                              </div>
                              {ev.note && <div style={{ fontSize: 12, color: th.textMuted, marginTop: 4, fontStyle: 'italic' }}>{ev.note}</div>}
                            </div>
                            <button onClick={() => deleteHerEvent(ev.id)}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fda4af', fontSize: 20, padding: '0 0 0 8px', flexShrink: 0 }}>×</button>
                          </div>
                        </div>
                      )
                    })}
                  </>
                )}
                {pastEvents.length > 0 && (
                  <>
                    <div className="label" style={{ marginBottom: 10, marginTop: futureEvents.length ? 16 : 0 }}>Past</div>
                    {pastEvents.map(ev => (
                      <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', ...th.plainItem, borderRadius: 12, marginBottom: 6, border: `1px solid ${th.plainItem.borderColor}`, opacity: 0.6 }}>
                        <span style={{ fontSize: 18 }}>{herEventIcons[ev.category] || '✨'}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: th.textSub }}>{ev.name}</div>
                          <div style={{ fontSize: 11, color: th.textFaint }}>
                            {new Date(ev.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <button onClick={() => deleteHerEvent(ev.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fda4af', fontSize: 18, padding: 0 }}>×</button>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </>
        )}

        {/* Surprise countdown tab */}
        {tab === 'surprise' && (
          <>
            <div style={{ ...th.softPurple, border: `1px solid ${th.softPurple.borderColor}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: th.purpleTitle }}>
              🤫 Only you can see this. Plan your surprises and watch the countdown tick down.
            </div>
            <AddSurpriseForm onAdd={addSurprise} />
            {surprises.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🎁</div>
                <p>Plan a surprise and track the countdown — a weekend trip, a special dinner, or anything you're secretly plotting.</p>
              </div>
            ) : (
              surprises.map(s => {
                const days = daysFromNow(s.date)
                return (
                  <div key={s.id} className="card" style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: th.text }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: th.textFaint, marginTop: 2 }}>
                          {new Date(s.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        {s.note && <div style={{ fontSize: 12, color: th.textMuted, marginTop: 4, fontStyle: 'italic' }}>{s.note}</div>}
                      </div>
                      <button onClick={() => deleteSurprise(s.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fda4af', fontSize: 20, padding: '0 0 0 8px', flexShrink: 0 }}>×</button>
                    </div>
                    <div style={{ textAlign: 'center', padding: '10px 0 4px', borderTop: `1px solid ${th.plainItem.borderColor}` }}>
                      {days >= 0 ? (
                        <>
                          <div style={{ fontSize: days === 0 ? 40 : 48, fontWeight: 900, color: '#f43f5e', lineHeight: 1 }}>
                            {days === 0 ? '🎊' : days}
                          </div>
                          <div style={{ fontSize: 12, color: th.textFaint, marginTop: 4 }}>
                            {days === 0 ? "Today's the day!" : `day${days === 1 ? '' : 's'} to go`}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 12, color: th.textFaint, fontStyle: 'italic' }}>
                          Happened {Math.abs(days)} days ago
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </>
        )}

        {/* Calendar export tab */}
        {tab === 'export' && (
          <>
            <div className="card" style={{ marginBottom: 14 }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: th.text, marginBottom: 8 }}>📅 Export to Calendar</div>
              <div style={{ fontSize: 13, color: th.textFaint, marginBottom: 16, lineHeight: 1.5 }}>
                Download your occasions as an .ics file and import it into Google Calendar, Apple Calendar, or any other app.
              </div>
              {occasions.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div className="label" style={{ marginBottom: 8 }}>
                    Exporting {occasions.length} occasion{occasions.length === 1 ? '' : 's'}:
                  </div>
                  {occasions.map(o => (
                    <div key={o.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 0', borderBottom: `1px solid ${th.plainItem.borderColor}` }}>
                      <span style={{ fontSize: 16 }}>{occasionEmojis[o.type] || '🎉'}</span>
                      <span style={{ fontSize: 13, color: th.text, flex: 1 }}>{o.name}</span>
                      <span style={{ fontSize: 11, color: th.textFaint }}>{o.date.replace('-', '/')}</span>
                    </div>
                  ))}
                </div>
              )}
              {occasions.length === 0 && (
                <div style={{ fontSize: 13, color: th.textFaint, fontStyle: 'italic', marginBottom: 16 }}>
                  No occasions yet — add some in the Events tab first.
                </div>
              )}
              <button className="btn btn-primary btn-full" onClick={exportICS} disabled={occasions.length === 0}>
                ↓ Download .ics file
              </button>
            </div>
            <div style={{ ...th.softBlue, border: `1px solid ${th.softBlue.borderColor}`, borderRadius: 12, padding: '12px 14px', fontSize: 12, lineHeight: 1.7 }}>
              <strong style={{ color: th.softBlue.color }}>How to import:</strong>
              <div style={{ color: th.textMuted, marginTop: 4 }}>
                <div>• <strong>Google Calendar:</strong> Settings → Import &amp; Export → Import</div>
                <div>• <strong>iPhone / Mac:</strong> Open file → tap "Add to Calendar"</div>
                <div>• <strong>Outlook:</strong> File → Open &amp; Export → Import/Export</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

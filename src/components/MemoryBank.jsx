import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useTheme } from '../context/ThemeContext'
import { t } from '../theme'

const CATEGORIES = ['likes', 'wants', 'interested in', 'favorite', 'dislikes']

const categoryColors = {
  'likes': 'chip', 'wants': 'chip chip-green',
  'interested in': 'chip chip-blue', 'favorite': 'chip chip-purple', 'dislikes': 'chip chip-amber',
}

const GIFT_EMOJIS    = ['🎁','🌸','🍫','💌','📚','🕯️','🎵','🛁','💅','☕','🌹','🎀','🍓','🥐','🌿']
const GESTURE_EMOJIS = ['💫','🍳','🎬','🎙️','🤗','🧺','🧹','💆','🥞','📺','🚗','📩','🎞️','🎵','👑']
const PLACE_CATEGORIES = ['restaurant', 'café', 'bar', 'activity', 'park', 'museum', 'shop', 'other']

function AddItemForm({ onAdd, type }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState(type === 'wishlist' ? 'wants' : 'likes')
  const [cost, setCost] = useState('')
  const [notes, setNotes] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ name: name.trim(), category, estimatedCost: cost ? Number(cost) : 0, notes: notes.trim(), id: Date.now() })
    setName(''); setCost(''); setNotes('')
    setOpen(false)
  }

  if (!open) return (
    <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
      + Add {type === 'wishlist' ? 'Wishlist Item' : 'Memory'}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>
        {type === 'wishlist' ? '🎁 New Wishlist Item' : '✨ New Memory'}
      </div>
      <div className="form-group">
        <label className="label">Name / Description</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)}
          placeholder={type === 'wishlist' ? 'e.g. That blue scarf from Zara' : 'e.g. Loves lavender scent'}
          autoFocus required />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Category</label>
          <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        {type === 'wishlist' && (
          <div className="form-group" style={{ width: 100 }}>
            <label className="label">Est. Cost ($)</label>
            <input className="input" type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="~$" min={0} />
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="label">Notes (optional)</label>
        <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any extra details..." />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

function AddCustomIdeaForm({ onAdd, kind }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [cost, setCost] = useState('')
  const [emoji, setEmoji] = useState(kind === 'gift' ? '🎁' : '💫')
  const emojis = kind === 'gift' ? GIFT_EMOJIS : GESTURE_EMOJIS

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ id: Date.now(), name: name.trim(), emoji, cost: cost ? Number(cost) : 0, category: 'custom', loveLanguages: [] })
    setName(''); setCost(''); setEmoji(emojis[0])
    setOpen(false)
  }

  if (!open) return (
    <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
      + Add Custom {kind === 'gift' ? 'Gift Idea' : 'Gesture'}
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>
        {kind === 'gift' ? '🎁 New Gift Idea' : '💫 New Gesture'}
      </div>
      <div className="form-group">
        <label className="label">Description</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)}
          placeholder={kind === 'gift' ? 'e.g. Pottery class for two' : 'e.g. Write her a poem'}
          autoFocus required />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label className="label">Pick an emoji</label>
          <select className="input" value={emoji} onChange={e => setEmoji(e.target.value)}>
            {emojis.map(em => <option key={em} value={em}>{em}</option>)}
          </select>
        </div>
        {kind === 'gift' && (
          <div className="form-group" style={{ width: 100 }}>
            <label className="label">Cost ($)</label>
            <input className="input" type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="~$" min={0} />
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

function AddPlaceForm({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('restaurant')
  const [notes, setNotes] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({ id: Date.now(), name: name.trim(), category, notes: notes.trim() })
    setName(''); setNotes('')
    setOpen(false)
  }

  if (!open) return (
    <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
      + Add Place
    </button>
  )

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>📍 New Place</div>
      <div className="form-group">
        <label className="label">Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)}
          placeholder="e.g. That little Italian place on 5th" autoFocus required />
      </div>
      <div className="form-group">
        <label className="label">Category</label>
        <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
          {PLACE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="label">Notes (optional)</label>
        <input className="input" value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="e.g. She mentioned it after seeing it on Instagram" />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

function ItemCard({ item, onDelete }) {
  const { darkMode } = useTheme()
  const th = t(darkMode)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 14px', ...th.plainItem, borderRadius: 12, border: `1px solid ${th.plainItem.borderColor}`, marginBottom: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <span className={categoryColors[item.category] || 'chip'}>{item.category}</span>
          {item.estimatedCost > 0 && <span className="chip chip-green">~${item.estimatedCost}</span>}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: th.text, lineHeight: 1.3 }}>{item.name}</div>
        {item.notes && <div style={{ fontSize: 12, color: th.textMuted, marginTop: 3, fontStyle: 'italic' }}>{item.notes}</div>}
      </div>
      <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#fda4af', padding: '0 0 0 10px', flexShrink: 0 }}>×</button>
    </div>
  )
}

function CustomIdeaCard({ item, onDelete }) {
  const { darkMode } = useTheme()
  const th = t(darkMode)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', ...th.plainItem, borderRadius: 12, border: `1px solid ${th.plainItem.borderColor}`, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 24 }}>{item.emoji}</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: th.text, lineHeight: 1.3 }}>{item.name}</div>
          {item.cost > 0 && <span className="chip chip-green" style={{ marginTop: 3, display: 'inline-flex' }}>~${item.cost}</span>}
        </div>
      </div>
      <button onClick={() => onDelete(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#fda4af', padding: '0 0 0 10px', flexShrink: 0 }}>×</button>
    </div>
  )
}

export default function MemoryBank() {
  const [tab, setTab] = useState('memory')
  const [memoryBank, setMemoryBank]   = useLocalStorage('memoryBank', [])
  const [wishlist, setWishlist]       = useLocalStorage('wishlist', [])
  const [customGifts, setCustomGifts]         = useLocalStorage('customGifts', [])
  const [customGestures, setCustomGestures]   = useLocalStorage('customGestures', [])
  const [places, setPlaces]                   = useLocalStorage('places', [])
  const [customKind, setCustomKind]   = useState('gift')
  const { darkMode } = useTheme()
  const th = t(darkMode)

  const addMemory   = (item) => setMemoryBank(prev => [item, ...prev])
  const addWishlist = (item) => setWishlist(prev => [item, ...prev])
  const delMemory   = (id) => setMemoryBank(prev => prev.filter(i => i.id !== id))
  const delWishlist = (id) => setWishlist(prev => prev.filter(i => i.id !== id))
  const addCustomGift    = (item) => setCustomGifts(prev => [item, ...prev])
  const addCustomGesture = (item) => setCustomGestures(prev => [item, ...prev])
  const delCustomGift    = (id) => setCustomGifts(prev => prev.filter(i => i.id !== id))
  const delCustomGesture = (id) => setCustomGestures(prev => prev.filter(i => i.id !== id))
  const addPlace         = (item) => setPlaces(prev => [item, ...prev])
  const delPlace         = (id) => setPlaces(prev => prev.filter(i => i.id !== id))

  const items    = tab === 'memory' ? memoryBank : wishlist
  const onAdd    = tab === 'memory' ? addMemory  : addWishlist
  const onDelete = tab === 'memory' ? delMemory  : delWishlist

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Memory Bank</div>
        <div className="section-subtitle">Log what she loves so your gifts feel personal</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="toggle-group" style={{ marginBottom: 16 }}>
          <button className={`toggle-btn ${tab === 'memory'   ? 'active' : ''}`} onClick={() => setTab('memory')}>✨ Memories</button>
          <button className={`toggle-btn ${tab === 'wishlist' ? 'active' : ''}`} onClick={() => setTab('wishlist')}>🎁 Wishlist</button>
          <button className={`toggle-btn ${tab === 'places'   ? 'active' : ''}`} onClick={() => setTab('places')}>📍 Places</button>
          <button className={`toggle-btn ${tab === 'custom'   ? 'active' : ''}`} onClick={() => setTab('custom')}>🎲 My Ideas</button>
        </div>

        {tab === 'places' ? (
          <>
            <div style={{ ...th.softAmber, border: `1px solid ${th.softAmber.borderColor}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
              📍 Restaurants, cafés, and places she wants to visit — so you always have a date idea ready.
            </div>
            <AddPlaceForm onAdd={addPlace} />
            {places.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📍</div>
                <p>Log restaurants she mentions, places she wants to explore, or activities she'd enjoy. Perfect for planning your next date.</p>
              </div>
            ) : (
              <>
                <div className="label" style={{ marginBottom: 8 }}>{places.length} place{places.length === 1 ? '' : 's'}</div>
                {places.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 14px', ...th.plainItem, borderRadius: 12, border: `1px solid ${th.plainItem.borderColor}`, marginBottom: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span className="chip chip-amber">{item.category}</span>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: th.text, lineHeight: 1.3 }}>{item.name}</div>
                      {item.notes && <div style={{ fontSize: 12, color: th.textMuted, marginTop: 3, fontStyle: 'italic' }}>{item.notes}</div>}
                    </div>
                    <button onClick={() => delPlace(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: '#fda4af', padding: '0 0 0 10px', flexShrink: 0 }}>×</button>
                  </div>
                ))}
              </>
            )}
          </>
        ) : tab === 'custom' ? (
          <>
            <div style={{ ...th.softPurple, border: `1px solid ${th.softPurple.borderColor}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12, color: th.purpleTitle }}>
              🎲 Custom ideas go directly into the daily randomizer pool.
            </div>
            <div className="toggle-group" style={{ marginBottom: 14 }}>
              <button className={`toggle-btn ${customKind === 'gift'    ? 'active' : ''}`} onClick={() => setCustomKind('gift')}>🎁 Gift Ideas</button>
              <button className={`toggle-btn ${customKind === 'gesture' ? 'active' : ''}`} onClick={() => setCustomKind('gesture')}>💫 Gestures</button>
            </div>
            <AddCustomIdeaForm onAdd={customKind === 'gift' ? addCustomGift : addCustomGesture} kind={customKind} />
            {(customKind === 'gift' ? customGifts : customGestures).length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{customKind === 'gift' ? '🎁' : '💫'}</div>
                <p>Add your own {customKind === 'gift' ? 'gift ideas' : 'gesture ideas'} — they'll be mixed into the daily randomizer alongside the built-in suggestions.</p>
              </div>
            ) : (
              <>
                <div className="label" style={{ marginBottom: 10 }}>{(customKind === 'gift' ? customGifts : customGestures).length} custom {customKind === 'gift' ? 'gifts' : 'gestures'}</div>
                {(customKind === 'gift' ? customGifts : customGestures).map(item => (
                  <CustomIdeaCard key={item.id} item={item} onDelete={customKind === 'gift' ? delCustomGift : delCustomGesture} />
                ))}
              </>
            )}
          </>
        ) : (
          <>
            {tab === 'wishlist' ? (
              <div style={{ ...th.softGreen, border: `1px solid ${th.softGreen.borderColor}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
                🤫 Wishlist items are silently used by the daily randomizer. She'll never know!
              </div>
            ) : (
              <div style={{ ...th.softBlue, border: `1px solid ${th.softBlue.borderColor}`, borderRadius: 12, padding: '10px 14px', marginBottom: 14, fontSize: 12 }}>
                💡 Log things she mentions liking — these help personalize your daily suggestions.
              </div>
            )}
            <AddItemForm onAdd={onAdd} type={tab} />
            {items.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">{tab === 'memory' ? '✨' : '🎁'}</div>
                <p>{tab === 'memory'
                  ? 'Start logging things she mentions — a scent she loves, a book she mentioned, a restaurant she wants to try.'
                  : "Secretly note things she hints at wanting. They'll quietly feed into your daily gift suggestions."}</p>
              </div>
            ) : (
              <>
                <div className="label" style={{ marginBottom: 8 }}>{items.length} {tab === 'memory' ? 'memories' : 'items'}</div>
                {items.map(item => <ItemCard key={item.id} item={item} onDelete={onDelete} />)}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

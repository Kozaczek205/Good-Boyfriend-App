import { useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

const CATEGORIES = ['likes', 'wants', 'interested in', 'favorite', 'dislikes']

const categoryColors = {
  'likes': 'chip',
  'wants': 'chip chip-green',
  'interested in': 'chip chip-blue',
  'favorite': 'chip chip-purple',
  'dislikes': 'chip chip-amber',
}

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

  if (!open) {
    return (
      <button className="btn btn-ghost btn-full" style={{ marginBottom: 14 }} onClick={() => setOpen(true)}>
        + Add {type === 'wishlist' ? 'Wishlist Item' : 'Memory'}
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#f43f5e', marginBottom: 12 }}>
        {type === 'wishlist' ? '🎁 New Wishlist Item' : '✨ New Memory'}
      </div>

      <div className="form-group">
        <label className="label">Name / Description</label>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder={type === 'wishlist' ? 'e.g. That blue scarf from Zara' : 'e.g. Loves lavender scent'}
          autoFocus
          required
        />
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
            <input
              className="input"
              type="number"
              value={cost}
              onChange={e => setCost(e.target.value)}
              placeholder="~$"
              min={0}
            />
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="label">Notes (optional)</label>
        <input
          className="input"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any extra details..."
        />
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
        <button type="button" className="btn btn-ghost" style={{ flex: 1 }} onClick={() => setOpen(false)}>Cancel</button>
      </div>
    </form>
  )
}

function ItemCard({ item, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      padding: '12px 14px', background: '#fff', borderRadius: 12,
      border: '1px solid #ffe4e6', marginBottom: 8,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
          <span className={categoryColors[item.category] || 'chip'}>{item.category}</span>
          {item.estimatedCost > 0 && <span className="chip chip-green">~${item.estimatedCost}</span>}
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#1f2937', lineHeight: 1.3 }}>{item.name}</div>
        {item.notes && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontStyle: 'italic' }}>
            {item.notes}
          </div>
        )}
      </div>
      <button
        onClick={() => onDelete(item.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          fontSize: 16, color: '#fda4af', padding: '0 0 0 10px', flexShrink: 0,
        }}
        title="Remove"
      >
        ×
      </button>
    </div>
  )
}

export default function MemoryBank() {
  const [tab, setTab] = useState('memory')
  const [memoryBank, setMemoryBank] = useLocalStorage('memoryBank', [])
  const [wishlist, setWishlist] = useLocalStorage('wishlist', [])

  const addMemory = (item) => setMemoryBank(prev => [item, ...prev])
  const addWishlist = (item) => setWishlist(prev => [item, ...prev])
  const deleteMemory = (id) => setMemoryBank(prev => prev.filter(i => i.id !== id))
  const deleteWishlist = (id) => setWishlist(prev => prev.filter(i => i.id !== id))

  const items = tab === 'memory' ? memoryBank : wishlist
  const onAdd = tab === 'memory' ? addMemory : addWishlist
  const onDelete = tab === 'memory' ? deleteMemory : deleteWishlist

  return (
    <div className="page">
      <div className="section-header">
        <div className="section-title">Memory Bank</div>
        <div className="section-subtitle">Log what she loves so your gifts feel personal</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Tab toggle */}
        <div className="toggle-group" style={{ marginBottom: 16 }}>
          <button
            className={`toggle-btn ${tab === 'memory' ? 'active' : ''}`}
            onClick={() => setTab('memory')}
          >
            ✨ Memories
          </button>
          <button
            className={`toggle-btn ${tab === 'wishlist' ? 'active' : ''}`}
            onClick={() => setTab('wishlist')}
          >
            🎁 Secret Wishlist
          </button>
        </div>

        {/* Context banner */}
        {tab === 'wishlist' ? (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: 12, padding: '10px 14px', marginBottom: 14,
            fontSize: 12, color: '#16a34a',
          }}>
            🤫 Wishlist items are silently used by the daily randomizer. She'll never know!
          </div>
        ) : (
          <div style={{
            background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 12, padding: '10px 14px', marginBottom: 14,
            fontSize: 12, color: '#2563eb',
          }}>
            💡 Log things she mentions liking — these help personalize your daily suggestions.
          </div>
        )}

        <AddItemForm onAdd={onAdd} type={tab} />

        {items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">{tab === 'memory' ? '✨' : '🎁'}</div>
            <p>
              {tab === 'memory'
                ? 'Start logging things she mentions — a scent she loves, a book she mentioned, a restaurant she wants to try.'
                : 'Secretly note things she hints at wanting. They\'ll quietly feed into your daily gift suggestions.'}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div className="label">{items.length} {tab === 'memory' ? 'memories' : 'items'}</div>
            </div>
            {items.map(item => (
              <ItemCard key={item.id} item={item} onDelete={onDelete} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

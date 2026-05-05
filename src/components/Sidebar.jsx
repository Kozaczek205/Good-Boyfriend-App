const tabs = [
  { id: 'home',      emoji: '💝', label: 'Today'   },
  { id: 'memory',    emoji: '✨', label: 'Memory'  },
  { id: 'occasions', emoji: '🎉', label: 'Events'  },
  { id: 'datenight', emoji: '🌙', label: 'Dates'   },
  { id: 'profile',   emoji: '💕', label: 'Profile' },
]

export default function Sidebar({ current, onChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span style={{ fontSize: 32 }}>💝</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#1f2937', lineHeight: 1.2 }}>Good Boyfriend</div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Your daily reminder</div>
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`sidebar-item ${current === tab.id ? 'active' : ''}`}
            onClick={() => onChange(tab.id)}
          >
            <span style={{ fontSize: 20 }}>{tab.emoji}</span>
            <span className="sidebar-label">{tab.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  )
}
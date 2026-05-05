const tabs = [
  { id: 'home',      emoji: '💝', label: 'Today'    },
  { id: 'memory',    emoji: '✨', label: 'Memory'   },
  { id: 'occasions', emoji: '🎉', label: 'Events'   },
  { id: 'datenight', emoji: '🌙', label: 'Dates'    },
  { id: 'profile',   emoji: '💕', label: 'Profile'  },
]

export default function BottomNav({ current, onChange }) {
  return (
    <nav className="bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 430,
      background: 'rgba(255,255,255,0.96)',
      backdropFilter: 'blur(12px)',
      borderTop: '1px solid #ffe4e6',
      display: 'flex',
      zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
            padding: '10px 0 8px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.18s',
          }}
        >
          <span style={{
            fontSize: 22,
            lineHeight: 1,
            filter: current === tab.id ? 'none' : 'grayscale(0.6) opacity(0.55)',
            transition: 'filter 0.18s',
            transform: current === tab.id ? 'scale(1.12)' : 'scale(1)',
            display: 'inline-block',
          }}>
            {tab.emoji}
          </span>
          <span style={{
            fontSize: 10,
            fontWeight: current === tab.id ? 700 : 500,
            color: current === tab.id ? '#f43f5e' : '#9ca3af',
            letterSpacing: '0.02em',
            transition: 'color 0.18s',
          }}>
            {tab.label}
          </span>
          {current === tab.id && (
            <span style={{
              position: 'absolute',
              bottom: 0,
              width: 20,
              height: 3,
              background: '#f43f5e',
              borderRadius: '3px 3px 0 0',
            }} />
          )}
        </button>
      ))}
    </nav>
  )
}

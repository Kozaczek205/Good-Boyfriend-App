// Returns style objects for light/dark mode inline styles
export const t = (isDark) => ({
  card:        isDark ? { background: '#23152a', borderColor: '#3d2040' }                                          : { background: '#fff',  borderColor: '#ffe4e6' },
  roseCard:    isDark ? { background: '#2a1020', borderColor: '#5d3050' }                                          : { background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)', borderColor: '#fda4af' },
  softPurple:  isDark ? { background: '#1e1430', borderColor: '#3d2860' }                                          : { background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', borderColor: '#e9d5ff' },
  softGreen:   isDark ? { background: '#0f2018', borderColor: '#1a4028', color: '#4ade80' }                        : { background: '#f0fdf4', borderColor: '#bbf7d0', color: '#16a34a' },
  softAmber:   isDark ? { background: '#201500', borderColor: '#3d2800', color: '#fbbf24' }                        : { background: '#fffbeb', borderColor: '#fde68a', color: '#d97706' },
  softBlue:    isDark ? { background: '#0f1828', borderColor: '#1a3050', color: '#60a5fa' }                        : { background: '#eff6ff', borderColor: '#bfdbfe', color: '#2563eb' },
  urgentBanner:isDark ? { background: '#2d1010', color: '#fb7185' }                                                : { background: '#fff1f2', color: '#f43f5e' },
  plainItem:   isDark ? { background: '#23152a', borderColor: '#3d2040' }                                          : { background: '#fff',  borderColor: '#ffe4e6' },
  subItem:     isDark ? { background: '#1a0f20', borderColor: '#2d1a35' }                                          : { background: '#fafafa', borderColor: '#ffe4e6' },
  gestureItem: isDark ? { background: '#23152a', borderColor: '#3d2040' }                                          : { background: '#fff',  borderColor: '#ffe4e6' },
  text:        isDark ? '#f5f0f7' : '#1f2937',
  textSub:     isDark ? '#c8b8d8' : '#374151',
  textMuted:   isDark ? '#9980a8' : '#6b7280',
  textFaint:   isDark ? '#6b5a7a' : '#9ca3af',
  purpleTitle: isDark ? '#c084fc' : '#7c3aed',
  purpleText:  isDark ? '#a855f7' : '#9333ea',
})

import { useEffect } from 'react'

function daysUntilDate(mmdd) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [month, day] = mmdd.split('-').map(Number)
  let next = new Date(today.getFullYear(), month - 1, day)
  if (next < today) next = new Date(today.getFullYear() + 1, month - 1, day)
  return Math.ceil((next - today) / (24 * 60 * 60 * 1000))
}

export function useNotifications({ enabled, todaySpin, occasions, partnerName }) {
  useEffect(() => {
    if (!enabled || !('Notification' in window) || Notification.permission !== 'granted') return

    const today = new Date().toISOString().split('T')[0]
    if (localStorage.getItem('notifiedDate') === today) return

    const herName = partnerName || 'her'

    setTimeout(() => {
      if (!todaySpin || todaySpin.date !== today) {
        new Notification('Good Boyfriend 💝', {
          body: `Ready to make ${herName} feel loved today?`,
          icon: '/icon.svg',
        })
      }

      occasions.forEach(occ => {
        const days = daysUntilDate(occ.date)
        if (days <= occ.leadTime) {
          new Notification(`📅 ${occ.name} in ${days} day${days === 1 ? '' : 's'}!`, {
            body: 'Time to start planning. Check the Events tab.',
            icon: '/icon.svg',
          })
        }
      })

      localStorage.setItem('notifiedDate', today)
    }, 1500)
  }, [enabled])
}

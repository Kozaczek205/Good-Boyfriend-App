import { useState } from 'react'
import Home from './components/Home'
import MemoryBank from './components/MemoryBank'
import Occasions from './components/Occasions'
import DateNight from './components/DateNight'
import Profile from './components/Profile'
import Onboarding from './components/Onboarding'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import { ThemeProvider } from './context/ThemeContext'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useNotifications } from './hooks/useNotifications'

function AppInner() {
  const [tab, setTab] = useState('home')
  const [onboardingDone, setOnboardingDone] = useLocalStorage('onboardingDone', false)
  const [notificationsEnabled] = useLocalStorage('notificationsEnabled', false)
  const [todaySpin] = useLocalStorage('todaySpin', null)
  const [occasions] = useLocalStorage('occasions', [])
  const [partnerName] = useLocalStorage('partnerName', '')

  useNotifications({ enabled: notificationsEnabled, todaySpin, occasions, partnerName })

  if (!onboardingDone) {
    return <Onboarding onDone={() => setOnboardingDone(true)} />
  }

  const screens = {
    home:      <Home />,
    memory:    <MemoryBank />,
    occasions: <Occasions />,
    datenight: <DateNight />,
    profile:   <Profile />,
  }

  return (
    <div className="app-layout">
      <Sidebar current={tab} onChange={setTab} />
      <main className="main-content">
        {screens[tab]}
      </main>
      <BottomNav current={tab} onChange={setTab} />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}

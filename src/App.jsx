import { useState } from 'react'
import Home from './components/Home'
import MemoryBank from './components/MemoryBank'
import Occasions from './components/Occasions'
import DateNight from './components/DateNight'
import Profile from './components/Profile'
import BottomNav from './components/BottomNav'
import Sidebar from './components/Sidebar'
import { ThemeProvider } from './context/ThemeContext'

export default function App() {
  const [tab, setTab] = useState('home')

  const screens = {
    home:      <Home />,
    memory:    <MemoryBank />,
    occasions: <Occasions />,
    datenight: <DateNight />,
    profile:   <Profile />,
  }

  return (
    <ThemeProvider>
      <div className="app-layout">
        <Sidebar current={tab} onChange={setTab} />
        <main className="main-content">
          {screens[tab]}
        </main>
        <BottomNav current={tab} onChange={setTab} />
      </div>
    </ThemeProvider>
  )
}

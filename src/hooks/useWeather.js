import { useState, useEffect } from 'react'

function describeCode(code) {
  if (code === 0)              return { label: 'Clear',        icon: '☀️',  outdoor: true  }
  if (code <= 3)               return { label: 'Partly cloudy', icon: '⛅',  outdoor: true  }
  if (code <= 48)              return { label: 'Foggy',         icon: '🌫️', outdoor: false }
  if (code <= 67)              return { label: 'Rainy',         icon: '🌧️', outdoor: false }
  if (code <= 77)              return { label: 'Snowy',         icon: '❄️',  outdoor: false }
  if (code <= 82)              return { label: 'Showers',       icon: '🌦️', outdoor: false }
  if (code <= 86)              return { label: 'Snow showers',  icon: '🌨️', outdoor: false }
  return                              { label: 'Stormy',        icon: '⛈️',  outdoor: false }
}

export function useWeather() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const cached = localStorage.getItem('weatherCache')
      if (cached) {
        const { data, ts } = JSON.parse(cached)
        if (Date.now() - ts < 30 * 60 * 1000) { setWeather(data); return }
      }
    } catch {}

    if (!navigator.geolocation) return
    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=weather_code,temperature_2m&forecast_days=1`
          const res  = await fetch(url)
          const json = await res.json()
          const code = json.current.weather_code
          const temp = Math.round(json.current.temperature_2m)
          const data = { ...describeCode(code), temp, code }
          setWeather(data)
          localStorage.setItem('weatherCache', JSON.stringify({ data, ts: Date.now() }))
        } catch {}
        setLoading(false)
      },
      () => setLoading(false)
    )
  }, [])

  return { weather, loading }
}

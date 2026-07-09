import { useEffect } from 'react'
import './App.css'

const resize = () => {
  const cWidth = document.body.clientWidth
  let width = (cWidth / 750) * 100
  if (width > 100) {
    width = 100
  } else if (width < 32) {
    width = 32
  }
  document.querySelector('html').style.fontSize = width + 'px'
}

function App() {
  useEffect(() => {
    resize()
    document.addEventListener('resize', resize)

    return () => {
      document.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div>
      <div className="board"></div>
    </div>
  )
}

export default App

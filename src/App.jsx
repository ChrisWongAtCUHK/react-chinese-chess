import { useState, useEffect } from 'react'
import Game from './game'
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
  Game.initGame()
  const [nextCamp, setNextCamp] = useState(1)
  const [winCamp, setWinCamp] = useState(0)
  const [over, setOver] = useState(false)
  const [blankMap] = useState(Game.getBlankMap())
  const [blackPieces] = useState(Game.getBlackPieces())
  const [redPieces] = useState(Game.getRedPieces())
  const [highLightPoint, setHighLightPoint] = useState([])
  const [needMovePiece] = useState(null)

  const begin = () => {}

  const removeHighLightItem = (piece) => {
    const strArr = []
    for (const point of highLightPoint) {
      strArr.push(point.toString())
    }
    const index = strArr.indexOf(piece.position.toString())
    if (index > -1) {
      setHighLightPoint((prev) => {
        const next = [...prev]
        next.splice(index, 1)
        return next
      })
    }
  }

  const handleHighLight = (piece) => {
    const positionStr = piece.position.toString()
    for (const point of highLightPoint) {
      if (point.toString() === positionStr) {
        if (needMovePiece && piece.camp === needMovePiece.camp) {
          removeHighLightItem(piece)
          return ''
        } else {
          return 'active'
        }
      }
    }
    return ''
  }

  const handlePosition = (position) => {
    const pieceSize = 0.68
    let x = position[0]
    let y = position[1]
    x = (x - 1) * pieceSize - pieceSize / 2
    y = (y - 1) * pieceSize - pieceSize / 2
    return { left: `${x}rem`, bottom: `${y}rem` }
  }

  useEffect(() => {
    resize()
    document.addEventListener('resize', resize)

    return () => {
      document.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div>
      <div className="board">
        <div className="board-wrap">
          {blankMap.map((item, index) => {
            return (
              <div
                className={`piece blank-item ${handleHighLight(item)}`}
                style={handlePosition(item.position)}
                key={`black${index}`}
              ></div>
            )
          })}
          {blackPieces.map((item) => {
            return (
              <div
                className={`piece black-${item.name} ${handleHighLight(item)}`}
                style={handlePosition(item.position)}
                key={`black${item.name}`}
              ></div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App

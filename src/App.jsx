import { useState, useEffect } from 'react'
import Game from './game'
import Rule from './game/rule'
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
  const [nextCamp, setNextCamp] = useState(1)
  const [winCamp, setWinCamp] = useState(0)
  const [over, setOver] = useState(false)
  const [blankMap] = useState(() => {
    Game.initGame()
    return Game.getBlankMap()
  })
  const [blackPieces, setBlackPieces] = useState(() => Game.getBlackPieces())
  const [redPieces, setRedPieces] = useState(() => Game.getRedPieces())
  const [highLightPoint, setHighLightPoint] = useState([])
  const [movedPointList, setMovedPointList] = useState([])
  const [needMovePiece, setNeedMovePiece] = useState(null)

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

  const gameOver = (camp) => {
    setWinCamp(camp)
    setOver(true)
  }

  const getPieceIndexByName = (pieces, piece) => {
    for (let index in pieces) {
      if (pieces[index].name === piece.name) {
        return index
      }
    }
  }

  const removePiece = (piece) => {
    if (piece.name === 'k') {
      gameOver(-piece.camp)
    }
    if (piece.camp === 1) {
      const index = getPieceIndexByName(redPieces, piece)
      setRedPieces((prev) => {
        prev.splice(index, 1)
        return prev
      })
    } else {
      const index = getPieceIndexByName(blackPieces, piece)
      setBlackPieces((prev) => {
        prev.splice(index, 1)
        return prev
      })
    }
  }

  const moveToAnim = (currentNeedMovePiece, targetPiece) => {
    if (Rule.canMove(currentNeedMovePiece, targetPiece, highLightPoint)) {
      let removedPiece = null // 被删除的棋子，悔棋时需要还原
      const beforeMovePiece = currentNeedMovePiece.copy() // 移动前的棋子
      if (targetPiece.camp && targetPiece.camp !== currentNeedMovePiece.camp) {
        removedPiece = targetPiece
        removePiece(targetPiece)
      }
      currentNeedMovePiece.moveTo(targetPiece.position)
      const movedPiece = currentNeedMovePiece.copy() // 移动后的棋子
      // update the pieces in App
      // update the pieces in Game
      if (currentNeedMovePiece.camp === 1) {
        setRedPieces((prev) => {
          const next = prev.filter(
            (piece) => piece.name !== currentNeedMovePiece.name,
          )
          const pieces = [...next, currentNeedMovePiece]
          Game.setRedPieces(pieces)
          return pieces
        })
      } else if (currentNeedMovePiece.camp === -1) {
        setBlackPieces((prev) => {
          const next = prev.filter(
            (piece) => piece.name !== currentNeedMovePiece.name,
          )
          const pieces = [...next, currentNeedMovePiece]
          Game.setBlackPieces(pieces)
          return pieces
        })
      }

      setNextCamp((prev) => -prev)
      // 清除状态
      setNeedMovePiece(null)
      setHighLightPoint([])
      setMovedPointList((prev) => [
        ...prev,
        {
          beforeMovePiece,
          movedPiece,
          removedPiece,
        },
      ])
    }
  }

  const clickPiece = (piece) => {
    if (needMovePiece && needMovePiece.camp !== piece.camp) {
      moveToAnim(needMovePiece, piece)
      setNeedMovePiece(null)
      setHighLightPoint([])
    } else if (piece.camp && piece.camp === nextCamp) {
      setNeedMovePiece(piece)
      setHighLightPoint(Rule.getMoveLine(piece))
    }
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
                onClick={() => clickPiece(item)}
              ></div>
            )
          })}
          {blackPieces.map((item) => {
            return (
              <div
                className={`piece black-${item.name} ${handleHighLight(item)}`}
                style={handlePosition(item.position)}
                key={`black${item.name}`}
                onClick={() => clickPiece(item)}
              ></div>
            )
          })}
          {redPieces.map((item) => {
            return (
              <div
                className={`piece red-${item.name} ${handleHighLight(item)}`}
                style={handlePosition(item.position)}
                key={`red${item.name}`}
                onClick={() => clickPiece(item)}
              ></div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App

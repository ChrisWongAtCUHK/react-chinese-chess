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

  const removePiece = (piece, pieces) => {
    if (piece.name === 'k') {
      gameOver(-piece.camp)
      return
    }
    const index = getPieceIndexByName(pieces, piece)
    pieces.splice(index, 1)
  }

  const moveToAnim = (currentNeedMovePiece, targetPiece) => {
    if (Rule.canMove(currentNeedMovePiece, targetPiece, highLightPoint)) {
      let removedPiece = null // 被删除的棋子，悔棋时需要还原
      const beforeMovePiece = currentNeedMovePiece.copy() // 移动前的棋子
      if (targetPiece.camp && targetPiece.camp !== currentNeedMovePiece.camp) {
        removedPiece = targetPiece
        const pieces =
          targetPiece.camp === 1 ? [...redPieces] : [...blackPieces]
        removePiece(targetPiece, pieces)
        if (targetPiece.camp === 1) {
          setRedPieces(pieces)
        } else {
          setBlackPieces(pieces)
        }
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

  const addPiece = (piece, pieces) => {
    if (!piece) return
    pieces.push(piece)
  }

  const backStep = () => {
    const nextMovedPointList = [...movedPointList]
    const step = nextMovedPointList.pop() || null

    if (!step) {
      return
    }

    // cleanup if necessary
    if (needMovePiece) {
      setNeedMovePiece(null)
      setHighLightPoint([])
    }

    setMovedPointList(nextMovedPointList)
    const currentRedPieces = [...redPieces]
    const currentBlackPieces = [...blackPieces]
    removePiece(
      step.movedPiece,
      step.movedPiece.camp === 1 ? currentRedPieces : currentBlackPieces,
    )
    if (step.beforeMovePiece && step.beforeMovePiece.camp) {
      addPiece(
        step.beforeMovePiece,
        step.beforeMovePiece.camp === 1 ? currentRedPieces : currentBlackPieces,
      )
    }

    if (step.removedPiece && step.removedPiece.camp) {
      addPiece(
        step.removedPiece,
        step.removedPiece.camp === 1 ? currentRedPieces : currentBlackPieces,
      )
    }

    setRedPieces(currentRedPieces)
    Game.setRedPieces(currentRedPieces)
    setBlackPieces(currentBlackPieces)
    Game.setBlackPieces(currentBlackPieces)

    setNextCamp((prev) => -prev)
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
      <div className={`status ${nextCamp > 0 ? 'red' : ''}`}>
        {nextCamp > 0 ? '红棋' : '黑棋'}
        <div className="options">
          <div onClick={() => backStep()}>悔棋</div>
        </div>
      </div>
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

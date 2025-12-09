import React, { useEffect, useMemo, useRef, useState } from 'react'
import { getTG } from './tg'

const LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
]

function checkWinner(b) {
  for (const [a,b1,c] of LINES) {
    if (b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a]
  }
  if (b.every(Boolean)) return 'draw'
  return null
}

function minimax(board, isMax) {
  const res = checkWinner(board)
  if (res === 'O') return { score: 10 }
  if (res === 'X') return { score: -10 }
  if (res === 'draw') return { score: 0 }

  let best = { score: isMax ? -Infinity : Infinity, index: -1 }
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = isMax ? 'O' : 'X'
      const r = minimax(board, !isMax)
      board[i] = null
      if (isMax) {
        if (r.score > best.score) best = { score: r.score, index: i }
      } else {
        if (r.score < best.score) best = { score: r.score, index: i }
      }
    }
  }
  return best
}

function bestMove(board) {
  // Try to win fast; if multiple, pick first
  return minimax([...board], true).index
}

function generatePromo() {
  return String(Math.floor(10000 + Math.random() * 90000))
}

export default function App() {
  const tg = useMemo(() => getTG(), [])
  const [board, setBoard] = useState(Array(9).fill(null))
  const [turn, setTurn] = useState('X')
  const [result, setResult] = useState(null) // 'X' | 'O' | 'draw' | null
  const [promo, setPromo] = useState(null)
  const aiTimer = useRef(null)

  useEffect(() => {
    tg.ready?.()
    tg.expand?.()
    return () => {
      if (aiTimer.current) clearTimeout(aiTimer.current)
    }
  }, [tg])

  function handleClick(i) {
    if (board[i] || result || turn !== 'X') return
    const next = [...board]
    next[i] = 'X'
    setBoard(next)
    const r = checkWinner(next)
    if (r) return handleFinish(r)
    setTurn('O')
    aiTimer.current = setTimeout(() => aiPlay(next), 420)
  }

  function aiPlay(current) {
    const idx = bestMove(current)
    if (idx == null || idx < 0) {
      const r = checkWinner(current)
      if (r) return handleFinish(r)
      setTurn('X')
      return
    }
    const next = [...current]
    next[idx] = 'O'
    setBoard(next)
    const r = checkWinner(next)
    if (r) return handleFinish(r)
    setTurn('X')
  }

  function handleFinish(r) {
    setResult(r)
    if (r === 'X') {
      const code = generatePromo()
      setPromo(code)
      tg.HapticFeedback?.notificationOccurred?.('success')
      try { tg.sendData?.(JSON.stringify({ type: 'win', code })) } catch {}
    } else if (r === 'O') {
      tg.HapticFeedback?.notificationOccurred?.('error')
      try { tg.sendData?.(JSON.stringify({ type: 'loss' })) } catch {}
    } else {
      tg.HapticFeedback?.notificationOccurred?.('warning')
    }
  }

  function reset() {
    setBoard(Array(9).fill(null))
    setTurn('X')
    setResult(null)
    setPromo(null)
  }

  const status = result
    ? (result === 'X' ? 'Победа!' : result === 'O' ? 'Компьютер победил' : 'Ничья')
    : (turn === 'X' ? 'Ваш ход' : 'Ход компьютера')

  return (
    <div className="wrap">
      <div className="card">
        <header className="header">
          <h1>Крестики‑нолики</h1>
          <p className="sub">Небольшая передышка и чуть‑чуть удачи ✨</p>
        </header>

        <div className="board">
          {board.map((v, i) => (
            <button
              key={i}
              className={`cell ${v ? 'filled' : ''}`}
              onClick={() => handleClick(i)}
              disabled={!!v || !!result || turn !== 'X'}
            >
              {v && <span className={`mark ${v === 'X' ? 'x' : 'o'}`}>{v}</span>}
            </button>
          ))}
        </div>

        <div className="footer">
          <div className="status">{status}</div>
          <div className="actions">
            <button className="btn ghost" onClick={reset}>Сыграть ещё</button>
          </div>
        </div>
      </div>

      {result && (
        <div className="overlay">
          <div className="modal">
            {result === 'X' ? (
              <>
                <h2 className="win">Ура! Победа 🎉</h2>
                <p className="muted">Ваш промокод</p>
                <div className="promo" onClick={() => navigator.clipboard?.writeText(promo || '')}>{promo}</div>
                <div className="modal-actions">
                  <button className="btn primary" onClick={() => navigator.clipboard?.writeText(promo || '')}>Скопировать</button>
                  <button className="btn" onClick={reset}>Сыграть ещё</button>
                </div>
              </>
            ) : result === 'O' ? (
              <>
                <h2 className="loss">Увы, вы проиграли</h2>
                <p className="muted">Ничего, в следующий раз повезёт</p>
                <div className="modal-actions">
                  <button className="btn primary" onClick={reset}>Попробовать снова</button>
                </div>
              </>
            ) : (
              <>
                <h2>Ничья</h2>
                <div className="modal-actions">
                  <button className="btn primary" onClick={reset}>Ещё раз</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

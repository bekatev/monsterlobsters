import { useEffect, useRef, useState } from "react"
import { navigate, useReducedMotion, withBase } from "../hooks"
import { mountKyoto } from "../kyoto/game"

const SONG = "https://www.youtube.com/watch?v=eC2zS8dLaOg"

const PAD = [
  ["left", "Left"],
  ["right", "Right"],
  ["jump", "Jump"],
  ["block", "Block"],
  ["punch", "Punch"],
  ["kick", "Kick"],
  ["special", "Special"],
]

export default function Kyoto() {
  const canvasRef = useRef(null)
  const gameRef = useRef(null)
  const reduce = useReducedMotion()
  const [status, setStatus] = useState("Kyoto. Press start.")
  const [phase, setPhase] = useState("title")
  const [human2, setHuman2] = useState(false)

  useEffect(() => {
    const previous = document.title
    document.title = "Kyoto — 4D Monster Lobsters"
    return () => {
      document.title = previous
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const game = mountKyoto(canvas, {
      reduce,
      onStatus: ({ phase: next, line }) => {
        setPhase(next)
        setStatus(line)
      },
    })
    gameRef.current = game
    return () => {
      game.destroy()
      gameRef.current = null
    }
  }, [reduce])

  const hold = (name) => ({
    onPointerDown: (event) => {
      event.preventDefault()
      gameRef.current?.down(name)
    },
    onPointerUp: () => gameRef.current?.up(name),
    onPointerCancel: () => gameRef.current?.up(name),
    onPointerLeave: () => gameRef.current?.up(name),
  })

  return (
    <div className="kyoto-page">
      <header className="kyoto-bar">
        <button type="button" onClick={() => navigate(withBase("/"))}>
          Back
        </button>
        <strong>Kyoto</strong>
        <a href={SONG} target="_blank" rel="noreferrer">
          The song
        </a>
      </header>
      <div className="kyoto-crt">
        <canvas ref={canvasRef} width={1280} height={720} aria-label="Kyoto fight" />
        <div className="kyoto-scan" aria-hidden="true" />
      </div>
      <p className="kyoto-status" aria-live="polite">
        {status}
      </p>
      <div className="kyoto-modes">
        <button
          type="button"
          data-on={phase === "select" && !human2}
          onClick={() => {
            setHuman2(false)
            gameRef.current?.setMode(false)
          }}
        >
          CPU
        </button>
        <button
          type="button"
          data-on={phase === "select" && human2}
          onClick={() => {
            setHuman2(true)
            gameRef.current?.setMode(true)
          }}
        >
          2P
        </button>
        <button type="button" onClick={() => gameRef.current?.nudgeRival(-1)}>
          Rival −
        </button>
        <button type="button" onClick={() => gameRef.current?.nudgeRival(1)}>
          Rival +
        </button>
        <button type="button" className="kyoto-start" onClick={() => gameRef.current?.start()}>
          Start
        </button>
      </div>
      <div className="kyoto-pad">
        {PAD.map(([name, label]) => (
          <button key={name} type="button" {...hold(name)}>
            {label}
          </button>
        ))}
      </div>
      <p className="kyoto-help">
        P1: A D move, W jump, S block, J punch, K kick, L special. P2: arrows, 1 punch, 2 kick, 3 special.
      </p>
    </div>
  )
}

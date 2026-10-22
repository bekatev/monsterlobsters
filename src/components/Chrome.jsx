import { forwardRef, useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { asset } from "../asset"
import { MARQUEE } from "../data"
import { scrollToId, useReducedMotion } from "../hooks"

export const Loader = forwardRef(function Loader({ onDone }, ref) {
  const reduce = useReducedMotion()
  const [value, setValue] = useState(reduce ? 100 : 0)

  useEffect(() => {
    if (reduce) {
      onDone()
      return
    }
    let frame
    const start = performance.now()
    const tick = (now) => {
      const next = Math.min(100, ((now - start) / 1400) * 100)
      setValue(Math.round(next))
      if (next < 100) frame = requestAnimationFrame(tick)
      else setTimeout(onDone, 220)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [onDone, reduce])

  if (reduce) return null

  return (
    <motion.div
      ref={ref}
      className="loader"
      exit={{ y: "-100%", transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
    >
      <div className="flex items-center justify-between">
        <span className="eyebrow">Lobster Rock</span>
        <button className="menu-btn" onClick={onDone}>
          Skip
        </button>
      </div>
      <div>
        <p className="serif text-3xl m-0">4D Monster Lobsters</p>
        <strong>{String(value).padStart(3, "0")}</strong>
      </div>
    </motion.div>
  )
})

const LINKS = [
  ["tour", "Tour"],
  ["top", "Enter"],
  ["records", "Records"],
  ["signal", "Optics"],
  ["watch", "Watch"],
  ["listen", "Listen"],
  ["band", "Band"],
]

export function Cursor() {
  const reduce = useReducedMotion()
  const [fine, setFine] = useState(false)

  useEffect(() => {
    const media = window.matchMedia("(pointer: fine)")
    setFine(media.matches)
    if (!media.matches || reduce) return
    const ring = document.getElementById("cursor-ring")
    if (!ring) return
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let frame
    const move = (e) => {
      tx = e.clientX
      ty = e.clientY
    }
    const loop = () => {
      x += (tx - x) * 0.16
      y += (ty - y) * 0.16
      ring.style.transform = `translate3d(${x}px, ${y}px, 0)`
      frame = requestAnimationFrame(loop)
    }
    window.addEventListener("pointermove", move)
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", move)
    }
  }, [reduce])

  if (!fine || reduce) return null
  return <div id="cursor-ring" className="cursor-ring" aria-hidden="true" />
}

export function Nav({ active, open, setOpen }) {
  return (
    <header className="nav">
      <a className="skip" href="#signal">
        Skip to signal
      </a>
      <button className="brand" onClick={() => scrollToId("tour")} aria-label="4D Monster Lobsters, back to top">
        <img className="brand-logo brand-logo-solid" src={asset("/brand/logo-mark.png")} alt="" />
        <img className="brand-logo brand-logo-clear" src={asset("/brand/logo-mark-clear.png")} alt="" />
      </button>
      <nav className="nav-links" aria-label="Primary">
        {LINKS.map(([id, label]) => (
          <button key={id} data-active={active === id} onClick={() => scrollToId(id)}>
            {label}
          </button>
        ))}
      </nav>
      <button className="menu-btn" aria-expanded={open} onClick={() => setOpen(true)}>
        Menu
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="full-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button className="menu-btn self-end" onClick={() => setOpen(false)}>
              Close
            </button>
            {LINKS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => {
                  setOpen(false)
                  scrollToId(id)
                }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

export function Rail({ active }) {
  const items = [
    ["tour", "00", "Tour"],
    ["top", "01", "Enter"],
    ["records", "02", "Records"],
    ["signal", "03", "Optics"],
    ["watch", "04", "Watch"],
    ["listen", "05", "Listen"],
    ["band", "06", "Band"],
  ]
  return (
    <nav className="rail" aria-label="Sections">
      {items.map(([id, num, label]) => (
        <button key={id} data-active={active === id} onClick={() => scrollToId(id)}>
          {num} {label}
        </button>
      ))}
    </nav>
  )
}

export function Marquee({ reverse = false, items = MARQUEE, duration = 46 }) {
  const reduce = useReducedMotion()
  const row = [...items, ...items]
  return (
    <div className="marquee" aria-hidden="true">
      <div
        className="marquee-track"
        style={{
          animationDuration: `${duration}s`,
          animationDirection: reverse ? "reverse" : "normal",
          animationPlayState: reduce ? "paused" : "running",
        }}
      >
        {row.map((item, i) => (
          <span key={`${item}-${i}`}>
            <span className="dot">✦ </span>
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { HERO_FRAMES } from "../data"
import { asset } from "../asset"
import { scrollToId, useReducedMotion } from "../hooks"

const ease = [0.16, 1, 0.3, 1]

function Rise({ text, delay = 0 }) {
  return (
    <span className="line-mask">
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.9, delay, ease }}
      >
        {text}
      </motion.span>
    </span>
  )
}

export default function Hero() {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(0)
  const frame = HERO_FRAMES[index]

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => setIndex((n) => (n + 1) % HERO_FRAMES.length), 4200)
    return () => clearInterval(id)
  }, [reduce])

  return (
    <section className="hero" id="top">
      <h1 className="sr-only">4D Monster Lobsters</h1>
      <div className="kicker">
        <span>Tbilisi · Lobster Rock</span>
        <button className="text-link" onClick={() => scrollToId("tour")}>
          Tour · 28 Oct–14 Nov
        </button>
      </div>
      <div className="hero-grid">
        <div className="hero-title" aria-hidden="true">
          <div className="display">
            <Rise text="4D" delay={0.15} />
          </div>
          <div className="display">
            <Rise text="MONSTER" delay={0.28} />
          </div>
          <div className="display">
            <Rise text="LOBSTERS" delay={0.4} />
          </div>
        </div>
        <button
          className="frame"
          onClick={() => setIndex((n) => (n + 1) % HERO_FRAMES.length)}
          aria-label={`Show the next picture. Now showing ${frame.caption}`}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={frame.src}
              src={asset(frame.src)}
              alt={frame.alt}
              initial={reduce ? false : { opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease }}
            />
          </AnimatePresence>
          <span className="frame-cap">{frame.caption}</span>
        </button>
      </div>
      <div className="hero-foot">
        <p className="serif text-2xl md:text-4xl leading-none m-0">
          Beka, Niku, Tika, Andria. Tbilisi.
        </p>
        <div className="scroll-cue">
          <i />
          Descend
        </div>
      </div>
    </section>
  )
}

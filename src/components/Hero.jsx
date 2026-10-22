import { useState } from "react"
import { motion } from "framer-motion"
import { scrollToId } from "../hooks"

const LINES = ["4D", "MONSTER", "LOBSTERS"]
const NAMES = ["Beka", "Niku", "Tika", "Andria"]
const ease = [0.16, 1, 0.3, 1]

function shuffle(list) {
  const next = [...list]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export default function Hero() {
  const [names] = useState(() => shuffle(NAMES))
  return (
    <section className="hero future-hero" id="top">
      <h1 className="sr-only">4D Monster Lobsters</h1>
      <div className="kicker">
        <span>Tbilisi · Lobster Rock</span>
        <button className="text-link" onClick={() => scrollToId("tour")}>
          Tour · 28 Oct–14 Nov
        </button>
      </div>
      <div className="future-name" aria-hidden="true">
        {LINES.map((line, index) => (
          <div className="display" key={line}>
            <motion.span
              initial={{ y: "110%" }}
              animate={{ y: "0%" }}
              transition={{ duration: 0.9, delay: 0.12 * index, ease }}
            >
              {line}
            </motion.span>
          </div>
        ))}
      </div>
      <div className="hero-foot">
        <p className="serif text-2xl md:text-4xl leading-none m-0">{names.join(", ")}. Tbilisi.</p>
        <div className="scroll-cue">
          <i />
          Descend
        </div>
      </div>
    </section>
  )
}

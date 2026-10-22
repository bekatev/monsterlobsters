import { motion } from "framer-motion"
import { scrollToId } from "../hooks"

const LINES = ["4D", "MONSTER", "LOBSTERS"]
const ease = [0.16, 1, 0.3, 1]

export default function Hero() {
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
              initial={{ y: "70%", rotateX: 55, opacity: 0 }}
              animate={{ y: "0%", rotateX: 0, opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.12 * index, ease }}
            >
              {line}
            </motion.span>
          </div>
        ))}
      </div>
      <div className="hero-foot">
        <p className="serif text-2xl md:text-4xl leading-none m-0">Beka, Niku, Tika, Andria. Tbilisi.</p>
        <div className="scroll-cue">
          <i />
          Descend
        </div>
      </div>
    </section>
  )
}

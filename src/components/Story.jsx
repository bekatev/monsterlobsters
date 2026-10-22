import { useState } from "react"
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion"
import { useRef } from "react"
import { CHAPTERS } from "../data"
import { asset } from "../asset"
import { useMedia, useReducedMotion } from "../hooks"

function Copy({ chapter, index }) {
  return (
    <div className="chapter-copy">
      <p className="eyebrow">
        {String(index + 1).padStart(2, "0")} / {String(CHAPTERS.length).padStart(2, "0")} · {chapter.kicker}
      </p>
      <div className="year">{chapter.year}</div>
      <h3>{chapter.title}</h3>
      {chapter.body.map((paragraph) => (
        <p className="prose" key={paragraph.slice(0, 24)}>
          {paragraph}
        </p>
      ))}
    </div>
  )
}

export default function Story() {
  const wide = useMedia("(min-width: 1100px)")
  const reduce = useReducedMotion()
  const pin = wide && !reduce
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] })
  const [index, setIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!pin) return
    const next = Math.min(CHAPTERS.length - 1, Math.floor(value * CHAPTERS.length))
    setIndex(next)
  })

  if (!pin) {
    return (
      <section className="panel" id="signal" aria-labelledby="signal-title">
        <p className="eyebrow">Signal</p>
        <h2 className="section-title" id="signal-title">
          Lobster Rock.
        </h2>
        <p className="serif text-2xl md:text-3xl max-w-3xl leading-tight">
          Beka, Niku, Tika, Andria.
        </p>
        {CHAPTERS.map((chapter, i) => (
          <article className="chapter" key={chapter.year}>
            <img className="w-full rounded-2xl border-2 border-ink object-cover max-h-[28rem]" src={asset(chapter.image)} alt={chapter.alt} />
            <Copy chapter={chapter} index={i} />
          </article>
        ))}
      </section>
    )
  }

  const chapter = CHAPTERS[index]

  return (
    <section
      className="chapter-pin"
      id="signal"
      ref={ref}
      style={{ height: `${CHAPTERS.length * 120}vh` }}
      aria-labelledby="signal-title"
    >
      <div className="chapter-sticky">
        <div>
          <p className="eyebrow">Signal</p>
          <h2 className="section-title" id="signal-title">
            Lobster Rock.
          </h2>
          <p className="serif text-3xl max-w-xl leading-none mt-4">
            Beka, Niku, Tika, Andria.
          </p>
          <div className="mt-8 min-h-[16rem]" aria-hidden="true">
            <AnimatePresence mode="wait">
              <motion.div
                key={chapter.year}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45 }}
              >
                <Copy chapter={chapter} index={index} />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="sr-only">
            {CHAPTERS.map((item, i) => (
              <article key={item.year}>
                <h3>
                  {item.year}. {item.title}
                </h3>
                {item.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 18)}>{paragraph}</p>
                ))}
                <p>
                  Chapter {i + 1} of {CHAPTERS.length}
                </p>
              </article>
            ))}
          </div>
        </div>
        <div className="frame" style={{ cursor: "default" }} aria-hidden="true">
          <AnimatePresence mode="sync">
            <motion.img
              key={chapter.image}
              src={asset(chapter.image)}
              alt=""
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
            />
          </AnimatePresence>
          <span className="frame-cap">{chapter.year}</span>
        </div>
      </div>
    </section>
  )
}

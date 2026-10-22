import { useRef, useState } from "react"
import { motion, useMotionValueEvent, useScroll } from "framer-motion"
import { useReducedMotion } from "../hooks"

function frameIndex(value, count) {
  if (value >= 1) return count - 1
  return Math.min(count - 1, Math.floor(value * count))
}

export default function ScrollReel({ id, eyebrow, title, note, items, getKey, render, onChange }) {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const stageRef = useRef(null)
  const [index, setIndex] = useState(0)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  })

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduce) return
    const next = frameIndex(value, items.length)
    setIndex((current) => {
      if (current !== next) onChange?.(next)
      return current === next ? current : next
    })
    const local = value >= 1 ? 1 : (value * items.length) % 1
    stageRef.current?.style.setProperty("--scan", `${local * 100}%`)
    stageRef.current?.style.setProperty("--zoom", String(1.045 - local * 0.045))
  })

  const label = String(index + 1).padStart(2, "0")
  const total = String(items.length).padStart(2, "0")

  if (reduce) {
    return (
      <section className="reel reel-flat" id={id} ref={ref} aria-labelledby={`${id}-title`}>
        <div className="reel-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title" id={`${id}-title`}>
            {title}
          </h2>
          {note}
        </div>
        {items.map((item, itemIndex) => (
          <div className="reel-frame" key={getKey(item)}>
            {render(item, itemIndex)}
          </div>
        ))}
      </section>
    )
  }

  return (
    <section
      className="reel"
      id={id}
      ref={ref}
      style={{ height: `${Math.max(items.length, 1) * 52}vh` }}
      aria-labelledby={`${id}-title`}
    >
      <div className="reel-sticky">
        <div className="reel-head">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="section-title" id={`${id}-title`}>
            {title}
          </h2>
          {note}
          <p className="reel-count" aria-hidden="true">
            {label}
            <span> / {total}</span>
          </p>
        </div>
        <div className="reel-frame" ref={stageRef}>
          <motion.div
            className="reel-media"
            key={getKey(items[index])}
            initial={{ opacity: 0, clipPath: "inset(12% 8% 18% 8%)" }}
            animate={{ opacity: 1, clipPath: "inset(0% 0% 0% 0%)" }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            {render(items[index], index)}
          </motion.div>
          <i className="reel-scan" aria-hidden="true" />
          <span className="reel-bracket reel-bracket-a" aria-hidden="true" />
          <span className="reel-bracket reel-bracket-b" aria-hidden="true" />
        </div>
        <div className="reel-meter" aria-hidden="true">
          <span style={{ width: `${((index + 1) / items.length) * 100}%` }} />
        </div>
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { RELEASES, SINGLES, spotifySearch } from "../data"
import { asset } from "../asset"
import { useMedia, useReducedMotion } from "../hooks"

function Sleeve({ release, onOpen }) {
  return (
    <button className="record-card" onClick={() => onOpen(release)}>
      <img src={asset(release.cover)} alt="" />
      <div className="record-meta">
        <span>{release.kind}</span>
        <span>{release.year}</span>
      </div>
      <h3>{release.title}</h3>
      <p className="prose mt-2 text-sm">{release.tracks.length} tracks · open the sleeve</p>
    </button>
  )
}

export function Records({ onOpen }) {
  const wide = useMedia("(min-width: 1100px)")
  const reduce = useReducedMotion()
  const pin = wide && !reduce
  const wrapRef = useRef(null)
  const trackRef = useRef(null)
  const [height, setHeight] = useState(() => (typeof window === "undefined" ? 2400 : window.innerHeight * 3.2))

  useEffect(() => {
    if (!pin) return
    const wrap = wrapRef.current
    const track = trackRef.current
    if (!wrap || !track) return

    const measure = () => {
      const distance = Math.max(0, track.scrollWidth - window.innerWidth + 80)
      setHeight(window.innerHeight + distance)
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener("resize", measure)

    let frame
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const rect = wrap.getBoundingClientRect()
        const distance = Math.max(1, track.scrollWidth - window.innerWidth + 80)
        const passed = Math.min(Math.max(-rect.top, 0), distance)
        track.style.transform = `translate3d(${-passed}px, 0, 0)`
      })
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener("resize", measure)
      window.removeEventListener("scroll", onScroll)
    }
  }, [pin])

  return (
    <section
      id="records"
      className="shelf shelf-pin"
      ref={wrapRef}
      style={pin ? { height } : undefined}
      aria-labelledby="records-title"
    >
      <div className={pin ? "shelf-sticky" : "panel"}>
        <div
          ref={trackRef}
          className={pin ? "flex items-end gap-8 pl-[8.5rem] pr-16 will-change-transform" : "shelf-row"}
        >
          <div className="intro-card">
            <p className="eyebrow">Records</p>
            <h2 className="section-title" id="records-title">
              The shelf.
            </h2>
            <p className="serif text-2xl md:text-4xl leading-none mt-4">
              Albums and the EP. Open a sleeve for the tracks.
            </p>
          </div>
          {RELEASES.map((release) => (
            <Sleeve key={release.id} release={release} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function Singles() {
  const loop = [...SINGLES, ...SINGLES]
  return (
    <section className="panel pt-0" aria-label="Singles">
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <p className="eyebrow">Singles</p>
          <h2 className="section-title text-[clamp(2.4rem,6vw,4.4rem)]">Singles.</h2>
        </div>
      </div>
      <div className="rail-wrap overflow-hidden">
        <div className="rail-singles">
          {loop.map((single, i) => (
            <a
              className="single-card"
              key={`${single.title}-${i}`}
              href={single.apple}
              target="_blank"
              rel="noreferrer"
            >
              <img src={asset(single.cover)} alt="" />
              <strong>{single.title}</strong>
              <small>
                <span>{single.year}</span>
                <span>Apple Music</span>
              </small>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ReleaseModal({ release, onClose }) {
  useEffect(() => {
    if (!release) return
    const previous = document.activeElement
    const dialog = document.getElementById("release-dialog")
    dialog?.querySelector("button")?.focus()
    const onKey = (event) => {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    window.__lenis?.stop()
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      window.__lenis?.start()
      document.body.style.overflow = ""
      if (previous instanceof HTMLElement) previous.focus()
    }
  }, [release, onClose])

  return createPortal(
    <AnimatePresence>
      {release && (
        <motion.div
          className="modal-back"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="modal"
            id="release-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="release-title"
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
          >
            <img src={asset(release.cover)} alt="" />
            <div>
              <button className="close-x" onClick={onClose} aria-label="Close sleeve">
                ×
              </button>
              <p className="eyebrow">
                {release.kind} · {release.date}
              </p>
              <h3 id="release-title" className="section-title text-[clamp(2.4rem,5vw,4rem)]">
                {release.title}
              </h3>
              <p className="prose">{release.blurb}</p>
              <div className="flex flex-wrap gap-2 my-4">
                <a className="outlet" href={release.apple} target="_blank" rel="noreferrer">
                  Apple Music
                </a>
                <a className="outlet" href={spotifySearch(release.title)} target="_blank" rel="noreferrer">
                  Spotify
                </a>
              </div>
              <ol>
                {release.tracks.map(([title, time], i) => (
                  <li key={title}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>{title}</span>
                    <span>{time}</span>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

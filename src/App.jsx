import { useCallback, useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import InkField from "./components/InkField"
import { Cursor, Loader, Marquee, Nav, Rail } from "./components/Chrome"
import Hero from "./components/Hero"
import Story from "./components/Story"
import { Records, ReleaseModal, Singles } from "./components/Records"
import { Listen, Live, Watch } from "./components/Signal"
import Band from "./components/Band"
import { PLACES } from "./data"
import { useReducedMotion } from "./hooks"
import Tour from "./components/Tour"

const TINTS = {
  tour: [0.9, 0.25, 0.32],
  top: [0.89, 0.3, 0.24],
  signal: [0.08, 0.55, 0.52],
  records: [0.86, 0.22, 0.28],
  listen: [0.78, 0.45, 0.2],
  watch: [0.55, 0.22, 0.62],
  live: [0.9, 0.25, 0.32],
  band: [0.18, 0.55, 0.38],
}

export default function App() {
  const reduce = useReducedMotion()
  const [booting, setBooting] = useState(true)
  const [menu, setMenu] = useState(false)
  const [active, setActive] = useState("tour")
  const [night, setNight] = useState(false)
  const [release, setRelease] = useState(null)
  const closeRelease = useCallback(() => setRelease(null), [])
  const finishBoot = useCallback(() => setBooting(false), [])

  useEffect(() => {
    if (reduce) return
    const lenis = new Lenis({
      lerp: 0.085,
      smoothWheel: true,
      syncTouch: false,
    })
    window.__lenis = lenis
    let frame
    const loop = (time) => {
      lenis.raf(time)
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
      delete window.__lenis
    }
  }, [reduce])

  useEffect(() => {
    const sections = ["tour", "top", "signal", "records", "listen", "watch", "live", "band"]
    const nodes = sections.map((id) => document.getElementById(id)).filter(Boolean)
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible?.target?.id) setActive(visible.target.id)
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0.1, 0.25, 0.5] },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const mark = () => {
      const live = document.getElementById("live")
      if (!live) return
      setNight(live.getBoundingClientRect().top < window.innerHeight * 0.65)
    }
    mark()
    window.addEventListener("scroll", mark, { passive: true })
    return () => window.removeEventListener("scroll", mark)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.night = night ? "true" : "false"
    const theme = document.querySelector('meta[name="theme-color"]')
    if (theme) theme.setAttribute("content", night ? "#110d14" : "#f3eadc")
  }, [night])

  useEffect(() => {
    document.documentElement.dataset.film = active === "tour" ? "true" : "false"
  }, [active])

  return (
    <>
      <InkField night={night} tint={TINTS[active] || TINTS.top} />
      <div className="grain" aria-hidden="true" />
      <Cursor />
      <AnimatePresence>{booting && <Loader key="boot" onDone={finishBoot} />}</AnimatePresence>
      <div className="site">
        <Nav active={active} open={menu} setOpen={setMenu} />
        <Rail active={active} />
        <main>
          <Tour />
          <Hero />
          <Marquee />
          <Marquee reverse items={PLACES} duration={62} />
          <Story />
          <Records onOpen={setRelease} />
          <Singles />
          <Listen />
          <Watch />
          <Live />
          <Band />
        </main>
      </div>
      <ReleaseModal release={release} onClose={closeRelease} />
    </>
  )
}

import { useCallback, useEffect, useState } from "react"
import { AnimatePresence } from "framer-motion"
import Lenis from "lenis"
import "lenis/dist/lenis.css"
import InkField from "./components/InkField"
import { Cursor, Loader, Nav, Rail } from "./components/Chrome"
import Hero from "./components/Hero"
import { Records, ReleaseModal, Singles } from "./components/Records"
import { Listen, Optics, Watch } from "./components/Signal"
import Band from "./components/Band"
import { useReducedMotion } from "./hooks"
import Tour from "./components/Tour"

const TINTS = {
  tour: [0.95, 0.22, 0.28],
  top: [0.45, 0.2, 0.85],
  signal: [0.15, 0.75, 0.85],
  records: [0.9, 0.25, 0.32],
  listen: [0.78, 0.45, 0.2],
  watch: [0.55, 0.2, 0.7],
  band: [0.2, 0.7, 0.55],
}

export default function App() {
  const reduce = useReducedMotion()
  const [booting, setBooting] = useState(true)
  const [menu, setMenu] = useState(false)
  const [active, setActive] = useState("tour")
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
    const sections = ["tour", "top", "records", "signal", "watch", "listen", "band"]
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
    document.documentElement.dataset.night = "true"
    const theme = document.querySelector('meta[name="theme-color"]')
    if (theme) theme.setAttribute("content", "#07060c")
  }, [])

  useEffect(() => {
    if (reduce) return
    const onMove = (event) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 8
      const y = (event.clientY / window.innerHeight - 0.5) * -5
      document.documentElement.style.setProperty("--tilt-y", `${x}deg`)
      document.documentElement.style.setProperty("--tilt-x", `${y}deg`)
    }
    const onScroll = () => {
      const depth = document.documentElement.scrollHeight - window.innerHeight
      const p = depth > 0 ? window.scrollY / depth : 0
      document.documentElement.style.setProperty("--beam", `${8 + p * 78}%`)
    }
    onScroll()
    window.addEventListener("pointermove", onMove)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("scroll", onScroll)
    }
  }, [reduce])

  useEffect(() => {
    document.documentElement.dataset.film = active === "tour" ? "true" : "false"
  }, [active])

  return (
    <>
      <InkField night tint={TINTS[active] || TINTS.top} />
      <div className="grain" aria-hidden="true" />
      <div className="beam" aria-hidden="true" />
      <Cursor />
      <AnimatePresence>{booting && <Loader key="boot" onDone={finishBoot} />}</AnimatePresence>
      <div className="site">
        <Nav active={active} open={menu} setOpen={setMenu} />
        <Rail active={active} />
        <main>
          <Tour />
          <Hero />
          <Records onOpen={setRelease} />
          <Singles />
          <Optics />
          <Watch />
          <Listen />
          <Band />
        </main>
      </div>
      <ReleaseModal release={release} onClose={closeRelease} />
    </>
  )
}

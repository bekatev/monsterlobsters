import { useEffect, useState } from "react"

export function useMedia(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [query])

  return matches
}

export function useReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)")
}

export function withBase(path) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  if (!path || path === "/") return base ? `${base}/` : "/"
  return `${base}${path.startsWith("/") ? path : `/${path}`}`
}

export function isKyotoPath(path = "") {
  return /\/kyoto\/?$/.test(path)
}

export function navigate(path) {
  if (window.location.pathname !== path) {
    window.history.pushState({}, "", path)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }
  window.scrollTo(0, 0)
}

export function usePathname() {
  const [path, setPath] = useState(() => window.location.pathname)
  useEffect(() => {
    const sync = () => setPath(window.location.pathname)
    window.addEventListener("popstate", sync)
    return () => window.removeEventListener("popstate", sync)
  }, [])
  return path
}

function scrollNow(id) {
  const el = document.getElementById(id)
  if (!el) return
  const lenis = window.__lenis
  if (lenis) lenis.scrollTo(el, { offset: -8 })
  else el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export function scrollToId(id) {
  if (window.location.pathname !== "/") {
    navigate("/")
    window.setTimeout(() => scrollNow(id), 40)
    return
  }
  scrollNow(id)
}

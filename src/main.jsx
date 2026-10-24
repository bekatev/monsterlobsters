import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.jsx"
import "./index.css"

try {
  const stored = sessionStorage.getItem("kyoto-redirect")
  if (stored && /\/kyoto\/?$/.test(stored)) {
    sessionStorage.removeItem("kyoto-redirect")
    window.history.replaceState(null, "", stored)
  }
} catch {
  /* private mode can block storage */
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

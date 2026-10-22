export function asset(path) {
  if (!path || /^(https?:|data:)/.test(path)) return path
  return `${import.meta.env.BASE_URL}${String(path).replace(/^\//, "")}`
}

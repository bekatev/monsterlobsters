const SCALE = 2
const W = 168 * SCALE
const H = 96 * SCALE

function sheet() {
  const idx = new Uint16Array(W * H)
  const cols = [null]
  const put = (x, y, color) => {
    x = x | 0
    y = y | 0
    if (x < 0 || y < 0 || x >= W || y >= H || !color) return
    let i = cols.indexOf(color)
    if (i < 0) {
      cols.push(color)
      i = cols.length - 1
    }
    idx[y * W + x] = i
  }
  const px = (x, y, color) => put(Math.round(x * SCALE), Math.round(y * SCALE), color)
  const disc = (x, y, r, color) => {
    const cx = x * SCALE
    const cy = y * SCALE
    const R = Math.ceil(r * SCALE)
    const rr = (r * SCALE) * (r * SCALE)
    for (let yy = -R; yy <= R; yy += 1) {
      for (let xx = -R; xx <= R; xx += 1) {
        if (xx * xx + yy * yy <= rr) put(cx + xx, cy + yy, color)
      }
    }
  }
  const limb = (x1, y1, x2, y2, r, light, mid, dark) => {
    const sx1 = x1 * SCALE
    const sy1 = y1 * SCALE
    const sx2 = x2 * SCALE
    const sy2 = y2 * SCALE
    const sr = r * SCALE
    const steps = Math.max(1, Math.ceil(Math.hypot(sx2 - sx1, sy2 - sy1)))
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps
      const x = sx1 + (sx2 - sx1) * t
      const y = sy1 + (sy2 - sy1) * t
      for (let oy = -sr; oy <= sr; oy += 1) {
        for (let ox = -sr; ox <= sr; ox += 1) {
          if (ox * ox + oy * oy > sr * sr + 0.2) continue
          let shade = oy < -sr * 0.28 ? light : oy > sr * 0.32 ? dark : mid
          if (shade === mid && ((ox + oy + i) & 3) === 0) shade = dark
          if (shade === light && ((ox + oy) & 3) === 0) shade = mid
          put(x + ox, y + oy, shade)
        }
      }
    }
  }
  return { px, disc, limb, idx, cols }
}

function bake(s, anchor) {
  const outlined = new Uint16Array(s.idx)
  let edge = s.cols.indexOf("#140c08")
  if (edge < 0) {
    s.cols.push("#140c08")
    edge = s.cols.length - 1
  }
  for (let y = 1; y < H - 1; y += 1) {
    for (let x = 1; x < W - 1; x += 1) {
      const i = y * W + x
      if (s.idx[i]) continue
      if (s.idx[i - 1] || s.idx[i + 1] || s.idx[i - W] || s.idx[i + W]) outlined[i] = edge
    }
  }
  const canvas = document.createElement("canvas")
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext("2d")
  const img = ctx.createImageData(W, H)
  for (let i = 0; i < outlined.length; i += 1) {
    const color = s.cols[outlined[i]]
    if (!color) continue
    const n = i * 4
    img.data[n] = parseInt(color.slice(1, 3), 16)
    img.data[n + 1] = parseInt(color.slice(3, 5), 16)
    img.data[n + 2] = parseInt(color.slice(5, 7), 16)
    img.data[n + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return { canvas, anchor: Math.round(anchor * SCALE) }
}

function eye(s, x, y, iris) {
  s.disc(x, y, 1.45, "#f7f4ee")
  s.disc(x + 0.35, y + 0.15, 0.78, iris)
  s.px(x + 0.2, y - 0.35, "#fffaf4")
}

function nose(s, x, y, skin) {
  s.disc(x, y, 1.35, skin)
}

function faceBase(s, x, y, skin) {
  s.disc(x, y, 7.6, skin[1])
  s.disc(x + 1.2, y - 1.6, 4.4, skin[0])
  s.disc(x + 2.4, y + 2.2, 3.2, skin[2])
}

function portrait(s, x, y, look) {
  if (look === "gi") {
    const hair = ["#c48448", "#7a4a28", "#3e2816"]
    const skin = ["#f4c8a8", "#e0a478", "#c48460"]
    const beard = ["#6a4430", "#3a2818", "#24160e"]
    s.disc(x - 1, y - 7, 4.2, hair[1])
    s.disc(x + 2, y - 10, 3, hair[0])
    s.disc(x - 4, y - 5, 3.2, hair[2])
    s.disc(x + 4, y - 6, 2.2, hair[1])
    s.limb(x - 1, y - 13, x + 1, y - 7, 1.15, hair[0], hair[1], hair[2])
    s.limb(x + 3, y - 14, x + 5, y - 8, 1, hair[0], hair[1], hair[1])
    s.limb(x - 5, y - 9, x - 3, y - 4, 1, hair[1], hair[2], hair[2])
    faceBase(s, x + 0.4, y + 1, skin)
    s.disc(x - 3, y - 6, 2.2, hair[2])
    s.disc(x + 1, y - 8, 2, hair[1])
    s.limb(x + 1.2, y - 2.6, x + 5.4, y - 2, 0.45, "#2a1c10", "#2a1c10", "#2a1c10")
    eye(s, x + 3.4, y - 0.4, "#3a2a18")
    nose(s, x + 7.2, y + 1.6, skin[2])
    s.disc(x + 1.5, y + 6.2, 4.4, beard[1])
    s.disc(x + 5, y + 5.2, 2.6, beard[0])
    s.disc(x - 1.5, y + 5.6, 3, beard[2])
    s.disc(x + 5.2, y + 3.4, 1.7, beard[1])
    s.px(x + 4.6, y + 4.6, "#c48a78")
    return
  }
  if (look === "fan") {
    const hair = ["#4a342e", "#241816", "#100c0a"]
    const skin = ["#f6d0b8", "#e4b090", "#c48a6c"]
    s.disc(x - 2, y - 6, 9, hair[1])
    s.disc(x + 3, y - 9, 5.6, hair[0])
    s.disc(x - 7, y - 1, 5, hair[2])
    s.disc(x, y - 12, 3.4, hair[0])
    s.disc(x + 6, y - 7, 3.2, hair[1])
    s.disc(x - 5, y - 10, 2.8, hair[2])
    faceBase(s, x + 1.2, y + 1.4, skin)
    s.limb(x + 0.4, y - 4.2, x + 5.4, y - 3.4, 1.15, hair[1], hair[2], hair[2])
    s.disc(x - 6, y - 2, 2.6, hair[1])
    s.disc(x + 1, y - 9, 2.4, hair[0])
    eye(s, x + 4.2, y + 0.2, "#1a120e")
    nose(s, x + 7.6, y + 2.2, skin[2])
    s.px(x + 5.4, y + 4.4, "#a06060")
    s.px(x + 6.3, y + 4.6, "#a06060")
    return
  }
  if (look === "green") {
    const hair = ["#322820", "#16120e", "#0a0806"]
    const skin = ["#f2c8aa", "#dca484", "#b88464"]
    const curls = [
      [-6, -5, 3.1],
      [-1, -9, 3.2],
      [4, -10, 2.8],
      [7, -6, 2.6],
      [-8, -1, 2.6],
      [1, -13, 2.2],
      [6, -3, 2.2],
      [-3, -3, 2.4],
    ]
    curls.forEach(([dx, dy, r], i) => s.disc(x + dx, y + dy, r, i % 2 ? hair[0] : hair[1]))
    faceBase(s, x + 0.6, y + 1.2, skin)
    ;[[-7, -2, 2.4], [-2, -8, 2.5], [3, -11, 2.4], [7, -6, 2.2], [-4, -13, 1.8]].forEach(([dx, dy, r], i) => {
      s.disc(x + dx, y + dy, r, i % 2 ? hair[0] : hair[2])
    })
    s.limb(x + 1.6, y - 2.2, x + 5.8, y - 1.5, 0.42, hair[2], hair[2], hair[2])
    eye(s, x + 3.8, y - 0.1, "#24180e")
    nose(s, x + 7.3, y + 1.8, skin[2])
    s.px(x + 5, y + 4.2, "#b07068")
    return
  }
  if (look === "plaid") {
    const hair = ["#f0d0a0", "#d0a060", "#8a6234"]
    const skin = ["#f8d8c0", "#efc0a0", "#d09878"]
    s.disc(x - 1, y - 8, 6, hair[1])
    s.disc(x + 3, y - 10, 3.8, hair[0])
    s.disc(x - 6, y - 3, 3.4, hair[2])
    s.disc(x - 3, y - 12, 2.6, hair[1])
    s.disc(x + 2, y - 5, 2.8, hair[0])
    faceBase(s, x + 0.8, y + 1, skin)
    s.disc(x - 2, y - 9, 2.6, hair[0])
    s.disc(x + 4, y - 9, 2.3, hair[1])
    s.disc(x - 7, y - 2, 2.1, hair[2])
    s.disc(x + 1, y - 12, 2, hair[0])
    s.limb(x + 1.8, y - 2.5, x + 5.6, y - 1.8, 0.38, hair[2], hair[2], hair[2])
    eye(s, x + 3.6, y - 0.3, "#4e5844")
    nose(s, x + 7.5, y + 1.5, skin[2])
    s.disc(x - 1.6, y + 3.4, 1.55, "#e4e0d8")
    s.disc(x - 1.6, y + 3.4, 0.72, skin[1])
    s.px(x + 5.2, y + 4.2, "#c08078")
    return
  }
  const skin = ["#f8d0b0", "#e8a878", "#c07848"]
  const hair = ["#3a322c", "#1a140f", "#0c0a08"]
  s.disc(x, y - 6, 4, hair[1])
  faceBase(s, x, y + 1, skin)
  s.limb(x - 6, y - 5, x + 5, y - 6, 1.2, hair[0], hair[1], hair[2])
  eye(s, x + 3.4, y - 0.2, "#1a120e")
  nose(s, x + 7, y + 1.6, skin[2])
}

function flame(s, x, y) {
  const bits = [
    [0, 0, 2.2, "#fff6d0"],
    [3, -1, 2.4, "#ffe14a"],
    [-2, 1, 1.8, "#ffe14a"],
    [6, 1, 2.6, "#ffb020"],
    [2, 3, 2.2, "#ff6a20"],
    [9, 0, 2.4, "#ff6a20"],
    [4, -3, 1.6, "#ffe14a"],
    [11, 2, 2.2, "#e01810"],
    [-1, -2, 1.4, "#fff6d0"],
    [7, 4, 2, "#e01810"],
    [8, -2, 1.8, "#ffb020"],
    [13, 1, 1.6, "#fff6d0"],
  ]
  bits.forEach(([dx, dy, r, color]) => s.disc(x + dx, y + dy, r, color))
}

function along(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

function fighterSheet(look, pose, mirror) {
  const s = sheet()
  const skin = ["#f8d0b0", "#e8a878", "#c07848"]
  const cloth = {
    gi: ["#f7fbf2", "#d7e4c8", "#8ea67a"],
    green: ["#8dff9e", "#22c84c", "#0c6e30"],
    fan: ["#ff9ae0", "#e040c0", "#8a1868"],
    plaid: ["#fff6ea", "#e7dcc8", "#b09878"],
    lobster: ["#ffb0a8", "#ff3535", "#9a1818"],
    lantern: ["#ffc4d0", "#ef7392", "#a04058"],
  }[look]
  const main = mirror ? ["#ffb4b0", "#ff3535", "#b01818"] : cloth
  const pants = look === "green" ? ["#4a4036", "#1a1612", "#0c0a08"] : look === "plaid" ? ["#f0ddb8", "#c6b496", "#8a7450"] : main
  const feet = look === "green" ? ["#f4a068", "#e07038", "#b85020"] : look === "plaid" ? ["#ffffff", "#e4e0d8", "#6e6458"] : skin
  const leg = look === "plaid" ? skin : pants

  if (pose === "ko") {
    s.limb(8, 70, 36, 66, 6, skin[0], skin[1], skin[2])
    s.limb(30, 66, 78, 64, 7, main[0], main[1], main[2])
    s.limb(70, 66, 118, 68, 5, leg[0], leg[1], leg[2])
    portrait(s, 16, 58, look)
    return bake(s, 40)
  }

  const j = {
    head: [34, 18],
    neck: [34, 30],
    chest: [36, 40],
    hip: [34, 54],
    shB: [28, 32],
    elB: [18, 40],
    haB: [22, 48],
    shF: [42, 32],
    elF: [52, 28],
    haF: [48, 20],
    hipB: [28, 54],
    knB: [22, 68],
    foB: [24, 84],
    hipF: [40, 54],
    knF: [50, 68],
    foF: [58, 84],
  }

  if (pose === "punch") {
    j.elF = [74, 34]
    j.haF = [104, 32]
    j.chest = [40, 40]
    j.head = [38, 18]
  }
  if (pose === "kick") {
    j.head = [20, 38]
    j.neck = [28, 40]
    j.chest = [42, 44]
    j.hip = [60, 48]
    j.hipB = [54, 50]
    j.knB = [48, 64]
    j.foB = [44, 84]
    j.hipF = [64, 46]
    j.knF = [98, 34]
    j.foF = [136, 26]
    j.shB = [32, 42]
    j.elB = [24, 50]
    j.haB = [18, 58]
    j.shF = [48, 40]
    j.elF = [56, 34]
    j.haF = [66, 30]
  }
  if (pose === "block") {
    j.elF = [46, 24]
    j.haF = [40, 16]
    j.elB = [36, 28]
    j.haB = [48, 22]
  }
  if (pose === "hurt") {
    j.head = [22, 18]
    j.neck = [26, 28]
    j.chest = [30, 40]
    j.hip = [38, 54]
    j.shB = [26, 34]
    j.elB = [16, 26]
    j.haB = [10, 16]
    j.shF = [34, 32]
    j.elF = [22, 22]
    j.haF = [14, 12]
    j.hipB = [32, 56]
    j.knB = [26, 70]
    j.foB = [28, 84]
    j.hipF = [44, 54]
    j.knF = [54, 70]
    j.foF = [62, 84]
  }
  if (pose === "buckle") {
    j.head = [52, 34]
    j.neck = [46, 36]
    j.chest = [40, 46]
    j.hip = [32, 56]
    j.shB = [34, 42]
    j.elB = [44, 50]
    j.haB = [52, 56]
    j.shF = [42, 40]
    j.elF = [54, 46]
    j.haF = [62, 52]
    j.hipB = [28, 56]
    j.knB = [22, 70]
    j.foB = [24, 84]
    j.hipF = [40, 56]
    j.knF = [34, 72]
    j.foF = [30, 84]
  }
  if (pose === "fire") {
    j.chest = [44, 40]
    j.head = [40, 18]
    j.elF = [62, 38]
    j.haF = [84, 36]
    j.knF = [58, 68]
    j.foF = [70, 84]
    j.foB = [16, 84]
  }
  if (pose === "fan") {
    j.elF = [50, 16]
    j.haF = [62, 8]
  }

  const sleeve = look === "lobster" ? skin : main
  const dress = look === "fan" || look === "lantern"

  s.limb(j.hipB[0], j.hipB[1], j.knB[0], j.knB[1], 5, leg[0], leg[1], leg[2])
  s.limb(j.knB[0], j.knB[1], j.foB[0], j.foB[1], 4, leg[0], leg[1], leg[2])
  s.limb(j.shB[0], j.shB[1], j.elB[0], j.elB[1], 4, sleeve[0], sleeve[1], sleeve[2])
  s.limb(j.elB[0], j.elB[1], j.haB[0], j.haB[1], 3, sleeve[0], sleeve[1], sleeve[2])

  if (dress) {
    const [hx, hy] = j.hip
    for (let row = 0; row < 32; row += 0.5) {
      const half = 10 + row * 0.42
      const y = hy + row
      s.limb(hx - half, y, hx + half, y, 0.55, main[0], main[1], main[2])
    }
    if (look === "fan") {
      s.disc(j.hip[0] - 4, j.hip[1] + 10, 2.4, "#3a62e0")
      s.disc(j.hip[0] + 6, j.hip[1] + 16, 1.8, "#6a8cff")
      s.disc(j.hip[0] - 1, j.hip[1] + 22, 2.1, "#3a62e0")
      s.disc(j.hip[0] + 3, j.hip[1] + 26, 1.4, "#1c3f9a")
    }
  } else {
    s.limb(j.hipF[0], j.hipF[1], j.knF[0], j.knF[1], 5, leg[0], leg[1], leg[2])
    s.limb(j.knF[0], j.knF[1], j.foF[0], j.foF[1], 4, leg[0], leg[1], leg[2])
  }

  if (look === "plaid") {
    const sb = along(j.hipB, j.knB, 0.42)
    const sf = along(j.hipF, j.knF, 0.42)
    s.limb(j.hipB[0], j.hipB[1], sb[0], sb[1], 6, pants[0], pants[1], pants[2])
    s.limb(j.hipF[0], j.hipF[1], sf[0], sf[1], 6, pants[0], pants[1], pants[2])
  }

  s.limb(j.neck[0], j.neck[1], j.chest[0], j.chest[1], 7, main[0], main[1], main[2])
  s.disc(j.chest[0], j.chest[1] - 4, 8, main[1])
  s.disc(j.chest[0] - 2, j.chest[1] - 7, 5, main[0])
  if (look === "gi") {
    s.limb(j.hip[0] - 7, j.hip[1] - 2, j.hip[0] + 7, j.hip[1] - 2, 1.1, "#14110e", "#14110e", "#14110e")
    s.limb(j.chest[0] - 2, j.chest[1] - 10, j.hip[0] - 1, j.hip[1] - 4, 0.7, main[2], main[2], "#5e7054")
    s.limb(j.chest[0] + 3, j.chest[1] - 10, j.hip[0] + 2, j.hip[1] - 4, 0.7, main[2], main[2], "#5e7054")
  }
  if (look === "plaid") {
    for (let row = 0; row < 3; row += 1) {
      s.limb(j.chest[0] - 8, j.chest[1] - 9 + row * 4, j.chest[0] + 8, j.chest[1] - 9 + row * 4, 0.7, "#ff4a42", "#d02828", "#8a1010")
    }
  }
  if (dress) s.limb(j.hip[0] - 9, j.hip[1], j.hip[0] + 9, j.hip[1], 0.8, "#14110e", "#14110e", "#14110e")

  s.limb(j.shF[0], j.shF[1], j.elF[0], j.elF[1], 4, sleeve[0], sleeve[1], sleeve[2])
  s.limb(j.elF[0], j.elF[1], j.haF[0], j.haF[1], 3, sleeve[0], sleeve[1], sleeve[2])
  s.disc(j.haF[0], j.haF[1], 3.4, skin[1])
  s.disc(j.haF[0] + 2.2, j.haF[1] - 0.4, 1.1, skin[0])
  s.disc(j.haB[0], j.haB[1], 2.8, skin[1])
  s.disc(j.foB[0], j.foB[1], 3.6, feet[1])
  s.disc(j.foB[0] - 1, j.foB[1] - 1, 1.4, feet[0])
  if (!dress || pose === "kick") {
    s.disc(j.foF[0], j.foF[1], 3.6, feet[1])
    s.disc(j.foF[0] - 1, j.foF[1] - 1, 1.4, feet[0])
  }
  if (look === "plaid") {
    s.disc(j.foB[0], j.foB[1] + 1.2, 4.2, "#f7f4ee")
    s.disc(j.foF[0], j.foF[1] + 1.2, 4.2, "#f7f4ee")
    s.limb(j.foB[0] - 3, j.foB[1] + 3.2, j.foB[0] + 3, j.foB[1] + 3.2, 0.7, "#3a342c", "#3a342c", "#3a342c")
    s.limb(j.foF[0] - 3, j.foF[1] + 3.2, j.foF[0] + 3, j.foF[1] + 3.2, 0.7, "#3a342c", "#3a342c", "#3a342c")
  }

  if (look === "fan" && (pose === "fan" || pose === "idle" || pose === "block")) {
    const [x, y] = j.haF
    for (let a = -1.15; a <= 0.7; a += 0.13) {
      s.limb(x + Math.cos(a) * 3, y + Math.sin(a) * 3, x + Math.cos(a) * 16, y + Math.sin(a) * 16, 0.55, "#d7e4ff", "#6a92f0", "#1c3f9a")
    }
    s.limb(x, y, x + 4, y + 10, 0.8, "#1a140f", "#1a140f", "#1a140f")
  }
  if (look === "lantern") {
    s.disc(j.haB[0], j.haB[1] - 8, 5.5, "#ffe14a")
    s.disc(j.haB[0], j.haB[1] - 8, 3.2, "#fff6d0")
    s.limb(j.haB[0] - 6, j.haB[1] - 13, j.haB[0] + 6, j.haB[1] - 13, 0.8, "#e01810", "#e01810", "#e01810")
    s.px(j.haB[0], j.haB[1] - 15, "#e01810")
  }
  if (look === "lobster") {
    s.disc(j.chest[0], j.chest[1], 13, main[1])
    s.disc(j.chest[0] + 2, j.chest[1] + 2, 6, "#ffd0c4")
    s.disc(j.haF[0] + 6, j.haF[1], 6.5, main[0])
    s.limb(j.head[0] - 3, j.head[1] - 8, j.head[0] - 6, j.head[1] - 16, 1.1, main[0], main[1], main[2])
    s.limb(j.head[0] + 3, j.head[1] - 8, j.head[0] + 6, j.head[1] - 16, 1.1, main[0], main[1], main[2])
  }

  if (look !== "lobster") portrait(s, j.head[0], j.head[1], look)
  else {
    s.disc(j.head[0], j.head[1], 8, main[1])
    s.disc(j.head[0] + 3, j.head[1] - 1, 1.1, "#f7f4ee")
    s.disc(j.head[0] + 4, j.head[1] - 1, 0.6, "#14110e")
  }

  if (pose === "kick" && look === "gi") flame(s, j.foF[0] + 8, j.foF[1] - 1)
  if (pose === "fire") flame(s, j.haF[0] + 12, j.haF[1])
  if ((pose === "punch" || pose === "kick") && look === "lobster") flame(s, j.haF[0] + 14, j.haF[1])

  return bake(s, pose === "kick" ? j.foB[0] : j.foB[0])
}

const cache = new Map()

function spriteFor(look, pose, mirror) {
  const key = `${look}|${pose}|${mirror ? 1 : 0}`
  if (!cache.has(key)) cache.set(key, fighterSheet(look, pose, mirror))
  return cache.get(key)
}

function poseOf(fighter) {
  if (fighter.state === "ko") return "ko"
  if (fighter.state === "hit") return fighter.react === "buckle" ? "buckle" : "hurt"
  if (fighter.state === "block") return "block"
  const active = fighter.move && fighter.moveFrame >= fighter.move.startup
  if (!active) return "idle"
  if (fighter.look === "green" && fighter.state === "special") return "fire"
  if (fighter.look === "fan" && (fighter.state === "punch" || fighter.state === "special")) return "fan"
  if (fighter.state === "kick" || (fighter.state === "special" && fighter.look === "gi")) return "kick"
  if (fighter.state === "punch" || fighter.state === "special") return "punch"
  return "idle"
}

export function drawFighter(ctx, fighter) {
  const zoom = fighter.zoom || (fighter.scale && fighter.scale < 0.8 ? 0.5 : 1)
  const pose = poseOf(fighter)
  const sprite = spriteFor(fighter.look || "gi", pose, fighter.mirror)
  const bob = fighter.state === "walk" ? (Math.floor((fighter.anim || 0) / 5) % 2) * 2 : 0
  ctx.save()
  ctx.translate(fighter.x, fighter.y - bob)
  ctx.scale((fighter.facing || 1) * zoom, zoom)
  ctx.imageSmoothingEnabled = false
  if (fighter.state === "hit") {
    ctx.rotate(fighter.react === "buckle" ? 0.2 : -0.24)
    ctx.translate(fighter.react === "buckle" ? 6 : -10, fighter.react === "buckle" ? 4 : -6)
    if (fighter.flash > 2) ctx.filter = "brightness(2.1)"
  }
  ctx.drawImage(sprite.canvas, -sprite.anchor, -H + 16)
  ctx.filter = "none"
  ctx.restore()
}

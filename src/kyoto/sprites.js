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
          const shade = oy < -sr * 0.55 ? light : oy > sr * 0.62 ? dark : mid
          put(x + ox, y + oy, shade)
        }
      }
    }
  }
  const cap = (x, y, r, _light, mid) => {
    disc(x, y, r, mid)
  }
  return { px, disc, limb, cap, idx, cols }
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

function fighterSheet(look, pose, mirror) {
  const s = sheet()
  const skin = ["#f8d0b0", "#e8a878", "#c07848"]
  const cloth = {
    gi: ["#f7fbf2", "#e4eed8", "#b7c9a4"],
    green: ["#d8ffc8", "#3ad85a", "#1c9a38"],
    fan: ["#ffc4ee", "#ee62d0", "#b03090"],
    plaid: ["#fff8ee", "#f0e6d4", "#cbb89a"],
    lobster: ["#ffc4bc", "#ff4a42", "#c02020"],
    lantern: ["#ffd0da", "#f090a8", "#c05878"],
  }[look]
  const main = mirror ? ["#ffb4b0", "#ff3535", "#b01818"] : cloth
  const pants = look === "green" ? ["#4a4036", "#1a1612", "#0c0a08"] : look === "plaid" ? ["#f0ddb8", "#c6b496", "#8a7450"] : main
  const feet = look === "green" ? ["#f4a068", "#e07038", "#b85020"] : look === "plaid" ? ["#ffffff", "#e4e0d8", "#6e6458"] : skin
  const leg = look === "plaid" ? skin : pants
  const sleeve = look === "lobster" ? skin : main

  if (pose === "ko") {
    const ground = 82
    s.limb(62, ground, 84, 64, 5.2, leg[0], leg[1], leg[2])
    s.limb(84, 64, 102, ground + 2, 4.4, leg[0], leg[1], leg[2])
    s.cap(62, ground, 5.4, leg[0], leg[1], leg[2])
    s.cap(84, 64, 4.6, leg[0], leg[1], leg[2])
    s.limb(66, ground + 2, 92, ground + 4, 4.6, leg[0], leg[1], leg[2])
    s.limb(92, ground + 4, 112, ground, 4, leg[0], leg[1], leg[2])
    s.cap(112, ground, 4.2, feet[0], feet[1], feet[2])
    s.limb(30, 74, 60, ground - 4, 8.4, main[0], main[1], main[2])
    s.cap(46, ground - 6, 9.2, main[0], main[1], main[2])
    s.limb(28, 70, 20, 60, 3.6, sleeve[0], sleeve[1], sleeve[2])
    s.limb(20, 60, 14, 68, 3, skin[0], skin[1], skin[2])
    s.cap(14, 68, 3.2, skin[0], skin[1], skin[2])
    s.limb(42, 72, 54, 64, 3.4, sleeve[0], sleeve[1], sleeve[2])
    s.cap(54, 64, 3.2, skin[0], skin[1], skin[2])
    s.limb(24, 68, 34, 76, 4.2, skin[0], skin[1], skin[2])
    if (look === "gi") s.limb(38, ground - 4, 54, ground - 4, 1.3, "#14110e", "#14110e", "#14110e")
    if (look !== "lobster") portrait(s, 18, 60, look)
    else {
      s.disc(18, 60, 8, main[1])
      s.disc(22, 58, 1.1, "#f7f4ee")
    }
    return bake(s, 70)
  }

  const j = {
    head: [36, 18],
    neck: [36, 30],
    chest: [37, 42],
    hip: [36, 56],
    shB: [24, 36],
    elB: [16, 48],
    haB: [20, 58],
    shF: [50, 36],
    elF: [58, 28],
    haF: [52, 18],
    hipB: [30, 58],
    knB: [24, 72],
    foB: [26, 84],
    hipF: [44, 58],
    knF: [52, 72],
    foF: [58, 84],
  }

  if (pose === "punch") {
    j.chest = [40, 42]
    j.head = [38, 18]
    j.neck = [39, 30]
    j.shF = [50, 38]
    j.elF = [64, 36]
    j.haF = [78, 34]
  }
  if (pose === "kick") {
    j.head = [28, 20]
    j.neck = [32, 32]
    j.chest = [38, 44]
    j.hip = [42, 56]
    j.hipB = [36, 58]
    j.knB = [32, 72]
    j.foB = [30, 84]
    j.hipF = [48, 52]
    j.knF = [66, 40]
    j.foF = [82, 32]
    j.shB = [28, 40]
    j.elB = [18, 50]
    j.haB = [16, 60]
    j.shF = [46, 40]
    j.elF = [54, 32]
    j.haF = [60, 24]
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
    j.elF = [58, 36]
    j.haF = [72, 34]
    j.knF = [58, 68]
    j.foF = [70, 84]
    j.foB = [16, 84]
  }
  if (pose === "fan") {
    j.elF = [50, 16]
    j.haF = [62, 8]
  }

  const dress = look === "fan" || look === "lantern"

  const seg = (a, b, r, colors) => {
    s.limb(a[0], a[1], b[0], b[1], r, colors[0], colors[1], colors[2])
    s.cap(a[0], a[1], r + 0.6, colors[0], colors[1], colors[2])
    s.cap(b[0], b[1], r * 0.92, colors[0], colors[1], colors[2])
  }

  seg(j.hipB, j.knB, 5.4, leg)
  seg(j.knB, j.foB, 4.4, leg)
  seg(j.shB, j.elB, 4.3, sleeve)
  seg(j.elB, j.haB, 3.5, sleeve)

  if (dress) {
    const [hx, hy] = j.hip
    for (let row = 0; row < 26; row += 1) {
      const half = 11 + row * 0.34
      s.limb(hx - half, hy + row, hx + half, hy + row, 1.35, main[0], main[1], main[2])
    }
    s.cap(j.hip[0], j.hip[1] + 2, 11, main[0], main[1], main[2])
    if (look === "fan") {
      s.disc(j.hip[0] - 4, j.hip[1] + 8, 2.2, "#3a62e0")
      s.disc(j.hip[0] + 5, j.hip[1] + 14, 1.7, "#6a8cff")
      s.disc(j.hip[0] - 1, j.hip[1] + 18, 1.9, "#3a62e0")
    }
  }
  if (!dress || pose === "kick") {
    seg(j.hipF, j.knF, 5.4, leg)
    seg(j.knF, j.foF, 4.4, leg)
  }

  s.limb(j.shB[0], j.shB[1], j.shF[0], j.shF[1], 7.2, main[0], main[1], main[2])
  s.limb(j.neck[0], j.neck[1], j.hip[0], j.hip[1], 8.6, main[0], main[1], main[2])
  s.cap(j.chest[0], j.chest[1], 10, main[0], main[1], main[2])
  s.cap(j.hip[0], j.hip[1], 8.2, main[0], main[1], main[2])
  s.limb(j.head[0], j.head[1] + 6, j.neck[0], j.chest[1] - 6, 4.4, skin[0], skin[1], skin[2])
  s.cap(j.neck[0], j.neck[1], 4.6, skin[0], skin[1], skin[2])
  s.cap(j.shB[0], j.shB[1], 5.6, main[0], main[1], main[2])
  s.cap(j.shF[0], j.shF[1], 5.6, main[0], main[1], main[2])
  s.disc(j.chest[0], j.chest[1], 8.2, main[1])
  s.disc(j.hip[0], j.hip[1] - 2, 6.2, main[1])
  if (look === "gi") {
    s.limb(j.hip[0] - 9, j.hip[1] - 1, j.hip[0] + 9, j.hip[1] - 1, 1.6, "#14110e", "#14110e", "#14110e")
    s.limb(j.chest[0] - 1, j.chest[1] - 8, j.hip[0] - 1, j.hip[1] - 3, 0.9, main[2], main[2], "#5e7054")
  }
  if (look === "plaid") {
    for (let row = 0; row < 3; row += 1) {
      s.limb(j.chest[0] - 9, j.chest[1] - 6 + row * 4, j.chest[0] + 9, j.chest[1] - 6 + row * 4, 1.05, "#ff4a42", "#d02828", "#8a1010")
    }
    s.limb(j.hip[0] - 13, j.hip[1] + 2, j.hip[0] + 14, j.hip[1] + 2, 5.2, pants[0], pants[1], pants[2])
    s.limb(j.hip[0] - 12, j.hip[1] + 8, j.hip[0] + 13, j.hip[1] + 8, 3.6, pants[0], pants[1], pants[2])
  }
  if (dress) s.limb(j.hip[0] - 10, j.hip[1] + 1, j.hip[0] + 10, j.hip[1] + 1, 1.15, "#14110e", "#14110e", "#14110e")

  seg(j.shF, j.elF, 4.4, sleeve)
  seg(j.elF, j.haF, 3.6, sleeve)
  const fist = (x, y) => {
    s.cap(x, y, 3.5, skin[0], skin[1], skin[2])
    s.disc(x + 2.1, y - 0.2, 1.15, skin[0])
  }
  fist(j.haF[0], j.haF[1])
  fist(j.haB[0], j.haB[1])
  const shoe = (x, y) => {
    s.cap(x, y - 1, 4.1, feet[0], feet[1], feet[2])
    s.disc(x + 2.6, y - 0.2, 2.5, feet[0])
    s.limb(x - 3, y + 2.4, x + 4.2, y + 2.6, 1.15, feet[2], feet[2], feet[2])
  }
  shoe(j.foB[0], j.foB[1])
  if (!dress || pose === "kick") shoe(j.foF[0], j.foF[1])
  if (look === "plaid") {
    const sneaker = (x, y) => {
      s.cap(x, y, 4.4, "#ffffff", "#f4f1ea", "#c8c2b6")
      s.disc(x + 2.8, y, 2.4, "#ffffff")
      s.limb(x - 3.2, y + 2.8, x + 4.4, y + 3, 1.2, "#3a342c", "#3a342c", "#3a342c")
    }
    sneaker(j.foB[0], j.foB[1])
    if (!dress || pose === "kick") sneaker(j.foF[0], j.foF[1])
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

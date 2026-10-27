import { drawFighter } from "./sprites"

const W = 640
const H = 360
const GROUND = 268
const LEFT = 46
const RIGHT = 594

const PUNCH = { name: "PUNCH", startup: 4, active: 6, recover: 10, dmg: 9, reach: 210, knock: 8, stun: 12 }
const KICK = { name: "KICK", startup: 6, active: 6, recover: 12, dmg: 13, reach: 240, knock: 12, stun: 14 }

export const ROSTER = [
  {
    id: "beka",
    name: "Beka",
    look: "gi",
    speed: 2.05,
    special: { name: "BLAZE", startup: 8, active: 5, recover: 16, dmg: 18, reach: 230, knock: 18, stun: 16, launch: true },
    colors: { skin: "#e4b48a", hair: "#241c16", shirt: "#f4f0e8", pants: "#b08960", shoe: "#d9c7a4", mark: "#5c3a28" },
  },
  {
    id: "niku",
    name: "Niku",
    look: "fan",
    speed: 2.2,
    special: { name: "FAN", startup: 7, active: 6, recover: 14, dmg: 13, reach: 220, knock: 11, stun: 20 },
    colors: { skin: "#e8c4a2", hair: "#1a120e", shirt: "#f7f4ee", pants: "#1e4634", shoe: "#efeae2" },
  },
  {
    id: "tika",
    name: "Tika",
    look: "green",
    speed: 2.45,
    slide: true,
    special: { name: "FIRE", startup: 4, active: 8, recover: 14, dmg: 14, reach: 240, knock: 16, stun: 12 },
    colors: { skin: "#efc9aa", hair: "#16110e", shirt: "#f3efe8", pants: "#6b4632", shoe: "#1a120e", vest: "#cbb89a" },
  },
  {
    id: "andria",
    name: "Andria",
    look: "plaid",
    speed: 2.75,
    special: { name: "FLURRY", startup: 2, active: 14, recover: 10, dmg: 6, reach: 210, knock: 5, stun: 7, windows: [2, 6, 10] },
    colors: { skin: "#f0c8a4", hair: "#8a5a32", shirt: "#e7e1d4", pants: "#c6b496", shoe: "#f6f3ee", stripe: "#9a3030", stripe2: "#7a7068" },
  },
  {
    id: "lobster",
    name: "Lobster",
    look: "lobster",
    speed: 1.8,
    special: { name: "PINCH", startup: 9, active: 6, recover: 16, dmg: 20, reach: 210, knock: 18, stun: 16, launch: true },
    colors: { skin: "#ff6a4a", hair: "#9a3030", shirt: "#ff3535", pants: "#9a3030", shoe: "#2a181c" },
  },
  {
    id: "lantern",
    name: "Lantern",
    look: "lantern",
    speed: 2.55,
    slide: true,
    special: { name: "GLOW", startup: 5, active: 8, recover: 12, dmg: 15, reach: 230, knock: 14, stun: 12 },
    colors: { skin: "#f1ebde", hair: "#1a1210", shirt: "#ef7392", pants: "#2a181c", shoe: "#f1ebde" },
  },
]

function cloneColors(colors, mirror) {
  if (!mirror) return colors
  return { ...colors, shirt: "#ff3535", pants: "#2a181c", vest: "#ef7392" }
}

function makeFighter(def, x, facing, mirror) {
  return {
    def,
    name: def.name,
    look: def.look,
    colors: cloneColors(def.colors, mirror),
    x,
    y: GROUND,
    vx: 0,
    vy: 0,
    facing,
    mirror: Boolean(mirror),
    hp: 100,
    score: 0,
    wins: 0,
    state: "idle",
    anim: 0,
    move: null,
    moveFrame: 0,
    stun: 0,
    flash: 0,
    react: "",
    spark: 0,
    hitWindows: new Set(),
  }
}

function resetPair(a, b) {
  a.x = 188
  b.x = 452
  a.y = b.y = GROUND
  a.vx = a.vy = b.vx = b.vy = 0
  a.hp = b.hp = 100
  a.state = b.state = "idle"
  a.stun = b.stun = 0
  a.move = b.move = null
  a.moveFrame = b.moveFrame = 0
  a.facing = 1
  b.facing = -1
  a.hitWindows = new Set()
  b.hitWindows = new Set()
}

function cardBox(i) {
  const col = i % 3
  const row = Math.floor(i / 3)
  return { x: 14 + col * 208, y: 62 + row * 146, w: 198, h: 138 }
}

function drawStage(ctx) {
  const bands = [
    [0, 28, "#2a140c", "#3a1c10"],
    [28, 24, "#6a3014", "#8a4018"],
    [52, 22, "#c46820", "#a85018"],
    [74, 26, "#e8a040", "#c88028"],
    [100, 28, "#f0c868", "#e0a848"],
    [128, 30, "#e8b050", "#c88830"],
    [158, 36, "#c07828", "#a06020"],
    [194, 40, "#8a4820", "#6a3018"],
    [234, GROUND - 234, "#6a3818", "#4a2810"],
  ]
  bands.forEach(([y, h, a, b]) => {
    ctx.fillStyle = a
    ctx.fillRect(0, y, W, h)
    ctx.fillStyle = b
    for (let yy = y; yy < y + h; yy += 2) {
      const nudge = (yy / 2) % 2
      for (let x = nudge; x < W; x += 2) ctx.fillRect(x, yy, 1, 1)
    }
  })

  const mesa = (x, base, peak, w) => {
    ctx.fillStyle = "#4a2814"
    ctx.beginPath()
    ctx.moveTo(x, base)
    ctx.lineTo(x + w * 0.22, peak)
    ctx.lineTo(x + w * 0.62, peak + 8)
    ctx.lineTo(x + w, base)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = "#2e160c"
    for (let yy = peak; yy < base; yy += 2) {
      const t = (yy - peak) / (base - peak)
      const left = x + w * 0.22 * (1 - t)
      const right = x + w * 0.62 + (w * 0.38) * t
      for (let xx = left; xx < right; xx += 2) if ((xx + yy) % 4 < 2) ctx.fillRect(xx, yy, 1, 1)
    }
    ctx.fillStyle = "#7a4a28"
    ctx.fillRect(x + w * 0.28, peak + 4, 3, base - peak - 8)
  }
  mesa(18, GROUND, 78, 150)
  mesa(430, GROUND - 6, 120, 90)
  mesa(560, GROUND, 150, 70)

  ctx.fillStyle = "#c02818"
  ctx.fillRect(500, 132, 6, 58)
  ctx.fillRect(556, 132, 6, 58)
  ctx.fillRect(494, 128, 68, 6)
  ctx.fillRect(498, 138, 60, 4)

  ctx.fillStyle = "#5a2814"
  ctx.fillRect(0, GROUND, W, H - GROUND)
  ctx.fillStyle = "#3a180c"
  for (let y = GROUND; y < H; y += 3) {
    ctx.fillRect(0, y, W, 1)
    for (let x = (y * 3) % 17; x < W; x += 17) ctx.fillRect(x, y + 1, 4, 1)
  }
  ctx.fillStyle = "#8a4824"
  for (let x = 0; x < W; x += 2) ctx.fillRect(x, GROUND, 1, 1)
}

function drawShadow(ctx, f) {
  ctx.fillStyle = "rgba(20, 8, 4, 0.55)"
  ctx.fillRect(f.x - 18, GROUND, 36, 3)
  ctx.fillRect(f.x - 10, GROUND + 3, 20, 2)
}

function lifeBar(ctx, x, hp, align) {
  const width = 210
  const y = 28
  const h = 12
  ctx.fillStyle = "#1a0804"
  ctx.fillRect(x - 2, y - 2, width + 4, h + 4)
  ctx.fillStyle = "#c01810"
  ctx.fillRect(x, y, width, h)
  const fill = Math.max(0, (hp / 100) * width)
  ctx.fillStyle = "#f0d020"
  if (align === "left") ctx.fillRect(x, y, fill, h)
  else ctx.fillRect(x + width - fill, y, fill, h)
  ctx.fillStyle = "#fff2a0"
  if (align === "left") ctx.fillRect(x, y, fill, 2)
  else ctx.fillRect(x + width - fill, y, fill, 2)
}

function drawHud(ctx, a, b, timer) {
  ctx.fillStyle = "#0a0604"
  ctx.fillRect(0, 0, W, 46)
  ctx.font = "800 15px Impact, Arial Black, sans-serif"
  ctx.textAlign = "left"
  ctx.fillStyle = "#f0d020"
  ctx.fillText("P1 -", 10, 20)
  ctx.fillText(String(a.score || 0).padStart(4, " "), 58, 20)
  ctx.textAlign = "right"
  ctx.fillText(String(b.score || 0).padStart(4, " "), W - 58, 20)
  ctx.fillText("P2 -", W - 10, 20)
  lifeBar(ctx, 8, a.hp, "left")
  lifeBar(ctx, W - 218, b.hp, "right")
  const label = String(timer).padStart(2, "0")
  ctx.font = "800 36px Impact, Arial Black, sans-serif"
  ctx.textAlign = "center"
  ctx.lineJoin = "round"
  ctx.lineWidth = 6
  ctx.strokeStyle = "#f0c018"
  ctx.strokeText(label, W / 2, 38)
  ctx.fillStyle = "#e01010"
  ctx.fillText(label, W / 2, 38)
  for (let i = 0; i < 2; i += 1) {
    ctx.fillStyle = a.wins > i ? "#f0d020" : "#3a180c"
    ctx.fillRect(8 + i * 8, 42, 6, 3)
    ctx.fillStyle = b.wins > i ? "#f0d020" : "#3a180c"
    ctx.fillRect(W - 14 - i * 8, 42, 6, 3)
  }
}

function centerBanner(ctx, text, sub) {
  ctx.font = "800 48px Impact, Arial Black, sans-serif"
  ctx.textAlign = "center"
  ctx.lineJoin = "round"
  ctx.lineWidth = 8
  ctx.strokeStyle = "#f0c018"
  ctx.strokeText(text, W / 2, 150)
  ctx.fillStyle = text === "FIGHT" ? "#f0d020" : "#e01010"
  ctx.fillText(text, W / 2, 150)
  if (sub) {
    ctx.font = "800 16px Impact, Arial Black, sans-serif"
    ctx.lineWidth = 4
    ctx.strokeText(sub, W / 2, 176)
    ctx.fillStyle = "#f0d020"
    ctx.fillText(sub, W / 2, 176)
  }
}
function emptyInput() {
  return { left: false, right: false, jump: false, block: false, punch: false, kick: false, special: false }
}

function cpuInput(me, foe) {
  const input = emptyInput()
  const dist = foe.x - me.x
  const ad = Math.abs(dist)
  const attacking = foe.move && foe.moveFrame >= Math.max(0, foe.move.startup - 2) && foe.moveFrame < foe.move.startup + foe.move.active
  const recovering = foe.move && foe.moveFrame >= foe.move.startup + foe.move.active
  if (attacking && ad < 240 && Math.random() < 0.7) {
    input.block = true
    return input
  }
  if (ad > 188) {
    input.left = dist < 0
    input.right = dist > 0
    return input
  }
  if (ad < 150) {
    input.left = dist > 0
    input.right = dist < 0
    return input
  }
  if (me.cpuWait > 0) {
    me.cpuWait -= 1
    if (attacking || Math.random() < 0.24) input.block = true
    return input
  }
  const roll = Math.random()
  if (recovering && roll < 0.55) {
    input.punch = true
    me.cpuWait = 10
  } else if (roll < 0.04) {
    input.special = true
    me.cpuWait = 30
  } else if (roll < 0.12) {
    input.kick = true
    me.cpuWait = 14
  } else if (roll < 0.22) {
    input.punch = true
    me.cpuWait = 10
  } else if (Math.random() < 0.34) input.block = true
  return input
}

function startMove(f, move, foe) {
  f.state = move === PUNCH ? "punch" : move === KICK ? "kick" : "special"
  f.move = move
  f.moveFrame = 0
  f.hitWindows = new Set()
  f.vx = 0
  if (!foe) return
  const dx = (foe.x - f.x) * f.facing
  if (dx > 172) f.vx = f.facing * 3.4
}

function control(f, input, foe) {
  f.anim += 1
  if (f.flash > 0) f.flash -= 1
  if (f.spark > 0) f.spark -= 1
  if (f.state === "ko") {
    f.vy += 0.55
    f.y += f.vy
    if (f.y > GROUND) {
      f.y = GROUND
      f.vy = 0
    }
    return
  }
  if (f.stun > 0) {
    f.stun -= 1
    f.vy += 0.55
    f.x += f.vx
    f.y += f.vy
    f.vx *= 0.8
    if (f.y >= GROUND) {
      f.y = GROUND
      f.vy = 0
    }
    if (f.stun <= 0 && f.hp > 0) f.state = "idle"
    f.x = Math.max(LEFT, Math.min(RIGHT, f.x))
    return
  }

  const busy = f.move != null
  const airborne = f.y < GROUND - 0.5
  if (!busy) {
    if (foe) f.facing = foe.x < f.x ? -1 : 1
    if (input.punch) startMove(f, PUNCH, foe)
    else if (input.kick) startMove(f, KICK, foe)
    else if (input.special) startMove(f, f.def.special, foe)
    else if (input.block && !airborne) {
      f.state = "block"
      f.vx = 0
    } else if (input.jump && !airborne) {
      f.vy = -9.4
      f.state = "jump"
      f.vx = (input.right ? 1 : 0) - (input.left ? 1 : 0)
      f.vx *= f.def.speed
    } else if (input.left || input.right) {
      f.state = airborne ? "jump" : "walk"
      f.vx = (input.right ? 1 : 0) - (input.left ? 1 : 0)
      f.vx *= f.def.speed
    } else {
      f.state = airborne ? "jump" : "idle"
      f.vx *= 0.5
    }
  } else if (f.state === "special" && f.def.slide && f.moveFrame < f.move.startup + f.move.active) {
    f.vx = f.facing * 6.2
  } else {
    f.vx *= 0.8
  }

  f.vy += 0.5
  f.x += f.vx
  f.y += f.vy
  if (f.y >= GROUND) {
    f.y = GROUND
    f.vy = 0
    if (f.state === "jump") f.state = "idle"
  }
  f.x = Math.max(LEFT, Math.min(RIGHT, f.x))

  if (busy) {
    const total = f.move.startup + f.move.active + f.move.recover
    if (f.moveFrame >= total) {
      f.move = null
      f.state = f.y < GROUND - 0.5 ? "jump" : "idle"
    } else f.moveFrame += 1
  }
}

function separate(a, b) {
  const gap = 164
  if (Math.abs(a.y - b.y) > 80) return
  if (Math.abs(a.x - b.x) >= gap) return
  const mid = (a.x + b.x) / 2
  if (a.x <= b.x) {
    a.x = mid - gap / 2
    b.x = mid + gap / 2
  } else {
    a.x = mid + gap / 2
    b.x = mid - gap / 2
  }
  a.x = Math.max(LEFT, Math.min(RIGHT, a.x))
  b.x = Math.max(LEFT, Math.min(RIGHT, b.x))
}

function connect(a, b, effects) {
  const m = a.move
  if (!m || a.state === "ko" || b.state === "ko") return
  let token = -1
  if (m.windows) {
    token = m.windows.findIndex((frame) => a.moveFrame === frame)
    if (token < 0 || a.hitWindows.has(token)) return
  } else if (a.moveFrame < m.startup || a.moveFrame >= m.startup + m.active || a.hitWindows.has(0)) {
    return
  } else token = 0
  const dx = (b.x - a.x) * a.facing
  if (dx <= 0 || dx > m.reach || Math.abs(a.y - b.y) > 96) {
    if (m.windows) a.hitWindows.add(token)
    return
  }
  a.hitWindows.add(token)
  const blocking = b.state === "block" && ((b.x - a.x) * a.facing > 0)
  const dmg = blocking ? 1 : m.dmg
  b.hp = Math.max(0, b.hp - dmg)
  a.score += dmg * 100
  const low = m === KICK || m.name === "BLAZE" || m.name === "PINCH"
  const knock = blocking ? 4 : m.knock
  b.vx = a.facing * knock * 0.45
  b.x += a.facing * Math.min(knock, 18)
  if (!blocking) {
    b.state = b.hp <= 0 ? "ko" : "hit"
    b.react = low ? "buckle" : "hurt"
    b.stun = b.hp <= 0 ? 999 : m.stun
    b.flash = 5
    b.spark = 7
    b.move = null
    b.vy = m.launch || b.hp <= 0 ? -7.2 : low ? -0.6 : -2.4
    effects.shake = Math.max(effects.shake, m.launch ? 8 : 5)
    effects.freeze = 3
    effects.popup = { x: b.x, y: b.y - 120, text: String(dmg), life: 28 }
    effects.sfx = b.hp <= 0 ? "ko" : "hit"
  } else {
    effects.sfx = "block"
    effects.shake = 2
  }
  if (b.hp <= 0) effects.ko = true
}

const KEYS = {
  KeyA: "left",
  KeyD: "right",
  KeyW: "jump",
  KeyS: "block",
  KeyJ: "punch",
  KeyK: "kick",
  KeyL: "special",
  ArrowLeft: "left2",
  ArrowRight: "right2",
  ArrowUp: "jump2",
  ArrowDown: "block2",
  Digit1: "punch2",
  Digit2: "kick2",
  Digit3: "special2",
  Numpad1: "punch2",
  Numpad2: "kick2",
  Numpad3: "special2",
  Enter: "start",
  Space: "start",
}

export function mountKyoto(canvas, { onStatus, reduce }) {
  canvas.width = W * 2
  canvas.height = H * 2
  const ctx = canvas.getContext("2d")
  const held = {}
  const prev = {}
  const releaseQueue = new Set()
  const bag = { human2: false }
  let queuedStart = false
  let p1 = 0
  let p2 = 3
  let fighters = null
  let phase = "title"
  let phaseT = 0
  let round = 1
  let timer = 99
  let timerT = 0
  let banner = ""
  let bannerSub = ""
  let shake = 0
  let freeze = 0
  let lastLine = ""
  let raf = 0
  let last = performance.now()
  let acc = 0
  const popups = []
  const titleCast = [
    { look: "fan", x: 352, facing: 1, zoom: 0.68 },
    { look: "green", x: 438, facing: 1, zoom: 0.68 },
    { look: "gi", x: 524, facing: 1, zoom: 0.68 },
    { look: "plaid", x: 608, facing: -1, zoom: 0.68 },
  ]
  const petals = Array.from({ length: 18 }, (_, i) => ({
    x: (i * 37) % W,
    y: (i * 53) % GROUND,
    s: 2 + (i % 3),
    v: 0.35 + (i % 4) * 0.12,
  }))
  let audio
  const sfx = (kind) => {
    if (reduce) return
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    if (!audio) audio = new AC()
    if (audio.state === "suspended") audio.resume()
    const play = (freq, dur, type, gain) => {
      const osc = audio.createOscillator()
      const amp = audio.createGain()
      osc.type = type
      osc.frequency.value = freq
      amp.gain.value = gain
      osc.connect(amp)
      amp.connect(audio.destination)
      osc.start()
      amp.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + dur)
      osc.stop(audio.currentTime + dur)
    }
    if (kind === "hit") play(180, 0.08, "square", 0.04)
    else if (kind === "block") play(90, 0.05, "square", 0.03)
    else if (kind === "ko") {
      play(140, 0.3, "sawtooth", 0.05)
      play(70, 0.4, "square", 0.04)
    } else if (kind === "start") play(440, 0.08, "square", 0.03)
  }

  const report = (line) => {
    if (line === lastLine) return
    lastLine = line
    onStatus({ phase, line })
  }

  const beginMatch = () => {
    const same = p1 === p2
    fighters = [makeFighter(ROSTER[p1], 188, 1, false), makeFighter(ROSTER[p2], 452, -1, same)]
    round = 1
    timer = 99
    timerT = 0
    phase = "intro"
    phaseT = 0
    banner = "ROUND 1"
    bannerSub = "FIGHT"
    sfx("start")
  }

  const finishRound = (reason) => {
    const [a, b] = fighters
    if (a.hp === b.hp) banner = "DRAW"
    else if (a.hp > b.hp) {
      a.wins += 1
      banner = reason === "time" ? "TIME" : "K.O."
    } else {
      b.wins += 1
      banner = reason === "time" ? "TIME" : "K.O."
    }
    bannerSub = a.hp !== b.hp ? `${a.hp > b.hp ? a.name : b.name} takes the round` : "Again"
    phase = "ko"
    phaseT = 0
  }

  const edge = (name) => held[name] && !prev[name]

  const update = () => {
    petals.forEach((p) => {
      p.y += p.v
      p.x += 0.25
      if (p.y > H) {
        p.y = -4
        p.x = Math.random() * W
      }
    })
    const start = edge("start") || queuedStart
    queuedStart = false

    if (phase === "title") {
      report("Kyoto. Press start.")
      if (start) {
        phase = "select"
        sfx("start")
      }
    } else if (phase === "select") {
      if (edge("left")) p1 = (p1 + ROSTER.length - 1) % ROSTER.length
      if (edge("right")) p1 = (p1 + 1) % ROSTER.length
      if (edge("left2")) p2 = (p2 + ROSTER.length - 1) % ROSTER.length
      if (edge("right2")) p2 = (p2 + 1) % ROSTER.length
      const rival = bag.human2 ? "2P" : "CPU"
      report(`${ROSTER[p1].name} vs ${ROSTER[p2].name}. ${rival}. Press start.`)
      if (start) beginMatch()
    } else if (phase === "intro") {
      phaseT += 1
      report(`${banner}. ${fighters[0].name} vs ${fighters[1].name}.`)
      if (phaseT === 40) banner = "FIGHT"
      if (phaseT > 70) {
        phase = "fight"
        timer = 99
        timerT = 0
      }
    } else if (phase === "fight") {
      const [a, b] = fighters
      const inputA = {
        left: !!held.left,
        right: !!held.right,
        jump: edge("jump"),
        block: !!held.block,
        punch: edge("punch"),
        kick: edge("kick"),
        special: edge("special"),
      }
      const inputB = bag.human2
        ? {
            left: !!held.left2,
            right: !!held.right2,
            jump: edge("jump2"),
            block: !!held.block2,
            punch: edge("punch2"),
            kick: edge("kick2"),
            special: edge("special2"),
          }
        : cpuInput(b, a)
      if (freeze > 0) freeze -= 1
      else {
        control(a, inputA, b)
        control(b, inputB, a)
        separate(a, b)
        const effects = { shake: 0, freeze: 0, sfx: "", ko: false, popup: null }
        connect(a, b, effects)
        connect(b, a, effects)
        if (effects.popup) popups.push(effects.popup)
        if (effects.shake) shake = Math.max(shake, effects.shake)
        if (effects.freeze) freeze = effects.freeze
        if (effects.sfx) sfx(effects.sfx)
        if (a.hp <= 0 || b.hp <= 0) finishRound("ko")
        else {
          timerT += 1
          if (timerT >= 60) {
            timerT = 0
            timer -= 1
            if (timer <= 0) finishRound("time")
          }
        }
      }
      report(`Round ${round}. ${a.name} ${a.hp}. ${b.name} ${b.hp}.`)
    } else if (phase === "ko") {
      phaseT += 1
      const [a, b] = fighters
      control(a, emptyInput(), b)
      control(b, emptyInput(), a)
      report(`${banner}. ${a.name} ${a.wins}. ${b.name} ${b.wins}.`)
      if (phaseT > 88) {
        if (a.wins >= 2 || b.wins >= 2) {
          phase = "winner"
          phaseT = 0
          sfx("start")
        } else {
          round += 1
          resetPair(a, b)
          timer = 99
          timerT = 0
          phase = "intro"
          phaseT = 0
          banner = `ROUND ${round}`
          bannerSub = "FIGHT"
        }
      }
    } else if (phase === "winner") {
      const winner = fighters[0].wins > fighters[1].wins ? fighters[0] : fighters[1]
      report(`${winner.name} wins.`)
      if (start) {
        phase = "select"
        fighters = null
        sfx("start")
      }
    }

    releaseQueue.forEach((name) => {
      held[name] = false
    })
    releaseQueue.clear()
    for (const key of Object.keys(held)) prev[key] = held[key]
    for (const key of Object.keys(prev)) if (!held[key]) prev[key] = false
    popups.forEach((p) => {
      p.y -= 0.6
      p.life -= 1
    })
    for (let i = popups.length - 1; i >= 0; i -= 1) if (popups[i].life <= 0) popups.splice(i, 1)
  }

  const draw = () => {
    ctx.setTransform(2, 0, 0, 2, 0, 0)
    ctx.imageSmoothingEnabled = false
    ctx.fillStyle = "#14110f"
    ctx.fillRect(0, 0, W, H)
    if (phase === "title") {
      drawStage(ctx)
      titleCast.forEach((fighter) => {
        const body = { ...fighter, y: GROUND, state: "idle", anim: 0 }
        drawShadow(ctx, body)
        drawFighter(ctx, body)
      })
      ctx.fillStyle = "#14110f"
      ctx.fillRect(0, 0, 300, H)
      ctx.fillStyle = "#ff3535"
      ctx.fillRect(0, 0, 8, H)
      ctx.fillStyle = "#f1ebde"
      ctx.textAlign = "left"
      ctx.font = "800 52px Syne, sans-serif"
      ctx.fillText("KYOTO", 28, 128)
      ctx.fillStyle = "#ff3535"
      ctx.font = "700 14px Syne, sans-serif"
      ctx.fillText("LOBSTER ROCK   1996", 32, 156)
      ctx.fillStyle = "#cbb3a6"
      ctx.font = "600 13px Syne, sans-serif"
      ctx.fillText("BEKA   NIKU   TIKA   ANDRIA", 32, 196)
      if (Math.floor(performance.now() / 420) % 2 === 0) {
        ctx.fillStyle = "#f1ebde"
        ctx.font = "800 18px Syne, sans-serif"
        ctx.fillText("PRESS START", 32, 258)
      }
      return
    }

    if (phase === "select") {
      drawStage(ctx, phaseT, petals)
      ctx.fillStyle = "rgba(12, 8, 8, 0.72)"
      ctx.fillRect(0, 0, W, H)
      ctx.fillStyle = "#f1ebde"
      ctx.textAlign = "center"
      ctx.font = "800 28px Syne, sans-serif"
      ctx.fillText("SELECT", W / 2, 36)
      ctx.font = "700 12px Syne, sans-serif"
      ctx.fillStyle = "#cbb3a6"
      ctx.fillText(bag.human2 ? "2 PLAYERS" : "VS CPU", W / 2, 52)
      ROSTER.forEach((def, i) => {
        const box = cardBox(i)
        ctx.fillStyle = "#2a181c"
        ctx.fillRect(box.x, box.y, box.w, box.h)
        ctx.lineWidth = 3
        if (i === p1) {
          ctx.strokeStyle = "#ff3535"
          ctx.strokeRect(box.x, box.y, box.w, box.h)
        } else if (i === p2) {
          ctx.strokeStyle = "#ef7392"
          ctx.strokeRect(box.x, box.y, box.w, box.h)
        }
        const preview = {
          x: 0,
          y: 0,
          facing: 1,
          state: "idle",
          anim: Math.floor(performance.now() / 16),
          look: def.look,
          def,
          scale: 0.48,
          move: null,
          moveFrame: 0,
        }
        ctx.save()
        ctx.translate(box.x + box.w / 2, box.y + 108)
        drawFighter(ctx, preview)
        ctx.restore()
        ctx.fillStyle = "#f1ebde"
        ctx.font = "800 14px Syne, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(def.name.toUpperCase(), box.x + box.w / 2, box.y + 118)
        ctx.fillStyle = "#ef7392"
        ctx.font = "700 11px Syne, sans-serif"
        ctx.fillText(def.special.name, box.x + box.w / 2, box.y + 132)
      })
      return
    }

    ctx.save()
    if (shake > 0.4 && !reduce) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake)
      shake *= 0.82
    } else shake = 0
    drawStage(ctx, phaseT, petals)
    if (fighters) {
      drawShadow(ctx, fighters[0])
      drawShadow(ctx, fighters[1])
      const ordered = fighters[0].x < fighters[1].x ? fighters : [fighters[1], fighters[0]]
      ordered.forEach((f) => drawFighter(ctx, f))
      fighters.forEach((f) => {
        if (f.spark <= 0) return
        const y = f.y - (f.react === "buckle" ? 86 : 124)
        const bits = [
          [0, 0, 4, "#fff6d0"],
          [-8, -4, 3, "#ffe14a"],
          [7, -2, 3, "#ff6a20"],
          [-3, 6, 2, "#fff6d0"],
          [5, 5, 2, "#e01810"],
          [0, -8, 2, "#ffe14a"],
        ]
        bits.forEach(([dx, dy, s, color], i) => {
          if ((f.spark + i) % 2 === 0) return
          ctx.fillStyle = color
          ctx.fillRect(f.x + dx - s / 2, y + dy, s, s)
        })
      })
      drawHud(ctx, fighters[0], fighters[1], phase === "fight" ? timer : 99)
      popups.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life / 28)
        ctx.fillStyle = "#ff3535"
        ctx.font = "800 16px Syne, sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(p.text, p.x, p.y)
        ctx.globalAlpha = 1
      })
    }
    if (phase === "intro") centerBanner(ctx, banner, phaseT > 40 ? "" : bannerSub)
    if (phase === "ko") centerBanner(ctx, banner, bannerSub)
    if (phase === "winner" && fighters) {
      const winner = fighters[0].wins >= 2 ? fighters[0] : fighters[1]
      centerBanner(ctx, `${winner.name.toUpperCase()} WINS`, "PRESS START")
    }
    ctx.restore()
  }

  const frame = (now) => {
    acc += Math.min(48, now - last)
    last = now
    while (acc >= 16.67) {
      update()
      acc -= 16.67
    }
    draw()
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  const press = (name) => {
    held[name] = true
    releaseQueue.delete(name)
  }
  const unpress = (name) => {
    releaseQueue.add(name)
  }
  const onKeyDown = (event) => {
    const name = KEYS[event.code]
    if (!name) return
    event.preventDefault()
    press(name)
  }
  const onKeyUp = (event) => {
    const name = KEYS[event.code]
    if (!name) return
    unpress(name)
  }
  const clearHeld = () => {
    Object.keys(held).forEach((key) => {
      held[key] = false
    })
    releaseQueue.clear()
  }
  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)
  window.addEventListener("blur", clearHeld)

  const onPointer = (event) => {
    const rect = canvas.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * W
    const y = ((event.clientY - rect.top) / rect.height) * H
    if (phase === "title" || phase === "winner") {
      queuedStart = true
      return
    }
    if (phase !== "select") return
    ROSTER.forEach((_, i) => {
      const box = cardBox(i)
      if (x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h) {
        if (i === p1) p2 = i
        else p1 = i
      }
    })
  }
  canvas.addEventListener("pointerdown", onPointer)

  bag.down = (name) => {
    press(name)
  }
  bag.up = (name) => {
    unpress(name)
  }
  bag.start = () => {
    queuedStart = true
  }
  bag.nudgeP1 = (dir) => {
    if (phase === "select") p1 = (p1 + dir + ROSTER.length) % ROSTER.length
  }
  bag.nudgeRival = (dir) => {
    if (phase === "select") p2 = (p2 + dir + ROSTER.length) % ROSTER.length
  }
  bag.setMode = (human2) => {
    bag.human2 = human2
  }
  bag.destroy = () => {
    cancelAnimationFrame(raf)
    window.removeEventListener("keydown", onKeyDown)
    window.removeEventListener("keyup", onKeyUp)
    window.removeEventListener("blur", clearHeld)
    canvas.removeEventListener("pointerdown", onPointer)
    if (audio) audio.close()
  }
  return bag
}

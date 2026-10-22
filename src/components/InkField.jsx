import { useEffect, useRef } from "react"

const VERT = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

const FRAG = `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_night;
uniform vec3 u_tint;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  vec2 m = (u_mouse - 0.5) * vec2(u_res.x / u_res.y, 1.0);
  float n1 = noise(p * 1.35 + vec2(u_time * 0.035, -u_time * 0.02));
  vec2 q = p + vec2(n1, noise(p * 2.1 - u_time * 0.04)) * 0.55;
  q += (m - p) * 0.08;
  float a = noise(q * 2.15 + u_time * 0.05);
  float b = noise(q * 3.3 - u_time * 0.045 + 6.2);
  float c = noise(q * 1.2 + vec2(4.0, u_time * 0.03));

  vec3 paper = vec3(0.953, 0.918, 0.863);
  vec3 rose = vec3(0.96, 0.62, 0.68);
  vec3 mint = vec3(0.45, 0.78, 0.62);
  vec3 gold = vec3(0.93, 0.78, 0.42);
  vec3 red = vec3(0.89, 0.28, 0.22);
  vec3 col = paper;
  col = mix(col, mix(rose, u_tint, 0.55), smoothstep(0.42, 0.82, a) * 0.72);
  col = mix(col, mint, smoothstep(0.5, 0.88, b) * 0.42);
  col = mix(col, gold, smoothstep(0.62, 0.9, c) * 0.28);
  float bloom = smoothstep(0.55, 0.0, length(p - m * 0.65) + (a - 0.5) * 0.35);
  col = mix(col, red, bloom * 0.22);

  float center = smoothstep(0.95, 0.15, length(p));
  col = mix(col, paper, center * 0.38);

  vec3 night = vec3(0.055, 0.04, 0.07);
  vec3 glow = mix(u_tint, vec3(0.95, 0.45, 0.38), 0.35);
  vec3 nightCol = mix(night, glow, 0.22 + bloom * 0.45 + a * 0.18);
  col = mix(col, nightCol, u_night);

  float g = hash(gl_FragCoord.xy + fract(u_time * 0.15));
  col += (g - 0.5) * 0.03;
  gl_FragColor = vec4(col, 1.0);
}
`

export default function InkField({ night, tint }) {
  const ref = useRef(null)
  const nightRef = useRef(night)
  const tintRef = useRef(tint)
  nightRef.current = night
  tintRef.current = tint

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false })
    if (!gl) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const compile = (type, src) => {
      const shader = gl.createShader(type)
      gl.shaderSource(shader, src)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program))
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(program, "a_pos")
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_res")
    const uTime = gl.getUniformLocation(program, "u_time")
    const uMouse = gl.getUniformLocation(program, "u_mouse")
    const uNight = gl.getUniformLocation(program, "u_night")
    const uTint = gl.getUniformLocation(program, "u_tint")

    const mouse = { x: 0.7, y: 0.4, tx: 0.7, ty: 0.4 }
    const nightV = { v: 0, t: 0 }
    const tintV = { r: 0.89, g: 0.32, b: 0.28, tr: 0.89, tg: 0.32, tb: 0.28 }
    let frame = 0
    let running = true

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()

    const onMove = (e) => {
      mouse.tx = e.clientX / window.innerWidth
      mouse.ty = 1 - e.clientY / window.innerHeight
    }
    window.addEventListener("pointermove", onMove)
    window.addEventListener("resize", resize)

    const draw = (now) => {
      if (!running) return
      mouse.x += (mouse.tx - mouse.x) * 0.05
      mouse.y += (mouse.ty - mouse.y) * 0.05
      nightV.t = nightRef.current ? 1 : 0
      nightV.v += (nightV.t - nightV.v) * 0.04
      const liveTint = tintRef.current
      tintV.tr = liveTint[0]
      tintV.tg = liveTint[1]
      tintV.tb = liveTint[2]
      tintV.r += (tintV.tr - tintV.r) * 0.04
      tintV.g += (tintV.tg - tintV.g) * 0.04
      tintV.b += (tintV.tb - tintV.b) * 0.04
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, reduce ? 4 : now * 0.001)
      gl.uniform2f(uMouse, mouse.x, mouse.y)
      gl.uniform1f(uNight, nightV.v)
      gl.uniform3f(uTint, tintV.r, tintV.g, tintV.b)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      running = false
      cancelAnimationFrame(frame)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("resize", resize)
      gl.deleteProgram(program)
      gl.deleteBuffer(buffer)
    }
  }, [])

  return <canvas id="ink" ref={ref} aria-hidden="true" />
}

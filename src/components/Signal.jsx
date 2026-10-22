import { useState } from "react"
import { VIDEOS, SONGS } from "../data"
import { asset } from "../asset"
import ScrollReel from "./ScrollReel"

const FILMS = VIDEOS.slice(0, 4)

const FRAMES = [
  { src: "/photos/phone.jpg", alt: "The band photographed from above in a tiled room, one holding a sunflower." },
  { src: "/photos/red-couch.jpg", alt: "The band around a red sofa in front of gold curtains." },
  { src: "/photos/egg.jpg", alt: "Members of the band on a mustard sofa under a fried-egg sculpture." },
  { src: "/photos/festival.jpg", alt: "A guitarist playing to a packed outdoor crowd." },
  { src: "/photos/club-red.jpg", alt: "The band under red light in a brick club." },
]

function Film({ video, active, setActive }) {
  const playing = active === video.id
  return (
    <button
      className="film"
      onClick={() => setActive(video.id)}
      aria-label={`Play ${video.title}`}
    >
      {playing ? (
        <iframe
          title={video.title}
          src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <>
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt=""
          />
          <i className="play">▶</i>
          <span>{video.title}</span>
        </>
      )}
    </button>
  )
}

export function Listen() {
  return (
    <section className="panel" id="listen" aria-labelledby="listen-title">
      <div className="listen-grid">
        <div>
          <p className="eyebrow">Listen</p>
          <h2 className="section-title" id="listen-title">
            Listen.
          </h2>
          <p className="prose">Spotify, Apple Music, YouTube.</p>
          <div className="mt-6 overflow-hidden rounded-2xl border-2 border-ink bg-[#121212]">
            <iframe
              title="4D Monster Lobsters on Spotify"
              src="https://open.spotify.com/embed/artist/5i3xr0k2wfK3o3yDNzZ7ek?utm_source=generator"
              width="100%"
              height="352"
              style={{ border: 0 }}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </div>
        </div>
        <div>
          <p className="eyebrow mb-2">Songs</p>
          {SONGS.map((song, index) => (
            <a className="song-row" key={song.title} href={song.href} target="_blank" rel="noreferrer">
              <span className="song-from">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <span className="song-title block">{song.title}</span>
                <span className="song-from">{song.from}</span>
              </span>
              <span className="song-time">{song.time}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Watch() {
  const [active, setActive] = useState(null)
  return (
    <ScrollReel
      id="watch"
      eyebrow="Watch"
      title="Videos."
      note={
        <a className="text-link" href="https://www.youtube.com/@4DMonsterLobsters" target="_blank" rel="noreferrer">
          Whole channel
        </a>
      }
      items={FILMS}
      getKey={(video) => video.id}
      onChange={() => setActive(null)}
      render={(video) => <Film video={video} active={active} setActive={setActive} />}
    />
  )
}

export function Optics() {
  return (
    <ScrollReel
      id="signal"
      eyebrow="Optics"
      title="Frames."
      items={FRAMES}
      getKey={(photo) => photo.src}
      render={(photo) => <img src={asset(photo.src)} alt={photo.alt} />}
    />
  )
}

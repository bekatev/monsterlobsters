import { useState } from "react"
import { MORE_VIDEOS, SHOWS, SONGS, VIDEOS } from "../data"
import { asset } from "../asset"
import { scrollToId } from "../hooks"

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
    <section className="panel" id="watch" aria-labelledby="watch-title">
      <p className="eyebrow">Watch</p>
      <h2 className="section-title" id="watch-title">
        Videos.
      </h2>
      <p className="prose mb-6">Official videos.</p>
      <div className="video-grid">
        {VIDEOS.map((video) => (
          <Film key={video.id} video={video} active={active} setActive={setActive} />
        ))}
      </div>
      <div className="pills mt-6">
        {MORE_VIDEOS.map((video) => (
          <a key={video.id} href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer">
            {video.title}
          </a>
        ))}
        <a href="https://www.youtube.com/@4DMonsterLobsters" target="_blank" rel="noreferrer">
          Whole channel
        </a>
      </div>
    </section>
  )
}

export function Live() {
  return (
    <section className="panel" id="live" aria-labelledby="live-title">
      <p className="eyebrow">Live</p>
      <h2 className="section-title" id="live-title">
        The shows.
      </h2>
      <p className="serif text-2xl md:text-4xl max-w-3xl leading-none mt-3 mb-8">
        <button className="text-link" onClick={() => scrollToId("tour")}>
          Dates and tickets
        </button>
      </p>
      <div className="show-grid">
        {SHOWS.map((photo) => (
          <figure key={photo.src}>
            <img src={asset(photo.src)} alt={photo.alt} />
          </figure>
        ))}
      </div>
    </section>
  )
}

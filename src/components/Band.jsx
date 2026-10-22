import { asset } from "../asset"
import { MEMBERS, PORTRAITS, SOCIALS } from "../data"

export default function Band() {
  return (
    <section className="panel" id="band" aria-labelledby="band-title">
      <div className="band-grid">
        <div>
          <p className="eyebrow">The band</p>
          <h2 className="section-title" id="band-title">
            Today’s lineup.
          </h2>
          <p className="prose">Lobster Rock. Tbilisi.</p>
          <figure className="logo-plate">
            <img src={asset("/brand/logo-mark.png")} alt="4D Monster Lobsters" />
          </figure>
        </div>
        <div>
          {MEMBERS.map((member, index) => (
            <article className="member" key={member.name}>
              <p className="role">0{index + 1}</p>
              <h3>{member.name}</h3>
            </article>
          ))}
        </div>
      </div>
      <div className="portrait-grid" aria-label="Portraits of the band">
        {PORTRAITS.map((photo) => (
          <figure key={photo.src}>
            <img src={asset(photo.src)} alt={photo.alt} />
          </figure>
        ))}
      </div>
      <footer className="footer" id="contact">
        <p className="eyebrow">Contact</p>
        <h2 className="footer-word">
          Instagram.
        </h2>
        <div className="pills">
          {SOCIALS.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </div>
        <p className="fine">
          4D Monster Lobsters. Lobster Rock. Tbilisi. Beka, Niku, Tika, Andria. Travel Guide Tour, 28 October–14 November 2026.
        </p>
      </footer>
    </section>
  )
}

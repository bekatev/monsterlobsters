import { asset } from "../asset"
import { SOCIALS } from "../data"

export default function Band() {
  return (
    <section className="panel" id="band" aria-label="The band">
      <div className="band-grid">
        <div>
          <p className="eyebrow">The band</p>
          <p className="prose">Lobster Rock. Tbilisi.</p>
          <figure className="logo-plate">
            <img src={asset("/brand/logo-mark.png")} alt="4D Monster Lobsters" />
          </figure>
        </div>
        <div>
          {["Tika", "Andria", "Niku", "Beka"].map((name) => (
            <article className="member" key={name}>
              <h3>{name}</h3>
            </article>
          ))}
        </div>
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

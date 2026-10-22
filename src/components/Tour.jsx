import { motion } from "framer-motion"
import { asset } from "../asset"
import { TOUR } from "../data"

export default function Tour() {
  return (
    <section className="tour-stage" id="tour" aria-labelledby="tour-title">
      <div className="tour-plate" aria-hidden="true">
        <img className="tour-still" src={asset("/photos/phone.jpg")} alt="" />
        <div className="tour-grade" />
      </div>
      <p className="tour-spine">
        <span>Travel Guide Tour</span>
      </p>
      <div className="tour-layout">
        <div className="tour-intro">
          <p className="eyebrow">28 Oct — 14 Nov</p>
          <h1 className="section-title" id="tour-title">
            Dates.
          </h1>
        </div>
        <ul className="tour-list">
          {TOUR.map((show, index) => (
            <motion.li
              className="tour-row"
              key={`${show.date}-${show.city}`}
              initial={{ opacity: 0, x: 36 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <div>
                <p className="tour-date">{show.date}</p>
                <p className="tour-year">{show.year}</p>
              </div>
              <div>
                <h2>{show.city}</h2>
                <p>
                  {show.place}
                  {show.when ? ` · ${show.when}` : ""}
                </p>
              </div>
              {show.href ? (
                <a href={show.href} target="_blank" rel="noreferrer">
                  {show.ticket}
                </a>
              ) : (
                <span />
              )}
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  )
}

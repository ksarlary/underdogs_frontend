import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <section className="not-found-page" aria-labelledby="not-found-title">
      <div className="not-found-card">
        <p className="not-found-code" aria-hidden="true">
          404
        </p>

        <p className="eyebrow">Navigation</p>

        <h1 id="not-found-title">Page introuvable</h1>

        <p className="not-found-message">
          La page que vous recherchez est introuvable.        </p>

        <div className="not-found-actions">
          <Link className="primary-button" to="/">
            Retour a l accueil
          </Link>

          <Link className="secondary-button" to="/matches">
            Voir les matchs
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NotFoundPage

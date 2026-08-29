import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="page notfound-page">
      <div className="container notfound-inner">
        <span className="eyebrow">Error 404</span>
        <h1>Page Not Found</h1>
        <p className="muted">The page you're looking for doesn't exist or may have moved.</p>
        <Link to="/" className="btn primary">Return to Home</Link>
      </div>
    </section>
  )
}

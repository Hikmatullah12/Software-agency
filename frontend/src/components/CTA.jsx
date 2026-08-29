import { Link } from 'react-router-dom'

export default function CTA() {
  return (
    <section className="cta-section bg-dark">
      <div className="cta-shape" aria-hidden="true" />
      <div className="container cta-inner">
        <h2>Ready to Build Your Next Digital Solution?</h2>
        <p>Let&apos;s turn your idea into a reliable, scalable, and modern technology solution.</p>
        <div className="cta-actions">
          <Link to="/contact" className="btn on-dark primary">Start a Project</Link>
          <Link to="/contact" className="btn on-dark">Contact Us</Link>
        </div>
      </div>
    </section>
  )
}

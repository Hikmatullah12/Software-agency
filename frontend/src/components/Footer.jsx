import { Link } from 'react-router-dom'
import './header.css'
import logo from '../../../images/logo/logo.png'
import SafeImage from './SafeImage'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="container site-footer-inner footer-grid">
        <div className="footer-brand">
          <SafeImage src={logo} alt="Hikmat Tech Solutions logo" className="footer-logo" fallback="Logo unavailable" />
          <div>
            <strong>Hikmat Tech Solutions</strong>
            <p className="muted">
              A software development agency building reliable web, mobile, and
              infrastructure solutions for growing businesses.
            </p>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/projects">Projects</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Services</h4>
          <ul>
            <li><Link to="/services">Web Development</Link></li>
            <li><Link to="/services">Mobile App Development</Link></li>
            <li><Link to="/services">UI/UX Design</Link></li>
            <li><Link to="/services">Database Solutions</Link></li>
            <li><Link to="/services">Cybersecurity</Link></li>
            <li><Link to="/services">IT Consulting</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Use the contact form on our <Link to="/contact">Contact page</Link> and we&apos;ll respond as soon as possible.</p>
          <p className="muted">Mon&ndash;Fri, 9:00 AM &ndash; 6:00 PM</p>
        </div>
      </div>

      <div className="site-footer-bottom">
        <div className="container footer-bottom-inner">
          <small>&copy; {year} Hikmat Tech Solutions. All rights reserved.</small>
        </div>
      </div>
    </footer>
  )
}

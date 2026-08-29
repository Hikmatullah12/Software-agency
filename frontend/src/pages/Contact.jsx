import { useState } from 'react'
import { useEffect } from 'react'
import axios from 'axios'
import './contact.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service_id: '', message: '' })
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState('')
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axios.get(`${API_URL}/api/services`)
      .then(({ data }) => setServices(data.services.filter((service) => service.is_active)))
      .catch(() => setApiError('Services are currently unavailable. Please try again later.'))
  }, [])

  function validate() {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required.'
    if (!form.email.trim()) e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email.'
    if (!form.service_id) e.service_id = 'Please select a service.'
    if (!form.message.trim()) e.message = 'Please enter a message.'
    if (form.phone && !/^\+?[0-9\s\-()]{7,}$/.test(form.phone)) e.phone = 'Enter a valid phone number.'
    return e
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((s) => ({ ...s, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setSuccess('')
    const eobj = validate()
    setErrors(eobj)
    if (Object.keys(eobj).length !== 0) return

    setLoading(true)
    setApiError('')
    axios.post(`${API_URL}/api/inquiries`, form)
      .then(({ data }) => {
        setSuccess(data.message)
        setForm({ name: '', email: '', phone: '', service_id: '', message: '' })
      })
      .catch((requestError) => setApiError(requestError.response?.data?.message || 'Unable to submit your inquiry.'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="page contact-page">
      <section className="page-hero bg-light-blue">
        <div className="container">
          <span className="eyebrow">Get In Touch</span>
          <h1>Contact</h1>
          <p className="lead">Tell us about your project and we&apos;ll get back to you.</p>
        </div>
      </section>

      <section className="section bg-white">
        <div className="container contact-grid">
          <div className="contact-info">
            <h2>Contact Information</h2>
            <div className="info-block">
              <div className="info-row">
                <span className="info-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </span>
                <div>
                  <strong>Working hours</strong>
                  <p className="muted">Mon&ndash;Fri, 9:00 AM &ndash; 6:00 PM</p>
                </div>
              </div>
              <p className="muted">
                Fill out the inquiry form and a member of our team will reach
                out to discuss your project.
              </p>
            </div>
          </div>

          <div className="contact-form">
            <h2>Project Inquiry</h2>
            <form onSubmit={handleSubmit} noValidate>
              <label>
                Full Name*
                <input name="name" value={form.name} onChange={handleChange} maxLength="255" />
                {errors.name && <div className="error">{errors.name}</div>}
              </label>

              <label>
                Email*
                <input name="email" value={form.email} onChange={handleChange} />
                {errors.email && <div className="error">{errors.email}</div>}
              </label>

              <label>
                Phone
                <input name="phone" value={form.phone} onChange={handleChange} />
                {errors.phone && <div className="error">{errors.phone}</div>}
              </label>

              <label>
                Service*
                <select name="service_id" value={form.service_id} onChange={handleChange} disabled={!services.length}>
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name}</option>
                  ))}
                </select>
                {errors.service_id && <div className="error">{errors.service_id}</div>}
              </label>

              <label>
                Message*
                <textarea name="message" value={form.message} onChange={handleChange} rows={6} />
                {errors.message && <div className="error">{errors.message}</div>}
              </label>

              <div className="form-actions">
                <button type="submit" className="btn primary" disabled={loading || !services.length}>{loading ? 'Sending...' : 'Send Message'}</button>
              </div>

              {success && <div className="success">{success}</div>}
              {apiError && <div className="error" role="alert">{apiError}</div>}
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

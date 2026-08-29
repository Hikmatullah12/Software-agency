import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { changePassword, updateProfile } from '../../auth/api'
import { useToast } from '../components/Toast'

export default function AdminSettings() {
  const { admin, refreshAdmin } = useOutletContext()
  const { notify } = useToast()

  const [fullName, setFullName] = useState(admin.fullName || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  async function handleProfileSubmit(event) {
    event.preventDefault()
    setProfileError('')
    setProfileSaving(true)
    try {
      const data = await updateProfile(fullName)
      notify(data.message, 'success')
      refreshAdmin()
    } catch (error) {
      setProfileError(error.message)
      notify(error.message, 'error')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault()
    setPasswordError('')
    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }
    setPasswordSaving(true)
    try {
      const data = await changePassword(currentPassword, newPassword)
      notify(data.message, 'success')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError(error.message)
      notify(error.message, 'error')
    } finally {
      setPasswordSaving(false)
    }
  }

  return (
    <section>
      <div className="admin-page-header">
        <div>
          <p className="admin-kicker">Account</p>
          <h1>Settings</h1>
          <p className="admin-intro">Manage your admin profile and password.</p>
        </div>
      </div>

      <form className="admin-form-card" onSubmit={handleProfileSubmit}>
        <h2>Profile</h2>
        <div className="admin-form-grid">
          <label>Full Name
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength="255" required />
          </label>
          <label>Email <span className="field-hint">(read-only)</span>
            <input value={admin.email} disabled />
          </label>
        </div>
        {profileError && <div className="error">{profileError}</div>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={profileSaving}>{profileSaving ? 'Saving...' : 'Save profile'}</button>
        </div>
      </form>

      <form className="admin-form-card" onSubmit={handlePasswordSubmit}>
        <h2>Change Password</h2>
        <div className="admin-form-grid">
          <label>Current Password
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required />
          </label>
          <div />
          <label>New Password <span className="field-hint">(min. 8 characters)</span>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          </label>
          <label>Confirm New Password
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={8} required />
          </label>
        </div>
        {passwordError && <div className="error">{passwordError}</div>}
        <div className="form-actions">
          <button type="submit" className="primary-button" disabled={passwordSaving}>{passwordSaving ? 'Updating...' : 'Update password'}</button>
        </div>
      </form>
    </section>
  )
}

export default function StatCard({ label, value, icon, accent = 'primary' }) {
  return (
    <div className={`stat-card stat-card-${accent}`}>
      <div className="stat-card-icon">{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  )
}

import { Link } from 'react-router-dom'
import { Plus, TrendingUp, Clock, AlertCircle, CheckCircle2, Zap } from 'lucide-react'
import { useEngagements } from '../hooks/useEngagement.js'
import { calcEngagementCompletion, getHealthColor, getStatusStyle } from '../utils/storage.js'
import ProgressRing from '../components/ProgressRing.jsx'
import { format, parseISO } from 'date-fns'

export default function Dashboard() {
  const { engagements } = useEngagements()
  const active   = engagements.filter(e => e.status === 'active')
  const complete = engagements.filter(e => e.status === 'complete')

  const totalDelivered = engagements.flatMap(e =>
    e.stages.flatMap(s => (s.deliverables||[]).filter(d => d.status === 'accepted'))
  ).length

  const totalBlockers = active.flatMap(e =>
    e.stages.flatMap(s => (s.blockers||[]).filter(b => b.status === 'active'))
  ).length

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-10 animate-in">
        <div>
          <p className="font-mono text-malux-muted text-xs tracking-widest uppercase mb-2">
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
          <h1 className="font-display font-bold text-4xl text-malux-text tracking-tight">
            Good {getTimeOfDay()}, Valentina
          </h1>
          <p className="text-malux-muted font-body mt-2 text-sm">
            LUMINA · Engagement Intelligence Dashboard
          </p>
        </div>
        <Link to="/engagements/new" className="btn-primary flex items-center gap-2 no-print">
          <Plus size={16} />
          New Engagement
        </Link>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-8 stagger-1 animate-in">
        {[
          { label: 'Active',       value: active.length,      icon: Zap,          color: 'text-malux-purple' },
          { label: 'Completed',    value: complete.length,    icon: CheckCircle2, color: 'text-malux-mint' },
          { label: 'Delivered',    value: totalDelivered,     icon: TrendingUp,   color: 'text-malux-purplelight' },
          { label: 'Live Blockers',value: totalBlockers,      icon: AlertCircle,  color: totalBlockers > 0 ? 'text-malux-pink' : 'text-malux-muted' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`p-2.5 rounded-lg bg-malux-surface2 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="font-display font-bold text-2xl text-malux-text">{value}</p>
              <p className="font-mono text-malux-muted text-xs">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Active Engagements */}
      {active.length > 0 && (
        <section className="mb-8 stagger-2 animate-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Active Engagements</h2>
            <Link to="/engagements" className="text-malux-muted hover:text-malux-purplelight font-mono text-xs transition-colors">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {active.map(e => (
              <EngagementCard key={e.id} engagement={e} />
            ))}
          </div>
        </section>
      )}

      {/* Recent pulse entries */}
      {active.some(e => e.weeklyPulse?.length > 0) && (
        <section className="stagger-3 animate-in">
          <h2 className="section-title mb-4">Recent Pulse</h2>
          <div className="grid grid-cols-1 gap-3">
            {active
              .filter(e => e.weeklyPulse?.length > 0)
              .map(e => {
                const latest = [...e.weeklyPulse].sort((a,b) => b.weekOf.localeCompare(a.weekOf))[0]
                const h = getHealthColor(latest.health)
                return (
                  <div key={e.id} className="card flex items-start gap-4">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${h.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-display font-semibold text-malux-text text-sm">{e.client}</p>
                        <span className={`badge ${h.border.replace('border-','border ')} ${h.bg} ${h.text} text-xs`}>
                          {h.label}
                        </span>
                        <span className="font-mono text-malux-muted text-xs ml-auto">
                          Week of {latest.weekOf}
                        </span>
                      </div>
                      <p className="text-malux-muted text-xs font-body line-clamp-2">{latest.summary}</p>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </section>
      )}

      {/* Empty state */}
      {engagements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 stagger-1 animate-in">
          <LogoMark />
          <h2 className="font-display font-bold text-xl text-malux-text mt-6 mb-2">
            Welcome to LUMINA
          </h2>
          <p className="text-malux-muted text-sm font-body text-center max-w-md mb-8">
            Your engagement intelligence workspace. Create your first engagement to get started with the LUMINA framework.
          </p>
          <Link to="/engagements/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Create First Engagement
          </Link>
        </div>
      )}
    </div>
  )
}

function EngagementCard({ engagement: e }) {
  const pct = calcEngagementCompletion(e)
  const latestPulse = e.weeklyPulse?.length
    ? [...e.weeklyPulse].sort((a,b) => b.weekOf.localeCompare(a.weekOf))[0]
    : null
  const health = getHealthColor(latestPulse?.health)
  const activeStage = e.stages?.find(s => s.status === 'in-progress')
  const activeBlockers = e.stages.flatMap(s => (s.blockers||[]).filter(b => b.status === 'active'))

  return (
    <Link to={`/engagements/${e.id}`} className="card-hover block group">
      <div className="flex items-start gap-5">
        <ProgressRing pct={pct} size={64} stroke={5} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1.5">
            <h3 className="font-display font-bold text-malux-text text-lg">{e.client}</h3>
            {latestPulse && (
              <span className={`status-dot ${health.dot}`} />
            )}
            <span className="font-mono text-malux-muted text-xs ml-auto">
              {e.startDate && `Started ${e.startDate}`}
            </span>
          </div>

          <p className="font-mono text-malux-muted text-xs mb-3">
            {e.sector} · {e.engagementType}
          </p>

          {/* Stage progress */}
          <div className="flex gap-1 mb-3">
            {e.stages?.map(s => (
              <div
                key={s.id}
                title={s.name}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  s.status === 'complete'    ? 'bg-malux-mint' :
                  s.status === 'in-progress' ? 'bg-malux-purple' :
                  s.status === 'blocked'     ? 'bg-malux-pink' :
                  'bg-malux-surface2'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-malux-muted">
            {activeStage && (
              <span className="text-malux-purplelight">
                ◎ {activeStage.name}
              </span>
            )}
            {activeBlockers.length > 0 && (
              <span className="text-malux-pink">
                ✕ {activeBlockers.length} blocker{activeBlockers.length > 1 ? 's' : ''}
              </span>
            )}
            <span className="ml-auto text-malux-faint group-hover:text-malux-muted transition-colors">
              Open →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function LogoMark() {
  return (
    <svg width="56" height="56" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-40">
      <rect x="4" y="4" width="40" height="40" rx="6" stroke="#AFA9EC" strokeWidth="1.3"/>
      <circle cx="16" cy="20" r="4.5" fill="#EEEDFE"/>
      <circle cx="30" cy="28" r="3" fill="#AFA9EC"/>
      <circle cx="20" cy="32" r="3.5" fill="#7F77DD"/>
      <circle cx="34" cy="16" r="2.5" fill="#AFA9EC" opacity="0.7"/>
      <line x1="16" y1="20" x2="30" y2="28" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.35"/>
      <line x1="30" y1="28" x2="20" y2="32" stroke="#7F77DD" strokeWidth="0.8" opacity="0.35"/>
      <line x1="16" y1="20" x2="34" y2="16" stroke="#AFA9EC" strokeWidth="0.8" opacity="0.25"/>
    </svg>
  )
}

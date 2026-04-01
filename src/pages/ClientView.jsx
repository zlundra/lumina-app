import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { getEngagementByToken, getStatusStyle, getHealthColor, calcEngagementCompletion, saveEngagement, generateId } from '../utils/storage.js'
import ProgressRing from '../components/ProgressRing.jsx'
import { format } from 'date-fns'

export default function ClientView() {
  const { token } = useParams()
  const [engagement, setEngagement] = useState(() => getEngagementByToken(token))

  if (!engagement) return (
    <div className="min-h-screen page-bg flex items-center justify-center">
      <div className="text-center">
        <LogoMark />
        <h1 className="font-display font-bold text-2xl text-malux-text mt-6 mb-2">Link unavailable</h1>
        <p className="text-malux-muted font-body text-sm">This engagement view is either not active or the link has changed.</p>
        <p className="font-mono text-malux-muted text-xs mt-4">LUMINA · MaLux Data Consulting · maluxdata.io</p>
      </div>
    </div>
  )

  const pct = calcEngagementCompletion(engagement)
  const latestPulse = engagement.weeklyPulse?.length
    ? [...engagement.weeklyPulse].sort((a,b)=>b.weekOf.localeCompare(a.weekOf))[0]
    : null
  const health = getHealthColor(latestPulse?.health)

  const addClientComment = (stageId, text) => {
    const updated = {
      ...engagement,
      stages: engagement.stages.map(s => s.id === stageId
        ? {
            ...s,
            comments: [...(s.comments||[]), {
              id: generateId(),
              text,
              author: 'Client',
              role: 'client',
              timestamp: new Date().toISOString(),
              resolved: false,
            }]
          }
        : s
      )
    }
    saveEngagement(updated)
    setEngagement(updated)
  }

  return (
    <div className="min-h-screen page-bg">
      {/* Header */}
      <div className="glass border-b border-malux-border px-8 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <LogoMark small />
          <div>
            <p className="font-display font-bold text-malux-text">{engagement.client}</p>
            <p className="font-mono text-malux-muted text-xs">LUMINA Engagement View · Read Only</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {latestPulse && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono ${health.border} ${health.bg} ${health.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                {health.label}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-8 space-y-8">

        {/* Overview */}
        <div className="animate-in flex items-start gap-8">
          <ProgressRing pct={pct} size={96} stroke={7} label="Overall Completion" />
          <div className="flex-1">
            <h1 className="font-display font-bold text-3xl text-malux-text mb-1">{engagement.client}</h1>
            <p className="font-mono text-malux-muted text-sm mb-3">{engagement.sector} · {engagement.engagementType}</p>
            {engagement.objective && (
              <div className="p-4 bg-malux-surface rounded-xl border border-malux-border">
                <p className="font-mono text-malux-muted text-xs uppercase tracking-widest mb-1">Objective</p>
                <p className="text-malux-text text-sm">{engagement.objective}</p>
              </div>
            )}
          </div>
        </div>

        {/* Stage progress */}
        <div className="animate-in stagger-1">
          <h2 className="font-display font-bold text-lg text-malux-text mb-4">Engagement Progress</h2>
          <div className="space-y-3">
            {engagement.stages.map((stage, i) => {
              const st = getStatusStyle(stage.status)
              return (
                <div key={stage.id} className="card">
                  <div className="flex items-center gap-4">
                    <span className="text-xl flex-shrink-0">{stage.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="font-display font-semibold text-malux-text">{stage.name}</span>
                        <span className={`badge ${st.color}`}>{st.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="progress-bar flex-1">
                          <div className="progress-fill" style={{width:`${stage.completionPct||0}%`}} />
                        </div>
                        <span className="font-mono text-xs text-malux-muted flex-shrink-0">{stage.completionPct||0}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Client-visible notes */}
                  {stage.notes?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-malux-border space-y-2">
                      {stage.notes.filter(n => n.type !== 'milestone' || true).slice(-3).map(n => (
                        <div key={n.id} className="flex gap-2 text-xs text-malux-muted">
                          <span>·</span>
                          <span>{n.text}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Deliverables */}
                  {stage.deliverables?.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-malux-border">
                      <p className="font-mono text-malux-muted text-xs uppercase tracking-wider mb-2">Deliverables</p>
                      <div className="space-y-1">
                        {stage.deliverables.map(d => (
                          <div key={d.id} className="flex items-center gap-2 text-xs">
                            <span className={d.status==='accepted'?'text-malux-mint':d.status==='in-review'?'text-malux-amber':'text-malux-muted'}>
                              {d.status==='accepted'?'✓':d.status==='in-review'?'◎':'○'}
                            </span>
                            <span className="text-malux-text">{d.name}</span>
                            {d.dueDate && <span className="text-malux-muted ml-auto">Due: {d.dueDate}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Comments */}
                  {(stage.comments?.length > 0 || engagement.clientCanComment) && (
                    <div className="mt-3 pt-3 border-t border-malux-border space-y-2">
                      {(stage.comments||[]).map(c => (
                        <div key={c.id} className={`p-2.5 rounded-lg text-xs ${c.role==='client'?'bg-malux-amber/5 border border-malux-amber/20 ml-4':'bg-malux-surface2'}`}>
                          <div className="flex gap-2 mb-1">
                            <span className={c.role==='client'?'text-malux-amber font-mono':'text-malux-purplelight font-mono'}>{c.author}</span>
                            <span className="text-malux-faint">{format(new Date(c.timestamp),'dd MMM HH:mm')}</span>
                          </div>
                          <p className="text-malux-text">{c.text}</p>
                        </div>
                      ))}
                      {engagement.clientCanComment && (
                        <ClientCommentInput onSubmit={(text) => addClientComment(stage.id, text)} />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Latest pulse */}
        {latestPulse && (
          <div className="animate-in stagger-2">
            <h2 className="font-display font-bold text-lg text-malux-text mb-4">Latest Update</h2>
            <div className={`card border ${health.border}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-2 h-2 rounded-full ${health.dot}`} />
                <span className="font-display font-semibold text-malux-text">Week of {latestPulse.weekOf}</span>
                <span className={`badge ${health.bg} ${health.border} ${health.text}`}>{health.label}</span>
              </div>
              {latestPulse.summary && <p className="text-malux-text text-sm mb-3">{latestPulse.summary}</p>}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {latestPulse.delivered && <div><span className="font-mono text-malux-muted">Delivered: </span><span className="text-malux-text">{latestPulse.delivered}</span></div>}
                {latestPulse.planned   && <div><span className="font-mono text-malux-muted">Next up: </span><span className="text-malux-text">{latestPulse.planned}</span></div>}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-malux-border text-center">
          <LogoMark />
          <p className="font-mono text-malux-muted text-xs mt-3">LUMINA Engagement Framework</p>
          <p className="font-mono text-malux-muted text-xs">MaLux Data Consulting · <a href="https://maluxdata.io" className="text-malux-purplelight hover:underline">maluxdata.io</a></p>
          <p className="font-mono text-malux-faint text-xs mt-2">This view is read-only. All content is confidential.</p>
        </div>
      </div>
    </div>
  )
}

function ClientCommentInput({ onSubmit }) {
  const [text, setText] = useState('')
  return (
    <div className="flex gap-2 mt-2">
      <input
        className="input text-xs flex-1"
        placeholder="Add a comment…"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key==='Enter' && text.trim()) { onSubmit(text.trim()); setText('') } }}
      />
      <button onClick={() => { if(text.trim()){onSubmit(text.trim());setText('')} }} className="btn-ghost text-xs">Post</button>
    </div>
  )
}

function LogoMark({ small }) {
  const s = small ? 28 : 44
  return (
    <svg width={s} height={s} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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

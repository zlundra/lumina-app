import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ChevronDown, ChevronRight, Plus, Save, Share2, Copy, Check,
  AlertCircle, CheckCircle2, Clock, Zap, MessageSquare, FileText,
  Database, HelpCircle, Flag, BarChart3, Download, Settings
} from 'lucide-react'
import { useEngagement } from '../hooks/useEngagement.js'
import {
  getStatusStyle, getHealthColor, getMaturityLabel,
  calcEngagementCompletion, exportEngagementJSON
} from '../utils/storage.js'
import { generatePDF } from '../utils/pdfGenerator.js'
import ProgressRing from '../components/ProgressRing.jsx'
import { format } from 'date-fns'

const MATURITY_QUESTIONS = [
  'Do you have a single source of truth for key metrics?',
  'Are data definitions consistent across teams?',
  'Is data quality actively monitored and acted on?',
  'Can non-technical staff access and use data independently?',
  'Are data decisions documented and traceable?',
]

export default function EngagementDetail() {
  const { id } = useParams()
  const {
    engagement, update, updateStage,
    addNote, addDeliverable, updateDeliverable,
    addSubStage, addQuestion, addBlocker,
    addComment, addDecision, addPulse, addSystem,
  } = useEngagement(id)

  const [activeTab, setActiveTab] = useState('stages')
  const [expandedStage, setExpandedStage] = useState(null)
  const [copied, setCopied]   = useState(false)
  const [saving, setSaving]   = useState(false)

  if (!engagement) return (
    <div className="p-8 text-malux-muted font-mono text-sm">
      Engagement not found. <Link to="/engagements" className="text-malux-purple hover:underline">← Back</Link>
    </div>
  )

  const pct = calcEngagementCompletion(engagement)
  const latestPulse = engagement.weeklyPulse?.length
    ? [...engagement.weeklyPulse].sort((a,b) => b.weekOf.localeCompare(a.weekOf))[0]
    : null
  const health = getHealthColor(latestPulse?.health)
  const totalBlockers = engagement.stages.flatMap(s => (s.blockers||[]).filter(b => b.status==='active')).length

  const copyClientLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/client/${engagement.clientViewToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleClientView = () => update({ clientViewEnabled: !engagement.clientViewEnabled })

  const TABS = [
    { id:'stages',    label:'Stages',    icon: Zap },
    { id:'systems',   label:'Systems',   icon: Database },
    { id:'decisions', label:'Decisions', icon: Flag },
    { id:'questions', label:'Questions', icon: HelpCircle },
    { id:'pulse',     label:'Pulse',     icon: BarChart3 },
    { id:'report',    label:'Report',    icon: FileText },
    { id:'settings',  label:'Settings',  icon: Settings },
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass border-b border-malux-border px-8 py-5 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center gap-5">
          <Link to="/engagements" className="text-malux-muted hover:text-malux-text transition-colors font-mono text-xs">← Back</Link>
          <div className="w-px h-4 bg-malux-border" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display font-bold text-xl text-malux-text truncate">{engagement.client}</h1>
            <p className="font-mono text-malux-muted text-xs">{engagement.sector} · {engagement.engagementType}</p>
          </div>

          <div className="flex items-center gap-3">
            {latestPulse && (
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono ${health.border} ${health.bg} ${health.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${health.dot}`} />
                {health.label}
              </div>
            )}
            {totalBlockers > 0 && (
              <div className="flex items-center gap-1.5 badge badge-pink">
                <AlertCircle size={10} />
                {totalBlockers} blocker{totalBlockers > 1 ? 's' : ''}
              </div>
            )}
            <div className="flex items-center gap-2">
              <ProgressRing pct={pct} size={40} stroke={4} />
            </div>
            <button onClick={copyClientLink} className="btn-ghost flex items-center gap-1.5">
              {copied ? <Check size={12} className="text-malux-mint" /> : <Share2 size={12} />}
              {copied ? 'Copied!' : 'Client Link'}
            </button>
            <button onClick={() => generatePDF(engagement)} className="btn-primary flex items-center gap-1.5">
              <Download size={13} />
              Export PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-6xl mx-auto flex gap-1 mt-4 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-mono text-xs transition-all whitespace-nowrap ${
                activeTab === id
                  ? 'bg-malux-purple/10 text-malux-purplelight border border-malux-purple/20'
                  : 'text-malux-muted hover:text-malux-text'
              }`}
            >
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-6">

        {/* STAGES TAB */}
        {activeTab === 'stages' && (
          <div className="space-y-3 animate-in">
            {engagement.stages.map((stage, si) => (
              <StageCard
                key={stage.id}
                stage={stage}
                index={si}
                expanded={expandedStage === stage.id}
                onToggle={() => setExpandedStage(expandedStage === stage.id ? null : stage.id)}
                onUpdateStage={(patch) => updateStage(stage.id, patch)}
                onAddNote={(note) => addNote(stage.id, note)}
                onAddDeliverable={(d) => addDeliverable(stage.id, d)}
                onUpdateDeliverable={(dId, patch) => updateDeliverable(stage.id, dId, patch)}
                onAddSubStage={(ss) => addSubStage(stage.id, ss)}
                onAddQuestion={(q) => addQuestion(stage.id, q)}
                onAddBlocker={(b) => addBlocker(stage.id, b)}
                onAddComment={(c) => addComment(stage.id, c)}
              />
            ))}
          </div>
        )}

        {/* SYSTEMS TAB */}
        {activeTab === 'systems' && (
          <SystemsTab engagement={engagement} onAddSystem={addSystem} onUpdate={update} />
        )}

        {/* DECISIONS TAB */}
        {activeTab === 'decisions' && (
          <DecisionsTab engagement={engagement} onAddDecision={addDecision} />
        )}

        {/* QUESTIONS TAB */}
        {activeTab === 'questions' && (
          <QuestionsTab engagement={engagement} onUpdate={update} />
        )}

        {/* PULSE TAB */}
        {activeTab === 'pulse' && (
          <PulseTab engagement={engagement} onAddPulse={addPulse} />
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <ReportTab engagement={engagement} onUpdate={update} onGeneratePDF={() => generatePDF(engagement)} />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <SettingsTab
            engagement={engagement}
            onUpdate={update}
            onToggleClientView={toggleClientView}
            onExportJSON={() => exportEngagementJSON(engagement)}
          />
        )}
      </div>
    </div>
  )
}

// ─── STAGE CARD ─────────────────────────────────────────────────────────────

function StageCard({ stage, index, expanded, onToggle, onUpdateStage, onAddNote, onAddDeliverable, onUpdateDeliverable, onAddSubStage, onAddQuestion, onAddBlocker, onAddComment }) {
  const status = getStatusStyle(stage.status)
  const [noteText, setNoteText]   = useState('')
  const [noteType, setNoteType]   = useState('note')
  const [showAddNote, setShowAddNote]         = useState(false)
  const [showAddDeliverable, setShowAddDeliverable] = useState(false)
  const [showAddSubStage, setShowAddSubStage] = useState(false)
  const [showAddBlocker, setShowAddBlocker]   = useState(false)
  const [delivForm, setDelivForm] = useState({ name:'', format:'', dueDate:'', criteria:'' })
  const [subStageForm, setSubStageForm] = useState({ name:'' })
  const [blockerForm, setBlockerForm]   = useState({ text:'', type:'Data', owner:'', action:'' })

  const activeBlockers = (stage.blockers||[]).filter(b => b.status==='active')
  const completedDelivs = (stage.deliverables||[]).filter(d => d.status==='accepted').length

  const submitNote = () => {
    if (!noteText.trim()) return
    onAddNote({ text: noteText.trim(), type: noteType })
    setNoteText(''); setShowAddNote(false)
  }

  const submitDeliverable = () => {
    if (!delivForm.name.trim()) return
    onAddDeliverable({ ...delivForm })
    setDelivForm({ name:'', format:'', dueDate:'', criteria:'' })
    setShowAddDeliverable(false)
  }

  const submitSubStage = () => {
    if (!subStageForm.name.trim()) return
    onAddSubStage({ name: subStageForm.name.trim() })
    setSubStageForm({ name:'' }); setShowAddSubStage(false)
  }

  const submitBlocker = () => {
    if (!blockerForm.text.trim()) return
    onAddBlocker({ ...blockerForm })
    setBlockerForm({ text:'', type:'Data', owner:'', action:'' })
    setShowAddBlocker(false)
  }

  return (
    <div className={`border rounded-xl overflow-hidden transition-all duration-200 ${
      stage.status === 'blocked' ? 'border-malux-pink/30' :
      stage.status === 'complete' ? 'border-malux-mint/20' :
      stage.status === 'in-progress' ? 'border-malux-purple/30' :
      'border-malux-border'
    } bg-malux-surface`}>
      {/* Stage header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-malux-surface2/50 transition-colors"
        onClick={onToggle}
      >
        <span className="text-lg flex-shrink-0">{stage.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <span className="font-display font-semibold text-malux-text">{stage.name}</span>
            <span className={`badge ${status.color}`}>{status.label}</span>
            {activeBlockers.length > 0 && (
              <span className="badge badge-pink flex items-center gap-1">
                <AlertCircle size={9} /> {activeBlockers.length} blocker
              </span>
            )}
          </div>
          <p className="font-mono text-malux-muted text-xs mt-0.5">{stage.description}</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="progress-bar w-32">
              <div className="progress-fill" style={{ width: `${stage.completionPct||0}%` }} />
            </div>
            <span className="font-mono text-xs text-malux-muted">{stage.completionPct||0}%</span>
            {stage.notes?.length > 0 && <span className="font-mono text-xs text-malux-muted">{stage.notes.length} note{stage.notes.length>1?'s':''}</span>}
            {stage.deliverables?.length > 0 && <span className="font-mono text-xs text-malux-mint">{completedDelivs}/{stage.deliverables.length} delivered</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <select
            className="input w-36 text-xs py-1.5"
            value={stage.status}
            onClick={e => e.stopPropagation()}
            onChange={e => onUpdateStage({ status: e.target.value })}
          >
            <option value="not-started">Not Started</option>
            <option value="in-progress">In Progress</option>
            <option value="complete">Complete</option>
            <option value="blocked">Blocked</option>
          </select>
          <input
            type="number" min="0" max="100"
            className="input w-20 text-xs py-1.5 text-center"
            value={stage.completionPct||0}
            onClick={e => e.stopPropagation()}
            onChange={e => onUpdateStage({ completionPct: Math.min(100, Math.max(0, +e.target.value)) })}
          />
          <span className="text-malux-muted font-mono text-xs">%</span>
          {expanded ? <ChevronDown size={16} className="text-malux-muted" /> : <ChevronRight size={16} className="text-malux-muted" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-malux-border">

          {/* Sub-tabs inside stage */}
          <div className="px-5 pt-4 grid grid-cols-1 gap-6">

            {/* Notes */}
            <Section title="Notes & Observations" action={<button onClick={() => setShowAddNote(v=>!v)} className="btn-ghost flex items-center gap-1"><Plus size={11} />Add Note</button>}>
              {showAddNote && (
                <div className="mb-3 p-4 bg-malux-surface2 rounded-xl border border-malux-border space-y-3">
                  <div className="flex gap-2">
                    {['note','decision','blocker','milestone'].map(t => (
                      <button key={t} onClick={() => setNoteType(t)}
                        className={`font-mono text-xs px-3 py-1 rounded-full border transition-all ${noteType===t?'bg-malux-purple/10 border-malux-purple/30 text-malux-purplelight':'border-malux-border text-malux-muted'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <textarea className="textarea" rows={3} placeholder="Enter note…" value={noteText} onChange={e=>setNoteText(e.target.value)} />
                  <div className="flex gap-2">
                    <button onClick={submitNote} className="btn-primary text-xs">Save Note</button>
                    <button onClick={() => setShowAddNote(false)} className="btn-ghost text-xs">Cancel</button>
                  </div>
                </div>
              )}
              <div className="space-y-2">
                {(stage.notes||[]).map(n => (
                  <NoteItem key={n.id} note={n} />
                ))}
                {!stage.notes?.length && !showAddNote && <p className="text-malux-muted font-mono text-xs">No notes yet.</p>}
              </div>
            </Section>

            {/* Sub-stages */}
            <Section title="Sub-stages" action={<button onClick={() => setShowAddSubStage(v=>!v)} className="btn-ghost flex items-center gap-1"><Plus size={11}/>Add Sub-stage</button>}>
              {showAddSubStage && (
                <div className="mb-3 flex gap-2">
                  <input className="input text-xs" placeholder="Sub-stage name…" value={subStageForm.name} onChange={e=>setSubStageForm({name:e.target.value})} />
                  <button onClick={submitSubStage} className="btn-primary text-xs whitespace-nowrap">Add</button>
                  <button onClick={() => setShowAddSubStage(false)} className="btn-ghost text-xs">✕</button>
                </div>
              )}
              <div className="space-y-2">
                {(stage.subStages||[]).map(ss => (
                  <div key={ss.id} className="flex items-center gap-3 p-3 bg-malux-surface2 rounded-lg">
                    <span className="font-body text-sm text-malux-text flex-1">{ss.name}</span>
                    <input type="number" min="0" max="100"
                      className="input w-16 text-xs py-1 text-center"
                      value={ss.completionPct||0}
                      onChange={e => onUpdateStage(st => ({
                        ...st,
                        subStages: st.subStages.map(s => s.id===ss.id ? {...s, completionPct:+e.target.value} : s)
                      }))}
                    />
                    <span className="font-mono text-xs text-malux-muted">%</span>
                    <div className="progress-bar w-20">
                      <div className="progress-fill" style={{width:`${ss.completionPct||0}%`}} />
                    </div>
                  </div>
                ))}
                {!stage.subStages?.length && !showAddSubStage && <p className="text-malux-muted font-mono text-xs">No sub-stages.</p>}
              </div>
            </Section>

            {/* Deliverables */}
            <Section title="Deliverables" action={<button onClick={() => setShowAddDeliverable(v=>!v)} className="btn-ghost flex items-center gap-1"><Plus size={11}/>Add Deliverable</button>}>
              {showAddDeliverable && (
                <div className="mb-3 p-4 bg-malux-surface2 rounded-xl border border-malux-border space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Name *</label><input className="input text-xs" value={delivForm.name} onChange={e=>setDelivForm(p=>({...p,name:e.target.value}))} /></div>
                    <div><label className="label">Format</label><input className="input text-xs" placeholder="PDF, Dashboard, etc." value={delivForm.format} onChange={e=>setDelivForm(p=>({...p,format:e.target.value}))} /></div>
                    <div><label className="label">Due Date</label><input type="date" className="input text-xs" value={delivForm.dueDate} onChange={e=>setDelivForm(p=>({...p,dueDate:e.target.value}))} /></div>
                    <div><label className="label">Acceptance Criteria</label><input className="input text-xs" value={delivForm.criteria} onChange={e=>setDelivForm(p=>({...p,criteria:e.target.value}))} /></div>
                  </div>
                  <div className="flex gap-2"><button onClick={submitDeliverable} className="btn-primary text-xs">Save</button><button onClick={()=>setShowAddDeliverable(false)} className="btn-ghost text-xs">Cancel</button></div>
                </div>
              )}
              <div className="space-y-2">
                {(stage.deliverables||[]).map(d => (
                  <DeliverableItem key={d.id} deliverable={d}
                    onUpdate={(patch) => onUpdateDeliverable(d.id, patch)} />
                ))}
                {!stage.deliverables?.length && !showAddDeliverable && <p className="text-malux-muted font-mono text-xs">No deliverables.</p>}
              </div>
            </Section>

            {/* Blockers */}
            <Section title="Blockers" action={<button onClick={() => setShowAddBlocker(v=>!v)} className="btn-ghost flex items-center gap-1"><Plus size={11}/>Add Blocker</button>}>
              {showAddBlocker && (
                <div className="mb-3 p-4 bg-malux-surface2 rounded-xl border border-malux-pink/20 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="label">Blocker *</label><input className="input text-xs" value={blockerForm.text} onChange={e=>setBlockerForm(p=>({...p,text:e.target.value}))} /></div>
                    <div><label className="label">Type</label>
                      <select className="input text-xs" value={blockerForm.type} onChange={e=>setBlockerForm(p=>({...p,type:e.target.value}))}>
                        {['Data','People','Technical','Unclear'].map(t=><option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <div><label className="label">Owner</label><input className="input text-xs" value={blockerForm.owner} onChange={e=>setBlockerForm(p=>({...p,owner:e.target.value}))} /></div>
                    <div><label className="label">Action Being Taken</label><input className="input text-xs" value={blockerForm.action} onChange={e=>setBlockerForm(p=>({...p,action:e.target.value}))} /></div>
                  </div>
                  <div className="flex gap-2"><button onClick={submitBlocker} className="btn-primary text-xs">Log Blocker</button><button onClick={()=>setShowAddBlocker(false)} className="btn-ghost text-xs">Cancel</button></div>
                </div>
              )}
              <div className="space-y-2">
                {(stage.blockers||[]).map(b => (
                  <BlockerItem key={b.id} blocker={b}
                    onResolve={() => onUpdateStage(st => ({
                      ...st,
                      blockers: st.blockers.map(bl => bl.id===b.id ? {...bl, status:'resolved', resolvedDate: new Date().toISOString().slice(0,10)} : bl)
                    }))} />
                ))}
                {!stage.blockers?.length && !showAddBlocker && <p className="text-malux-muted font-mono text-xs">No blockers. 🟢</p>}
              </div>
            </Section>

            {/* Comments (client-visible) */}
            <Section title="Comments" sublabel="Visible in client view if enabled">
              <div className="space-y-2 mb-3">
                {(stage.comments||[]).map(c => (
                  <div key={c.id} className={`p-3 rounded-lg border text-sm ${c.role==='client' ? 'bg-malux-surface2 border-malux-amber/20 ml-4' : 'bg-malux-surface border-malux-border'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-mono text-xs ${c.role==='client'?'text-malux-amber':'text-malux-purplelight'}`}>{c.author}</span>
                      <span className="font-mono text-malux-faint text-xs">{format(new Date(c.timestamp),'dd MMM HH:mm')}</span>
                    </div>
                    <p className="text-malux-text text-xs">{c.text}</p>
                  </div>
                ))}
              </div>
              <CommentInput onSubmit={(text) => onAddComment({ text, author:'Valentina', role:'analyst' })} />
            </Section>

          </div>
          <div className="h-4" />
        </div>
      )}
    </div>
  )
}

// ─── SYSTEMS TAB ─────────────────────────────────────────────────────────────

function SystemsTab({ engagement, onAddSystem, onUpdate }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name:'', purpose:'', owner:'', upstream:'', downstream:'', quality:'', tech:'', notes:'' })
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const submit = () => {
    if (!form.name.trim()) return
    onAddSystem({ ...form })
    setForm({ name:'', purpose:'', owner:'', upstream:'', downstream:'', quality:'', tech:'', notes:'' })
    setShowForm(false)
  }

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Systems Intelligence Map</h2>
        <button onClick={() => setShowForm(v=>!v)} className="btn-primary flex items-center gap-1.5"><Plus size={14}/>Add System</button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-4">
          <h3 className="font-display font-semibold text-malux-text">New System</h3>
          <div className="grid grid-cols-3 gap-3">
            {[['name','System Name *'],['purpose','Purpose'],['owner','Data Owner'],['upstream','Upstream Feeds'],['downstream','Downstream Outputs'],['tech','Format / Tech'],['quality','Quality Concerns'],['notes','Notes']].map(([k,l]) => (
              <div key={k} className={k==='notes'?'col-span-3':''}>
                <label className="label">{l}</label>
                <input className="input text-xs" value={form[k]} onChange={e=>set(k,e.target.value)} />
              </div>
            ))}
          </div>
          <div className="flex gap-2"><button onClick={submit} className="btn-primary">Save System</button><button onClick={()=>setShowForm(false)} className="btn-ghost">Cancel</button></div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b border-malux-border text-malux-muted text-left">
              {['System','Purpose','Owner','Upstream','Downstream','Tech','Quality','Notes'].map(h => (
                <th key={h} className="pb-2 pr-4 font-mono font-normal uppercase text-xs tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(engagement.systemsMap||[]).map(s => (
              <tr key={s.id} className="border-b border-malux-border/50 hover:bg-malux-surface2/30 transition-colors">
                <td className="py-3 pr-4 font-semibold text-malux-text">{s.name}</td>
                <td className="py-3 pr-4 text-malux-muted">{s.purpose||'—'}</td>
                <td className="py-3 pr-4 text-malux-muted">{s.owner||'—'}</td>
                <td className="py-3 pr-4 text-malux-muted">{s.upstream||'—'}</td>
                <td className="py-3 pr-4 text-malux-muted">{s.downstream||'—'}</td>
                <td className="py-3 pr-4 text-malux-muted">{s.tech||'—'}</td>
                <td className="py-3 pr-4 text-malux-pink">{s.quality||'—'}</td>
                <td className="py-3 pr-4 text-malux-muted">{s.notes||'—'}</td>
              </tr>
            ))}
            {!engagement.systemsMap?.length && (
              <tr><td colSpan="8" className="py-8 text-center text-malux-muted">No systems mapped yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── DECISIONS TAB ───────────────────────────────────────────────────────────

function DecisionsTab({ engagement, onAddDecision }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ decision:'', context:'', agreedBy:'', impact:'', reversible:'yes' })
  const set = (k,v) => setForm(p=>({...p,[k]:v}))

  const submit = () => {
    if (!form.decision.trim()) return
    onAddDecision({ ...form, date: new Date().toISOString().slice(0,10) })
    setForm({ decision:'', context:'', agreedBy:'', impact:'', reversible:'yes' })
    setShowForm(false)
  }

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">Decisions & Rationale Log</h2>
        <button onClick={() => setShowForm(v=>!v)} className="btn-primary flex items-center gap-1.5"><Plus size={14}/>Log Decision</button>
      </div>

      {showForm && (
        <div className="card mb-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2"><label className="label">Decision *</label><input className="input" placeholder="What was decided?" value={form.decision} onChange={e=>set('decision',e.target.value)} /></div>
            <div className="col-span-2"><label className="label">Context / Why</label><textarea className="textarea" rows={2} placeholder="The reasoning behind it" value={form.context} onChange={e=>set('context',e.target.value)} /></div>
            <div><label className="label">Agreed By</label><input className="input text-xs" value={form.agreedBy} onChange={e=>set('agreedBy',e.target.value)} /></div>
            <div><label className="label">Impact</label><input className="input text-xs" value={form.impact} onChange={e=>set('impact',e.target.value)} /></div>
            <div><label className="label">Reversible?</label>
              <select className="input text-xs" value={form.reversible} onChange={e=>set('reversible',e.target.value)}>
                <option value="yes">Yes</option><option value="no">No</option><option value="partial">Partially</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2"><button onClick={submit} className="btn-primary">Log Decision</button><button onClick={()=>setShowForm(false)} className="btn-ghost">Cancel</button></div>
        </div>
      )}

      <div className="space-y-3">
        {(engagement.decisions||[]).map((d, i) => (
          <div key={d.id} className="card">
            <div className="flex items-start gap-3">
              <span className="font-display font-bold text-malux-purple text-lg w-6 flex-shrink-0">{i+1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-malux-text">{d.decision}</p>
                {d.context && <p className="text-malux-muted text-xs mt-1">{d.context}</p>}
                <div className="flex gap-3 mt-2 flex-wrap">
                  {d.date && <span className="font-mono text-xs text-malux-muted">{d.date}</span>}
                  {d.agreedBy && <span className="badge badge-purple">Agreed: {d.agreedBy}</span>}
                  {d.impact && <span className="font-mono text-xs text-malux-amber">Impact: {d.impact}</span>}
                  <span className={`badge ${d.reversible==='no'?'badge-pink':'badge-gray'}`}>
                    {d.reversible==='yes'?'Reversible':d.reversible==='no'?'Irreversible':'Partially reversible'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!engagement.decisions?.length && !showForm && (
          <div className="card text-center py-8"><p className="text-malux-muted font-mono text-xs">No decisions logged yet. Every decision made during the engagement belongs here.</p></div>
        )}
      </div>
    </div>
  )
}

// ─── QUESTIONS TAB ───────────────────────────────────────────────────────────

function QuestionsTab({ engagement, onUpdate }) {
  const [text, setText] = useState('')
  const allQ = engagement.stages.flatMap(s => (s.openQuestions||[]).map(q => ({ ...q, stage: s.name })))
  const open = allQ.filter(q => q.status !== 'resolved')
  const resolved = allQ.filter(q => q.status === 'resolved')

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Open Questions & Assumptions</h2>
        <div className="flex gap-2 font-mono text-xs text-malux-muted">
          <span className="text-malux-amber">{open.length} open</span>
          <span>·</span>
          <span className="text-malux-mint">{resolved.length} resolved</span>
        </div>
      </div>

      <div className="space-y-2">
        {open.map(q => (
          <div key={q.id} className="card flex items-start gap-3">
            <span className="text-malux-amber mt-0.5">?</span>
            <div className="flex-1">
              <p className="text-malux-text text-sm">{q.text}</p>
              <p className="font-mono text-malux-muted text-xs mt-1">Stage: {q.stage} · Raised: {q.date}</p>
            </div>
          </div>
        ))}
        {!open.length && <p className="text-malux-muted font-mono text-xs">No open questions. Add them within each stage.</p>}
      </div>

      {resolved.length > 0 && (
        <>
          <h3 className="font-mono text-xs text-malux-muted uppercase tracking-widest">Resolved</h3>
          <div className="space-y-2 opacity-60">
            {resolved.map(q => (
              <div key={q.id} className="card flex items-start gap-3">
                <span className="text-malux-mint mt-0.5">✓</span>
                <div className="flex-1">
                  <p className="text-malux-text text-sm line-through">{q.text}</p>
                  {q.resolution && <p className="text-malux-mint text-xs mt-1">{q.resolution}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ─── PULSE TAB ───────────────────────────────────────────────────────────────

function PulseTab({ engagement, onAddPulse }) {
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ health:'green', summary:'', delivered:'', blockers:'', planned:'', analystNote:'' })
  const set = (k,v) => setForm(p=>({...p,[k]:v}))
  const sorted = [...(engagement.weeklyPulse||[])].sort((a,b)=>b.weekOf.localeCompare(a.weekOf))

  const submit = () => {
    onAddPulse({ ...form, weekOf: new Date().toISOString().slice(0,10) })
    setForm({ health:'green', summary:'', delivered:'', blockers:'', planned:'', analystNote:'' })
    setShowForm(false)
  }

  return (
    <div className="animate-in">
      <div className="flex items-center justify-between mb-6">
        <h2 className="section-title">Weekly Pulse Signal</h2>
        <button onClick={() => setShowForm(v=>!v)} className="btn-primary flex items-center gap-1.5"><Plus size={14}/>Log This Week</button>
      </div>

      {showForm && (
        <div className="card mb-6 space-y-4">
          <h3 className="font-display font-semibold text-malux-text">Week of {new Date().toISOString().slice(0,10)}</h3>
          <div>
            <label className="label">Overall Health</label>
            <div className="flex gap-2">
              {[['green','🟢 On Track'],['amber','🟡 Attention'],['red','🔴 Blocked']].map(([v,l]) => (
                <button key={v} onClick={() => set('health',v)}
                  className={`font-mono text-xs px-4 py-2 rounded-lg border transition-all ${form.health===v?'bg-malux-purple/10 border-malux-purple/30 text-malux-purplelight':'border-malux-border text-malux-muted'}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div><label className="label">Summary</label><textarea className="textarea" rows={2} placeholder="What happened this week?" value={form.summary} onChange={e=>set('summary',e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">What Was Delivered</label><textarea className="textarea" rows={2} value={form.delivered} onChange={e=>set('delivered',e.target.value)} /></div>
            <div><label className="label">Active Blockers</label><textarea className="textarea" rows={2} value={form.blockers} onChange={e=>set('blockers',e.target.value)} /></div>
            <div><label className="label">Planned Next Week</label><textarea className="textarea" rows={2} value={form.planned} onChange={e=>set('planned',e.target.value)} /></div>
            <div><label className="label">Analyst Note (private)</label><textarea className="textarea" rows={2} placeholder="Honest read on how things feel" value={form.analystNote} onChange={e=>set('analystNote',e.target.value)} /></div>
          </div>
          <div className="flex gap-2"><button onClick={submit} className="btn-primary">Save Pulse</button><button onClick={()=>setShowForm(false)} className="btn-ghost">Cancel</button></div>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((p, i) => {
          const h = getHealthColor(p.health)
          return (
            <div key={p.id} className={`card border ${i===0?h.border:'border-malux-border'}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className={`w-2 h-2 rounded-full ${h.dot} flex-shrink-0`} />
                <span className="font-display font-semibold text-malux-text">Week of {p.weekOf}</span>
                <span className={`badge text-xs ${h.bg} ${h.border} ${h.text}`}>{h.label}</span>
                {i===0 && <span className="badge badge-purple ml-auto">Latest</span>}
              </div>
              {p.summary && <p className="text-malux-text text-sm mb-2">{p.summary}</p>}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {p.delivered && <div><span className="font-mono text-malux-muted">Delivered: </span><span className="text-malux-text">{p.delivered}</span></div>}
                {p.blockers  && <div><span className="font-mono text-malux-pink">Blockers: </span><span className="text-malux-text">{p.blockers}</span></div>}
                {p.planned   && <div><span className="font-mono text-malux-muted">Next week: </span><span className="text-malux-text">{p.planned}</span></div>}
                {p.analystNote && <div className="col-span-2 italic text-malux-muted border-t border-malux-border pt-2 mt-1">{p.analystNote}</div>}
              </div>
            </div>
          )
        })}
        {!sorted.length && <div className="card text-center py-8"><p className="text-malux-muted font-mono text-xs">No pulse entries yet. Log your first one every Friday — 10 minutes.</p></div>}
      </div>
    </div>
  )
}

// ─── REPORT TAB ──────────────────────────────────────────────────────────────

function ReportTab({ engagement, onUpdate, onGeneratePDF }) {
  const [maturityQ, setMaturityQ] = useState(engagement.maturityClose != null
    ? Array(5).fill(null).map((_, i) => Math.round(engagement.maturityClose / 5))
    : Array(5).fill(0)
  )
  const closeScore = maturityQ.reduce((a,b)=>a+b,0)

  const saveMaturityClose = () => onUpdate({ maturityClose: closeScore })

  return (
    <div className="animate-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="section-title">Report Builder</h2>
        <button onClick={onGeneratePDF} className="btn-primary flex items-center gap-2"><Download size={14}/>Generate PDF Report</button>
      </div>

      {/* Analyst summary */}
      <div className="card">
        <label className="label">Executive Summary (analyst)</label>
        <p className="font-mono text-malux-muted text-xs mb-2">This text appears verbatim in Section 1 of the leave-behind report.</p>
        <textarea className="textarea" rows={5}
          placeholder="Write a plain-language summary of what you found and what changed. Written for a non-technical reader."
          value={engagement.analystSummary||''}
          onChange={e => onUpdate({ analystSummary: e.target.value })}
        />
      </div>

      {/* Maturity close */}
      <div className="card">
        <h3 className="font-display font-semibold text-malux-text mb-1">Data Maturity — Close Assessment</h3>
        <p className="font-mono text-malux-muted text-xs mb-4">Intake score: <strong className="text-malux-text">{engagement.maturityIntake ?? 'Not set'}/25</strong></p>
        <div className="space-y-3">
          {MATURITY_QUESTIONS.map((q, i) => (
            <div key={i} className="flex items-start gap-4">
              <span className="font-mono text-malux-muted text-xs w-4 flex-shrink-0 mt-0.5">{i+1}.</span>
              <p className="text-sm text-malux-text flex-1">{q}</p>
              <div className="flex gap-1 flex-shrink-0">
                {[1,2,3,4,5].map(v => (
                  <button key={v} onClick={() => setMaturityQ(prev => prev.map((x,j)=>j===i?v:x))}
                    className={`w-7 h-7 rounded font-mono text-xs transition-all ${maturityQ[i]===v?'bg-malux-purple text-white':'bg-malux-surface2 text-malux-muted hover:bg-malux-surface3'}`}>
                    {v}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-malux-border">
          <span className="font-display font-bold text-2xl text-malux-text">{closeScore}<span className="text-malux-muted text-base">/25</span></span>
          <span className={`badge ${closeScore>engagement.maturityIntake?'badge-mint':closeScore<engagement.maturityIntake?'badge-pink':'badge-gray'}`}>
            {closeScore > (engagement.maturityIntake||0) ? `+${closeScore-(engagement.maturityIntake||0)} improvement` :
             closeScore < (engagement.maturityIntake||0) ? `${closeScore-(engagement.maturityIntake||0)} regression` : 'No change'}
          </span>
          <button onClick={saveMaturityClose} className="btn-primary ml-auto">Save Score</button>
        </div>
      </div>

      {/* Report checklist */}
      <div className="card">
        <h3 className="font-display font-semibold text-malux-text mb-4">Export Checklist</h3>
        {[
          [!!engagement.objective, 'Business objective defined'],
          [!!engagement.analystSummary, 'Executive summary written'],
          [engagement.systemsMap?.length > 0, 'Systems map populated'],
          [engagement.stages.some(s=>s.notes?.length>0), 'Stage notes added'],
          [engagement.decisions?.length > 0, 'Decisions logged'],
          [engagement.stages.some(s=>s.deliverables?.some(d=>d.status==='accepted')), 'Deliverables accepted'],
          [engagement.maturityIntake != null, 'Maturity intake score set'],
          [engagement.maturityClose != null, 'Maturity close score set'],
        ].map(([done, label]) => (
          <div key={label} className={`flex items-center gap-2 py-2 border-b border-malux-border/50 last:border-0 font-mono text-xs ${done?'text-malux-mint':'text-malux-muted'}`}>
            <span>{done ? '✓' : '○'}</span>
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────

function SettingsTab({ engagement, onUpdate, onToggleClientView, onExportJSON }) {
  return (
    <div className="animate-in space-y-4 max-w-2xl">
      <h2 className="section-title">Settings</h2>

      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-malux-text">Client View</h3>
        <p className="text-malux-muted text-xs font-body">When enabled, clients can view progress via a read-only link and add comments. They cannot edit any data.</p>
        <div className="flex items-center gap-4">
          <button onClick={onToggleClientView}
            className={`relative w-12 h-6 rounded-full transition-all ${engagement.clientViewEnabled?'bg-malux-purple':'bg-malux-surface2 border border-malux-border'}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${engagement.clientViewEnabled?'left-7':'left-1'}`} />
          </button>
          <span className="font-mono text-sm text-malux-text">{engagement.clientViewEnabled ? 'Enabled' : 'Disabled'}</span>
        </div>
        {engagement.clientViewEnabled && (
          <div>
            <label className="label">Client View URL</label>
            <div className="flex gap-2">
              <input className="input text-xs" readOnly value={`${window.location.origin}${window.location.pathname}#/client/${engagement.clientViewToken}`} />
            </div>
          </div>
        )}
      </div>

      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-malux-text">Engagement Status</h3>
        <div>
          <label className="label">Status</label>
          <select className="input" value={engagement.status} onChange={e => onUpdate({ status: e.target.value })}>
            <option value="active">Active</option>
            <option value="complete">Complete</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-semibold text-malux-text mb-3">Data Export</h3>
        <button onClick={onExportJSON} className="btn-ghost flex items-center gap-1.5">
          <Download size={13}/> Export as JSON
        </button>
        <p className="font-mono text-malux-muted text-xs mt-2">Full engagement data as JSON. Use for backup or migration.</p>
      </div>
    </div>
  )
}

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────

function Section({ title, sublabel, action, children }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="font-mono text-xs uppercase tracking-widest text-malux-muted">{title}</h4>
          {sublabel && <p className="font-mono text-malux-faint text-xs">{sublabel}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}

function NoteItem({ note }) {
  const icons = { note:'·', decision:'◆', blocker:'✕', milestone:'★' }
  const colors = { note:'text-malux-muted', decision:'text-malux-purplelight', blocker:'text-malux-pink', milestone:'text-malux-amber' }
  return (
    <div className="flex gap-3 p-3 bg-malux-surface2 rounded-lg">
      <span className={`font-mono text-sm flex-shrink-0 mt-0.5 ${colors[note.type]||'text-malux-muted'}`}>{icons[note.type]||'·'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-malux-text text-sm">{note.text}</p>
        <p className="font-mono text-malux-faint text-xs mt-1">{note.author} · {format(new Date(note.timestamp),'dd MMM yyyy HH:mm')}</p>
      </div>
    </div>
  )
}

function DeliverableItem({ deliverable: d, onUpdate }) {
  const statusColors = { pending:'text-malux-muted', 'in-review':'text-malux-amber', accepted:'text-malux-mint', rejected:'text-malux-pink' }
  return (
    <div className="flex items-center gap-3 p-3 bg-malux-surface2 rounded-lg">
      <span className={`font-mono text-sm ${statusColors[d.status]||'text-malux-muted'}`}>
        {d.status==='accepted'?'✓':d.status==='rejected'?'✕':d.status==='in-review'?'◎':'○'}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-malux-text text-sm font-medium">{d.name}</p>
        <p className="font-mono text-malux-muted text-xs">{d.format}{d.dueDate?` · Due: ${d.dueDate}`:''}</p>
      </div>
      <select className="input w-32 text-xs py-1" value={d.status} onChange={e => onUpdate({ status: e.target.value })}>
        <option value="pending">Pending</option>
        <option value="in-review">In Review</option>
        <option value="accepted">Accepted</option>
        <option value="rejected">Rejected</option>
      </select>
    </div>
  )
}

function BlockerItem({ blocker: b, onResolve }) {
  const typeColors = { Data:'text-malux-amber', People:'text-malux-purplelight', Technical:'text-malux-pink', Unclear:'text-malux-muted' }
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border ${b.status==='resolved'?'bg-malux-surface2 border-malux-border opacity-50':'bg-malux-pink/5 border-malux-pink/20'}`}>
      <span className={`font-mono text-xs mt-0.5 ${typeColors[b.type]||'text-malux-muted'}`}>{b.type}</span>
      <div className="flex-1 min-w-0">
        <p className="text-malux-text text-sm">{b.text}</p>
        {b.action && <p className="font-mono text-malux-muted text-xs mt-1">Action: {b.action}</p>}
        <p className="font-mono text-malux-faint text-xs">Raised: {b.raisedDate}{b.owner?` · Owner: ${b.owner}`:''}</p>
      </div>
      {b.status !== 'resolved' && (
        <button onClick={onResolve} className="btn-ghost text-xs flex-shrink-0">Resolve</button>
      )}
    </div>
  )
}

function CommentInput({ onSubmit }) {
  const [text, setText] = useState('')
  return (
    <div className="flex gap-2">
      <input className="input text-xs flex-1" placeholder="Add a comment…" value={text} onChange={e=>setText(e.target.value)}
        onKeyDown={e=>{if(e.key==='Enter'&&text.trim()){onSubmit(text.trim());setText('')}}} />
      <button onClick={() => { if(text.trim()){onSubmit(text.trim());setText('')} }} className="btn-ghost text-xs">Post</button>
    </div>
  )
}

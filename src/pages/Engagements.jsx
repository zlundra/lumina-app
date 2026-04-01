import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Archive, Trash2, ExternalLink, Copy, Check } from 'lucide-react'
import { useEngagements } from '../hooks/useEngagement.js'
import { calcEngagementCompletion, getStatusStyle } from '../utils/storage.js'
import ProgressRing from '../components/ProgressRing.jsx'

export default function Engagements() {
  const { engagements, create, remove } = useEngagements()
  const navigate = useNavigate()
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all'
    ? engagements
    : engagements.filter(e => e.status === filter)

  const handleCreate = (data) => {
    const e = create(data)
    setShowNew(false)
    navigate(`/engagements/${e.id}`)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8 animate-in">
        <div>
          <h1 className="font-display font-bold text-3xl text-malux-text">Engagements</h1>
          <p className="text-malux-muted font-mono text-xs mt-1">{engagements.length} total</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Engagement
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['all','active','complete','archived'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`font-mono text-xs px-4 py-1.5 rounded-full border transition-all ${
              filter === f
                ? 'bg-malux-purple/10 border-malux-purple/30 text-malux-purplelight'
                : 'border-malux-border text-malux-muted hover:border-malux-faint'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.map((e, i) => (
          <EngagementRow key={e.id} engagement={e} onDelete={() => remove(e.id)} delay={i} />
        ))}
        {filtered.length === 0 && (
          <div className="card text-center py-12">
            <p className="text-malux-muted font-body">No engagements found.</p>
            <button onClick={() => setShowNew(true)} className="btn-primary mt-4 inline-flex items-center gap-2">
              <Plus size={14} /> Create one
            </button>
          </div>
        )}
      </div>

      {/* New Engagement Modal */}
      {showNew && (
        <NewEngagementModal
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

function EngagementRow({ engagement: e, onDelete, delay }) {
  const pct = calcEngagementCompletion(e)
  const [copied, setCopied] = useState(false)

  const copyClientLink = () => {
    const url = `${window.location.origin}/lumina-app/#/client/${e.clientViewToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className="card-hover animate-in flex items-center gap-5"
      style={{ animationDelay: `${delay * 0.05}s`, opacity: 0 }}
    >
      <ProgressRing pct={pct} size={52} stroke={4} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          <Link
            to={`/engagements/${e.id}`}
            className="font-display font-semibold text-malux-text hover:text-malux-purplelight transition-colors"
          >
            {e.client}
          </Link>
          <span className={`badge ${
            e.status === 'active' ? 'badge-purple' :
            e.status === 'complete' ? 'badge-mint' : 'badge-gray'
          }`}>
            {e.status}
          </span>
        </div>
        <p className="font-mono text-malux-muted text-xs mt-0.5">
          {e.sector} · {e.engagementType} · Started {e.startDate || 'TBC'}
        </p>
        <div className="flex gap-1 mt-2">
          {e.stages?.map(s => (
            <div
              key={s.id}
              title={s.name}
              className={`h-1 w-6 rounded-full ${
                s.status === 'complete' ? 'bg-malux-mint' :
                s.status === 'in-progress' ? 'bg-malux-purple' :
                s.status === 'blocked' ? 'bg-malux-pink' : 'bg-malux-surface2'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {e.clientViewEnabled && (
          <button
            onClick={copyClientLink}
            title="Copy client view link"
            className="btn-ghost flex items-center gap-1.5"
          >
            {copied ? <Check size={12} className="text-malux-mint" /> : <Copy size={12} />}
            {copied ? 'Copied' : 'Client Link'}
          </button>
        )}
        <Link to={`/engagements/${e.id}`} className="btn-ghost flex items-center gap-1.5">
          <ExternalLink size={12} />
          Open
        </Link>
        <button
          onClick={() => { if (confirm(`Delete "${e.client}"? This cannot be undone.`)) onDelete() }}
          className="btn-danger"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function NewEngagementModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    client: '', sector: '', orgSize: '', contactName: '', contactRole: '',
    startDate: '', duration: '', engagementType: 'project', feeStructure: '',
    objective: '', inScope: '', outScope: '',
  })
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  return (
    <div className="fixed inset-0 bg-malux-bg/90 backdrop-blur-md z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div
        className="bg-malux-surface border border-malux-border rounded-2xl p-8 w-full max-w-2xl shadow-malux-lg animate-in overflow-y-auto max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-display font-bold text-2xl text-malux-text mb-1">New Engagement</h2>
        <p className="text-malux-muted font-mono text-xs mb-6">LUMINA · Client Intake — Layer 01</p>

        <div className="space-y-5">
          {/* Client */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Client Organisation *">
              <input className="input" placeholder="e.g. NMBI" value={form.client} onChange={e => set('client', e.target.value)} />
            </Field>
            <Field label="Sector">
              <input className="input" placeholder="e.g. Healthcare Regulation" value={form.sector} onChange={e => set('sector', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Org Size">
              <input className="input" placeholder="e.g. ~100 staff" value={form.orgSize} onChange={e => set('orgSize', e.target.value)} />
            </Field>
            <Field label="Primary Contact">
              <input className="input" placeholder="Name" value={form.contactName} onChange={e => set('contactName', e.target.value)} />
            </Field>
            <Field label="Contact Role">
              <input className="input" placeholder="Role" value={form.contactRole} onChange={e => set('contactRole', e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field label="Start Date">
              <input className="input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
            </Field>
            <Field label="Duration">
              <input className="input" placeholder="e.g. 3 months" value={form.duration} onChange={e => set('duration', e.target.value)} />
            </Field>
            <Field label="Type">
              <select className="input" value={form.engagementType} onChange={e => set('engagementType', e.target.value)}>
                <option value="project">Project</option>
                <option value="retainer">Retainer</option>
                <option value="advisory">Advisory</option>
                <option value="contractor">Contractor</option>
              </select>
            </Field>
          </div>

          <Field label="Business Objective">
            <textarea className="textarea" rows={3} placeholder="What is the primary business problem to solve?" value={form.objective} onChange={e => set('objective', e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="In Scope">
              <textarea className="textarea" rows={2} placeholder="What's included" value={form.inScope} onChange={e => set('inScope', e.target.value)} />
            </Field>
            <Field label="Out of Scope">
              <textarea className="textarea" rows={2} placeholder="What's explicitly excluded" value={form.outScope} onChange={e => set('outScope', e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => { if (form.client.trim()) onCreate(form) }}
            disabled={!form.client.trim()}
            className="btn-primary flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Create Engagement →
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}

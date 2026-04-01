const STORAGE_KEY = 'lumina_engagements'
const VERSION_KEY = 'lumina_version'
const CURRENT_VERSION = '1.0.0'

export const generateId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

export const generateToken = () =>
  Math.random().toString(36).slice(2, 18)

// Default stage template
export const DEFAULT_STAGES = [
  { id: 's1', name: 'Discovery & Intake',              color: 'purple', icon: '🔍', description: 'Systems inventory, maturity assessment, scope agreement' },
  { id: 's2', name: 'Current State Analysis',          color: 'pink',   icon: '📊', description: 'Process mapping, data quality audit, stakeholder interviews' },
  { id: 's3', name: 'Gap & Opportunity Identification', color: 'amber',  icon: '⚡', description: 'Findings, prioritisation, data problem log' },
  { id: 's4', name: 'Solution Design',                 color: 'mint',   icon: '🎯', description: 'Recommendations, approach, tooling decisions' },
  { id: 's5', name: 'Delivery & Implementation',       color: 'purple', icon: '🚀', description: 'Work output log, deliverables, testing' },
  { id: 's6', name: 'Knowledge Transfer',              color: 'pink',   icon: '📚', description: 'Documentation, training, handover' },
  { id: 's7', name: 'Engagement Close',                color: 'mint',   icon: '✅', description: 'Leave-behind report, maturity reassessment, sign-off' },
]

export const createEngagement = (data) => ({
  id:                  generateId(),
  createdAt:           new Date().toISOString(),
  updatedAt:           new Date().toISOString(),
  status:              'active',          // active | complete | archived
  clientViewEnabled:   false,
  clientViewToken:     generateToken(),
  clientCanComment:    true,

  // Layer 01 — Intake
  client:              data.client || '',
  sector:              data.sector || '',
  orgSize:             data.orgSize || '',
  contactName:         data.contactName || '',
  contactRole:         data.contactRole || '',
  startDate:           data.startDate || '',
  duration:            data.duration || '',
  engagementType:      data.engagementType || 'project',
  feeStructure:        data.feeStructure || '',
  objective:           data.objective || '',
  successMidpoint:     data.successMidpoint || '',
  successEnd:          data.successEnd || '',
  successMetric:       data.successMetric || '',
  knownProblems:       data.knownProblems || '',
  inScope:             data.inScope || '',
  outScope:            data.outScope || '',
  excluded:            data.excluded || '',
  maturityIntake:      null,
  maturityClose:       null,
  analystSummary:      '',

  // Systems
  systemsMap:          [],   // { id, name, purpose, owner, upstream, downstream, quality, notes }

  // Stages
  stages: DEFAULT_STAGES.map(s => ({
    ...s,
    status:        'not-started', // not-started | in-progress | complete | blocked
    completionPct: 0,
    startDate:     null,
    endDate:       null,
    notes:         [],    // { id, text, author, timestamp, type:'note'|'decision'|'blocker'|'milestone' }
    subStages:     [],    // { id, name, status, completionPct, notes }
    deliverables:  [],    // { id, name, format, dueDate, criteria, status, acceptedBy, acceptedAt }
    openQuestions: [],    // { id, text, raisedBy, date, owner, status, resolution }
    comments:      [],    // { id, text, author, role:'analyst'|'client', timestamp, resolved }
    blockers:      [],    // { id, text, type, raisedDate, owner, action, status, resolvedDate }
  })),

  // Global
  weeklyPulse: [],     // { id, weekOf, health, summary, delivered, blockers, planned, analystNote }
  stakeholders: [],    // { id, name, role, interest, comms, notes }
  decisions: [],       // { id, date, decision, context, agreedBy, impact, reversible }
  openQuestions: [],   // global open questions
})

// CRUD operations
export const loadEngagements = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export const saveEngagements = (engagements) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(engagements))
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
    return true
  } catch { return false }
}

export const getEngagement = (id) => {
  const all = loadEngagements()
  return all.find(e => e.id === id) || null
}

export const getEngagementByToken = (token) => {
  const all = loadEngagements()
  return all.find(e => e.clientViewToken === token && e.clientViewEnabled) || null
}

export const saveEngagement = (engagement) => {
  const all = loadEngagements()
  const idx = all.findIndex(e => e.id === engagement.id)
  const updated = { ...engagement, updatedAt: new Date().toISOString() }
  if (idx >= 0) { all[idx] = updated } else { all.push(updated) }
  saveEngagements(all)
  return updated
}

export const deleteEngagement = (id) => {
  const all = loadEngagements().filter(e => e.id !== id)
  saveEngagements(all)
}

// Calculations
export const calcEngagementCompletion = (engagement) => {
  if (!engagement.stages?.length) return 0
  const total = engagement.stages.reduce((sum, s) => sum + (s.completionPct || 0), 0)
  return Math.round(total / engagement.stages.length)
}

export const calcMaturityDelta = (engagement) => {
  if (engagement.maturityIntake == null || engagement.maturityClose == null) return null
  return engagement.maturityClose - engagement.maturityIntake
}

export const getHealthColor = (health) => {
  if (health === 'green')  return { text: 'text-malux-mint',  bg: 'bg-malux-mint/10',  border: 'border-malux-mint/30',  dot: 'bg-malux-mint',  label: '🟢 On Track' }
  if (health === 'amber')  return { text: 'text-malux-amber', bg: 'bg-malux-amber/10', border: 'border-malux-amber/30', dot: 'bg-malux-amber', label: '🟡 Attention Needed' }
  if (health === 'red')    return { text: 'text-malux-pink',  bg: 'bg-malux-pink/10',  border: 'border-malux-pink/30',  dot: 'bg-malux-pink',  label: '🔴 Blocked' }
  return { text: 'text-malux-muted', bg: 'bg-malux-surface2', border: 'border-malux-border', dot: 'bg-malux-muted', label: '⚪ Not Started' }
}

export const getStatusStyle = (status) => {
  if (status === 'complete')    return { label: 'Complete',    color: 'badge-mint' }
  if (status === 'in-progress') return { label: 'In Progress', color: 'badge-purple' }
  if (status === 'blocked')     return { label: 'Blocked',     color: 'badge-pink' }
  return { label: 'Not Started', color: 'badge-gray' }
}

export const getMaturityLabel = (score) => {
  if (!score) return { label: 'Not assessed', color: 'text-malux-muted' }
  if (score <= 8)  return { label: 'Reactive',    color: 'text-malux-pink' }
  if (score <= 14) return { label: 'Aware',       color: 'text-malux-amber' }
  if (score <= 19) return { label: 'Structured',  color: 'text-malux-amber' }
  if (score <= 23) return { label: 'Proactive',   color: 'text-malux-mint' }
  return { label: 'Optimised', color: 'text-malux-mint' }
}

export const exportEngagementJSON = (engagement) => {
  const blob = new Blob([JSON.stringify(engagement, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `lumina-${engagement.client.toLowerCase().replace(/\s+/g,'-')}-${engagement.id}.json`
  a.click()
  URL.revokeObjectURL(url)
}

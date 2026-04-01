import { jsPDF } from 'jspdf'
import { calcEngagementCompletion, calcMaturityDelta, getMaturityLabel } from './storage.js'
import { format } from 'date-fns'

const COLORS = {
  bg:       [10,  10,  15],
  surface:  [18,  18,  26],
  surface2: [26,  26,  38],
  border:   [42,  42,  63],
  purple:   [124, 92,  252],
  purpleL:  [157, 132, 253],
  pink:     [252, 92,  125],
  mint:     [92,  252, 184],
  amber:    [252, 184, 92],
  text:     [232, 232, 244],
  muted:    [106, 106, 138],
  white:    [255, 255, 255],
}

const pw = 210 // A4 width mm
const ph = 297 // A4 height mm
const ml = 20  // margin left
const mr = 20  // margin right
const cw = pw - ml - mr // content width

export const generatePDF = (engagement) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  let y = 0

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const setFont  = (size, style='normal', color=COLORS.text) => {
    doc.setFontSize(size)
    doc.setFont('helvetica', style)
    doc.setTextColor(...color)
  }

  const setFill  = (color) => doc.setFillColor(...color)
  const setDraw  = (color) => doc.setDrawColor(...color)

  const rect     = (x, rx, ry, rw, rh, fill, draw) => {
    if (fill) setFill(fill)
    if (draw) setDraw(draw)
    doc.rect(rx, ry, rw, rh, fill && draw ? 'FD' : fill ? 'F' : 'D')
  }

  const newPage  = () => { doc.addPage(); y = 20 }

  const checkSpace = (needed) => { if (y + needed > ph - 25) newPage() }

  const text     = (str, x, ty, opts={}) => { doc.text(str, x, ty, opts) }

  const line     = (x1, ly1, x2, ly2, color=COLORS.border) => {
    setDraw(color)
    doc.line(x1, ly1, x2, ly2)
  }

  const splitText = (str, maxW) => doc.splitTextToSize(str || '—', maxW)

  const tag      = (label, tx, ty, color=COLORS.purple) => {
    setFont(7, 'bold', color)
    text(label.toUpperCase(), tx, ty)
  }

  const sectionHeader = (title, icon='') => {
    checkSpace(18)
    y += 4
    setFill(COLORS.surface2)
    doc.roundedRect(ml, y, cw, 10, 1, 1, 'F')
    setFont(10, 'bold', COLORS.purpleL)
    text(`${icon}  ${title}`, ml + 4, y + 6.5)
    y += 16
  }

  const fieldRow = (label, value, indent=0) => {
    checkSpace(10)
    setFont(7.5, 'normal', COLORS.muted)
    text(label.toUpperCase(), ml + indent, y)
    setFont(8.5, 'normal', COLORS.text)
    const lines = splitText(value || '—', cw - indent - 40)
    text(lines, ml + indent + 40, y)
    y += Math.max(6, lines.length * 5) + 2
  }

  // ─── COVER PAGE ───────────────────────────────────────────────────────────
  setFill(COLORS.bg)
  doc.rect(0, 0, pw, ph, 'F')

  // Purple glow blob
  setFill([40, 20, 80])
  doc.circle(30, 60, 50, 'F')
  setFill([20, 10, 50])
  doc.circle(180, 240, 40, 'F')

  // Header stripe
  setFill(COLORS.surface)
  doc.rect(0, 0, pw, 55, 'F')

  // Logo mark — recreate icon as vector
  const lx = ml, ly = 12
  setDraw(COLORS.purpleL)
  doc.setLineWidth(0.4)
  doc.roundedRect(lx, ly, 22, 22, 2, 2, 'D')
  setFill(COLORS.text)
  doc.circle(lx + 6, ly + 8, 2.2, 'F')
  setFill(COLORS.purpleL)
  doc.circle(lx + 14, ly + 13, 1.4, 'F')
  doc.circle(lx + 10, ly + 16, 1.7, 'F')
  setFill([...COLORS.purpleL, 0.5])
  doc.circle(lx + 17, ly + 6, 1.2, 'F')
  doc.setLineWidth(0.3)
  setDraw([...COLORS.purpleL])
  doc.line(lx+6, ly+8, lx+14, ly+13)
  doc.line(lx+14, ly+13, lx+10, ly+16)

  // Logo text
  setFont(18, 'bold', COLORS.text)
  text('Ma', lx + 27, ly + 15)
  setFont(18, 'bold', COLORS.purpleL)
  text('Lux', lx + 42, ly + 15)

  // LUMINA label
  setFont(8, 'normal', COLORS.muted)
  text('LUMINA ENGAGEMENT FRAMEWORK', pw - mr, ly + 10, { align: 'right' })
  setFont(7, 'normal', COLORS.muted)
  text('maluxdata.io', pw - mr, ly + 16, { align: 'right' })

  // Line under header
  line(0, 55, pw, 55, COLORS.border)

  // Main cover content
  y = 90
  setFont(9, 'normal', COLORS.muted)
  text('ENGAGEMENT INTELLIGENCE REPORT', ml, y)
  y += 10

  setFont(28, 'bold', COLORS.text)
  const clientLines = splitText(engagement.client || 'Client Report', cw)
  text(clientLines, ml, y)
  y += clientLines.length * 12 + 6

  // Purple underline accent
  setFill(COLORS.purple)
  doc.rect(ml, y, 40, 1.5, 'F')
  y += 12

  setFont(11, 'normal', COLORS.purpleL)
  text(engagement.sector || '', ml, y)
  y += 10

  setFont(9, 'normal', COLORS.muted)
  text(`Engagement period: ${engagement.startDate || 'Ongoing'}  ·  ${engagement.engagementType || 'Project'}`, ml, y)
  y += 8
  text(`Prepared by: Valentina · MaLux Data Consulting`, ml, y)
  y += 8
  text(`Generated: ${format(new Date(), 'dd MMMM yyyy')}`, ml, y)

  // Completion badge
  const pct = calcEngagementCompletion(engagement)
  y += 20
  setFill(COLORS.surface)
  doc.roundedRect(ml, y, 70, 22, 3, 3, 'F')
  setFill(COLORS.purple)
  doc.roundedRect(ml, y, 70 * pct / 100, 22, 3, 3, 'F')
  setFont(14, 'bold', COLORS.white)
  text(`${pct}% Complete`, ml + 35, y + 14, { align: 'center' })

  // Maturity scores
  if (engagement.maturityIntake != null) {
    const delta = calcMaturityDelta(engagement)
    setFill(COLORS.surface2)
    doc.roundedRect(ml + 80, y, 110, 22, 3, 3, 'F')
    setFont(8, 'normal', COLORS.muted)
    text('DATA MATURITY', ml + 84, y + 7)
    setFont(12, 'bold', COLORS.text)
    text(`${engagement.maturityIntake}/25`, ml + 84, y + 16)
    setFont(8, 'normal', COLORS.muted)
    text('→', ml + 104, y + 16)
    setFont(12, 'bold', delta > 0 ? COLORS.mint : COLORS.text)
    text(`${engagement.maturityClose ?? '?'}/25`, ml + 112, y + 16)
    if (delta != null) {
      setFont(8, 'bold', delta > 0 ? COLORS.mint : COLORS.pink)
      text(delta > 0 ? `+${delta} ▲` : `${delta} ▼`, ml + 140, y + 16)
    }
  }

  // Footer on cover
  setFill(COLORS.surface)
  doc.rect(0, ph - 20, pw, 20, 'F')
  setFont(7, 'normal', COLORS.muted)
  text('Confidential · MaLux Data Consulting · maluxdata.io', pw / 2, ph - 10, { align: 'center' })

  // ─── PAGE 2 — EXECUTIVE SUMMARY ───────────────────────────────────────────
  newPage()

  // Running header on all subsequent pages
  const runningHeader = (pageTitle) => {
    setFill(COLORS.surface)
    doc.rect(0, 0, pw, 12, 'F')
    setFont(7, 'normal', COLORS.muted)
    text('LUMINA · MaLux Data Consulting', ml, 8)
    text(pageTitle, pw - mr, 8, { align: 'right' })
    line(0, 12, pw, 12, COLORS.border)
  }

  const runningFooter = (pageNum) => {
    line(0, ph - 12, pw, ph - 12, COLORS.border)
    setFont(7, 'normal', COLORS.muted)
    text(engagement.client, ml, ph - 6)
    text(`Page ${pageNum}`, pw - mr, ph - 6, { align: 'right' })
  }

  // Reusable section renderer
  let pageNum = 2
  const doPage = (title, fn) => {
    runningHeader(title)
    y = 22
    fn()
    runningFooter(pageNum)
    pageNum++
  }

  doPage('Executive Summary', () => {
    sectionHeader('Executive Summary', '01')

    setFont(9, 'normal', COLORS.muted)
    text('WHY WE ENGAGED', ml, y); y += 6
    setFont(9, 'normal', COLORS.text)
    const obj = splitText(engagement.objective || 'To be completed.', cw)
    text(obj, ml, y); y += obj.length * 5 + 8

    setFont(9, 'normal', COLORS.muted)
    text('WHAT WAS DELIVERED', ml, y); y += 6
    setFont(9, 'normal', COLORS.text)
    engagement.stages.forEach(s => {
      if (s.deliverables?.length) {
        s.deliverables.filter(d => d.status === 'accepted').forEach(d => {
          checkSpace(6)
          text(`·  ${d.name}`, ml + 4, y); y += 5
        })
      }
    })
    y += 6

    setFont(9, 'normal', COLORS.muted)
    text('ANALYST SUMMARY', ml, y); y += 6
    setFont(9, 'normal', COLORS.text)
    const summary = splitText(engagement.analystSummary || 'Summary to be added at engagement close.', cw)
    text(summary, ml, y); y += summary.length * 5 + 8

    // Quick stats
    checkSpace(30)
    const stats = [
      { label: 'Stages',       value: `${engagement.stages.filter(s => s.status==='complete').length}/${engagement.stages.length} complete` },
      { label: 'Decisions',    value: `${engagement.decisions?.length || 0} logged` },
      { label: 'Deliverables', value: `${engagement.stages.flatMap(s=>s.deliverables||[]).filter(d=>d.status==='accepted').length} accepted` },
      { label: 'Completion',   value: `${calcEngagementCompletion(engagement)}%` },
    ]
    const sw = (cw) / stats.length
    stats.forEach((st, i) => {
      const sx = ml + i * sw
      setFill(COLORS.surface2)
      doc.roundedRect(sx, y, sw - 4, 18, 2, 2, 'F')
      setFont(7, 'normal', COLORS.muted)
      text(st.label.toUpperCase(), sx + 4, y + 6)
      setFont(11, 'bold', COLORS.purpleL)
      text(st.value, sx + 4, y + 14)
    })
    y += 24
  })

  // ─── STAGE-BY-STAGE DETAIL ─────────────────────────────────────────────────
  engagement.stages.forEach((stage, si) => {
    if (stage.status === 'not-started') return
    newPage()
    doPage(`Stage ${si+1}: ${stage.name}`, () => {
      // Stage header
      setFill(COLORS.surface2)
      doc.roundedRect(ml, y, cw, 14, 2, 2, 'F')
      setFont(11, 'bold', COLORS.text)
      text(`${stage.icon || '●'}  ${stage.name}`, ml + 4, y + 9)
      const st = stage.status === 'complete' ? '✓ Complete' : stage.status === 'in-progress' ? '◎ In Progress' : '✕ Blocked'
      setFont(8, 'normal', stage.status === 'complete' ? COLORS.mint : stage.status === 'in-progress' ? COLORS.purpleL : COLORS.pink)
      text(st, pw - mr - 4, y + 9, { align: 'right' })
      y += 18

      // Progress bar
      setFill(COLORS.surface)
      doc.rect(ml, y, cw, 3, 'F')
      setFill(COLORS.purple)
      doc.rect(ml, y, cw * (stage.completionPct || 0) / 100, 3, 'F')
      setFont(7, 'normal', COLORS.muted)
      text(`${stage.completionPct || 0}% complete`, pw - mr, y + 2.5, { align: 'right' })
      y += 10

      // Notes
      if (stage.notes?.length) {
        setFont(8, 'bold', COLORS.purpleL)
        text('NOTES & OBSERVATIONS', ml, y); y += 6
        stage.notes.slice(0, 8).forEach(n => {
          checkSpace(8)
          const icon = n.type === 'decision' ? '◆' : n.type === 'blocker' ? '✕' : n.type === 'milestone' ? '★' : '·'
          setFont(7.5, 'normal', COLORS.muted)
          text(`${icon} ${format(new Date(n.timestamp), 'dd MMM')}`, ml, y)
          setFont(7.5, 'normal', COLORS.text)
          const nl = splitText(n.text, cw - 22)
          text(nl, ml + 22, y); y += nl.length * 4.5 + 2
        })
        y += 4
      }

      // Deliverables
      if (stage.deliverables?.length) {
        checkSpace(20)
        setFont(8, 'bold', COLORS.purpleL)
        text('DELIVERABLES', ml, y); y += 6
        stage.deliverables.forEach(d => {
          checkSpace(8)
          const icon = d.status === 'accepted' ? '✓' : d.status === 'in-review' ? '◎' : '○'
          setFont(7.5, 'normal', d.status === 'accepted' ? COLORS.mint : COLORS.muted)
          text(icon, ml, y)
          setFont(7.5, 'normal', COLORS.text)
          text(d.name, ml + 6, y)
          if (d.dueDate) { setFont(7, 'normal', COLORS.muted); text(d.dueDate, pw-mr, y, {align:'right'}) }
          y += 6
        })
        y += 4
      }

      // Sub-stages
      if (stage.subStages?.length) {
        checkSpace(14)
        setFont(8, 'bold', COLORS.purpleL)
        text('SUB-STAGES', ml, y); y += 6
        stage.subStages.forEach(ss => {
          checkSpace(7)
          setFont(7.5, 'normal', COLORS.muted)
          text(`→  ${ss.name}`, ml + 4, y)
          setFont(7, 'normal', ss.completionPct === 100 ? COLORS.mint : COLORS.amber)
          text(`${ss.completionPct || 0}%`, pw-mr, y, {align:'right'})
          y += 5.5
        })
        y += 4
      }
    })
  })

  // ─── DECISIONS LOG ────────────────────────────────────────────────────────
  if (engagement.decisions?.length) {
    newPage()
    doPage('Decisions & Rationale Log', () => {
      sectionHeader('Decisions & Rationale Log', '06')
      engagement.decisions.forEach((d, i) => {
        checkSpace(20)
        setFill(COLORS.surface2)
        doc.roundedRect(ml, y, cw, 2, 0, 0, 'F')
        y += 4
        setFont(8, 'bold', COLORS.text)
        text(`${i+1}.  ${d.decision}`, ml, y)
        setFont(7, 'normal', COLORS.muted)
        text(d.date || '', pw-mr, y, {align:'right'})
        y += 5
        if (d.context) {
          setFont(7.5, 'normal', COLORS.muted)
          const cl = splitText(d.context, cw - 8)
          text(cl, ml + 4, y); y += cl.length * 4.5
        }
        if (d.agreedBy) { tag(`Agreed: ${d.agreedBy}`, ml + 4, y); y += 5 }
        y += 4
      })
    })
  }

  // ─── OPEN ITEMS ───────────────────────────────────────────────────────────
  const allOpen = [
    ...engagement.stages.flatMap(s => (s.openQuestions||[]).filter(q=>q.status!=='resolved')),
    ...(engagement.openQuestions||[]).filter(q=>q.status!=='resolved'),
  ]
  if (allOpen.length) {
    newPage()
    doPage('Open Items & Recommendations', () => {
      sectionHeader('Open Items & Recommendations', '07')
      allOpen.forEach((q, i) => {
        checkSpace(10)
        setFont(8, 'normal', COLORS.amber)
        text(`${i+1}.`, ml, y)
        setFont(8, 'normal', COLORS.text)
        const ql = splitText(q.text, cw - 8)
        text(ql, ml + 8, y); y += ql.length * 5 + 3
      })
    })
  }

  // ─── MATURITY PAGE ────────────────────────────────────────────────────────
  if (engagement.maturityIntake != null) {
    newPage()
    doPage('Data Maturity Assessment', () => {
      sectionHeader('Data Maturity Assessment', '08')
      const delta = calcMaturityDelta(engagement)
      const intakeLabel = getMaturityLabel(engagement.maturityIntake)
      const closeLabel  = getMaturityLabel(engagement.maturityClose)

      fieldRow('Score at Intake',  `${engagement.maturityIntake}/25 — ${intakeLabel.label}`)
      fieldRow('Score at Close',   engagement.maturityClose != null ? `${engagement.maturityClose}/25 — ${closeLabel.label}` : 'Not yet assessed')
      if (delta != null) {
        fieldRow('Movement', `${delta > 0 ? '+' : ''}${delta} points (${delta > 0 ? 'improvement' : 'regression'})`)
      }
      y += 8

      // Visual bar
      const levels = ['Reactive','Aware','Structured','Proactive','Optimised']
      const bw = cw / 5
      levels.forEach((l, i) => {
        const lx = ml + i * bw
        const active = engagement.maturityIntake > i * 5
        setFill(active ? COLORS.purple : COLORS.surface2)
        doc.rect(lx, y, bw - 1, 8, 'F')
        setFont(6.5, active ? 'bold' : 'normal', active ? COLORS.white : COLORS.muted)
        text(l, lx + bw/2 - 1, y + 5.5, {align:'center'})
      })
      y += 16
    })
  }

  // ─── BACK COVER ───────────────────────────────────────────────────────────
  newPage()
  runningHeader('End of Report')

  setFill(COLORS.surface)
  doc.rect(0, ph/2 - 40, pw, 80, 'F')

  setFont(10, 'normal', COLORS.muted)
  text('This report was produced using the', pw/2, ph/2 - 20, {align:'center'})
  setFont(16, 'bold', COLORS.purpleL)
  text('LUMINA Engagement Framework', pw/2, ph/2 - 10, {align:'center'})
  setFont(9, 'normal', COLORS.muted)
  text('by MaLux Data Consulting', pw/2, ph/2, {align:'center'})
  setFont(8, 'normal', COLORS.muted)
  text('maluxdata.io', pw/2, ph/2 + 10, {align:'center'})
  text('All content is confidential to the client organisation and MaLux.', pw/2, ph/2 + 18, {align:'center'})

  // Save
  const filename = `LUMINA-Report-${(engagement.client||'client').replace(/\s+/g,'-')}-${format(new Date(),'yyyy-MM-dd')}.pdf`
  doc.save(filename)
}

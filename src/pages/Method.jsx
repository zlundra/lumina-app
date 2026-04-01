export default function Method() {
  const sections = [
    {
      title: 'Why LUMINA exists',
      icon: '🔮',
      content: `Most data and BA consultants deliver outputs — reports, dashboards, recommendations. The client pays, the analyst leaves, and everything learned during the engagement walks out the door with them.

LUMINA exists to change that. Every engagement run under this framework produces not just deliverables but institutional memory — a structured, readable record of the client's systems, processes, decisions, and data landscape that stays with them permanently.

This is the MaLux differentiator. It is not a tool. It is a method.`
    },
    {
      title: 'The 7 core principles',
      icon: '⚡',
      items: [
        ['Document as you work, not after', 'The leave-behind report should never be a retrospective scramble. Every session adds to it. By the end of the engagement, it should be 80% written.'],
        ['Plain language over jargon', 'Every section of every deliverable should be readable by a non-technical stakeholder. If the CEO can\'t understand it, rewrite it.'],
        ['Capture verbatim', 'When clients describe their problems in their own words, write those words down exactly. Don\'t sanitise. Their language reveals what they actually care about.'],
        ['Name the blockers', 'If something is slowing the work, log it immediately with a type and an owner. Unlogged blockers become client surprises.'],
        ['Scope protects everyone', 'The scope boundary in Layer 01 is not bureaucracy. It protects the client from false expectations and protects you from scope creep.'],
        ['The Pulse is for honesty', 'The weekly pulse is your private early warning system. If it\'s amber or red, log it that way. Catching it early is the point.'],
        ['The leave-behind is the product', 'The dashboards, the SQL, the recommendations — those are deliverables. The LUMINA report is the product.'],
      ]
    },
    {
      title: 'Weekly rhythm',
      icon: '📅',
      table: {
        headers: ['When', 'Action', 'Time'],
        rows: [
          ['After every session', 'Log session notes, decisions, blockers', '5 min'],
          ['As they happen', 'Log open questions and assumptions', '2 min each'],
          ['Every Friday', 'Update Weekly Pulse', '10 min'],
          ['Midpoint', 'Begin drafting Leave-Behind Report', '30 min'],
          ['Final week', 'Complete and export Leave-Behind', '2–3 hrs'],
        ]
      }
    },
    {
      title: 'Data Maturity Score',
      icon: '📊',
      table: {
        headers: ['Score', 'Level', 'What it means'],
        rows: [
          ['1–8',  '🔴 Reactive',    'Data is an afterthought. Decisions are gut-feel.'],
          ['9–14', '🟠 Aware',       'Some structure exists but applied inconsistently.'],
          ['15–19','🟡 Structured',  'Intentional approach but incomplete.'],
          ['20–23','🟢 Proactive',   'Data is genuinely managed. Ownership is clear.'],
          ['24–25','⭐ Optimised',   'Data is a strategic asset. Self-service works.'],
        ]
      }
    },
    {
      title: 'Blocker types',
      icon: '🚧',
      items: [
        ['Data',      'Can\'t proceed because data is missing, inaccessible, or too poor quality'],
        ['People',    'Waiting on a decision, approval, or input from a stakeholder'],
        ['Technical', 'System, access, or tooling issue preventing progress'],
        ['Unclear',   'Don\'t yet understand the problem well enough to move — needs clarification'],
      ]
    },
  ]

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-10 animate-in">
        <p className="font-mono text-malux-muted text-xs tracking-widest uppercase mb-2">Framework documentation</p>
        <h1 className="font-display font-bold text-4xl text-malux-text tracking-tight mb-2">
          LUMINA Method Guide
        </h1>
        <p className="text-malux-muted font-body">The principles, habits, and rules behind the framework.</p>
      </div>

      <div className="space-y-8">
        {sections.map((s, i) => (
          <div key={s.title} className="animate-in" style={{ animationDelay: `${i*0.07}s`, opacity:0 }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">{s.icon}</span>
              <h2 className="font-display font-bold text-xl text-malux-text">{s.title}</h2>
            </div>

            {s.content && (
              <div className="card">
                <p className="text-malux-muted font-body text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
              </div>
            )}

            {s.items && (
              <div className="space-y-3">
                {s.items.map(([title, desc], j) => (
                  <div key={j} className="card flex gap-4">
                    <span className="font-display font-bold text-malux-purple text-lg w-6 flex-shrink-0">{j+1}</span>
                    <div>
                      <p className="font-display font-semibold text-malux-text text-sm">{title}</p>
                      <p className="text-malux-muted font-body text-xs mt-1 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {s.table && (
              <div className="card overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-malux-border">
                      {s.table.headers.map(h => (
                        <th key={h} className="text-left font-mono text-malux-muted uppercase tracking-wider pb-2 pr-6">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((row, j) => (
                      <tr key={j} className="border-b border-malux-border/50 last:border-0">
                        {row.map((cell, k) => (
                          <td key={k} className={`py-2.5 pr-6 font-body ${k===0?'font-mono text-malux-purplelight':k===1?'font-semibold text-malux-text':'text-malux-muted'}`}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-malux-border text-center animate-in">
        <p className="font-mono text-malux-muted text-xs">LUMINA Engagement Framework · MaLux Data Consulting</p>
        <a href="https://maluxdata.io" className="font-mono text-malux-purplelight text-xs hover:underline">maluxdata.io</a>
      </div>
    </div>
  )
}

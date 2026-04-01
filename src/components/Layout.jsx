import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, FolderOpen, BookOpen,
  ExternalLink, ChevronRight, Menu, X
} from 'lucide-react'

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/engagements', icon: FolderOpen,       label: 'Engagements' },
  { to: '/method',      icon: BookOpen,          label: 'Method Guide' },
]

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-malux-bg">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex w-64 flex-shrink-0 border-r border-malux-border bg-malux-surface/60 backdrop-blur-xl flex-col sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* ── MOBILE TOP BAR ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-malux-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-malux-muted hover:text-malux-text hover:bg-malux-surface2 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <LogoMark size={24} />
          <span className="font-display font-bold text-malux-text">
            Ma<span className="text-malux-purple">Lux</span>
            <span className="text-malux-muted font-mono text-xs ml-1.5 font-normal">LUMINA</span>
          </span>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-malux-bg/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-72 bg-malux-surface border-r border-malux-border flex flex-col animate-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-malux-border">
              <div className="flex items-center gap-3">
                <LogoMark size={28} />
                <div>
                  <div className="font-display font-bold text-malux-text text-lg leading-none">
                    Ma<span className="text-malux-purple">Lux</span>
                  </div>
                  <div className="font-mono text-malux-muted text-xs tracking-widest mt-0.5">LUMINA</div>
                </div>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-2 text-malux-muted hover:text-malux-text">
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-4 py-5 space-y-1">
              {NAV.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg font-body text-sm transition-all duration-150 group
                    ${isActive
                      ? 'bg-malux-purple/10 text-malux-text border border-malux-purple/20'
                      : 'text-malux-muted hover:text-malux-text hover:bg-malux-surface2'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={16} className={isActive ? 'text-malux-purple' : 'text-malux-muted group-hover:text-malux-purplelight'} />
                      {label}
                      {isActive && <ChevronRight size={12} className="ml-auto text-malux-purple" />}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            <div className="px-4 py-4 border-t border-malux-border">
              <a href="https://maluxdata.io" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-malux-muted hover:text-malux-purplelight text-xs font-mono transition-colors">
                <ExternalLink size={12} /> maluxdata.io
              </a>
            </div>
          </aside>
        </>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 min-h-screen page-bg overflow-y-auto md:pt-0 pt-14">
        {children}
      </main>
    </div>
  )
}

function SidebarContent() {
  return (
    <>
      <div className="px-6 py-5 border-b border-malux-border">
        <div className="flex items-center gap-3">
          <LogoMark size={32} />
          <div>
            <div className="font-display font-bold text-malux-text text-lg leading-none">
              Ma<span className="text-malux-purple">Lux</span>
            </div>
            <div className="font-mono text-malux-muted text-xs tracking-widest mt-0.5">LUMINA</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-5 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg font-body text-sm transition-all duration-150 group
              ${isActive
                ? 'bg-malux-purple/10 text-malux-text border border-malux-purple/20'
                : 'text-malux-muted hover:text-malux-text hover:bg-malux-surface2'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-malux-purple' : 'text-malux-muted group-hover:text-malux-purplelight'} />
                {label}
                {isActive && <ChevronRight size={12} className="ml-auto text-malux-purple" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-malux-border">
        <a href="https://maluxdata.io" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-malux-muted hover:text-malux-purplelight text-xs font-mono transition-colors">
          <ExternalLink size={12} /> maluxdata.io
        </a>
        <p className="text-malux-faint font-mono text-xs px-4 mt-1">v1.0.0</p>
      </div>
    </>
  )
}

function LogoMark({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
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

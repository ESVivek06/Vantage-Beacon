import { Briefcase, Lightbulb, Brain, Package, Zap, ArrowDown } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Freelancer joins',
    description: 'Posts skills, availability, and goals to the platform.',
    icon: Briefcase,
    accent: '#7C3AED',
    accentLight: 'rgba(124,58,237,0.15)',
  },
  {
    number: '02',
    title: 'AI Engine analyses',
    description: 'Maps profile against network graph — roles, needs, timing.',
    icon: Brain,
    accent: '#14B8A6',
    accentLight: 'rgba(20,184,166,0.15)',
  },
  {
    number: '03',
    title: 'Match sent to Founder',
    description: 'Curated introduction delivered — no cold outreach, no noise.',
    icon: Lightbulb,
    accent: '#F59E0B',
    accentLight: 'rgba(245,158,11,0.15)',
  },
];

const roles = [
  { label: 'Freelancer', icon: Briefcase, color: '#7C3AED' },
  { label: 'Founder', icon: Lightbulb, color: '#0D9488' },
  { label: 'Investor', icon: Package, color: '#D97706' },
  { label: 'Supplier', icon: Package, color: '#DB2777' },
];

export default function Infographic() {
  return (
    <div
      style={{ width: 1080, height: 1080, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      className="relative overflow-hidden bg-primary-950 flex flex-col"
    >
      {/* Background radial */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 800px 600px at 540px -100px, rgba(99,102,241,0.3) 0%, transparent 60%), radial-gradient(ellipse 500px 400px at 540px 1180px, rgba(245,158,11,0.15) 0%, transparent 60%)',
        }}
      />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '54px 54px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-14 pt-14 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">V.B</span>
        </div>
        <div className="bg-primary-800/60 border border-primary-700/50 rounded-full px-4 py-1.5">
          <span className="text-primary-200 text-sm font-medium">How It Works</span>
        </div>
      </div>

      {/* Title */}
      <div className="relative z-10 px-14 pt-8 pb-6">
        <h1
          className="text-white font-black leading-none mb-3"
          style={{ fontSize: 56, letterSpacing: '-0.03em' }}
        >
          From Profile to
          <br />
          <span className="text-accent-400">Perfect Match.</span>
        </h1>
        <p className="text-primary-300 text-lg leading-relaxed max-w-lg">
          AI-powered business matching across UK, India, and North America. No cold outreach. Just results.
        </p>
      </div>

      {/* Steps */}
      <div className="relative z-10 flex-1 px-14 flex flex-col justify-center gap-0">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div key={step.number}>
              <div className="flex items-start gap-6 py-5">
                {/* Left: number + line */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                    style={{ backgroundColor: step.accentLight, border: `1.5px solid ${step.accent}40` }}
                  >
                    <Icon size={26} style={{ color: step.accent }} strokeWidth={2} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="text-xs font-bold tracking-widest uppercase"
                      style={{ color: step.accent }}
                    >
                      Step {step.number}
                    </span>
                  </div>
                  <h3
                    className="text-white font-bold mb-1.5"
                    style={{ fontSize: 24, letterSpacing: '-0.01em' }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-primary-300 text-base leading-relaxed">{step.description}</p>
                </div>
              </div>

              {/* Arrow between steps */}
              {idx < steps.length - 1 && (
                <div className="flex items-center pl-6 py-1">
                  <ArrowDown size={18} className="text-primary-700" strokeWidth={2} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom — all roles */}
      <div className="relative z-10 px-14 pb-14">
        <div className="border-t border-primary-800 pt-8">
          <p className="text-primary-500 text-xs font-semibold uppercase tracking-widest mb-4">
            All roles on one platform
          </p>
          <div className="flex items-center gap-4">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.label}
                  className="flex items-center gap-2.5 bg-primary-900/60 border border-primary-800 rounded-xl px-4 py-2.5 flex-1"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${role.color}20` }}
                  >
                    <Icon size={14} style={{ color: role.color }} strokeWidth={2.5} />
                  </div>
                  <span className="text-primary-200 text-sm font-semibold">{role.label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-primary-600 text-sm mt-5 text-center">vantagebeacon.com · Early Access</p>
        </div>
      </div>
    </div>
  );
}

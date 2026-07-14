import { UserPlus, Brain, Handshake, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'You join',
    description: 'Create your profile — role, skills, goals, and location.',
    color: '#4F46E5',
    bg: '#EEF2FF',
    border: '#C7D2FE',
  },
  {
    icon: Brain,
    step: '02',
    title: 'AI analyses',
    description: 'Our engine maps your profile against the entire network graph.',
    color: '#0D9488',
    bg: '#F0FDFA',
    border: '#99F6E4',
  },
  {
    icon: Handshake,
    step: '03',
    title: 'Match sent',
    description: 'You receive a curated introduction — no cold outreach needed.',
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
  },
];

export default function BannerC() {
  return (
    <div
      style={{ width: 1200, height: 627, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      className="relative overflow-hidden bg-neutral-50 flex flex-col justify-between px-16 py-14"
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
              <Zap size={15} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-neutral-900 font-bold text-base tracking-tight">V.B</span>
          </div>
          <h1
            className="text-neutral-900 font-black leading-none"
            style={{ fontSize: 42, letterSpacing: '-0.025em' }}
          >
            How it works
          </h1>
          <p className="text-neutral-500 text-base mt-2">Three steps to your first match.</p>
        </div>

        <div className="flex items-center gap-2 bg-success-50 border border-success-100 text-success-700 rounded-full px-4 py-2 text-sm font-semibold">
          <CheckCircle2 size={14} className="text-success-600" />
          AI-powered · No cold outreach
        </div>
      </div>

      {/* Flow steps */}
      <div className="relative z-10 flex items-stretch gap-0">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={s.step} className="flex items-center flex-1">
              {/* Card */}
              <div
                className="flex-1 rounded-2xl p-8 border"
                style={{ backgroundColor: s.bg, borderColor: s.border }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: s.color }}
                  >
                    <Icon size={22} className="text-white" strokeWidth={2} />
                  </div>
                  <span
                    className="text-4xl font-black opacity-20 leading-none"
                    style={{ color: s.color }}
                  >
                    {s.step}
                  </span>
                </div>
                <h3
                  className="font-bold text-neutral-900 mb-2"
                  style={{ fontSize: 22, letterSpacing: '-0.01em' }}
                >
                  {s.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{s.description}</p>
              </div>

              {/* Arrow connector */}
              {idx < steps.length - 1 && (
                <div className="flex-shrink-0 w-12 flex items-center justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-px bg-neutral-300" />
                    <ArrowRight size={16} className="text-neutral-400" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="relative z-10 flex items-center justify-between pt-2">
        <div className="flex items-center gap-6">
          {['UK', 'India', 'North America'].map((market) => (
            <div key={market} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-400" />
              <span className="text-neutral-500 text-sm">{market}</span>
            </div>
          ))}
        </div>
        <span className="text-neutral-400 text-sm font-medium">vantagebeacon.com · Early Access Open</span>
      </div>
    </div>
  );
}

import { Zap, ArrowRight } from 'lucide-react';

export default function BannerA() {
  return (
    <div
      style={{ width: 1200, height: 627, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      className="relative overflow-hidden bg-primary-950 flex flex-col justify-between"
    >
      {/* Radial glow top-left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 700px 500px at -100px -80px, rgba(99,102,241,0.35) 0%, transparent 70%), radial-gradient(ellipse 400px 300px at 1100px 600px, rgba(245,158,11,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-16 pt-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-600 flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">V.B</span>
        </div>

        {/* Tag */}
        <div className="flex items-center gap-2 bg-primary-800/60 border border-primary-700/60 rounded-full px-4 py-1.5">
          <div className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
          <span className="text-primary-200 text-sm font-medium">Now Live · Early Access</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-16 pb-4">
        <p className="text-primary-300 text-lg font-medium mb-4 tracking-wide uppercase" style={{ letterSpacing: '0.1em' }}>
          The Multi-Sided Business Platform
        </p>

        <h1
          className="text-white font-black mb-6 leading-none"
          style={{ fontSize: 80, letterSpacing: '-0.03em', lineHeight: 1.05 }}
        >
          Connect,
          <br />
          Match,
          <br />
          <span className="text-accent-400">Build.</span>
        </h1>

        <p className="text-primary-300 text-xl mb-10 max-w-xl leading-relaxed">
          AI-powered matching connecting freelancers, founders, investors &amp; suppliers across UK, India, and North America.
        </p>

        <div className="flex items-center gap-4">
          <button
            className="flex items-center gap-2 bg-accent-500 hover:bg-accent-400 text-white font-bold px-8 py-4 rounded-lg text-lg shadow-xl transition-colors"
            style={{ boxShadow: '0 0 40px rgba(245,158,11,0.4)' }}
          >
            Request Early Access
            <ArrowRight size={20} strokeWidth={2.5} />
          </button>
          <span className="text-primary-400 text-sm">vantagebeacon.com</span>
        </div>
      </div>

      {/* Bottom accent bar */}
      <div className="relative z-10 px-16 pb-10 flex items-center justify-between">
        <div className="flex items-center gap-6">
          {['Freelancers', 'Founders', 'Investors', 'Suppliers'].map((role) => (
            <div key={role} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
              <span className="text-primary-400 text-sm">{role}</span>
            </div>
          ))}
        </div>
        <div className="text-primary-600 text-xs">vantagebeacon.com</div>
      </div>

      {/* Right-side decorative circles */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none">
        <div
          className="w-96 h-96 rounded-full border border-primary-800/40"
          style={{ transform: 'translate(40%, 0)' }}
        />
        <div
          className="absolute w-72 h-72 rounded-full border border-primary-700/30"
          style={{ top: '50%', right: 0, transform: 'translate(60%, -50%)' }}
        />
        <div
          className="absolute w-48 h-48 rounded-full bg-primary-800/20"
          style={{ top: '50%', right: 0, transform: 'translate(70%, -50%)' }}
        />
      </div>
    </div>
  );
}

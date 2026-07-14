import { Users, Star, Zap, ArrowRight, Clock } from 'lucide-react';

const roles = [
  { label: 'Freelancer', color: '#7C3AED', bg: '#F5F3FF' },
  { label: 'Founder', color: '#0D9488', bg: '#F0FDFA' },
  { label: 'Investor', color: '#D97706', bg: '#FFFBEB' },
  { label: 'Supplier', color: '#DB2777', bg: '#FDF2F8' },
];

export default function BannerB() {
  return (
    <div
      style={{ width: 1200, height: 627, fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}
      className="relative overflow-hidden bg-white flex"
    >
      {/* Left panel — white */}
      <div className="flex-1 flex flex-col justify-between px-16 py-14 relative">
        {/* Subtle top-left glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 500px 400px at -80px -80px, rgba(99,102,241,0.06) 0%, transparent 70%)',
          }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary-600 flex items-center justify-center shadow-md">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-neutral-900 font-bold text-lg tracking-tight">V.B</span>
        </div>

        {/* Main stat */}
        <div className="relative z-10">
          <div className="flex items-end gap-3 mb-3">
            <span
              className="font-black text-primary-600 leading-none"
              style={{ fontSize: 96, letterSpacing: '-0.04em' }}
            >
              60+
            </span>
            <div className="pb-4">
              <div className="flex items-center gap-2 mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} className="text-accent-500 fill-accent-500" />
                ))}
              </div>
              <span className="text-neutral-500 text-lg font-medium">verified members</span>
            </div>
          </div>

          <h2
            className="text-neutral-900 font-bold mb-4 leading-tight"
            style={{ fontSize: 32, letterSpacing: '-0.02em' }}
          >
            The network that actually
            <br />
            <span className="text-primary-600">gets business done.</span>
          </h2>

          <p className="text-neutral-500 text-lg leading-relaxed max-w-md">
            AI-matched connections across UK, India, and North America. Real introductions, real opportunities.
          </p>
        </div>

        {/* CTA */}
        <div className="relative z-10 flex items-center gap-4">
          <button className="flex items-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-lg text-base shadow-md">
            Join Early Access
            <ArrowRight size={16} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-1.5 text-neutral-400 text-sm">
            <Clock size={13} />
            <span>Limited spots available</span>
          </div>
        </div>
      </div>

      {/* Right panel — light indigo */}
      <div className="w-96 bg-primary-50 border-l border-primary-100 flex flex-col justify-between px-10 py-14">
        {/* Members count */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Users size={18} className="text-primary-500" />
            <span className="text-primary-700 font-semibold text-sm">Active Members</span>
          </div>

          {/* Role chips */}
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.label}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm border border-neutral-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: role.color }}
                  />
                  <span className="font-medium text-neutral-700 text-sm">{role.label}</span>
                </div>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: role.color, backgroundColor: role.bg }}
                >
                  Verified
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Social proof */}
        <div className="border-t border-primary-200 pt-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex -space-x-2">
              {['#6366F1', '#14B8A6', '#F59E0B', '#7C3AED'].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white"
                  style={{ backgroundColor: c }}
                >
                  {['JD', 'SR', 'ML', 'AK'][i]}
                </div>
              ))}
            </div>
            <span className="text-neutral-600 text-sm font-medium">Joined this week</span>
          </div>
          <p className="text-primary-700 text-xs font-semibold uppercase tracking-wider">
            Early Access · Apply Now
          </p>
        </div>
      </div>
    </div>
  );
}

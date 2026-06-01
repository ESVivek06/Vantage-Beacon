import Link from 'next/link';
import { Briefcase, Rocket, TrendingUp, Package, Globe, ShieldCheck, Zap, Users, Lock, Check, ArrowRight, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RoleBadge } from '@/components/TrustBadge';
import { MarketingNav } from '@/components/join/MarketingNav';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neutral-0 font-sans">
      <MarketingNav />

      {/* Hero */}
      <section
        className="relative overflow-hidden py-32 md:py-[128px]"
        style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 60%, #0F766E 100%)' }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-[200px] -right-[100px] h-[600px] w-[600px] rounded-full blur-[120px]" style={{ background: 'rgba(79,70,229,0.2)' }} />
          <div className="absolute -bottom-[100px] left-[10%] h-[400px] w-[400px] rounded-full blur-[80px]" style={{ background: 'rgba(13,148,136,0.2)' }} />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-3 py-1" style={{ background: 'rgba(245,158,11,0.2)', borderColor: 'rgba(245,158,11,0.3)' }}>
            <span className="text-xs font-semibold tracking-wide text-accent-300">Now in early access · UK · India · North America</span>
          </div>
          <h1 className="text-display-2xl font-bold text-neutral-0" style={{ letterSpacing: '-0.025em' }}>
            Where Business<br />Gets Built
          </h1>
          <p className="mx-auto mt-6 max-w-[620px] text-xl text-primary-200">
            V.B connects freelancers, founders, investors, and suppliers on one intelligent platform. Stop searching — start matching.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              size="xl"
              asChild
              className="w-full bg-accent-500 text-neutral-900 shadow-md hover:bg-accent-400 sm:w-auto"
            >
              <Link href="/join/role">Get early access <ArrowRight className="ml-1 h-5 w-5" /></Link>
            </Button>
            <Button
              size="xl"
              variant="ghost"
              asChild
              className="w-full border-white/30 text-neutral-0 hover:bg-white/10 sm:w-auto"
            >
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
          <div className="mt-5 flex items-center justify-center gap-3">
            <div className="flex" aria-hidden="true">
              {['#818CF8', '#4F46E5', '#14B8A6', '#A5B4FC', '#F59E0B'].map((color, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2"
                  style={{ backgroundColor: color, borderColor: '#3730A3', marginLeft: i > 0 ? '-8px' : '0' }}
                />
              ))}
            </div>
            <span className="ml-3 text-sm font-medium text-neutral-300">47 professionals already joined</span>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="border-b border-neutral-200 bg-neutral-0 py-5">
        <div className="mx-auto max-w-[1160px] overflow-x-auto px-4">
          <div className="flex min-w-max items-center justify-center gap-12">
            {[
              { icon: <Globe className="h-5 w-5 text-neutral-400" />, text: 'UK · India · North America' },
              { icon: <ShieldCheck className="h-5 w-5 text-success-600" />, text: 'Verified Users Only' },
              { icon: <Zap className="h-5 w-5 text-primary-600" />, text: 'AI-Powered Matching' },
              { icon: <Users className="h-5 w-5 text-secondary-600" />, text: 'Multi-role Platform' },
              { icon: <Lock className="h-5 w-5 text-neutral-400" />, text: 'Private & Secure' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex flex-col items-center gap-2">
                {icon}
                <span className="text-sm font-semibold text-neutral-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards */}
      <section className="bg-neutral-50 px-4 py-24">
        <div className="mx-auto max-w-[640px] text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary-600">Built for every role</p>
          <h2 className="mt-2 text-display-md font-bold text-neutral-900">One platform. Every role in the build journey.</h2>
          <p className="mt-3 text-lg text-neutral-500">V.B is designed for the ecosystem, not just one type of user.</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-[1160px] grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ROLE_CARDS.map((card) => (
            <RoleCard key={card.role} {...card} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-neutral-0 px-4 py-24">
        <div className="mx-auto max-w-[560px] text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary-600">How it works</p>
          <h2 className="mt-2 text-display-md font-bold text-neutral-900">From registration to connection in 3 steps</h2>
        </div>
        <div className="relative mx-auto mt-16 flex max-w-[960px] flex-col gap-8 md:flex-row md:justify-center">
          <div aria-hidden="true" className="absolute top-[28px] left-[calc(50%-200px)] hidden h-0.5 w-[400px] bg-neutral-200 md:block" />
          {HOW_IT_WORKS.map((step, i) => (
            <div key={i} className="relative z-10 flex flex-1 flex-col items-center text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold"
                style={{ backgroundColor: step.color, color: step.textColor }}
              >
                {i + 1}
              </div>
              <h3 className="mt-6 text-display-sm font-semibold text-neutral-900">{step.title}</h3>
              <p className="mt-2 text-md text-neutral-500">{step.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section
        className="px-4 py-20"
        style={{ background: 'linear-gradient(90deg, #4F46E5 0%, #0D9488 100%)' }}
      >
        <div className="mx-auto grid max-w-[960px] grid-cols-2 gap-8 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <span className="text-display-lg font-bold text-neutral-0">{s.value}</span>
              <span className="mt-1 text-md font-medium text-primary-200">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-neutral-50 px-4 py-24 text-center">
        <h2 className="text-display-md font-bold text-neutral-900">Ready to build something together?</h2>
        <p className="mt-4 text-lg text-neutral-500">Join the V.B early access list. Free. No commitment.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button size="xl" asChild className="w-full sm:w-auto">
            <Link href="/join/role">Get early access</Link>
          </Button>
          <Button size="xl" variant="secondary" asChild className="w-full sm:w-auto">
            <a href="#how-it-works">How it works</a>
          </Button>
        </div>
        <p className="mt-6 text-sm text-neutral-500">🔒 No credit card required · Invite-only launch · Privacy guaranteed</p>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 px-4 py-12">
        <div className="mx-auto max-w-[1160px]">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div>
              <span className="text-display-sm font-bold text-neutral-0">V.B</span>
              <p className="mt-1 text-sm text-neutral-500">The platform for building businesses.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-neutral-400">
              {['Platform', 'Features', 'Pricing', 'About', 'Terms', 'Privacy', 'Cookies', 'Contact'].map((l) => (
                <a key={l} href="#" className="transition-colors hover:text-neutral-200">{l}</a>
              ))}
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-neutral-800 pt-6 sm:flex-row">
            <span className="text-sm text-neutral-500">© 2026 V.B. All rights reserved.</span>
            <div className="flex items-center gap-4 text-neutral-400">
              <a href="#" className="transition-colors hover:text-neutral-200" aria-label="LinkedIn"><Linkedin className="h-5 w-5" /></a>
              <a href="#" className="transition-colors hover:text-neutral-200" aria-label="Twitter"><Twitter className="h-5 w-5" /></a>
              <a href="#" className="transition-colors hover:text-neutral-200" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function RoleCard({ role, icon, title, description, features, ctaLabel, accentBg, accentColor, ctaBg, ctaText }: {
  role: string; icon: React.ReactNode; title: string; description: string;
  features: string[]; ctaLabel: string; accentBg: string; accentColor: string;
  ctaBg: string; ctaText: string;
}) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-neutral-200 bg-neutral-0 p-8 transition-all duration-normal hover:-translate-y-1 hover:shadow-lg">
      <div className="absolute top-4 right-4">
        <RoleBadge role={role} />
      </div>
      <div className="flex h-14 w-14 items-center justify-center rounded-xl" style={{ backgroundColor: accentBg }}>
        <div style={{ color: accentColor }}>{icon}</div>
      </div>
      <h3 className="mt-6 text-display-sm font-bold text-neutral-900">{title}</h3>
      <p className="mt-3 text-md leading-relaxed text-neutral-600">{description}</p>
      <ul className="mt-4 flex flex-col gap-2">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <Check className="h-4 w-4 shrink-0" style={{ color: accentColor }} />
            {f}
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-6">
        <Button
          size="lg"
          className="w-full"
          style={{ backgroundColor: ctaBg, color: ctaText }}
          asChild
        >
          <Link href={`/join/role?preselect=${role}`}>{ctaLabel}</Link>
        </Button>
      </div>
    </div>
  );
}

const ROLE_CARDS = [
  {
    role: 'freelancer', title: 'Freelancer',
    icon: <Briefcase className="h-6 w-6" />,
    description: 'Get matched with funded founders who need exactly your skills. Set your terms, build your portfolio.',
    features: ['AI-matched to relevant projects', 'UK · India · North America markets', 'Verified investor-backed companies'],
    ctaLabel: 'Join as Freelancer', accentBg: '#E0E7FF', accentColor: '#4F46E5', ctaBg: '#4F46E5', ctaText: '#fff',
  },
  {
    role: 'founder', title: 'Founder / Startup',
    icon: <Rocket className="h-6 w-6" />,
    description: 'Find the talent, partners, and investors your startup needs — without the noise of generic job boards.',
    features: ['Curated freelancer talent pool', 'Connect with aligned investors', 'Supplier marketplace access'],
    ctaLabel: 'Join as Founder', accentBg: '#CCFBF1', accentColor: '#0D9488', ctaBg: '#0D9488', ctaText: '#fff',
  },
  {
    role: 'investor', title: 'Investor',
    icon: <TrendingUp className="h-6 w-6" />,
    description: 'Discover curated dealflow, meet verified founders at the right stage, and connect directly with operators.',
    features: ['Curated early-stage dealflow', 'Verified founder profiles', 'Direct founder messaging'],
    ctaLabel: 'Join as Investor', accentBg: '#FEF3C7', accentColor: '#B45309', ctaBg: '#F59E0B', ctaText: '#0F172A',
  },
  {
    role: 'supplier', title: 'Supplier / Service',
    icon: <Package className="h-6 w-6" />,
    description: 'Reach businesses that need your services. Build relationships with funded startups and established founders.',
    features: ['Access startup buyer ecosystem', 'Featured in discovery marketplace', 'Verified supplier badge'],
    ctaLabel: 'List Your Services', accentBg: '#DCFCE7', accentColor: '#16A34A', ctaBg: '#16A34A', ctaText: '#fff',
  },
];

const HOW_IT_WORKS = [
  { title: 'Create your profile', sub: 'Tell us your role, location, and what you bring to the table.', color: '#4F46E5', textColor: '#fff' },
  { title: 'Get AI-matched', sub: 'Our matching engine connects you with the most relevant people.', color: '#0D9488', textColor: '#fff' },
  { title: 'Connect & collaborate', sub: 'Start conversations, explore opportunities, and build your network.', color: '#F59E0B', textColor: '#0F172A' },
];

const STATS = [
  { value: '47+', label: 'Early Members' },
  { value: '4', label: 'Roles Served' },
  { value: '3', label: 'Markets' },
  { value: '100%', label: 'Verified Profiles' },
];

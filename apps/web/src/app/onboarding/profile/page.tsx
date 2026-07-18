'use client';

import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { StepProgress } from '@/components/onboarding/StepProgress';
import { InFieldNudge } from '@/components/InFieldNudge';

const STEPS = ['You', 'Profile', 'Preferences', 'Matching'];

type Role = 'freelancer' | 'founder' | 'investor' | 'supplier' | 'stakeholder';

function TagPills({
  tags, onAdd, onRemove, placeholder, max = 5,
}: {
  tags: string[]; onAdd: (v: string) => void; onRemove: (v: string) => void;
  placeholder?: string; max?: number;
}) {
  const [val, setVal] = useState('');
  return (
    <div className="flex flex-wrap gap-1.5 p-2.5 border border-neutral-200 rounded-md min-h-10 focus-within:border-primary-500 focus-within:shadow-focus-ring transition-shadow">
      {tags.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
          {t}
          <button type="button" onClick={() => onRemove(t)} aria-label={`Remove ${t}`} className="text-primary-400 hover:text-primary-700">
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      {tags.length < max && (
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && val.trim()) {
              e.preventDefault();
              onAdd(val.trim());
              setVal('');
            }
          }}
          placeholder={tags.length === 0 ? placeholder : undefined}
          className="text-sm bg-transparent border-none outline-none min-w-24 placeholder:text-neutral-400"
          aria-label={placeholder}
        />
      )}
    </div>
  );
}

export default function OnboardingProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [role, setRole] = useState<Role>('freelancer');

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.role) setRole(data.role as Role); })
      .catch(() => {});
  }, []);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Freelancer
  const [skills, setSkills] = useState<string[]>([]);
  const [availability, setAvailability] = useState('');

  // Founder
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [stage, setStage] = useState('');

  // Investor
  const [investFocus, setInvestFocus] = useState<string[]>([]);

  // Supplier
  const [serviceType, setServiceType] = useState<string[]>([]);

  // Stakeholder
  const [organization, setOrganization] = useState('');
  const [interestAreas, setInterestAreas] = useState<string[]>([]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  function addTag(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>, max = 5) {
    setter((p) => (p.includes(value) || p.length >= max ? p : [...p, value]));
  }

  function removeTag(value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) {
    setter((p) => p.filter((x) => x !== value));
  }

  async function handleSave() {
    setSubmitted(true);
    if (!name) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
    router.push('/onboarding/preferences');
  }

  const nameError = submitted && !name ? 'Full name is required' : '';

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/onboarding" className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-6">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mb-8">
          <StepProgress steps={STEPS} current={1} />
        </div>

        <h1 className="text-display-sm font-bold text-neutral-900 mb-1">
          Build your {role.charAt(0).toUpperCase() + role.slice(1)} profile
        </h1>
        <p className="text-md text-neutral-500 mb-8">This is what other members see first.</p>

        <div className="space-y-6 bg-neutral-0 rounded-xl shadow-xs p-6 border border-neutral-100">
          {/* Photo */}
          <div className="flex flex-col items-center gap-2">
            <div
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label="Upload profile photo"
              className="relative h-20 w-20 rounded-full border-2 border-dashed border-neutral-300 flex items-center justify-center cursor-pointer hover:border-primary-300 hover:bg-neutral-50 transition-colors overflow-hidden"
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Profile preview" className="h-full w-full object-cover" />
                  <button
                    onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); }}
                    className="absolute top-0 right-0 h-5 w-5 bg-neutral-900 text-white rounded-full flex items-center justify-center"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </>
              ) : (
                <div className="text-center">
                  <Camera className="h-6 w-6 text-neutral-400 mx-auto" />
                  <p className="text-2xs text-neutral-400 mt-0.5">Upload</p>
                </div>
              )}
            </div>
            <InFieldNudge />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} aria-label="Profile photo file input" />
          </div>

          {/* Full name */}
          <div>
            <Label htmlFor="ob-name" className="text-sm font-medium text-neutral-700 mb-1 block">
              Full name <span className="text-error-600" aria-hidden="true">*</span>
            </Label>
            <Input
              id="ob-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
              aria-required="true"
              aria-invalid={!!nameError}
              aria-describedby={nameError ? 'name-err' : undefined}
            />
            {nameError && <p id="name-err" className="text-xs text-error-600 mt-1" role="alert">{nameError}</p>}
          </div>

          {/* Location */}
          <div>
            <Label htmlFor="ob-location" className="text-sm font-medium text-neutral-700 mb-1 block">
              Location <span className="text-error-600" aria-hidden="true">*</span>
            </Label>
            <select
              id="ob-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-10 rounded-md border border-neutral-200 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-focus-ring"
              aria-required="true"
            >
              <option value="">Select city, country</option>
              <option>London, UK</option>
              <option>Manchester, UK</option>
              <option>Mumbai, India</option>
              <option>Bangalore, India</option>
              <option>New York, USA</option>
              <option>San Francisco, USA</option>
              <option>Remote / Global</option>
            </select>
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="ob-bio" className="text-sm font-medium text-neutral-700 mb-1 block">Short bio</Label>
            <textarea
              id="ob-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="Describe what you do and what you're looking for"
              className="w-full rounded-md border border-neutral-200 text-sm px-3 py-2 resize-none focus:outline-none focus:border-primary-500 focus:shadow-focus-ring placeholder:text-neutral-400"
            />
            <div className="flex justify-between mt-0.5">
              <InFieldNudge />
              <span className="text-xs text-neutral-400">{bio.length}/280</span>
            </div>
          </div>

          {/* Freelancer fields */}
          {role === 'freelancer' && (
            <>
              <div>
                <Label className="text-sm font-medium text-neutral-700 mb-1 block">
                  Primary skills <span className="text-error-600" aria-hidden="true">*</span>
                </Label>
                <TagPills
                  tags={skills}
                  onAdd={(v) => addTag(v, setSkills)}
                  onRemove={(v) => removeTag(v, setSkills)}
                  placeholder="Type a skill + Enter (max 5)"
                />
                <InFieldNudge className="mt-1" />
              </div>
              <div>
                <Label className="text-sm font-medium text-neutral-700 mb-2 block">Availability</Label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Availability">
                  {['Full-time', 'Part-time', 'Project-based', 'Not available'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={availability === opt}
                      onClick={() => setAvailability(opt)}
                      className={['px-3 py-1.5 rounded-full border text-sm transition-colors focus-visible:outline-none focus-visible:shadow-focus-ring', availability === opt ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'].join(' ')}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
                <InFieldNudge className="mt-1" />
              </div>
            </>
          )}

          {/* Founder fields */}
          {role === 'founder' && (
            <>
              <div>
                <Label htmlFor="ob-company" className="text-sm font-medium text-neutral-700 mb-1 block">Company name <span className="text-error-600" aria-hidden="true">*</span></Label>
                <Input id="ob-company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your company" />
              </div>
              <div>
                <Label htmlFor="ob-industry" className="text-sm font-medium text-neutral-700 mb-1 block">Industry <span className="text-error-600" aria-hidden="true">*</span></Label>
                <select id="ob-industry" value={industry} onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-10 rounded-md border border-neutral-200 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-focus-ring">
                  <option value="">Select industry</option>
                  {['Tech', 'Fintech', 'Health', 'EdTech', 'E-commerce', 'SaaS', 'Other'].map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-sm font-medium text-neutral-700 mb-2 block">Stage <span className="text-error-600" aria-hidden="true">*</span></Label>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Company stage">
                  {['Idea', 'Pre-seed', 'Seed', 'Series A', 'Growth'].map((s) => (
                    <button key={s} type="button" role="radio" aria-checked={stage === s} onClick={() => setStage(s)}
                      className={['px-3 py-1.5 rounded-full border text-sm transition-colors', stage === s ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-neutral-200 text-neutral-700 hover:border-neutral-300'].join(' ')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {role === 'investor' && (
            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-1 block">Investment focus</Label>
              <TagPills tags={investFocus} onAdd={(v) => addTag(v, setInvestFocus)} onRemove={(v) => removeTag(v, setInvestFocus)} placeholder="Add sectors (max 5)" />
            </div>
          )}

          {role === 'supplier' && (
            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-1 block">Service type <span className="text-error-600" aria-hidden="true">*</span></Label>
              <TagPills tags={serviceType} onAdd={(v) => addTag(v, setServiceType)} onRemove={(v) => removeTag(v, setServiceType)} placeholder="Add services (max 5)" />
            </div>
          )}

          {role === 'stakeholder' && (
            <>
              <div>
                <Label htmlFor="ob-org" className="text-sm font-medium text-neutral-700 mb-1 block">Organization</Label>
                <Input id="ob-org" value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Your organization" />
              </div>
              <div>
                <Label className="text-sm font-medium text-neutral-700 mb-1 block">Interest areas</Label>
                <TagPills tags={interestAreas} onAdd={(v) => addTag(v, setInterestAreas)} onRemove={(v) => removeTag(v, setInterestAreas)} placeholder="Add interests (max 5)" />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center gap-3 mt-6">
          <Button variant="ghost" size="md" asChild>
            <Link href="/onboarding"><ChevronLeft className="h-4 w-4" />Back</Link>
          </Button>
          <Button variant="primary" size="md" disabled={saving} onClick={handleSave}>
            {saving ? 'Saving…' : 'Save & Continue →'}
          </Button>
        </div>
      </div>
    </main>
  );
}

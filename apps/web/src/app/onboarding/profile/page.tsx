'use client';

import { useState, useRef, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Camera, X } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProfileCard } from '@/components/ProfileCard';
import { initials } from '@/lib/utils';

const STEPS = ['Profile', 'Skills', 'Verification', 'Complete'];
const SUGGESTED_SKILLS = ['React', 'TypeScript', 'Python', 'Node.js', 'Product', 'Design', 'Finance', 'Marketing', 'Strategy', 'Data'];
const AVAILABILITY_OPTIONS = ['Immediate', 'From date', 'Not actively looking'];

export default function OnboardingProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [dayRate, setDayRate] = useState('');
  const [currency, setCurrency] = useState('£');
  const [availability, setAvailability] = useState('Immediate');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPhotoPreview(url);
  }

  function addSkill(skill: string) {
    if (!skills.includes(skill) && skills.length < 15) {
      setSkills((p) => [...p, skill]);
    }
  }

  function handleSkillKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      addSkill(skillInput.trim());
      setSkillInput('');
    }
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    router.push('/feed');
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/onboarding/role"
            className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>

          {/* Progress stepper */}
          <div className="flex items-center gap-0">
            {STEPS.map((label, i) => (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={[
                      'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                      i === 0
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'bg-neutral-200 text-neutral-500',
                    ].join(' ')}
                  >
                    {i + 1}
                  </div>
                  <span className="text-xs text-neutral-600 font-medium hidden sm:block">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 mb-5 bg-neutral-200" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-8">
          {/* Form */}
          <div className="flex-1 space-y-6">
            {/* Basic Info */}
            <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-5">Basic Info</h2>

              <div className="space-y-4">
                {/* Photo upload */}
                <div className="flex flex-col items-center">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setPhotoPreview(url);
                      }
                    }}
                    className={[
                      'relative h-32 w-32 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors',
                      dragOver
                        ? 'border-primary-400 bg-primary-50'
                        : 'border-neutral-300 hover:border-primary-300 hover:bg-neutral-50',
                    ].join(' ')}
                  >
                    {photoPreview ? (
                      <>
                        <img
                          src={photoPreview}
                          alt="Profile preview"
                          className="h-full w-full rounded-full object-cover"
                        />
                        <button
                          onClick={(e) => { e.stopPropagation(); setPhotoPreview(null); }}
                          className="absolute top-0 right-0 h-7 w-7 bg-neutral-900 text-white rounded-full flex items-center justify-center hover:bg-neutral-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <div className="text-center">
                        <Camera className="h-8 w-8 text-neutral-400 mx-auto mb-1" />
                        <p className="text-xs text-neutral-500">Upload photo</p>
                        <p className="text-2xs text-neutral-400">or drag here</p>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-neutral-400 mt-2">JPEG, PNG — max 5MB</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-neutral-700 mb-1 block">
                    Full name <span className="text-error-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="title" className="text-sm font-medium text-neutral-700 mb-1 block">
                    Professional title / tagline <span className="text-error-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value.slice(0, 60))}
                    placeholder="e.g. Full-stack engineer & product builder"
                    required
                  />
                  <p className="text-xs text-neutral-400 mt-1">{title.length}/60</p>
                </div>

                <div>
                  <Label htmlFor="location" className="text-sm font-medium text-neutral-700 mb-1 block">
                    Location
                  </Label>
                  <select
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)]"
                  >
                    <option value="">Select location</option>
                    <option>London, UK</option>
                    <option>Manchester, UK</option>
                    <option>Mumbai, India</option>
                    <option>Bangalore, India</option>
                    <option>New York, USA</option>
                    <option>San Francisco, USA</option>
                    <option>Remote</option>
                  </select>
                </div>
              </div>
            </section>

            {/* About */}
            <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-5">About</h2>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 500))}
                placeholder="Tell founders and investors what you do best…"
                maxLength={500}
                className="w-full min-h-[120px] rounded-sm border border-neutral-300 text-sm px-3 py-2 bg-neutral-0 resize-y focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)] placeholder:text-neutral-400"
              />
              <p className="text-xs text-neutral-400 mt-1">{bio.length}/500</p>
            </section>

            {/* Skills */}
            <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-1">Skills</h2>
              <p className="text-sm text-neutral-500 mb-4">Add up to 15 skills</p>

              {/* Selected skills */}
              <div className="flex flex-wrap gap-1.5 mb-3 min-h-[32px]">
                {skills.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-primary-50 text-primary-700 border border-primary-200"
                  >
                    {s}
                    <button
                      onClick={() => setSkills((p) => p.filter((x) => x !== s))}
                      className="text-primary-500 hover:text-primary-700"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Search skills…"
                  className="min-w-32 text-sm bg-transparent border-none outline-none placeholder:text-neutral-400"
                />
              </div>

              {/* Suggested skills */}
              <p className="text-xs text-neutral-500 mb-2">Suggested:</p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.filter((s) => !skills.includes(s)).map((s) => (
                  <button
                    key={s}
                    onClick={() => addSkill(s)}
                    className="text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </section>

            {/* Rate & Availability */}
            <section className="bg-neutral-0 rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-5">Rate &amp; Availability</h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-neutral-700 mb-1 block">Day rate</Label>
                  <div className="flex items-center gap-2">
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="h-10 w-16 rounded-sm border border-neutral-300 text-sm px-2 bg-neutral-0 focus:outline-none focus:border-primary-500"
                    >
                      <option>£</option>
                      <option>₹</option>
                      <option>$</option>
                    </select>
                    <Input
                      type="text"
                      value={dayRate}
                      onChange={(e) => setDayRate(e.target.value)}
                      placeholder="e.g. 600"
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    Visible to: Verified members only
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-neutral-700 mb-2 block">Availability</Label>
                  <div className="flex flex-wrap gap-2">
                    {AVAILABILITY_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAvailability(opt)}
                        className={[
                          'px-3 py-1.5 rounded-full border text-sm transition-colors',
                          availability === opt
                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                            : 'border-neutral-200 text-neutral-700 hover:border-neutral-300',
                        ].join(' ')}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Button variant="ghost" size="md" asChild>
                <Link href="/onboarding/role">
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
              <Button
                variant="primary"
                size="md"
                disabled={!name || !title || saving}
                onClick={handleSave}
              >
                {saving ? 'Saving…' : 'Save & Continue'}
              </Button>
            </div>
          </div>

          {/* Live preview — desktop */}
          <div className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-24">
              <p className="text-sm font-semibold text-neutral-500 mb-3 text-center">Profile Preview</p>
              <ProfileCard
                id="preview"
                name={name || 'Your Name'}
                title={title || 'Your professional title'}
                role="freelancer"
                location={location || 'Your location'}
                skills={skills}
                verified={false}
              />
              <p className="text-xs text-neutral-400 text-center mt-3">
                This is how others will see you
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

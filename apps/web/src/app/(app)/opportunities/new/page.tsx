'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const opportunityTypes = ['Role', 'Contract', 'Advisory', 'Investment Offer', 'Partnership'];
const locationOptions = ['UK', 'India', 'North America', 'Remote', 'Global'];
const compensationTypes = ['Fixed Fee', 'Day Rate', 'Equity', 'Revenue Share', 'Negotiable'];
const experienceLevels = ['Junior', 'Mid', 'Senior', 'Lead', 'Any'];
const timelineOptions = ['Immediate', '1–4 weeks', '1–3 months', 'Long-term', 'Flexible'];

const STEPS = ['Basics', 'Requirements', 'Preview'];

export default function PostOpportunityPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Role');
  const [domain, setDomain] = useState('');
  const [location, setLocation] = useState('Remote');
  const [compensation, setCompensation] = useState('Negotiable');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [experience, setExperience] = useState('Any');
  const [timeline, setTimeline] = useState('Flexible');
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [niceInput, setNiceInput] = useState('');

  const step1Valid = !!title && !!type;
  const step2Valid = !!description;

  function addSkill(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills((p) => [...p, skillInput.trim()]);
      }
      setSkillInput('');
    }
  }

  function addNice(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && niceInput.trim()) {
      e.preventDefault();
      if (!niceToHave.includes(niceInput.trim())) {
        setNiceToHave((p) => [...p, niceInput.trim()]);
      }
      setNiceInput('');
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    // API call would go here
    await new Promise((r) => setTimeout(r, 600));
    setSubmitting(false);
    router.push('/opportunities');
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/opportunities"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 mb-4"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Opportunities
        </Link>
        <h1 className="text-display-md font-bold text-neutral-900">Post an Opportunity</h1>
        <p className="text-neutral-500 mt-1">Tell the V.B community what you&apos;re looking for</p>
      </div>

      {/* Progress stepper */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={[
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  i < step
                    ? 'bg-success-600 text-white'
                    : i === step
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-neutral-200 text-neutral-500',
                ].join(' ')}
              >
                {i < step ? '✓' : i + 1}
              </div>
              <span className="text-xs text-neutral-600 font-medium whitespace-nowrap">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 mb-5 transition-colors ${i < step ? 'bg-success-600' : 'bg-neutral-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 — Basics */}
      {step === 0 && (
        <div className="bg-neutral-0 rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <Label htmlFor="title" className="text-sm font-medium text-neutral-700 mb-1 block">
              Opportunity title <span className="text-error-600">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior React Engineer for Series A startup"
              required
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">
              Opportunity type <span className="text-error-600">*</span>
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {opportunityTypes.map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={[
                    'py-2 px-3 rounded-md border text-sm font-medium transition-colors',
                    type === t
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="domain" className="text-sm font-medium text-neutral-700 mb-1 block">
              Domain / Industry
            </Label>
            <select
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-full h-10 rounded-sm border border-neutral-300 text-sm px-3 bg-neutral-0 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)]"
            >
              <option value="">Select domain</option>
              <option>FinTech</option>
              <option>HealthTech</option>
              <option>B2B SaaS</option>
              <option>D2C</option>
              <option>EdTech</option>
              <option>CleanTech</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">Location</Label>
            <div className="flex flex-wrap gap-2">
              {locationOptions.map((l) => (
                <button
                  key={l}
                  onClick={() => setLocation(l)}
                  className={[
                    'px-3 py-1.5 rounded-full border text-sm transition-colors',
                    location === l
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300',
                  ].join(' ')}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">Compensation</Label>
            <div className="flex flex-wrap gap-2 mb-3">
              {compensationTypes.map((c) => (
                <button
                  key={c}
                  onClick={() => setCompensation(c)}
                  className={[
                    'px-3 py-1.5 rounded-full border text-sm transition-colors',
                    compensation === c
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300',
                  ].join(' ')}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="text"
                placeholder="Min (e.g. £500)"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="flex-1"
              />
              <span className="text-neutral-400">–</span>
              <Input
                type="text"
                placeholder="Max"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2 — Requirements */}
      {step === 1 && (
        <div className="bg-neutral-0 rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-neutral-700 mb-1 block">
              Description <span className="text-error-600">*</span>
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you're looking for, the scope of the work, and any key requirements…"
              maxLength={600}
              className="w-full min-h-[120px] rounded-sm border border-neutral-300 text-sm px-3 py-2 bg-neutral-0 resize-y focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_3px_var(--color-primary-100)] placeholder:text-neutral-400"
            />
            <p className="text-xs text-neutral-400 mt-1">{description.length}/600</p>
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-1 block">Skills required</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {skills.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200"
                >
                  {s}
                  <button onClick={() => setSkills((p) => p.filter((x) => x !== s))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder="Type a skill and press Enter"
                className="min-w-32 text-sm bg-transparent border-none outline-none placeholder:text-neutral-400"
              />
            </div>
            <div className="border border-neutral-200 rounded-sm p-2 min-h-[40px] flex flex-wrap gap-1" />
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">Experience level</Label>
            <div className="flex gap-1 flex-wrap">
              {experienceLevels.map((l) => (
                <button
                  key={l}
                  onClick={() => setExperience(l)}
                  className={[
                    'px-3 py-1.5 rounded-md border text-sm transition-colors',
                    experience === l
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300',
                  ].join(' ')}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2 block">Timeline</Label>
            <div className="flex gap-2 flex-wrap">
              {timelineOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeline(t)}
                  className={[
                    'px-3 py-1.5 rounded-full border text-sm transition-colors',
                    timeline === t
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 text-neutral-700 hover:border-neutral-300',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-1 block">Nice to haves</Label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {niceToHave.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700"
                >
                  {n}
                  <button onClick={() => setNiceToHave((p) => p.filter((x) => x !== n))}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              type="text"
              value={niceInput}
              onChange={(e) => setNiceInput(e.target.value)}
              onKeyDown={addNice}
              placeholder="Add a nice-to-have and press Enter"
            />
          </div>
        </div>
      )}

      {/* Step 3 — Preview */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-neutral-0 rounded-xl shadow-sm p-6">
            <p className="text-xs text-neutral-500 mb-4 font-medium uppercase tracking-wide">
              This is how it will appear to matches
            </p>
            {/* Preview card */}
            <div className="border-l-4 border-l-primary-600 border border-neutral-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="text-md font-semibold text-neutral-900">{title || 'Opportunity Title'}</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-success-100 text-success-700">Open</span>
              </div>
              <p className="text-xs text-neutral-500 mb-3">
                {type} · {location} · {compensation}
                {budgetMin && budgetMax ? ` · ${budgetMin}–${budgetMax}` : ''}
              </p>
              {description && (
                <p className="text-sm text-neutral-600 line-clamp-3 mb-3">{description}</p>
              )}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="mt-4 flex gap-2 text-sm">
              <button
                onClick={() => setStep(0)}
                className="text-primary-600 hover:underline"
              >
                Edit basics
              </button>
              <span className="text-neutral-300">·</span>
              <button
                onClick={() => setStep(1)}
                className="text-primary-600 hover:underline"
              >
                Edit requirements
              </button>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Posting…' : 'Post Opportunity'}
          </Button>
          <button className="w-full text-sm text-neutral-500 hover:text-neutral-700 py-2">
            Save as Draft
          </button>
        </div>
      )}

      {/* Navigation */}
      {step < 2 && (
        <div className="flex justify-between mt-6">
          {step > 0 ? (
            <Button variant="ghost" size="md" onClick={() => setStep(step - 1)}>
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          <Button
            variant="primary"
            size="md"
            disabled={step === 0 ? !step1Valid : !step2Valid}
            onClick={() => setStep(step + 1)}
          >
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

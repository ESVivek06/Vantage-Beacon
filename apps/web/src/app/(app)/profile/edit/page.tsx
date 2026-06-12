'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, X, Plus, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/graphql';
import { ME_QUERY, UPDATE_PROFILE_MUTATION, REQUEST_PHOTO_UPLOAD_MUTATION } from '@/lib/queries';
import { initials } from '@/lib/utils';
import { parseTagMeta, plainTags } from '@/types/profile';
import type { UserRole } from '@/types/profile';

interface MeData {
  me: {
    id: string;
    role: string;
    photoUrl?: string;
    profile?: {
      displayName: string;
      bio?: string;
      skills: string[];
      tags: string[];
      verified: boolean;
    };
  };
}

function TagInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState('');

  function add() {
    const val = input.trim();
    if (val && !value.includes(val)) {
      onChange([...value, val]);
      setInput('');
    }
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? `Add ${label.toLowerCase()}…`}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); add(); }
          }}
        />
        <Button type="button" variant="outline" size="icon" onClick={add}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((item) => (
            <Badge key={item} variant="secondary" className="gap-1">
              {item}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== item))}
                className="hover:text-error-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        <select
          className="w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-primary-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
      </div>
    </div>
  );
}

// ─── Role-specific field sections ────────────────────────────────────────────

function FreelancerFields({
  meta,
  onMeta,
}: {
  meta: Record<string, string>;
  onMeta: (key: string, val: string) => void;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Freelancer Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            value={meta['headline'] ?? ''}
            onChange={(e) => onMeta('headline', e.target.value)}
            placeholder="e.g. Senior React Engineer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rate">Day Rate</Label>
          <Input
            id="rate"
            value={meta['rate'] ?? ''}
            onChange={(e) => onMeta('rate', e.target.value)}
            placeholder="e.g. £650/day"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="experience">Years of Experience</Label>
          <Input
            id="experience"
            value={meta['experience'] ?? ''}
            onChange={(e) => onMeta('experience', e.target.value)}
            placeholder="e.g. 8 years"
          />
        </div>
        <SelectField
          label="Availability"
          value={meta['availability'] ?? 'open'}
          onChange={(v) => onMeta('availability', v)}
          options={['open', 'busy', 'offline']}
        />
      </CardContent>
    </Card>
  );
}

function FounderFields({
  meta,
  onMeta,
}: {
  meta: Record<string, string>;
  onMeta: (key: string, val: string) => void;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Company Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company">Company Name</Label>
          <Input
            id="company"
            value={meta['company'] ?? ''}
            onChange={(e) => onMeta('company', e.target.value)}
            placeholder="Your company name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={meta['industry'] ?? ''}
            onChange={(e) => onMeta('industry', e.target.value)}
            placeholder="e.g. FinTech, HealthTech"
          />
        </div>
        <SelectField
          label="Funding Stage"
          value={meta['fundingStage'] ?? ''}
          onChange={(v) => onMeta('fundingStage', v)}
          options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Series C+', 'Bootstrapped']}
        />
        <div className="space-y-2">
          <Label htmlFor="teamSize">Team Size</Label>
          <Input
            id="teamSize"
            value={meta['teamSize'] ?? ''}
            onChange={(e) => onMeta('teamSize', e.target.value)}
            placeholder="e.g. 1–10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={meta['website'] ?? ''}
            onChange={(e) => onMeta('website', e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lookingFor">Currently Looking For</Label>
          <Textarea
            id="lookingFor"
            value={meta['lookingFor'] ?? ''}
            onChange={(e) => onMeta('lookingFor', e.target.value)}
            placeholder="Describe what kind of talent or partners you're seeking…"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function InvestorFields({
  meta,
  onMeta,
}: {
  meta: Record<string, string>;
  onMeta: (key: string, val: string) => void;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Investment Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="checkSize">Typical Check Size</Label>
          <Input
            id="checkSize"
            value={meta['checkSize'] ?? ''}
            onChange={(e) => onMeta('checkSize', e.target.value)}
            placeholder="e.g. £50k – £500k"
          />
        </div>
        <SelectField
          label="Stage Focus"
          value={meta['stage'] ?? ''}
          onChange={(v) => onMeta('stage', v)}
          options={['Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth', 'Any']}
        />
        <div className="space-y-2">
          <Label htmlFor="focusAreas">Focus Areas (comma-separated)</Label>
          <Input
            id="focusAreas"
            value={meta['focusAreas'] ?? ''}
            onChange={(e) => onMeta('focusAreas', e.target.value)}
            placeholder="e.g. FinTech, AI, Climate"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="geo">Geographic Focus</Label>
          <Input
            id="geo"
            value={meta['geo'] ?? ''}
            onChange={(e) => onMeta('geo', e.target.value)}
            placeholder="e.g. UK & Europe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fundType">Fund Type</Label>
          <Input
            id="fundType"
            value={meta['fundType'] ?? ''}
            onChange={(e) => onMeta('fundType', e.target.value)}
            placeholder="e.g. Angel, VC, Family Office"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="portfolioCount">Portfolio Companies</Label>
          <Input
            id="portfolioCount"
            value={meta['portfolioCount'] ?? ''}
            onChange={(e) => onMeta('portfolioCount', e.target.value)}
            placeholder="e.g. 24"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="criteria">Investment Criteria</Label>
          <Textarea
            id="criteria"
            value={meta['criteria'] ?? ''}
            onChange={(e) => onMeta('criteria', e.target.value)}
            placeholder="What you look for in founders / companies…"
            rows={3}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function SupplierFields({
  meta,
  onMeta,
}: {
  meta: Record<string, string>;
  onMeta: (key: string, val: string) => void;
}) {
  return (
    <Card>
      <CardHeader><CardTitle>Service Details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="services">Services Offered (comma-separated)</Label>
          <Input
            id="services"
            value={meta['services'] ?? ''}
            onChange={(e) => onMeta('services', e.target.value)}
            placeholder="e.g. Brand Design, Web Development, Copywriting"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="minRate">Min Rate</Label>
          <Input
            id="minRate"
            value={meta['minRate'] ?? ''}
            onChange={(e) => onMeta('minRate', e.target.value)}
            placeholder="e.g. £500/day"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxRate">Max Rate</Label>
          <Input
            id="maxRate"
            value={meta['maxRate'] ?? ''}
            onChange={(e) => onMeta('maxRate', e.target.value)}
            placeholder="e.g. £1,500/day"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="turnaround">Typical Turnaround</Label>
          <Input
            id="turnaround"
            value={meta['turnaround'] ?? ''}
            onChange={(e) => onMeta('turnaround', e.target.value)}
            placeholder="e.g. 2–4 weeks"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Input
            id="companySize"
            value={meta['companySize'] ?? ''}
            onChange={(e) => onMeta('companySize', e.target.value)}
            placeholder="e.g. Solo / 2–10 / 10–50"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [role, setRole] = useState<UserRole>('freelancer');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    skillInput: '',
    skills: [] as string[],
    plainTagInput: '',
    plainTags: [] as string[],
  });

  const [meta, setMeta] = useState<Record<string, string>>({});

  function setMetaField(key: string, val: string) {
    setMeta((m) => ({ ...m, [key]: val }));
  }

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<MeData>(ME_QUERY);
        const me = data.me;
        const profile = me?.profile;
        setPhotoUrl(me?.photoUrl ?? '');
        setRole((me?.role as UserRole) ?? 'freelancer');
        if (profile) {
          const parsedMeta = parseTagMeta(profile.tags ?? []);
          const plain = plainTags(profile.tags ?? []);
          setForm((f) => ({
            ...f,
            displayName: profile.displayName,
            bio: profile.bio ?? '',
            skills: profile.skills ?? [],
            plainTags: plain,
          }));
          setMeta(parsedMeta);
        }
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function buildTags(): string[] {
    const metaTags = Object.entries(meta)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${k}:${v}`);
    return [...form.plainTags, ...metaTags];
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    try {
      const client = createClient();
      const { requestProfilePhotoUpload } = await client.request<{
        requestProfilePhotoUpload: { url: string; key: string };
      }>(REQUEST_PHOTO_UPLOAD_MUTATION, { fileName: file.name });

      await fetch(requestProfilePhotoUpload.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      await client.request(UPDATE_PROFILE_MUTATION, {
        input: { photoKey: requestProfilePhotoUpload.key },
      });

      setPhotoUrl(URL.createObjectURL(file));
    } catch {
      setError('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.displayName.trim()) {
      setError('Display name is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const client = createClient();
      await client.request(UPDATE_PROFILE_MUTATION, {
        input: {
          displayName: form.displayName,
          bio: form.bio,
          skills: form.skills,
          tags: buildTags(),
        },
      });
      setSuccess('Profile updated!');
      setTimeout(() => router.push(`/profile/${session?.user?.id ?? ''}`), 1200);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const displayName = form.displayName || session?.user?.name || session?.user?.email || 'User';

  if (loading) {
    return <div className="h-48 rounded-lg bg-neutral-200 animate-pulse max-w-2xl" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-display-sm font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <Card>
          <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {photoUrl && <AvatarImage src={photoUrl} alt={displayName} />}
                <AvatarFallback className="text-2xl">{initials(displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {uploading ? 'Uploading…' : 'Upload Photo'}
                </Button>
                <p className="text-xs text-neutral-500 mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Your display name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">
                {role === 'investor' ? 'Investment Thesis' : 'Bio'}
              </Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder={
                  role === 'investor'
                    ? 'Describe your investment thesis and what you look for…'
                    : role === 'founder'
                    ? 'Tell others about your mission and company…'
                    : 'Tell others about yourself…'
                }
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Role-specific fields */}
        {role === 'freelancer' && <FreelancerFields meta={meta} onMeta={setMetaField} />}
        {role === 'founder' && <FounderFields meta={meta} onMeta={setMetaField} />}
        {role === 'investor' && <InvestorFields meta={meta} onMeta={setMetaField} />}
        {role === 'supplier' && <SupplierFields meta={meta} onMeta={setMetaField} />}

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>
              {role === 'investor' ? 'Focus Areas' : role === 'supplier' ? 'Specialisations' : 'Skills'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TagInput
              label=""
              value={form.skills}
              onChange={(v) => setForm((f) => ({ ...f, skills: v }))}
              placeholder={
                role === 'investor' ? 'Add focus area…' : role === 'supplier' ? 'Add specialisation…' : 'Add skill…'
              }
            />
          </CardContent>
        </Card>

        {/* Tags (generic) */}
        <Card>
          <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
          <CardContent>
            <TagInput
              label=""
              value={form.plainTags}
              onChange={(v) => setForm((f) => ({ ...f, plainTags: v }))}
              placeholder="Add tag…"
            />
          </CardContent>
        </Card>

        {error && <p className="text-sm text-error-600 bg-error-50 rounded-md p-3">{error}</p>}
        {success && <p className="text-sm text-success-600 bg-success-50 rounded-md p-3">{success}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/profile/${session?.user?.id ?? ''}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

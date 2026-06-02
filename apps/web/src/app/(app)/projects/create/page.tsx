'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createClient } from '@/lib/graphql';
import { CREATE_PROJECT_MUTATION } from '@/lib/queries';

const REGIONS = ['UK', 'IN', 'NA'];

export default function CreateProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    region: 'UK',
    skills: [] as string[],
    budgetMin: '',
    budgetMax: '',
    budgetCurrency: '£',
  });

  function addSkill() {
    const val = skillInput.trim();
    if (val && !form.skills.includes(val)) {
      setForm((f) => ({ ...f, skills: [...f.skills, val] }));
      setSkillInput('');
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const client = createClient();
      const budget = (form.budgetMin || form.budgetMax)
        ? { min: form.budgetMin ? parseInt(form.budgetMin) : undefined, max: form.budgetMax ? parseInt(form.budgetMax) : undefined, currency: form.budgetCurrency }
        : undefined;

      const data = await client.request<{ createProject: { id: string } }>(CREATE_PROJECT_MUTATION, {
        input: {
          title: form.title,
          description: form.description,
          requiredSkills: form.skills,
          budget,
          region: form.region,
        },
      });

      router.push(`/projects/${data.createProject.id}`);
    } catch {
      setError('Failed to create project. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Project</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Project Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Project title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Describe your project, goals, and what you're looking for…"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label>Region *</Label>
              <Select value={form.region} onValueChange={(v) => setForm((f) => ({ ...f, region: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Required Skills</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add a required skill…"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((s) => s !== skill) }))}
                      className="hover:text-error-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Budget (optional)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <Label>Currency</Label>
                <Select value={form.budgetCurrency} onValueChange={(v) => setForm((f) => ({ ...f, budgetCurrency: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="£">£ GBP</SelectItem>
                    <SelectItem value="$">$ USD</SelectItem>
                    <SelectItem value="₹">₹ INR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMin">Min</Label>
                <Input
                  id="budgetMin"
                  type="number"
                  value={form.budgetMin}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMin: e.target.value }))}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budgetMax">Max</Label>
                <Input
                  id="budgetMax"
                  type="number"
                  value={form.budgetMax}
                  onChange={(e) => setForm((f) => ({ ...f, budgetMax: e.target.value }))}
                  placeholder="10000"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-error-600">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Creating…' : 'Create Project'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/projects')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

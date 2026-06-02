'use client';

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Upload, X, Plus } from 'lucide-react';
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

export default function EditProfilePage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    displayName: '',
    bio: '',
    skillInput: '',
    tagInput: '',
    skills: [] as string[],
    tags: [] as string[],
  });

  useEffect(() => {
    async function load() {
      try {
        const client = createClient();
        const data = await client.request<{ me: { photoUrl?: string; profile?: { displayName: string; bio?: string; skills: string[]; tags: string[] } } }>(ME_QUERY);
        const profile = data.me?.profile;
        setPhotoUrl(data.me?.photoUrl ?? '');
        if (profile) {
          setForm((f) => ({
            ...f,
            displayName: profile.displayName,
            bio: profile.bio ?? '',
            skills: profile.skills,
            tags: profile.tags,
          }));
        }
      } catch {
        //
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function addSkill() {
    const val = form.skillInput.trim();
    if (val && !form.skills.includes(val)) {
      setForm((f) => ({ ...f, skills: [...f.skills, val], skillInput: '' }));
    }
  }

  function addTag() {
    const val = form.tagInput.trim();
    if (val && !form.tags.includes(val)) {
      setForm((f) => ({ ...f, tags: [...f.tags, val], tagInput: '' }));
    }
  }

  async function handlePhotoUpload(file: File) {
    setUploading(true);
    try {
      const client = createClient();
      const { requestProfilePhotoUpload } = await client.request<{ requestProfilePhotoUpload: { url: string; key: string } }>(
        REQUEST_PHOTO_UPLOAD_MUTATION,
        { fileName: file.name },
      );

      await fetch(requestProfilePhotoUpload.url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      await client.request(UPDATE_PROFILE_MUTATION, {
        input: { photoKey: requestProfilePhotoUpload.key },
      });

      const objectUrl = URL.createObjectURL(file);
      setPhotoUrl(objectUrl);
    } catch {
      setError('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
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
          tags: form.tags,
        },
      });
      setSuccess('Profile updated successfully!');
      setTimeout(() => router.push('/profile'), 1500);
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  const displayName = form.displayName || session?.user?.name || session?.user?.email || 'User';

  if (loading) {
    return <div className="h-48 rounded-lg bg-muted animate-pulse" />;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo */}
        <Card>
          <CardHeader><CardTitle>Profile Photo</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                {photoUrl && <AvatarFallback style={{ backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover' }} />}
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
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Info</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Your display name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Tell others about yourself…"
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader><CardTitle>Skills</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={form.skillInput}
                onChange={(e) => setForm((f) => ({ ...f, skillInput: e.target.value }))}
                placeholder="Add a skill…"
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
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader><CardTitle>Tags</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={form.tagInput}
                onChange={(e) => setForm((f) => ({ ...f, tagInput: e.target.value }))}
                placeholder="Add a tag…"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }))}
                      className="hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {success && <p className="text-sm text-success-600">{success}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push('/profile')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

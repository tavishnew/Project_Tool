import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef } from 'react';
import { useAuth } from '@/auth';
import { api } from '@/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { User, Camera, Loader2 } from 'lucide-react';

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name, avatar_url: avatarUrl || undefined });
      setUser(updated.user);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for storage
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setAvatarUrl(base64);
      toast.success('Avatar uploaded');
    } catch {
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
      // Reset input value so same file can be uploaded again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setSaving(true);
    try {
      const updated = await api.updateProfile({ name, avatar_url: '' });
      setUser(updated.user);
      setAvatarUrl('');
      toast.success('Avatar removed');
    } catch {
      toast.error('Failed to remove avatar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and profile.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6" data-testid="settings-form">
        <div className="grid gap-6 md:grid-cols-2">
          <Card data-testid="profile-card">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your name and profile picture.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative" data-testid="avatar-upload-area">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={`${user?.name}'s avatar`}
                        className="h-24 w-24 rounded-full border-2 border-border object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-muted">
                        <span className="text-3xl font-semibold text-muted-foreground">
                          {user?.name?.[0]?.toUpperCase() ?? 'U'}
                        </span>
                      </div>
                    )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="sr-only"
                    disabled={uploading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="absolute bottom-[-4px] right-[-4px] h-10 w-10 rounded-full bg-background shadow"
                    disabled={uploading}
                    aria-label="Upload avatar"
                    onClick={triggerFileInput}
                  >
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={user?.email ?? ''}
                      disabled
                      aria-describedby="email-help"
                    />
                    <p id="email-help" className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if needed.
                    </p>
                  </div>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                      disabled={saving}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      Remove avatar
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Account information and security.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Role</Label>
                  <p className="text-sm text-muted-foreground capitalize">{user?.role ?? 'user'}</p>
                </div>
                <div className="space-y-1">
                  <Label>Member since</Label>
                  <p className="text-sm text-muted-foreground">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                  </p>
                </div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">
                Password changes and email updates are managed separately. Use the "Forgot password"
                flow on the login page to reset your password.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save changes
          </Button>
        </div>
      </form>
    </div>
  );
}
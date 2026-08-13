import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/auth';
import { api } from '@/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Camera, Loader2, LockKeyhole, Trash2 } from 'lucide-react';
import type { OwnedProjectForDeletion } from '@/types';

export const Route = createFileRoute('/app/settings')({
  component: SettingsPage,
});

function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? '');
  const [emailPassword, setEmailPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  const [ownedProjects, setOwnedProjects] = useState<OwnedProjectForDeletion[]>([]);
  const [transfers, setTransfers] = useState<Record<string, string>>({});
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [loadingDeletionOptions, setLoadingDeletionOptions] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const emailChanged = email.trim().toLowerCase() !== (user?.email ?? '').toLowerCase();

  useEffect(() => {
    void api.getAccountDeletionOptions()
      .then((result) => setOwnedProjects(result.ownedProjects))
      .catch(() => toast.error('Could not load project ownership information.'))
      .finally(() => setLoadingDeletionOptions(false));
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (emailChanged && !emailPassword) {
      toast.error('Enter your current password to change your email address.');
      return;
    }
    setSaving(true);
    try {
      const updated = await api.updateProfile({
        name,
        email: email.trim(),
        avatar_url: avatarUrl || null,
        currentPassword: emailChanged ? emailPassword : undefined,
      });
      setUser(updated.user);
      setEmail(updated.user.email);
      setEmailPassword('');
      toast.success('Profile updated.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  }

  function triggerFileInput() {
    fileInputRef.current?.click();
  }

  async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2 MB.');
      return;
    }
    setUploading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setAvatarUrl(base64);
      toast.success('Avatar ready to save.');
    } catch {
      toast.error('Failed to prepare the avatar.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('The new password and confirmation do not match.');
      return;
    }
    setChangingPassword(true);
    try {
      const result = await api.changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success(result.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not change password.');
    } finally {
      setChangingPassword(false);
    }
  }

  async function deleteAccount(event: React.FormEvent) {
    event.preventDefault();
    if (deleteConfirmation !== 'DELETE') {
      toast.error('Type DELETE to confirm account deletion.');
      return;
    }
    const missingTransfer = ownedProjects.find((project) => !transfers[project.id]);
    if (missingTransfer) {
      toast.error(`Choose a new owner for ${missingTransfer.name} before deleting your account.`);
      return;
    }
    if (ownedProjects.some((project) => project.eligibleMembers.length === 0)) {
      toast.error('Every owned project needs another existing member before your account can be deleted.');
      return;
    }
    setDeleting(true);
    try {
      await api.deleteAccount(
        deletePassword,
        ownedProjects.map((project) => ({ projectId: project.id, newOwnerId: transfers[project.id] }))
      );
      setUser(null);
      toast.success('Your account has been deleted.');
      navigate({ to: '/' });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not delete account.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold tracking-tight">Account settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, credentials, and account lifecycle.</p>
      </header>

      <form onSubmit={handleSave} className="space-y-6" data-testid="settings-form">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card data-testid="profile-card">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Update your identity and profile image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative shrink-0" data-testid="avatar-upload-area">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={`${user?.name}'s avatar`} className="h-24 w-24 rounded-full border-2 border-border object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-border bg-muted text-3xl font-semibold text-muted-foreground">
                      {user?.name?.[0]?.toUpperCase() ?? 'U'}
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" disabled={uploading} />
                  <Button type="button" variant="outline" size="icon" className="absolute bottom-[-4px] right-[-4px] h-10 w-10 rounded-full bg-background shadow" disabled={uploading} aria-label="Upload avatar" onClick={triggerFileInput}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" value={name} onChange={(event) => setName(event.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
                  </div>
                  {emailChanged && (
                    <div className="space-y-2 rounded-lg border border-amber-400/30 bg-amber-500/10 p-3">
                      <Label htmlFor="email-current-password">Current password</Label>
                      <Input id="email-current-password" type="password" value={emailPassword} onChange={(event) => setEmailPassword(event.target.value)} placeholder="Required to change email" required />
                      <p className="text-xs text-muted-foreground">We require your current password before changing the sign-in email.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
              <CardDescription>Your account details and permissions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1"><Label>Workspace role</Label><p className="text-sm capitalize text-muted-foreground">{user?.role ?? 'user'}</p></div>
                <div className="space-y-1"><Label>Member since</Label><p className="text-sm text-muted-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</p></div>
              </div>
              <Separator />
              <p className="text-sm text-muted-foreground">Saving profile changes keeps your existing session active. Email changes are re-verified with your current password.</p>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end"><Button type="submit" disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save profile</Button></div>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LockKeyhole className="h-5 w-5 text-primary" />Password</CardTitle>
          <CardDescription>Change your password by confirming the current one first.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="grid gap-4 md:grid-cols-3 md:items-end">
            <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" minLength={8} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required /></div>
            <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
            <div className="md:col-span-3"><Button type="submit" disabled={changingPassword}>{changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Change password</Button></div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive"><AlertTriangle className="h-5 w-5" />Danger zone</CardTitle>
          <CardDescription>Account deletion is permanent. Project ownership must be transferred before deletion.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={deleteAccount} className="space-y-5">
            {loadingDeletionOptions ? (
              <p className="text-sm text-muted-foreground"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading ownership requirements…</p>
            ) : ownedProjects.length > 0 ? (
              <div className="space-y-3 rounded-lg border border-amber-400/30 bg-amber-500/10 p-4">
                <p className="text-sm font-medium">Transfer each project you own to an existing member.</p>
                {ownedProjects.map((project) => (
                  <div key={project.id} className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_15rem] sm:items-center">
                    <div><p className="text-sm font-medium">{project.name}</p><p className="text-xs text-muted-foreground">{project.eligibleMembers.length ? 'Select the next owner.' : 'Add another project member before deletion can proceed.'}</p></div>
                    <Select value={transfers[project.id] ?? ''} onValueChange={(value) => setTransfers((current) => ({ ...current, [project.id]: value }))} disabled={!project.eligibleMembers.length}>
                      <SelectTrigger><SelectValue placeholder="Select new owner" /></SelectTrigger>
                      <SelectContent>{project.eligibleMembers.map((member) => <SelectItem key={member.id} value={member.id}>{member.name} · {member.email}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">You do not own any projects, so no ownership transfer is required.</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="delete-password">Current password</Label><Input id="delete-password" type="password" value={deletePassword} onChange={(event) => setDeletePassword(event.target.value)} required /></div>
              <div className="space-y-2"><Label htmlFor="delete-confirmation">Type DELETE to confirm</Label><Input id="delete-confirmation" value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} required /></div>
            </div>
            <Button type="submit" variant="destructive" disabled={deleting || loadingDeletionOptions}><Trash2 className="mr-2 h-4 w-4" />{deleting ? 'Deleting account…' : 'Delete account permanently'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

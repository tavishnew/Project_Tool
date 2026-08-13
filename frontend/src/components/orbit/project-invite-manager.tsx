import { useEffect, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Clock3, Mail, ShieldCheck, UserPlus, X } from "lucide-react";
import { api } from "@/api";
import type { ProjectInvitation } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface ProjectInviteManagerProps {
  projectId: string;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString() : null;
}

function invitationState(invite: ProjectInvitation) {
  if (invite.status === "accepted") {
    return {
      label: `Accepted ${formatDate(invite.accepted_at) ?? ""}`.trim(),
      detail: "This person has project access.",
      icon: CheckCircle2,
      className: "text-emerald-600 dark:text-emerald-400",
    };
  }

  if (invite.status === "revoked") {
    return {
      label: "Revoked",
      detail: "This invitation can no longer be used.",
      icon: X,
      className: "text-muted-foreground",
    };
  }

  return {
    label: "Awaiting acceptance",
    detail: `Expires ${formatDate(invite.expires_at)}`,
    icon: Clock3,
    className: "text-amber-600 dark:text-amber-400",
  };
}

function deliveryState(invite: ProjectInvitation) {
  if (invite.delivery_status === "sent") {
    return {
      label: `Email handed to SMTP${invite.delivery_attempted_at ? ` on ${formatDate(invite.delivery_attempted_at)}` : ""}.`,
      className: "text-muted-foreground",
    };
  }

  if (invite.delivery_status === "failed") {
    return {
      label: `Email was not sent${invite.delivery_error ? `: ${invite.delivery_error}` : "."}`,
      className: "text-destructive",
    };
  }

  return {
    label: "Email delivery has not been attempted.",
    className: "text-muted-foreground",
  };
}

export function ProjectInviteManager({ projectId }: ProjectInviteManagerProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [invites, setInvites] = useState<ProjectInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  async function loadInvitations() {
    setLoading(true);
    try {
      const result = await api.listInvites(projectId);
      setInvites(result.invites);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load invitations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInvitations();
  }, [projectId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const result = await api.createInvite(projectId, email.trim(), role);
      setEmail("");
      if (result.delivery.status === "failed") {
        toast.error(result.warning ?? "Invitation created, but the email was not sent.", {
          description: result.delivery.error ?? "Configure SMTP on the server, then send a new invitation.",
        });
      } else {
        toast.success("Invitation email sent. This panel will show when it is accepted.");
      }
      await loadInvitations();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create invitation");
    } finally {
      setSubmitting(false);
    }
  }

  async function revoke(invitationId: string) {
    setRevokingId(invitationId);
    try {
      await api.revokeInvite(projectId, invitationId);
      setInvites((current) => current.map((invite) => (
        invite.id === invitationId ? { ...invite, status: "revoked" } : invite
      )));
      toast.success("Invitation revoked.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not revoke invitation");
    } finally {
      setRevokingId(null);
    }
  }

  const pendingInvites = invites.filter((invite) => invite.status === "pending");
  const acceptedInvites = invites.filter((invite) => invite.status === "accepted");

  return (
    <Card className="border-border bg-card/80">
      <CardHeader className="space-y-1 p-4 pb-2 sm:px-5">
        <CardTitle className="flex items-center gap-1.5 text-base">
          <UserPlus className="h-4 w-4 text-primary" />
          Project access
        </CardTitle>
        <CardDescription className="text-xs leading-5">
          Invite collaborators and track delivery and access in one place.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4 pt-2 sm:px-5 sm:pb-5">
        <form onSubmit={submit} className="grid gap-2 md:grid-cols-[minmax(0,1fr)_8.5rem_auto] md:items-end">
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="project-invite-email">Email address</Label>
            <Input
              id="project-invite-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="collaborator@example.com"
              required
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs" htmlFor="project-invite-role">Project role</Label>
            <Select value={role} onValueChange={(value) => setRole(value as "member" | "admin")}>
              <SelectTrigger className="h-9" id="project-invite-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={submitting} size="sm" className="w-full md:w-auto">
            <Mail className="mr-1.5 h-3.5 w-3.5" />
            {submitting ? "Sending…" : "Send invite"}
          </Button>
        </form>

        <p className="rounded-md border border-border bg-muted/20 px-2.5 py-1.5 text-[11px] leading-4 text-muted-foreground">
          “Sent” means SMTP accepted the email; “Accepted” means the invitee now has project access.
        </p>

        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-medium">Invitation activity</h3>
              <p className="text-xs text-muted-foreground">
                {pendingInvites.length} awaiting acceptance · {acceptedInvites.length} with access
              </p>
            </div>
            <span className="text-sm text-muted-foreground">{invites.length}</span>
          </div>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading invitations…</p>
          ) : invites.length === 0 ? (
            <p className="rounded-md border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">No invitations have been created for this project.</p>
          ) : (
            <ul className="divide-y divide-border rounded-md border border-border">
              {invites.map((invite) => {
                const access = invitationState(invite);
                const delivery = deliveryState(invite);
                const AccessIcon = access.icon;
                const deliveryFailed = invite.delivery_status === "failed";

                return (
                  <li key={invite.id} className="flex flex-wrap items-start justify-between gap-2 p-2.5">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-medium">{invite.email}</p>
                      <p className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                        {invite.role === "admin" && <ShieldCheck className="h-3.5 w-3.5" />}
                        {invite.role === "admin" ? "Administrator" : "Member"}
                        <span aria-hidden="true">·</span>
                        <AccessIcon className={`h-3.5 w-3.5 ${access.className}`} />
                        <span className={access.className}>{access.label}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{access.detail}</p>
                      {invite.status === "pending" && (
                        <p className={`flex items-start gap-1 text-xs ${delivery.className}`}>
                          {deliveryFailed && <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                          <span>{delivery.label}</span>
                        </p>
                      )}
                    </div>
                    {invite.status === "pending" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => void revoke(invite.id)}
                        disabled={revokingId === invite.id}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Revoke
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { api } from "@/api";
import { useAuth } from "@/auth";
import { cn } from "@/lib/utils";

const COLORS = ["#A0522D", "#C9963F", "#6E8062", "#6B4F36", "#8C7355", "#B46B4D"];

export function NewProjectDialog({
  open,
  onOpenChange,
  onCreateProject,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreateProject?: (name: string, description: string, color?: string) => Promise<void>;
}) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try{
      if (onCreateProject) {
        await onCreateProject(name.trim(), desc.trim(), color);
      } else {
        await api.createProject(name.trim(), desc.trim(), color);
      }
      setName("");
      setDesc("");
      setColor(COLORS[0]);
      onOpenChange(false);
    } catch (err) {
      setError('Failed to create project');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="new-project-dialog">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Give it a name and a color. Members can be added later.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4" data-testid="new-project-form">
          <div className="space-y-1.5">
            <Label htmlFor="np-name">Name</Label>
            <Input id="np-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Aurora launch" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-desc">Description</Label>
            <Textarea id="np-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What is this project about?" />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2" data-testid="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 border border-primary-foreground/50 transition-transform",
                    color === c && "ring-2 ring-offset-2 ring-offset-background scale-110",
                  )}
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="ledger-action" onClick={submit} disabled={loading}>
            {loading ? 'Creating...' : 'Create project'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
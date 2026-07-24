import { useState } from 'react';
import Modal from "@/components/Modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const COLORS = ["#ff5a4e", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#0ea5e9"];

interface NewProjectDialogProps {
  onClose: () => void;
  onCreate: (data: { name: string; description: string; color: string }) => Promise<void>;
}

export default function NewProjectDialog({ onClose, onCreate }: NewProjectDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[0]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const getBoxShadow = (color: string): string => {
    return `0 0 0 2px ${color}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError('Project name is required');
    
    setBusy(true);
    setError('');
    try {
      await onCreate({ name: name.trim(), description: description.trim(), color });
      setName('');
      setDescription('');
      setColor(COLORS[0]);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      setBusy(false);
    }
  };

  return (
    <Modal title="New project" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Give it a name and a color. Members can be added later.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="np-name">Name</Label>
            <Input
              id="np-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Aurora launch"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-desc">Description</Label>
            <Textarea
              id="np-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={
                    color === c
                      ? 'h-8 w-8 rounded-full transition-all ring-2 ring-offset-2 ring-offset-background scale-110 shadow-lg'
                      : 'h-8 w-8 rounded-full transition-all hover:scale-105'
                  }
                  style={{ 
                    backgroundColor: c, 
                    boxShadow: color === c ? getBoxShadow(c) : undefined 
                  }}
                />
              ))}
            </div>
          </div>
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create project'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

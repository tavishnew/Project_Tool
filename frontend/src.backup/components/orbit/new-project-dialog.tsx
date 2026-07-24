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
import { useStore } from "@/lib/mock-store";
import { cn } from "@/lib/utils";

const COLORS = ["#ff5a4e", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#0ea5e9"];

export function NewProjectDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const create = useStore((s) => s.createProject);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState(COLORS[0]);

  function submit() {
    if (!name.trim()) return;
    create({ name: name.trim(), description: desc.trim(), color });
    setName("");
    setDesc("");
    setColor(COLORS[0]);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>Give it a name and a color. Members can be added later.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
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
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-8 w-8 rounded-full transition-transform",
                    color === c && "ring-2 ring-offset-2 ring-offset-background scale-110",
                  )}
                  style={{ backgroundColor: c, boxShadow: color === c ? `0 0 0 2px ${c}` : undefined }}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>Create project</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

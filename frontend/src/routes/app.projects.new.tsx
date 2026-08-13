import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { ArrowLeft, FolderPlus, Loader2 } from "lucide-react";
import { api } from "@/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/app/projects/new")({
  component: NewProjectPage,
});

const PROJECT_COLORS = ["#A0522D", "#C9963F", "#6E8062", "#6B4F36", "#8C7355", "#B46B4D"];

function NewProjectPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      toast.error("A project name is required");
      return;
    }

    setSubmitting(true);
    try {
      const { project } = await api.createProject(trimmedName, description.trim(), color);
      toast.success("Project created");
      navigate({ to: "/app/projects/$id", params: { id: project.id } });
    } catch (error: any) {
      toast.error(error.message || "Could not create the project");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <Link to="/app" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to projects
      </Link>

      <Card className="ledger-frame overflow-hidden">
        <CardHeader>
          <p className="ledger-kicker text-muted-foreground">Workspace / new record</p>
          <CardTitle className="mt-2 flex items-center gap-2 font-display text-2xl">
            <FolderPlus className="h-6 w-6 text-primary" /> Create a project
          </CardTitle>
          <CardDescription>Set the essentials now; you can refine details and invite teammates later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Website refresh"
                maxLength={120}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="project-description">Description <span className="text-muted-foreground">(optional)</span></Label>
              <textarea
                id="project-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="What is this project for?"
                rows={4}
                maxLength={1000}
                className="ledger-input flex w-full rounded-md border border-input px-3 py-2 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium leading-none">Project color</legend>
              <div className="flex flex-wrap gap-3">
                {PROJECT_COLORS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-label={`Use ${option} as the project color`}
                    aria-pressed={color === option}
                    onClick={() => setColor(option)}
                    className={`h-8 w-8 border border-primary-foreground/50 ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${color === option ? "ring-2 ring-foreground" : "hover:scale-110"}`}
                    style={{ backgroundColor: option }}
                  />
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link to="/app"><Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button></Link>
              <Button type="submit" className="ledger-action w-full sm:w-auto" disabled={submitting}>
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

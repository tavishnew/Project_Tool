import { createFileRoute } from '@tanstack/react-router';
import { SettingsPage } from '@/pages/SettingsPage';

export const Route = createFileRoute('/app/projects/$id/settings/')({
  component: SettingsPageRoute,
});

function SettingsPageRoute({ params }: { params: { projectId: string } }) {
  return <SettingsPage projectId={params.projectId} />;
}
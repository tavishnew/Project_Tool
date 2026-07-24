import { createFileRoute } from '@tanstack/react-router';
import { ListPage } from '@/pages/ListPage';

export const Route = createFileRoute('/app/projects/$id/list/')({
  component: ListPageRoute,
});

function ListPageRoute({ params }: { params: { projectId: string } }) {
  return <ListPage projectId={params.projectId} />;
}
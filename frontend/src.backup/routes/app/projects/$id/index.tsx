import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useParams } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { BoardPage } from '@/pages/BoardPage';
import { ListPage } from '@/pages/ListPage';
import { Tabs, TabsDefault, TabList, Tab, TabPanels, TabPanel } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/app/projects/$id/')({
  component: ProjectDetailLayout,
});

function ProjectDetailLayout() {
  const { projectId } = useParams();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Project Details</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Edit project
          </Button>
        </div>
      </div>
      
      <TabsDefault defaultValue="board" className="w-full">
        <TabList className="w-[200px] flex-initial">
          <Tab value="board">Board</Tab>
          <Tab value="list">List</Tab>
          <Tab value="settings">Settings</Tab>
          <Tab value="members">Members</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="board">
            <BoardPage projectId={projectId} />
          </TabPanel>
          <TabPanel value="list">
            <ListPage projectId={projectId} />
          </TabPanel>
          <TabPanel value="settings">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Project Settings</h2>
              <p className="text-muted-foreground">Project settings would go here.</p>
            </div>
          </TabPanel>
          <TabPanel value="members">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Project Members</h2>
              <p className="text-muted-foreground">Project members would go here.</p>
            </div>
          </TabPanel>
        </TabPanels>
      </TabsDefault>
    </div>
  );
}
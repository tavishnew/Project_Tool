import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/auth';
import { api } from '@/api';
import { useQuery } from '@tanstack/react-query';
import { MemberAvatar } from '@/components/orbit/member-avatar';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/app/members/')({
  component: MembersPage,
});

function MembersPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: membersData, isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: () => {
      // This endpoint might not exist in the current API
      // For now, return empty array or try to fetch from a plausible endpoint
      return Promise.resolve([]);
    },
  });

  if (isLoading) {
    return <div className="flex min-h-[20rem] items-center justify-center">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-center text-destructive p-6">Error loading members</div>;
  }

  const members = membersData || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Team Members</h1>
        <p className="text-muted-foreground">Manage your workspace members</p>
      </div>
      
      <div className="mb-4">
        <Link to="/app/members/invite" className="btn btn-primary">
          Invite Member
        </Link>
      </div>
      
      {members.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No team members yet</p>
          <Link to="/app/members/invite" className="btn btn-primary mt-4">
            Invite Your First Member
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 bg-card border rounded-lg">
              <MemberAvatar 
                src={member.image_url ?? undefined} 
                name={member.name} 
                size={40} 
              />
              <div className="flex-1">
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.email}</p>
                {member.role && <p className="text-xs text-muted-foreground">{member.role}</p>}
              </div>
              <Button variant="outline" size="sm" className="ml-4">
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
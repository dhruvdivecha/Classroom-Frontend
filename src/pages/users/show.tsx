import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { useShow } from '@refinedev/core';
import { User } from '@/types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EditButton } from '@/components/refine-ui/buttons/edit';
import { DeleteButton } from '@/components/refine-ui/buttons/delete';

const UsersShow = () => {
  const { query } = useShow<User>({ resource: 'users' });
  const data = query.data?.data;
  const { isLoading, isError } = query;

  if (isLoading || isError || !data) {
    return (
      <ShowView>
        <ShowViewHeader resource="users" title="User" />
        <p className={isError ? 'text-destructive' : ''}>
          {isLoading ? 'Loading...' : isError ? 'Error loading user.' : 'User not found.'}
        </p>
      </ShowView>
    );
  }

  return (
    <ShowView>
      <ShowViewHeader resource="users" title="User" />
      <Card className="p-6">
        <dl className="space-y-3">
          <div><dt className="text-sm text-muted-foreground">Name</dt><dd className="font-medium">{data.name ?? '—'}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Email</dt><dd>{data.email}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Role</dt><dd><Badge variant="secondary">{(data.role ?? '').toLowerCase()}</Badge></dd></div>
          <div><dt className="text-sm text-muted-foreground">Email Verified</dt><dd>{data.emailVerified ? <Badge variant="default" className="bg-green-600">Verified</Badge> : <Badge variant="destructive">Unverified</Badge>}</dd></div>
        </dl>
        <div className="mt-4 flex gap-2">
          <EditButton resource="users" recordItemId={data.id} />
          <DeleteButton resource="users" recordItemId={data.id} />
        </div>
      </Card>
    </ShowView>
  );
};

export default UsersShow;

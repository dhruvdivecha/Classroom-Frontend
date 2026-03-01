import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { useShow, useGetIdentity } from '@refinedev/core';
import { Subject } from '@/types';
import { Card } from '@/components/ui/card';
import { EditButton } from '@/components/refine-ui/buttons/edit';
import { DeleteButton } from '@/components/refine-ui/buttons/delete';

const SubjectsShow = () => {
  const { query } = useShow<Subject>({ resource: 'subjects' });
  const { data: identity } = useGetIdentity();
  const userRole = identity?.role || 'student';
  const data = query.data?.data;
  const { isLoading, isError } = query;

  if (isLoading || isError || !data) {
    return (
      <ShowView>
        <ShowViewHeader resource="subjects" title="Subject" />
        <p className={isError ? 'text-destructive' : ''}>
          {isLoading ? 'Loading...' : isError ? 'Error loading subject.' : 'Subject not found.'}
        </p>
      </ShowView>
    );
  }

  const departmentName = typeof data.department === 'object' && data.department?.name != null ? data.department.name : (data.department as string) ?? '—';

  return (
    <ShowView>
      <ShowViewHeader resource="subjects" title="Subject" />
      <Card className="p-6">
        <dl className="space-y-3">
          <div><dt className="text-sm text-muted-foreground">Code</dt><dd className="font-mono font-medium">{data.code}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Name</dt><dd className="font-medium">{data.name}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Department</dt><dd>{departmentName}</dd></div>
          {data.description != null && data.description !== '' && (
            <div><dt className="text-sm text-muted-foreground">Description</dt><dd className="whitespace-pre-wrap">{data.description}</dd></div>
          )}
        </dl>
        <div className="mt-4 flex gap-2">
          {userRole !== 'student' && (
            <>
              <EditButton resource="subjects" recordItemId={data.id} />
              <DeleteButton resource="subjects" recordItemId={data.id} />
            </>
          )}
        </div>
      </Card>
    </ShowView>
  );
};

export default SubjectsShow;

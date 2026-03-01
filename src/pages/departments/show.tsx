import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { useShow } from '@refinedev/core';
import { Department } from '@/types';
import { Card } from '@/components/ui/card';
import { EditButton } from '@/components/refine-ui/buttons/edit';
import { DeleteButton } from '@/components/refine-ui/buttons/delete';

const DepartmentsShow = () => {
  const { query } = useShow<Department>({ resource: 'departments' });
  const data = query.data?.data;
  const { isLoading, isError } = query;

  if (isLoading || isError || !data) {
    return (
      <ShowView>
        <ShowViewHeader resource="departments" title="Department" />
        <p className={isError ? 'text-destructive' : ''}>
          {isLoading ? 'Loading...' : isError ? 'Error loading department.' : 'Department not found.'}
        </p>
      </ShowView>
    );
  }

  return (
    <ShowView>
      <ShowViewHeader resource="departments" title="Department" />
      <Card className="p-6">
        <dl className="space-y-3">
          <div><dt className="text-sm text-muted-foreground">Code</dt><dd className="font-mono font-medium">{data.code}</dd></div>
          <div><dt className="text-sm text-muted-foreground">Name</dt><dd className="font-medium">{data.name}</dd></div>
          {data.description != null && data.description !== '' && (
            <div><dt className="text-sm text-muted-foreground">Description</dt><dd>{data.description}</dd></div>
          )}
        </dl>
        <div className="mt-4 flex gap-2">
          <EditButton resource="departments" recordItemId={data.id} />
          <DeleteButton resource="departments" recordItemId={data.id} />
        </div>
      </Card>
    </ShowView>
  );
};

export default DepartmentsShow;

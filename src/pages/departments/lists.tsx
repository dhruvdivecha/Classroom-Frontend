import React, { useMemo } from 'react';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Search } from 'lucide-react';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { useCan, useGetIdentity } from '@refinedev/core';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { Department } from '@/types';
import { ShowButton } from '@/components/refine-ui/buttons/show';
import { EditButton } from '@/components/refine-ui/buttons/edit';
import { DeleteButton } from '@/components/refine-ui/buttons/delete';

const DepartmentsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data: canCreate } = useCan({ resource: 'departments', action: 'create' });
  const { data: identity } = useGetIdentity();
  const userRole = identity?.role || 'student';

  const searchFilter = useMemo(() => {
    if (searchTerm) {
      return [{ field: 'name' as const, operator: 'contains' as const, value: searchTerm }];
    }
    return [];
  }, [searchTerm]);

  const table = useTable<Department>({
    columns: useMemo<ColumnDef<Department>[]>(() => [
      { id: 'code', accessorKey: 'code', size: 120, header: () => <p className="column-title ml-2">Code</p>, cell: ({ getValue }) => <span className="font-mono text-sm">{getValue<string>()}</span> },
      { id: 'name', accessorKey: 'name', size: 200, header: () => <p className="column-title ml-2">Name</p>, cell: ({ getValue }) => <span className="font-medium">{getValue<string>()}</span> },
      { id: 'description', accessorKey: 'description', size: 300, header: () => <p className="column-title ml-2">Description</p>, cell: ({ getValue }) => <span className="truncate line-clamp-2 text-muted-foreground">{getValue<string>() ?? '—'}</span> },
      {
        id: 'actions',
        size: 180,
        header: () => <p className="column-title ml-2">Actions</p>,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <ShowButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm">View</ShowButton>
            {userRole === 'admin' && (
              <>
                <EditButton resource="departments" recordItemId={row.original.id} variant="outline" size="sm">Edit</EditButton>
                <DeleteButton resource="departments" recordItemId={row.original.id} size="sm" />
              </>
            )}
          </div>
        ),
      },
    ], [userRole]),
    refineCoreProps: {
      resource: 'departments',
      pagination: { pageSize: 10, mode: 'server' },
      filters: { permanent: searchFilter },
      sorters: { initial: [{ field: 'id', order: 'desc' }] },
    },
  });

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Departments</h1>
      <div className="intro-row">
        <p>Manage departments. Departments group subjects.</p>
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <input type="text" placeholder="Search by name or code..." className="pl-10 w-full" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          {canCreate?.can && <CreateButton resource="departments" />}
        </div>
      </div>
      <DataTable table={table} />
    </ListView>
  );
};

export default DepartmentsList;

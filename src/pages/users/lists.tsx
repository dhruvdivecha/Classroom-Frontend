import React, { useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Search, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateButton } from '@/components/refine-ui/buttons/create';
import { useTable } from '@refinedev/react-table';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/refine-ui/data-table/data-table';
import { User } from '@/types';
import { ShowButton } from '@/components/refine-ui/buttons/show';
import { EditButton } from '@/components/refine-ui/buttons/edit';
import { DeleteButton } from '@/components/refine-ui/buttons/delete';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useInvalidate } from '@refinedev/core';
import { BACKEND_BASE_URL } from '@/constants';

/* ------------------------------------------------------------------ */
/*  Pending-approval tab                                              */
/* ------------------------------------------------------------------ */

const PendingUsersTab: React.FC = () => {
  const invalidate = useInvalidate();
  const [loadingIds, setLoadingIds] = React.useState<Record<string, 'approve' | 'deny'>>({});

  const handleApprove = useCallback(
    async (userId: string) => {
      setLoadingIds((prev) => ({ ...prev, [userId]: 'approve' }));
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/users/${userId}/verify`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verified: true }),
        });
        if (!res.ok) console.error('Approve failed:', await res.text());
        invalidate({ resource: 'users', invalidates: ['list'] });
      } catch (e) {
        console.error('Approve failed', e);
      } finally {
        setLoadingIds((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    },
    [invalidate],
  );

  const handleDeny = useCallback(
    async (userId: string) => {
      setLoadingIds((prev) => ({ ...prev, [userId]: 'deny' }));
      try {
        const res = await fetch(`${BACKEND_BASE_URL}/users/${userId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (!res.ok) console.error('Deny/delete failed:', await res.text());
        invalidate({ resource: 'users', invalidates: ['list'] });
      } catch (e) {
        console.error('Deny failed', e);
      } finally {
        setLoadingIds((prev) => {
          const next = { ...prev };
          delete next[userId];
          return next;
        });
      }
    },
    [invalidate],
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        size: 180,
        header: () => <p className="column-title ml-2">Name</p>,
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>() ?? '—'}</span>
        ),
      },
      {
        id: 'email',
        accessorKey: 'email',
        size: 220,
        header: () => <p className="column-title ml-2">Email</p>,
        cell: ({ getValue }) => <span>{getValue<string>()}</span>,
      },
      {
        id: 'role',
        accessorKey: 'role',
        size: 120,
        header: () => <p className="column-title ml-2">Role</p>,
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {(getValue<string>() ?? '').toLowerCase()}
          </Badge>
        ),
      },
      {
        id: 'createdAt',
        accessorKey: 'createdAt',
        size: 160,
        header: () => <p className="column-title ml-2">Signed Up</p>,
        cell: ({ getValue }) => {
          const d = getValue<string>();
          return <span>{d ? new Date(d).toLocaleDateString() : '—'}</span>;
        },
      },
      {
        id: 'actions',
        size: 200,
        header: () => <p className="column-title ml-2">Actions</p>,
        cell: ({ row }) => {
          const userId = row.original.id;
          const action = loadingIds[userId];
          const isLoading = !!action;
          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
                disabled={isLoading}
                onClick={() => handleApprove(userId)}
              >
                {action === 'approve' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-1" />
                )}
                {action === 'approve' ? 'Approving…' : 'Approve'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 border-red-600 hover:bg-red-50"
                disabled={isLoading}
                onClick={() => handleDeny(userId)}
              >
                {action === 'deny' ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <XCircle className="h-4 w-4 mr-1" />
                )}
                {action === 'deny' ? 'Removing…' : 'Deny'}
              </Button>
            </div>
          );
        },
      },
    ],
    [handleApprove, handleDeny, loadingIds],
  );

  const table = useTable<User>({
    columns,
    refineCoreProps: {
      resource: 'users',
      pagination: { pageSize: 10, mode: 'server' },
      filters: {
        permanent: [
          { field: 'emailVerified', operator: 'eq', value: 'false' },
        ],
      },
      sorters: { initial: [{ field: 'id', order: 'desc' }] },
    },
  });

  return <DataTable table={table} />;
};

/* ------------------------------------------------------------------ */
/*  All-users tab (existing behaviour + email-verified badge)         */
/* ------------------------------------------------------------------ */

const AllUsersTab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const roleFromUrl = searchParams.get('role') ?? 'all';
  const [searchTerm, setSearchTerm] = React.useState(searchFromUrl);
  const [roleFilter, setRoleFilter] = React.useState<string>(roleFromUrl);

  useEffect(() => {
    setSearchTerm(searchFromUrl);
    setRoleFilter(
      roleFromUrl === 'admin' || roleFromUrl === 'teacher' || roleFromUrl === 'student'
        ? roleFromUrl
        : 'all',
    );
  }, [searchFromUrl, roleFromUrl]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);
    if (searchTerm) next.set('search', searchTerm);
    else next.delete('search');
    if (roleFilter && roleFilter !== 'all') next.set('role', roleFilter);
    else next.delete('role');
    setSearchParams(next, { replace: true });
  }, [searchTerm, roleFilter]);

  const searchFilter = useMemo(
    () =>
      searchTerm
        ? [{ field: 'name' as const, operator: 'contains' as const, value: searchTerm }]
        : [],
    [searchTerm],
  );
  const roleFilterArr = useMemo(
    () =>
      roleFilter && roleFilter !== 'all'
        ? [{ field: 'role' as const, operator: 'eq' as const, value: roleFilter }]
        : [],
    [roleFilter],
  );

  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'name',
        accessorKey: 'name',
        size: 180,
        header: () => <p className="column-title ml-2">Name</p>,
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>() ?? '—'}</span>
        ),
      },
      {
        id: 'email',
        accessorKey: 'email',
        size: 220,
        header: () => <p className="column-title ml-2">Email</p>,
        cell: ({ getValue }) => <span>{getValue<string>()}</span>,
      },
      {
        id: 'role',
        accessorKey: 'role',
        size: 120,
        header: () => <p className="column-title ml-2">Role</p>,
        cell: ({ getValue }) => (
          <Badge variant="secondary">
            {(getValue<string>() ?? '').toLowerCase()}
          </Badge>
        ),
      },
      {
        id: 'emailVerified',
        accessorKey: 'emailVerified',
        size: 130,
        header: () => <p className="column-title ml-2">Verified</p>,
        cell: ({ getValue }) =>
          getValue<boolean>() ? (
            <Badge variant="default" className="bg-green-600">Verified</Badge>
          ) : (
            <Badge variant="destructive">Unverified</Badge>
          ),
      },
      {
        id: 'actions',
        size: 220,
        header: () => <p className="column-title ml-2">Actions</p>,
        cell: ({ row }) => (
          <div className="flex gap-2">
            <ShowButton resource="users" recordItemId={row.original.id} variant="outline" size="sm">
              View
            </ShowButton>
            <EditButton resource="users" recordItemId={row.original.id} variant="outline" size="sm">
              Edit
            </EditButton>
            <DeleteButton resource="users" recordItemId={row.original.id} size="sm" />
          </div>
        ),
      },
    ],
    [],
  );

  const table = useTable<User>({
    columns,
    refineCoreProps: {
      resource: 'users',
      pagination: { pageSize: 10, mode: 'server' },
      filters: { permanent: [...searchFilter, ...roleFilterArr] },
      sorters: { initial: [{ field: 'id', order: 'desc' }] },
    },
  });

  return (
    <>
      <div className="intro-row">
        <div className="actions-row">
          <div className="search-field">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <CreateButton resource="users" />
          </div>
        </div>
      </div>
      <DataTable table={table} />
    </>
  );
};

/* ------------------------------------------------------------------ */
/*  Main page                                                         */
/* ------------------------------------------------------------------ */

const UsersList: React.FC = () => {
  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Users</h1>
      <p className="mb-4">Manage users — approve new sign-ups and manage existing accounts.</p>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="all">All Users</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <PendingUsersTab />
        </TabsContent>

        <TabsContent value="all">
          <AllUsersTab />
        </TabsContent>
      </Tabs>
    </ListView>
  );
};

export default UsersList;

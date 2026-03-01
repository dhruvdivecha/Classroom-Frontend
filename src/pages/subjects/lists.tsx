import React, { useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import { CreateButton } from '@/components/refine-ui/buttons/create'
import { useCan, useGetIdentity } from '@refinedev/core'
import { useTable } from '@refinedev/react-table';
import { useList } from '@refinedev/core';
import { Subject, Department } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { ShowButton } from '@/components/refine-ui/buttons/show'
import { EditButton } from '@/components/refine-ui/buttons/edit'
import { DeleteButton } from '@/components/refine-ui/buttons/delete'

const SubjectsList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const searchFromUrl = searchParams.get('search') ?? ''
    const deptFromUrl = searchParams.get('department') ?? 'all'
	const [searchTerm, setSearchTerm] = React.useState(searchFromUrl)
    const [selectedFilter, setSelectedFilter] = React.useState(deptFromUrl)
    const { data: canCreate } = useCan({ resource: 'subjects', action: 'create' })
    const { data: identity } = useGetIdentity()
    const userRole = identity?.role || 'student'

    useEffect(() => {
        setSearchTerm(searchFromUrl)
        setSelectedFilter(deptFromUrl)
    }, [searchFromUrl, deptFromUrl])

    useEffect(() => {
        const next = new URLSearchParams(searchParams)
        if (searchTerm) next.set('search', searchTerm)
        else next.delete('search')
        if (selectedFilter && selectedFilter !== 'all') next.set('department', selectedFilter)
        else next.delete('department')
        setSearchParams(next, { replace: true })
    }, [searchTerm, selectedFilter])

    const { result: deptResult } = useList<Department>({ resource: 'departments', pagination: { pageSize: 200 } })
    const departments = deptResult?.data ?? []

    const filterDepartment = React.useMemo(() => {
        if (selectedFilter && selectedFilter !== 'all') {
            return [{ field: 'department' as const, operator: 'eq' as const, value: selectedFilter }]
        }
        return []
    }, [selectedFilter]);

    const searchFilter = React.useMemo(() => {
        if (searchTerm) {
            return [
                {
                    field: 'name',
                    operator: 'contains' as const,
                    value: searchTerm,
                }
            ]
        }
        return []
    }, [searchTerm]);

    const subjectTable = useTable<Subject>({
        columns: useMemo<ColumnDef<Subject>[]>(() => [
            {
                id: 'code', 
                accessorKey: 'code', 
                size: 100, 
                header: () => <p className='column-title ml-2'>code</p>,
                cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
            },
            {
                id: 'name',
                accessorKey: 'name',
                size: 200,
                header: () => <p className='column-title ml-2'>Name</p>,
                cell: ({ getValue }) => <span className='text-foregrouund'>{getValue<string>()}</span>,
                filterFn: "includesString",
            },
            {
                id: 'department',
                accessorKey: 'department.name',
                size: 150,
                header: () => <p className='column-title ml-2'>Department</p>,
                cell: ({ row }) => {
                    const dep = row.original.department;
                    const name = typeof dep === 'object' && dep && 'name' in dep ? (dep as { name?: string }).name : null;
                    return <Badge variant='secondary'>{name ?? '—'}</Badge>;
                },
            },
            {
                id: 'description',
                accessorKey: 'description',
                size: 300,
                header: () => <p className='column-title ml-2'>Description</p>,
                cell: ({ getValue }) => <span className='truncate line-clamp-2'>{getValue<string>() ?? '—'}</span>,
            },
            {
                id: 'actions',
                size: 180,
                header: () => <p className='column-title ml-2'>Actions</p>,
                cell: ({ row }) => (
                    <div className='flex gap-2'>
                        <ShowButton resource='subjects' recordItemId={row.original.id} variant='outline' size='sm'>View</ShowButton>
                        {userRole !== 'student' && (
                            <>
                                <EditButton resource='subjects' recordItemId={row.original.id} variant='outline' size='sm'>Edit</EditButton>
                                <DeleteButton resource='subjects' recordItemId={row.original.id} size='sm' />
                            </>
                        )}
                    </div>
                ),
            },
        ], [userRole]),
        refineCoreProps: {
            resource: 'subjects',
            pagination: {
                pageSize: 10, mode: 'server',
            },
            filters: {
                permanent: [
                    ...filterDepartment,
                    ...searchFilter,
                ]
            },
            sorters:{
                initial: [
                    { field: 'id', order: 'desc' },
                ]
            },
        }
    });

	return (
		<ListView>
			<Breadcrumb />

			<h1 className="page-title">Subjects</h1>

			<div className="intro-row">
				<p>
					Quick access to essential metrics and management tools for your
					subjects.
				</p>

				<div className="actions-row">
					<div className="search-field">
						<Search className="search-icon" />
						<input
							type="text"
							placeholder="Search by name..."
							className="pl-10 w-full"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
                    <div className='flex gap-2 w-full sm:w-auto'>
                        <Select value={selectedFilter ?? undefined} onValueChange={(value) => setSelectedFilter(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Department" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept: Department) => (
                                    <SelectItem key={dept.id} value={dept.name}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>   
                        </Select>
                        {canCreate?.can && <CreateButton />}
                    </div>
				</div>
			</div>
            <DataTable table={subjectTable} />


		</ListView>
	)
}

export default SubjectsList
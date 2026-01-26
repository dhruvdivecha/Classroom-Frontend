import React, { useMemo } from 'react'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import { DEPARTMENTS_OPTIONS } from '@/constants'
import { CreateButton } from '@/components/refine-ui/buttons/create'
import { useTable } from '@refinedev/react-table';
import { Subject } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/refine-ui/data-table/data-table'

const SubjectsList: React.FC = () => {
	const [searchTerm, setSearchTerm] = React.useState('')
    const [selectedFilter, setSelectedFilter] = React.useState("all")

    const filterDepartment = React.useMemo(() => {
        if (selectedFilter && selectedFilter !== 'all') {
            return [
                {
                    field: 'department',
                    operator: 'eq' as const,
                    value: selectedFilter,
                }
            ]
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
                accessorKey: 'department',
                size: 150,
                header: () => <p className='column-title ml-2'>Department</p>,
                cell: ({ getValue }) => <Badge variant='secondary'>{getValue<string>()}</Badge>,
            },
            {
                id: 'description',
                accessorKey: 'description',
                size: 300,
                header: () => <p className='column-title ml-2'>Description</p>,
                cell: ({ getValue }) => <span className='truncate line-clamp-2'>{getValue<string>()}</span>,
            }
        ], []),
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
                                <SelectValue placeholder="Filter by Departement" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {DEPARTMENTS_OPTIONS.map((dept) => (
                                    <SelectItem key={dept.value} value={dept.value}>
                                        {dept.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>   
                        </Select>
                        <CreateButton />
                    </div>
				</div>
			</div>
            <DataTable table={subjectTable} />


		</ListView>
	)
}

export default SubjectsList
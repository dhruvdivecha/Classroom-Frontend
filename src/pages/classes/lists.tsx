import React, { useMemo } from 'react'
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb'
import { ListView } from '@/components/refine-ui/views/list-view'
import { Search } from 'lucide-react'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/components/ui/select'
import { CreateButton } from '@/components/refine-ui/buttons/create'
import { useTable } from '@refinedev/react-table';
import { ClassDetails, Subject, User } from '@/types';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge'
import { DataTable } from '@/components/refine-ui/data-table/data-table'
import { useList } from '@refinedev/core'

const ClassesList: React.FC = () => {
	const [searchTerm, setSearchTerm] = React.useState('')
    const [selectedSubject, setSelectedSubject] = React.useState("all")
    const [selectedTeacher, setSelectedTeacher] = React.useState("all")

    // Fetch subjects for filter dropdown
    const { query: subjectsQuery } = useList<Subject>({
        resource: "subjects",
        pagination: {
            pageSize: 100,
        },
    });

    // Fetch teachers for filter dropdown
    const { query: teachersQuery } = useList<User>({
        resource: "users",
        filters: [
            {
                field: "role",
                operator: "eq",
                value: "teacher",
            },
        ],
        pagination: {
            pageSize: 100,
        },
    });

    const subjects = subjectsQuery.data?.data || [];
    const teachers = teachersQuery.data?.data || [];

    const filterSubject = React.useMemo(() => {
        if (selectedSubject && selectedSubject !== 'all') {
            return [
                {
                    field: 'subject',
                    operator: 'eq' as const,
                    value: selectedSubject,
                }
            ]
        }
        return []
    }, [selectedSubject]);

    const filterTeacher = React.useMemo(() => {
        if (selectedTeacher && selectedTeacher !== 'all') {
            return [
                {
                    field: 'teacher',
                    operator: 'eq' as const,
                    value: selectedTeacher,
                }
            ]
        }
        return []
    }, [selectedTeacher]);

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

    const classesTable = useTable<ClassDetails>({
        columns: useMemo<ColumnDef<ClassDetails>[]>(() => [
            {
                id: 'banner', 
                accessorKey: 'bannerUrl', 
                size: 100, 
                header: () => <p className='column-title ml-2'>Banner</p>,
                cell: ({ getValue }) => {
                    const url = getValue<string>();
                    return url ? (
                        <img 
                            src={url} 
                            alt="Class banner" 
                            className="w-16 h-16 object-cover rounded"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center text-muted-foreground text-xs">
                            No image
                        </div>
                    );
                },
            },
            {
                id: 'name',
                accessorKey: 'name',
                size: 200,
                header: () => <p className='column-title ml-2'>Class Name</p>,
                cell: ({ getValue }) => <span className='text-foreground font-medium'>{getValue<string>()}</span>,
                filterFn: "includesString",
            },
            {
                id: 'status',
                accessorKey: 'status',
                size: 120,
                header: () => <p className='column-title ml-2'>Status</p>,
                cell: ({ getValue }) => {
                    const status = getValue<string>();
                    return (
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                            {status}
                        </Badge>
                    );
                },
            },
            {
                id: 'subject',
                accessorKey: 'subject.name',
                size: 150,
                header: () => <p className='column-title ml-2'>Subject</p>,
                cell: ({ getValue }) => <Badge variant='secondary'>{getValue<string>()}</Badge>,
            },
            {
                id: 'teacher',
                accessorKey: 'teacher.name',
                size: 150,
                header: () => <p className='column-title ml-2'>Teacher</p>,
                cell: ({ getValue }) => <span className='text-foreground'>{getValue<string>()}</span>,
            },
            {
                id: 'capacity',
                accessorKey: 'capacity',
                size: 100,
                header: () => <p className='column-title ml-2'>Capacity</p>,
                cell: ({ getValue }) => <span className='text-foreground'>{getValue<number>()}</span>,
            }
        ], []),
        refineCoreProps: {
            resource: 'classes',
            pagination: {
                pageSize: 10, mode: 'server',
            },
            filters: {
                permanent: [
                    ...filterSubject,
                    ...filterTeacher,
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

			<h1 className="page-title">Classes</h1>

			<div className="intro-row">
				<p>
					Manage and view all classes with their details, subjects, and assigned teachers.
				</p>

				<div className="actions-row">
					<div className="search-field">
						<Search className="search-icon" />
						<input
							type="text"
							placeholder="Search by class name..."
							className="pl-10 w-full"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
                    <div className='flex gap-2 w-full sm:w-auto'>
                        <Select value={selectedSubject ?? undefined} onValueChange={(value) => setSelectedSubject(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Subject" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Subjects</SelectItem>
                                {subjects.map((subject) => (
                                    <SelectItem key={subject.id} value={subject.name}>
                                        {subject.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>   
                        </Select>
                        <Select value={selectedTeacher ?? undefined} onValueChange={(value) => setSelectedTeacher(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by Teacher" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Teachers</SelectItem>
                                {teachers.map((teacher) => (
                                    <SelectItem key={teacher.id} value={teacher.name}>
                                        {teacher.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>   
                        </Select>
                        <CreateButton resource="classes" />
                    </div>
				</div>
			</div>
            <DataTable table={classesTable} />

		</ListView>
	)
}

export default ClassesList
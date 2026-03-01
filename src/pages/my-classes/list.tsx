import React, { useMemo, useState, useEffect } from 'react';
import { useGetIdentity } from '@refinedev/core';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Breadcrumb } from '@/components/refine-ui/layout/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { BACKEND_BASE_URL } from '@/constants';
import { ClassDetails, EnrollmentWithStudent } from '@/types';
import { ShowButton } from '@/components/refine-ui/buttons/show';
import { EditButton } from '@/components/refine-ui/buttons/edit';
import { Users, GraduationCap } from 'lucide-react';
import { useLink } from '@refinedev/core';

type ClassWithEnrollments = ClassDetails & {
  enrollments: EnrollmentWithStudent[];
  enrollmentCount: number;
};

export default function MyClassesList() {
  const { data: identity } = useGetIdentity();
  const Link = useLink();
  const [classes, setClasses] = useState<ClassWithEnrollments[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMyClasses = async () => {
      if (!identity?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        // Fetch only this teacher's classes for "My Classes" page
        const classesRes = await fetch(
          `${BACKEND_BASE_URL}/classes?teacherId=${encodeURIComponent(identity.id)}&limit=100`,
          { credentials: 'include' }
        );
        if (!classesRes.ok) throw new Error('Failed to load classes');
        const classesData = await classesRes.json();
        const myClasses: ClassDetails[] = classesData.data || [];

        // Fetch enrollments for each class
        const classesWithEnrollments = await Promise.all(
          myClasses.map(async (cls) => {
            try {
              const enrollRes = await fetch(
                `${BACKEND_BASE_URL}/classes/${cls.id}/enrollments`,
                { credentials: 'include' }
              );
              const enrollData = enrollRes.ok ? await enrollRes.json() : { data: [] };
              return {
                ...cls,
                enrollments: enrollData.data || [],
                enrollmentCount: (enrollData.data || []).length,
              };
            } catch {
              return {
                ...cls,
                enrollments: [],
                enrollmentCount: 0,
              };
            }
          })
        );

        setClasses(classesWithEnrollments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load classes');
      } finally {
        setLoading(false);
      }
    };

    loadMyClasses();
  }, [identity?.id]);

  if (loading) {
    return (
      <ListView>
        <Breadcrumb />
        <h1 className="page-title">My Classes</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
              <CardContent><Skeleton className="h-20 w-full" /></CardContent>
            </Card>
          ))}
        </div>
      </ListView>
    );
  }

  if (error) {
    return (
      <ListView>
        <Breadcrumb />
        <h1 className="page-title">My Classes</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-destructive">{error}</p>
          </CardContent>
        </Card>
      </ListView>
    );
  }

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">My Classes</h1>
      <div className="intro-row">
        <p>View and manage your classes with enrolled students.</p>
      </div>

      {classes.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">You don't have any classes yet.</p>
            <Link to="/classes/create">
              <Button className="mt-4">Create your first class</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {classes.map((cls) => (
            <Card key={cls.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl">{cls.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {cls.subject?.name} • {cls.teacher?.name || 'Unknown Teacher'}
                    </CardDescription>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={cls.status === 'active' ? 'default' : 'secondary'}>
                      {cls.status}
                    </Badge>
                    <Badge variant="outline">
                      <Users className="h-3 w-3 mr-1 inline" />
                      {cls.enrollmentCount} / {cls.capacity}
                    </Badge>
                    <ShowButton resource="classes" recordItemId={cls.id} size="sm" variant="outline">
                      View
                    </ShowButton>
                    <EditButton resource="classes" recordItemId={cls.id} size="sm" variant="outline">
                      Edit
                    </EditButton>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {cls.enrollments.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
                ) : (
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Enrolled Students ({cls.enrollments.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {cls.enrollments.map((enrollment) => (
                        <div
                          key={enrollment.id}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/50 text-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {enrollment.student?.name || enrollment.student?.email || enrollment.studentId}
                            </p>
                            {enrollment.student?.email && (
                              <p className="text-xs text-muted-foreground truncate">
                                {enrollment.student.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </ListView>
  );
}

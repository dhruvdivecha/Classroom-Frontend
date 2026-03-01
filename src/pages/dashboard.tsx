import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BACKEND_BASE_URL } from '@/constants';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { Users, Building2, BookOpen, GraduationCap, ClipboardList, Activity, UserCheck, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useGetIdentity, useLink } from '@refinedev/core';
import { ClassDetails, EnrollmentWithStudent } from '@/types';
import { ShowButton } from '@/components/refine-ui/buttons/show';
import { EditButton } from '@/components/refine-ui/buttons/edit';

type AdminStats = {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalDepartments: number;
  totalSubjects: number;
  totalClasses: number;
  totalEnrollments: number;
};

type TeacherStats = {
  myClasses: number;
  totalStudents: number;
  pendingJoinRequests: number;
};

type StudentStats = {
  enrolledClasses: number;
  pendingRequests: number;
  classes?: Array<{
    id: number;
    name: string;
    description: string | null;
    capacity: number;
    status: string;
    subjectName: string;
    teacherName: string | null;
    teacherEmail: string;
  }>;
};

type TrendPoint = { month: string; count: number };
type DeptPoint = { name: string; count: number; departmentId?: number };
type CapacityPoint = { name: string; value: number };
type RolePoint = { name: string; value: number };
type ActivityItem = {
  id: number;
  createdAt: string;
  studentName: string | null;
  studentEmail: string;
  className: string;
  classId: number;
};

type TeacherClassWithEnrollments = ClassDetails & {
  enrollments: EnrollmentWithStudent[];
  enrollmentCount: number;
};

const chartColors = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

export default function Dashboard() {
  const { data: identity } = useGetIdentity();
  const userRole = identity?.role || null;
  const Link = useLink();

  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [teacherStats, setTeacherStats] = useState<TeacherStats | null>(null);
  const [studentStats, setStudentStats] = useState<StudentStats | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClassWithEnrollments[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [byDept, setByDept] = useState<DeptPoint[]>([]);
  const [capacity, setCapacity] = useState<CapacityPoint[]>([]);
  const [userDist, setUserDist] = useState<RolePoint[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch dashboard data until we know the user's role
    if (!userRole) return;

    const base = BACKEND_BASE_URL;
    if (!base) {
      setError('Backend URL not configured');
      setLoading(false);
      return;
    }
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Common fetches for admin and teacher
        const commonFetches = (userRole === 'admin' || userRole === 'teacher')
          ? [
              fetch(`${base}/dashboard/stats`, { credentials: 'include' }),
              fetch(`${base}/dashboard/enrollment-trends`, { credentials: 'include' }),
              fetch(`${base}/dashboard/classes-by-department`, { credentials: 'include' }),
              fetch(`${base}/dashboard/capacity-status`, { credentials: 'include' }),
              fetch(`${base}/dashboard/activity`, { credentials: 'include' }),
            ]
          : [
              fetch(`${base}/dashboard/stats`, { credentials: 'include' }),
            ];

        // Only admin gets user distribution
        const distFetch = userRole === 'admin'
          ? fetch(`${base}/dashboard/user-distribution`, { credentials: 'include' })
          : null;

        const responses = await Promise.all(commonFetches);

        // Parse stats
        const statsRes = responses[0];
        if (!statsRes.ok) throw new Error('Stats failed');
        const statsJson = await statsRes.json();
        
        if (userRole === 'admin') {
          setAdminStats(statsJson.data ?? null);
          const [, trendsRes, deptRes, capRes, actRes] = responses;
          if (trendsRes.ok) { const j = await trendsRes.json(); setTrends(j.data ?? []); }
          if (deptRes.ok) { const j = await deptRes.json(); setByDept(j.data ?? []); }
          if (capRes.ok) { const j = await capRes.json(); setCapacity(j.data ?? []); }
          if (actRes.ok) { const j = await actRes.json(); setActivity(j.data ?? []); }
          if (distFetch) {
            const distRes = await distFetch;
            if (distRes.ok) { const j = await distRes.json(); setUserDist(j.data ?? []); }
          }
        } else if (userRole === 'teacher') {
          setTeacherStats(statsJson.data ?? null);
          const [, trendsRes, deptRes, capRes, actRes] = responses;
          if (trendsRes.ok) { const j = await trendsRes.json(); setTrends(j.data ?? []); }
          if (deptRes.ok) { const j = await deptRes.json(); setByDept(j.data ?? []); }
          if (capRes.ok) { const j = await capRes.json(); setCapacity(j.data ?? []); }
          if (actRes.ok) { const j = await actRes.json(); setActivity(j.data ?? []); }

          // Fetch teacher's classes with enrollments (replaces My Classes page)
          try {
            const classesRes = await fetch(
              `${base}/classes?teacherId=${encodeURIComponent(identity!.id as string)}&limit=100`,
              { credentials: 'include' }
            );
            if (classesRes.ok) {
              const classesData = await classesRes.json();
              const myClasses: ClassDetails[] = classesData.data || [];
              const classesWithEnrollments = await Promise.all(
                myClasses.map(async (cls) => {
                  try {
                    const enrollRes = await fetch(`${base}/classes/${cls.id}/enrollments`, { credentials: 'include' });
                    const enrollData = enrollRes.ok ? await enrollRes.json() : { data: [] };
                    return { ...cls, enrollments: enrollData.data || [], enrollmentCount: (enrollData.data || []).length };
                  } catch {
                    return { ...cls, enrollments: [], enrollmentCount: 0 };
                  }
                })
              );
              setTeacherClasses(classesWithEnrollments);
            }
          } catch (e) {
            console.error('Failed to load teacher classes:', e);
          }
        } else {
          // Student
          const studentStatsRes = await fetch(`${base}/dashboard/student-stats`, { credentials: 'include' });
          if (studentStatsRes.ok) {
            const studentJson = await studentStatsRes.json();
            setStudentStats(studentJson.data ?? null);
          }
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userRole, identity?.id]);

  if (loading && !adminStats && !teacherStats && !studentStats) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}><CardHeader><Skeleton className="h-4 w-24" /></CardHeader><CardContent><Skeleton className="h-8 w-16" /></CardContent></Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  // Render different cards based on role
  let cards: Array<{ title: string; value: number; icon: React.ComponentType<{ className?: string }> }> = [];
  
  if (userRole === 'admin' && adminStats) {
    cards = [
      { title: 'Total Users', value: adminStats.totalUsers, icon: Users },
      { title: 'Teachers', value: adminStats.totalTeachers, icon: Users },
      { title: 'Students', value: adminStats.totalStudents, icon: Users },
      { title: 'Departments', value: adminStats.totalDepartments, icon: Building2 },
      { title: 'Subjects', value: adminStats.totalSubjects, icon: BookOpen },
      { title: 'Classes', value: adminStats.totalClasses, icon: GraduationCap },
      { title: 'Enrollments', value: adminStats.totalEnrollments, icon: ClipboardList },
    ];
  } else if (userRole === 'teacher' && teacherStats) {
    cards = [
      { title: 'My Classes', value: teacherStats.myClasses, icon: GraduationCap },
      { title: 'Total Students', value: teacherStats.totalStudents, icon: Users },
      { title: 'Pending Requests', value: teacherStats.pendingJoinRequests, icon: Clock },
    ];
  } else if (userRole === 'student' && studentStats) {
    cards = [
      { title: 'Enrolled Classes', value: studentStats.enrolledClasses, icon: GraduationCap },
      { title: 'Pending Requests', value: studentStats.pendingRequests, icon: Clock },
    ];
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 p-2 sm:p-4 min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold">Dashboard</h1>

      <div className={`grid gap-4 ${userRole === 'admin' ? 'md:grid-cols-2 lg:grid-cols-4' : 'md:grid-cols-3'}`}>
        {cards.map(({ title, value, icon: Icon }) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Dashboard: Show enrolled classes */}
      {userRole === 'student' && studentStats?.classes && studentStats.classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {studentStats.classes.map((cls) => (
                <li key={cls.id} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">{cls.subjectName}</p>
                      <p className="text-sm text-muted-foreground">Teacher: {cls.teacherName || cls.teacherEmail}</p>
                    </div>
                    <Badge variant={cls.status === 'active' ? 'default' : 'secondary'}>{cls.status}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Teacher Dashboard: My Classes with enrolled students */}
      {userRole === 'teacher' && teacherClasses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">My Classes</h2>
          {teacherClasses.map((cls) => (
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

      {/* Charts - show for admin and teacher */}
      {(userRole === 'admin' || userRole === 'teacher') && (
        <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enrollment trends</CardTitle>
            <p className="text-sm text-muted-foreground">Enrollments per month (last 6 months)</p>
          </CardHeader>
          <CardContent>
            {trends.length > 0 ? (
              <ChartContainer config={{ count: { label: 'Enrollments', color: 'var(--chart-1)' } }} className="h-[240px] w-full">
                <BarChart data={trends} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No enrollment data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes by department</CardTitle>
          </CardHeader>
          <CardContent>
            {byDept.length > 0 ? (
              <ChartContainer config={Object.fromEntries(byDept.map((d, i) => [d.name, { color: chartColors[i % chartColors.length] }]))} className="h-[240px] w-full">
                <PieChart>
                  <Pie data={byDept} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.name}: ${e.count}`}>
                    {byDept.map((_, i) => (
                      <Cell key={i} fill={chartColors[i % chartColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No classes by department yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Capacity status</CardTitle>
            <p className="text-sm text-muted-foreground">Classes at capacity vs under</p>
          </CardHeader>
          <CardContent>
            {capacity.length > 0 ? (
              <ChartContainer config={{ 'At capacity': { color: 'var(--destructive)' }, 'Under capacity': { color: 'var(--chart-2)' } } } className="h-[240px] w-full">
                <PieChart>
                  <Pie data={capacity} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {capacity.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? 'var(--destructive)' : 'var(--chart-2)'} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-muted-foreground text-sm">No capacity data yet.</p>
            )}
          </CardContent>
        </Card>

        {/* User distribution - admin only */}
        {userRole === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>User distribution</CardTitle>
              <p className="text-sm text-muted-foreground">By role</p>
            </CardHeader>
            <CardContent>
              {userDist.length > 0 ? (
                <ChartContainer config={Object.fromEntries(userDist.map((d, i) => [d.name, { color: chartColors[i % chartColors.length] }]))} className="h-[240px] w-full">
                  <PieChart>
                    <Pie data={userDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(e) => `${e.name}: ${e.value}`}>
                      {userDist.map((_, i) => (
                        <Cell key={i} fill={chartColors[i % chartColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
              ) : (
                <p className="text-muted-foreground text-sm">No users yet.</p>
              )}
            </CardContent>
          </Card>
        )}
        </div>
      )}

      {/* Activity feed - show for admin and teacher */}
      {(userRole === 'admin' || userRole === 'teacher') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Activity feed
            </CardTitle>
            <p className="text-sm text-muted-foreground">Recent enrollments</p>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent activity.</p>
            ) : (
              <ul className="space-y-3 max-h-[320px] overflow-auto">
                {activity.map((a) => (
                  <li key={a.id} className="flex justify-between text-sm border-b pb-2 last:border-0">
                    <span>
                      <strong>{a.studentName ?? a.studentEmail}</strong> enrolled in <strong>{a.className}</strong>
                    </span>
                    <span className="text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

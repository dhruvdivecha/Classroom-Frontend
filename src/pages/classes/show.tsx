import React, { useCallback, useState } from 'react';
import { ShowView, ShowViewHeader } from '@/components/refine-ui/views/show-view';
import { ClassDetails, EnrollmentWithStudent, User } from '@/types';
import { useShow, useList } from '@refinedev/core';
import { useParams } from 'react-router';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { bannerPhoto } from '@/lib/cloudinary';
import { AdvancedImage } from '@cloudinary/react';
import { fetchEnrollments, enrollStudent, unenrollStudent } from '@/lib/enrollments-api';
import { createJoinRequest, getJoinRequests, type JoinRequest } from '@/lib/join-requests-api';
import { Copy, UserPlus, Loader2, AlertTriangle, Send } from 'lucide-react';
import { useGetIdentity } from '@refinedev/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { EditButton } from '@/components/refine-ui/buttons/edit';
import { DeleteButton } from '@/components/refine-ui/buttons/delete';

function useEnrollments(classId: number | undefined) {
  const [list, setList] = useState<EnrollmentWithStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (classId == null) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEnrollments(classId);
      setList(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [classId]);

  React.useEffect(() => {
    refetch();
  }, [refetch]);

  return { list, loading, error, refetch };
}

const Show = () => {
  const params = useParams();
  const classId = params?.id ? parseInt(params.id, 10) : undefined;
  const { query } = useShow<ClassDetails>({ resource: 'classes' });
  const classDetails = query.data?.data;
  const { isLoading, isError } = query;
  const { list: enrollments, loading: enrollmentsLoading, refetch: refetchEnrollments } = useEnrollments(classId);
  const { data: identity } = useGetIdentity();
  const userRole = identity?.role || 'student';
  const userId = identity?.id;

  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [joinRequestLoading, setJoinRequestLoading] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');

  // Load join requests for this class (if student)
  React.useEffect(() => {
    if (userRole === 'student' && classId && userId) {
      setJoinRequestLoading(true);
      getJoinRequests()
        .then((requests) => {
          const classRequests = requests.filter((r) => r.classId === classId && r.studentId === userId);
          setJoinRequests(classRequests);
        })
        .catch(console.error)
        .finally(() => setJoinRequestLoading(false));
    }
  }, [classId, userId, userRole]);

  const pendingRequest = joinRequests.find((r) => r.status === 'pending');
  const isEnrolled = enrollments.some((e) => e.studentId === userId);
  const isClassTeacher = classDetails?.teacher?.id === userId;

  const { result: studentsResult } = useList<User>({
    resource: 'users',
    filters: [{ field: 'role', operator: 'eq', value: 'student' }],
    pagination: { pageSize: 200 },
  });
  const students = studentsResult?.data ?? [];
  const enrolledIds = new Set(enrollments.map((e) => e.studentId));
  const availableStudents = students.filter((s) => !enrolledIds.has(s.id));

  const [enrollStudentId, setEnrollStudentId] = useState<string>('');
  const [enrollSubmitting, setEnrollSubmitting] = useState(false);
  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);

  const handleCopyInviteCode = () => {
    if (classDetails?.inviteCode) {
      navigator.clipboard.writeText(classDetails.inviteCode);
      // Could add toast
    }
  };

  const handleEnroll = async () => {
    if (!classId || !enrollStudentId) return;
    setEnrollSubmitting(true);
    try {
      await enrollStudent(classId, enrollStudentId);
      setEnrollStudentId('');
      setEnrollDialogOpen(false);
      await refetchEnrollments();
    } catch (e) {
      console.error(e);
    } finally {
      setEnrollSubmitting(false);
    }
  };

  const handleUnenroll = async (studentId: string) => {
    if (!classId) return;
    try {
      await unenrollStudent(classId, studentId);
      await refetchEnrollments();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestJoin = async () => {
    if (!classId) return;
    setRequestSubmitting(true);
    try {
      await createJoinRequest(classId, requestMessage || undefined);
      setRequestMessage('');
      // Reload requests
      const requests = await getJoinRequests();
      const classRequests = requests.filter((r) => r.classId === classId && r.studentId === userId);
      setJoinRequests(classRequests);
    } catch (e) {
      console.error(e);
    } finally {
      setRequestSubmitting(false);
    }
  };

  if (isLoading || isError || !classDetails) {
    return (
      <ShowView className="class-view class-show">
        <ShowViewHeader resource="classes" title="Class Details" />
        <p className={isError ? 'text-destructive' : ''}>
          {isLoading ? 'Loading...' : isError ? 'Error loading class.' : 'Class not found.'}
        </p>
      </ShowView>
    );
  }

  const teacherName = classDetails.teacher?.name ?? 'Unknown Teacher';
  const { bannerCldPubId, name, description, status, capacity, inviteCode, subject, teacher, department } = classDetails;
  const enrolledCount = enrollments.length;
  const atCapacity = enrolledCount >= capacity;

  return (
    <ShowView className="class-view class-show">
      <ShowViewHeader resource="classes" title="Class Details" />
      <div className="banner">
        {bannerCldPubId ? (
          <AdvancedImage cldImg={bannerPhoto(bannerCldPubId, name)} alt={name} />
        ) : (
          <div className="placeholder" />
        )}
      </div>

      <Card className="details-card">
        <div className="details-header">
          <div>
            <h1>{name}</h1>
            <p>{description ?? '—'}</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline">{enrolledCount} / {capacity} spots</Badge>
            {atCapacity && (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> At capacity
              </Badge>
            )}
            <Badge variant="outline" data-status={status}>{status.toUpperCase()}</Badge>
            {userRole !== 'student' && (
              <>
                <EditButton resource="classes" recordItemId={classDetails.id} variant="outline" size="sm" />
                <DeleteButton resource="classes" recordItemId={classDetails.id} size="sm" />
              </>
            )}
          </div>
        </div>

        <div className="details-grid">
          <div className="instructor">
            <p>Instructor</p>
            <div>
              <div>
                <p>{teacherName}</p>
                <p>{teacher?.email ?? 'No email'}</p>
              </div>
            </div>
          </div>
          <div className="department">
            <p>Department</p>
            <div>
              <p>{department?.name ?? '—'}</p>
              <p>{department?.description ?? '—'}</p>
            </div>
          </div>
          <Separator />
          <div className="subject">
            <p>Subject</p>
            <div>
              <Badge variant="outline">Code: {subject?.code ?? '—'}</Badge>
              <p>{subject?.name ?? '—'}</p>
              <p>{subject?.description ?? '—'}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="join">
          <h2>Invite code</h2>
          <div className="flex items-center gap-2 flex-wrap">
            <code className="px-3 py-2 bg-muted rounded font-mono text-lg">{inviteCode ?? '—'}</code>
            <Button type="button" variant="outline" size="sm" onClick={handleCopyInviteCode}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
          </div>
        </div>

        <Separator />

        {/* Student Join Request Section */}
        {userRole === 'student' && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Join this class</h2>
            {isEnrolled ? (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-green-800 dark:text-green-200 font-medium">You are enrolled in this class</p>
              </div>
            ) : pendingRequest ? (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  Join request {pendingRequest.status === 'pending' ? 'pending' : pendingRequest.status === 'approved' ? 'approved' : 'rejected'}
                </p>
                {pendingRequest.message && <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">{pendingRequest.message}</p>}
              </div>
            ) : (
              <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                <DialogTrigger asChild>
                  <Button type="button" size="lg" className="w-full" disabled={atCapacity}>
                    <Send className="h-4 w-4 mr-2" /> Request to Join
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Request to join class</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-2">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Optional message to teacher</label>
                      <Textarea
                        placeholder="Why do you want to join this class?"
                        value={requestMessage}
                        onChange={(e) => setRequestMessage(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <Button onClick={handleRequestJoin} disabled={requestSubmitting || atCapacity}>
                      {requestSubmitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Sending...</> : 'Send Request'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}

        {/* Teacher/Admin Enrollments Section */}
        {(userRole === 'teacher' || userRole === 'admin') && (
          <div>
            <h2 className="text-lg font-semibold mb-2">Enrolled students</h2>
            {enrollmentsLoading ? (
              <p className="text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  {(userRole === 'admin' || (userRole === 'teacher' && isClassTeacher)) && (
                  <Dialog open={enrollDialogOpen} onOpenChange={setEnrollDialogOpen}>
                    <DialogTrigger asChild>
                      <Button type="button" size="sm" disabled={atCapacity}>
                        <UserPlus className="h-4 w-4 mr-1" /> Enroll student
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Enroll a student</DialogTitle>
                      </DialogHeader>
                      <div className="flex flex-col gap-4 py-2">
                        <Select value={enrollStudentId} onValueChange={setEnrollStudentId}>
                          <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                          <SelectContent>
                            {availableStudents.map((s: User) => (
                              <SelectItem key={s.id} value={s.id}>{s.name ?? s.email} ({s.email})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {availableStudents.length === 0 && <p className="text-sm text-muted-foreground">No students available to enroll (all enrolled or no students).</p>}
                        <Button onClick={handleEnroll} disabled={!enrollStudentId || enrollSubmitting}>
                          {enrollSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enroll'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  )}
                </div>
                {enrollments.length === 0 ? (
                  <p className="text-muted-foreground">No students enrolled yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {enrollments.map((e) => (
                      <li key={e.id} className="flex items-center justify-between py-2 border-b last:border-0">
                        <div>
                          <span className="font-medium">{e.student?.name ?? e.student?.email ?? e.studentId}</span>
                          <span className="text-muted-foreground text-sm ml-2">{e.student?.email}</span>
                        </div>
                        {(userRole === 'admin' || (userRole === 'teacher' && isClassTeacher)) && (
                          <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => handleUnenroll(e.studentId)}>
                            Remove
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        )}
      </Card>
    </ShowView>
  );
};

export default Show;

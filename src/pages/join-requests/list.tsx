import React, { useEffect, useState } from 'react';
import { ListView } from '@/components/refine-ui/views/list-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getJoinRequests, approveRequest, rejectRequest, type JoinRequest } from '@/lib/join-requests-api';
import { useGetIdentity } from '@refinedev/core';
import { Check, X, Loader2 } from 'lucide-react';
import { useNotification } from '@refinedev/core';

export default function JoinRequestsList() {
  const { data: identity } = useGetIdentity();
  const userRole = identity?.role || 'student';
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<number, 'approve' | 'reject' | null>>({});
  const { open } = useNotification();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getJoinRequests();
        setRequests(data);
      } catch (e) {
        console.error('Failed to load join requests:', e);
        open?.({
          type: 'error',
          message: 'Failed to load join requests',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      await approveRequest(id);
      open?.({
        type: 'success',
        message: 'Join request approved',
      });
      // Reload requests
      const data = await getJoinRequests();
      setRequests(data);
    } catch (e) {
      open?.({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to approve request',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async (id: number) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
    try {
      await rejectRequest(id);
      open?.({
        type: 'success',
        message: 'Join request rejected',
      });
      // Reload requests
      const data = await getJoinRequests();
      setRequests(data);
    } catch (e) {
      open?.({
        type: 'error',
        message: e instanceof Error ? e.message : 'Failed to reject request',
      });
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  if (loading) {
    return (
      <ListView>
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Join Requests</h1>
          <p>Loading...</p>
        </div>
      </ListView>
    );
  }

  const pendingRequests = requests.filter((r) => r.status === 'pending');
  const otherRequests = requests.filter((r) => r.status !== 'pending');

  return (
    <ListView>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Join Requests</h1>

        {userRole === 'teacher' || userRole === 'admin' ? (
          <>
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">No pending join requests.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((req) => (
                  <Card key={req.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{req.class?.name || `Class #${req.classId}`}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Student: {req.student?.name || req.student?.email || req.studentId}
                          </p>
                          {req.message && <p className="text-sm mt-2">{req.message}</p>}
                        </div>
                        <Badge variant="outline">Pending</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApprove(req.id)}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={!!actionLoading[req.id]}
                        >
                          {actionLoading[req.id] === 'approve' ? (
                            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Approving...</>
                          ) : (
                            <><Check className="h-4 w-4 mr-1" /> Approve</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(req.id)}
                          disabled={!!actionLoading[req.id]}
                        >
                          {actionLoading[req.id] === 'reject' ? (
                            <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Rejecting...</>
                          ) : (
                            <><X className="h-4 w-4 mr-1" /> Reject</>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-4">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-muted-foreground">No join requests.</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((req) => (
                <Card key={req.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{req.class?.name || `Class #${req.classId}`}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(req.createdAt).toLocaleString()}
                        </p>
                        {req.message && <p className="text-sm mt-2">{req.message}</p>}
                      </div>
                      <Badge
                        variant={
                          req.status === 'approved'
                            ? 'default'
                            : req.status === 'rejected'
                            ? 'destructive'
                            : 'outline'
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </ListView>
  );
}

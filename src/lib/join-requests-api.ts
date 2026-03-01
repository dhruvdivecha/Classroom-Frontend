import { BACKEND_BASE_URL } from '@/constants';

export type JoinRequest = {
  id: number;
  studentId: string;
  classId: number;
  status: 'pending' | 'approved' | 'rejected';
  message?: string | null;
  createdAt: string;
  student?: { id: string; name: string | null; email: string };
  class?: { id: number; name: string };
};

export async function createJoinRequest(classId: number, message?: string): Promise<JoinRequest> {
  const res = await fetch(`${BACKEND_BASE_URL}/join-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ classId, message }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to create join request');
  }
  const json = await res.json();
  return json.data;
}

export async function getJoinRequests(): Promise<JoinRequest[]> {
  const res = await fetch(`${BACKEND_BASE_URL}/join-requests`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to load join requests');
  const json = await res.json();
  return json.data ?? [];
}

export async function getPendingCount(): Promise<number> {
  const res = await fetch(`${BACKEND_BASE_URL}/join-requests/pending-count`, {
    credentials: 'include',
  });
  if (!res.ok) return 0;
  const json = await res.json();
  return json.data?.count ?? 0;
}

export async function approveRequest(requestId: number): Promise<void> {
  const res = await fetch(`${BACKEND_BASE_URL}/join-requests/${requestId}/approve`, {
    method: 'PUT',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to approve request');
  }
}

export async function rejectRequest(requestId: number): Promise<void> {
  const res = await fetch(`${BACKEND_BASE_URL}/join-requests/${requestId}/reject`, {
    method: 'PUT',
    credentials: 'include',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Failed to reject request');
  }
}

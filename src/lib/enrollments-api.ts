import { BACKEND_BASE_URL } from '@/constants';
import type { EnrollmentWithStudent } from '@/types';

export async function fetchEnrollments(classId: number): Promise<EnrollmentWithStudent[]> {
  const res = await fetch(`${BACKEND_BASE_URL}/classes/${classId}/enrollments`);
  if (!res.ok) throw new Error('Failed to load enrollments');
  const json = await res.json();
  return json.data ?? [];
}

export async function enrollStudent(classId: number, studentId: string): Promise<void> {
  const res = await fetch(`${BACKEND_BASE_URL}/classes/${classId}/enrollments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Enroll failed');
  }
}

export async function unenrollStudent(classId: number, studentId: string): Promise<void> {
  const res = await fetch(`${BACKEND_BASE_URL}/classes/${classId}/enrollments/${studentId}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Unenroll failed');
}

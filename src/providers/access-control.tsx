import { AccessControlProvider } from '@refinedev/core';
import { authClient } from '@/lib/auth-client';

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource, action, params }) => {
    try {
      const session = await authClient.getSession();
      const userRole = session?.data?.user?.role || 'student';

      // Admin has full access
      if (userRole === 'admin') {
        return {
          can: true,
        };
      }

      // Teacher restrictions
      if (userRole === 'teacher') {
        // Teachers can't access users resource
        if (resource === 'users') {
          return {
            can: false,
            reason: 'Teachers cannot access user management',
          };
        }

        // Teachers can't create departments
        if (resource === 'departments' && (action === 'create' || action === 'edit' || action === 'delete')) {
          return {
            can: false,
            reason: 'Teachers cannot modify departments',
          };
        }

        // Teachers can do everything else
        return {
          can: true,
        };
      }

      // Student restrictions
      if (userRole === 'student') {
        // Students can't access users, departments, or join-requests list
        if (resource === 'users' || resource === 'departments' || resource === 'join-requests') {
          return {
            can: false,
            reason: 'Students cannot access this resource',
          };
        }

        // Students can't create, edit, or delete most resources
        if (action === 'create' || action === 'edit' || action === 'delete') {
          // Students can create join requests
          if (resource === 'join-requests' && action === 'create') {
            return {
              can: true,
            };
          }
          return {
            can: false,
            reason: 'Students have read-only access',
          };
        }

        // Students can view/list resources
        return {
          can: true,
        };
      }

      return {
        can: false,
        reason: 'Unknown role',
      };
    } catch (error) {
      return {
        can: false,
        reason: 'Failed to check permissions',
      };
    }
  },
};

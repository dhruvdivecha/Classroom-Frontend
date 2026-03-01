import { Authenticated } from '@refinedev/core';
import { Outlet } from 'react-router';

export const AuthenticatedLayout = () => {
  return (
    <Authenticated
      key="auth-check"
      redirectOnFail="/login"
    >
      <Outlet />
    </Authenticated>
  );
};

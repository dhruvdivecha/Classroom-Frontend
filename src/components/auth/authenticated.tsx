import { Authenticated } from '@refinedev/core';
import { Outlet } from 'react-router';

export const AuthenticatedLayout = () => {
  return (
    <Authenticated
      redirectOnFail="/login"
      v3LegacyAuthProviderCompatible={true}
    >
      <Outlet />
    </Authenticated>
  );
};

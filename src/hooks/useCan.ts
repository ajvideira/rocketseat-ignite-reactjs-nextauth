import { useAuth } from '../contexts/AuthContext';

type UseCanParams = {
  permissions: string[];
  roles: string[];
};

export function useCan({ permissions, roles }: UseCanParams) {
  const { isAuthenticated, user } = useAuth();

  let [hasPermissions, hasRoles] = [false, false];

  if (!isAuthenticated) {
    return false;
  }

  if (permissions) {
    hasPermissions = permissions.every((permission) =>
      user?.permissions.includes(permission)
    );
  }

  if (roles) {
    hasRoles = roles.some((role) => user?.roles.includes(role));
  }

  return hasPermissions && hasRoles;
}

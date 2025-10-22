import { useQuery } from "@tanstack/react-query";
import type { User, UserOrganizationRole } from "@shared/schema";

export interface UserWithRoles extends User {
  roles: UserOrganizationRole[];
  isSuperAdmin: boolean;
}

export function useAuth() {
  const { data: user, isLoading } = useQuery<UserWithRoles>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}

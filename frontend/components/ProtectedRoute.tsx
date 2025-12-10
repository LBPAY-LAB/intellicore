'use client';

import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { authenticated, user, login, hasRole, isLoading } = useKeycloak();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!authenticated) {
      login();
      return;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized');
    }
  }, [authenticated, requiredRole, user, isLoading]);

  if (isLoading || !authenticated || (requiredRole && !hasRole(requiredRole))) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center space-y-4">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="text-lg text-slate-600">Autenticando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

'use client';

import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UnauthorizedPage() {
  const { user, logout } = useKeycloak();
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Acesso Negado</CardTitle>
          <CardDescription>
            Você não tem permissão para acessar esta página
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <p className="text-sm text-muted-foreground">Usuário conectado:</p>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="flex flex-wrap gap-1 mt-2">
              <p className="text-xs text-muted-foreground w-full">Suas permissões:</p>
              {user?.roles
                .filter(role => !['offline_access', 'uma_authorization', 'default-roles-supercore-realm'].includes(role))
                .map((role) => (
                  <span
                    key={role}
                    className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                  >
                    {role}
                  </span>
                ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push('/')}
              className="w-full"
              variant="default"
            >
              <Home className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Button>
            <Button
              onClick={logout}
              className="w-full"
              variant="outline"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Trocar de Conta
            </Button>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            Se você acredita que deveria ter acesso a esta página, entre em contato com o administrador do sistema.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

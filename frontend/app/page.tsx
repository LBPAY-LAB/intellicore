'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserMenu } from '@/components/UserMenu';
import { useKeycloak } from '@/lib/keycloak/KeycloakProvider';
import { useApiClient } from '@/lib/api/client';
import { Building2, Shield, Users, Database, Activity, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OracleIdentity {
  id: string;
  entity_name: string;
  legal_name: string;
  cnpj: string;
  ispb: string;
  entity_type: string;
  capabilities: string[];
  regulatory_info: {
    licenses: string[];
    bacen_participant: boolean;
  };
  integrations: {
    name: string;
    status: string;
  }[];
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { user } = useKeycloak();
  const apiClient = useApiClient();
  const [oracleIdentity, setOracleIdentity] = useState<OracleIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOracleIdentity = async () => {
      try {
        const data = await apiClient.get<OracleIdentity>('/oracle/whoami');
        setOracleIdentity(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch Oracle identity');
        console.error('Failed to fetch Oracle identity:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOracleIdentity();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  SuperCore
                </h1>
                <p className="text-xs text-muted-foreground">Core Banking Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Bem-vindo, {user?.name?.split(' ')[0]}</h2>
            <p className="text-muted-foreground mt-2">
              Plataforma SuperCore - Core Banking 100% baseado em IA
            </p>
          </div>

          {/* Assistant Quick Access */}
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Assistente de Criação
              </CardTitle>
              <CardDescription>
                Crie novos objetos através de linguagem natural
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use o assistente inteligente para criar Object Definitions sem conhecimento técnico.
                Responda perguntas simples e deixe o sistema gerar toda a estrutura automaticamente.
              </p>
              <Button
                onClick={() => router.push('/assistant')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Abrir Assistente
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Oracle Identity Section */}
          <Card className="border-2 border-primary/20 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Identidade do Oráculo
              </CardTitle>
              <CardDescription>
                Quem somos: A consciência autoconsciente da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {oracleIdentity && (
                <div className="space-y-6">
                  {/* Entity Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Nome da Entidade</p>
                      <p className="font-semibold">{oracleIdentity.entity_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Razão Social</p>
                      <p className="font-semibold">{oracleIdentity.legal_name}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">CNPJ</p>
                      <p className="font-mono font-semibold">{oracleIdentity.cnpj}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">ISPB</p>
                      <p className="font-mono font-semibold">{oracleIdentity.ispb}</p>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      Capacidades
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {oracleIdentity.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Regulatory Info */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Informações Regulatórias
                    </p>
                    <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${oracleIdentity.regulatory_info.bacen_participant ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                        <span className="text-sm">
                          {oracleIdentity.regulatory_info.bacen_participant ? 'Participante BACEN' : 'Não participante BACEN'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Licenças:</p>
                        <div className="flex flex-wrap gap-1">
                          {oracleIdentity.regulatory_info.licenses.map((license) => (
                            <span
                              key={license}
                              className="px-2 py-0.5 bg-white border rounded text-xs"
                            >
                              {license}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Integrations */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Integrações Ativas
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {oracleIdentity.integrations.map((integration) => (
                        <div
                          key={integration.name}
                          className="bg-slate-50 rounded-lg p-3 space-y-1"
                        >
                          <p className="text-sm font-medium">{integration.name}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                integration.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                              }`}
                            ></span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {integration.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Object Definitions</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Objetos criados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Instances</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Instâncias ativas</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Relationships</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Relacionamentos</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

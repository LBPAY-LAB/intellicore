'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { objectDefinitionsAPI } from '@/lib/api/object-definitions';
import { ObjectDefinition } from '@/lib/types/object-definition';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { JSONViewer } from '@/components/backoffice/object-definitions/JSONViewer';
import { FSMViewer } from '@/components/backoffice/object-definitions/FSMViewer';
import {
  ArrowLeft,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export default function ObjectDefinitionViewPage() {
  const router = useRouter();
  const params = useParams();
  const { getAccessToken } = useAuth();
  const [objectDefinition, setObjectDefinition] = useState<ObjectDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params.id) {
      loadObjectDefinition(params.id as string);
    }
  }, [params.id]);

  const loadObjectDefinition = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const token = await getAccessToken();
      const data = await objectDefinitionsAPI.get(id, token || undefined);
      setObjectDefinition(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load object definition';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !objectDefinition) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p>{error || 'Object definition not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/backoffice/object-definitions')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {objectDefinition.display_name}
              </h1>
              <Badge variant={objectDefinition.is_active ? 'success' : 'secondary'}>
                {objectDefinition.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline">v{objectDefinition.version}</Badge>
            </div>
            <p className="text-sm text-muted-foreground font-mono mt-1">
              {objectDefinition.name}
            </p>
          </div>
        </div>
        <Button
          onClick={() =>
            router.push(`/backoffice/object-definitions/${objectDefinition.id}/edit`)
          }
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
      </div>

      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>Basic information about this object definition</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-sm font-mono mt-1">{objectDefinition.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Display Name</p>
              <p className="text-sm mt-1">{objectDefinition.display_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Version</p>
              <p className="text-sm mt-1">v{objectDefinition.version}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Status</p>
              <div className="mt-1">
                {objectDefinition.is_active ? (
                  <Badge variant="success">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <XCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </Badge>
                )}
              </div>
            </div>
            <div className="col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="text-sm mt-1">
                {objectDefinition.description || 'No description provided'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Created At</p>
              <p className="text-sm mt-1">
                {new Date(objectDefinition.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Updated At</p>
              <p className="text-sm mt-1">
                {new Date(objectDefinition.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="schema" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schema">Schema</TabsTrigger>
          <TabsTrigger value="fsm">State Machine</TabsTrigger>
          <TabsTrigger value="rules">Validation Rules</TabsTrigger>
          <TabsTrigger value="ui-hints">UI Hints</TabsTrigger>
          <TabsTrigger value="relationships">Relationships</TabsTrigger>
        </TabsList>

        <TabsContent value="schema" className="space-y-4">
          <JSONViewer
            data={objectDefinition.schema}
            title="JSON Schema"
          />
        </TabsContent>

        <TabsContent value="fsm" className="space-y-4">
          <FSMViewer fsm={objectDefinition.states} />
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation Rules</CardTitle>
              <CardDescription>
                Rules that validate instances of this object
              </CardDescription>
            </CardHeader>
            <CardContent>
              {objectDefinition.rules && objectDefinition.rules.length > 0 ? (
                <div className="space-y-3">
                  {objectDefinition.rules.map((rule, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg border bg-muted/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{rule.name}</h4>
                        <Badge variant="outline">{rule.type}</Badge>
                      </div>
                      <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
                        {JSON.stringify(rule.config, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No validation rules defined
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ui-hints" className="space-y-4">
          <JSONViewer
            data={objectDefinition.ui_hints || {}}
            title="UI Hints"
          />
        </TabsContent>

        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
              <CardDescription>
                Allowed relationships for this object type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {objectDefinition.relationships &&
              objectDefinition.relationships.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {objectDefinition.relationships.map((rel, index) => (
                    <Badge key={index} variant="secondary">
                      {rel}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No relationships defined
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

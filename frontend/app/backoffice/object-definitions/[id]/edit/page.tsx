'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { objectDefinitionsAPI } from '@/lib/api/object-definitions';
import { ObjectDefinition } from '@/lib/types/object-definition';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ObjectDefinitionForm } from '@/components/backoffice/object-definitions/ObjectDefinitionForm';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';

export default function EditObjectDefinitionPage() {
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/backoffice/object-definitions/${params.id}`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to View
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Object Definition
          </h1>
          <p className="text-muted-foreground">
            {objectDefinition.display_name}
          </p>
        </div>
      </div>

      {/* Form */}
      <ObjectDefinitionForm
        objectDefinition={objectDefinition}
        isEdit={true}
      />
    </div>
  );
}

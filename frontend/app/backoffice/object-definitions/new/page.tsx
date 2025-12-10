'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ObjectDefinitionForm } from '@/components/backoffice/object-definitions/ObjectDefinitionForm';
import { ArrowLeft } from 'lucide-react';

export default function NewObjectDefinitionPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/backoffice/object-definitions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to List
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Create Object Definition
          </h1>
          <p className="text-muted-foreground">
            Define a new object type for your platform
          </p>
        </div>
      </div>

      {/* Form */}
      <ObjectDefinitionForm isEdit={false} />
    </div>
  );
}

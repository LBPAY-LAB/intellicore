'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { objectDefinitionsAPI } from '@/lib/api/object-definitions';
import {
  ObjectDefinition,
  CreateObjectDefinitionRequest,
  UpdateObjectDefinitionRequest,
} from '@/lib/types/object-definition';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SchemaEditor } from './SchemaEditor';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';

interface ObjectDefinitionFormProps {
  objectDefinition?: ObjectDefinition;
  isEdit?: boolean;
}

// Default JSON Schema template
const DEFAULT_SCHEMA = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      description: 'Name of the entity',
    },
  },
  required: ['name'],
};

// Default FSM template
const DEFAULT_FSM = {
  initial: 'ACTIVE',
  states: ['ACTIVE', 'INACTIVE'],
  transitions: [
    {
      from: 'ACTIVE',
      to: 'INACTIVE',
      event: 'deactivate',
    },
    {
      from: 'INACTIVE',
      to: 'ACTIVE',
      event: 'activate',
    },
  ],
};

export function ObjectDefinitionForm({
  objectDefinition,
  isEdit = false,
}: ObjectDefinitionFormProps) {
  const router = useRouter();
  const { getAccessToken } = useAuth();

  // Form state
  const [name, setName] = useState(objectDefinition?.name || '');
  const [displayName, setDisplayName] = useState(objectDefinition?.display_name || '');
  const [description, setDescription] = useState(objectDefinition?.description || '');
  const [schema, setSchema] = useState(
    JSON.stringify(objectDefinition?.schema || DEFAULT_SCHEMA, null, 2)
  );
  const [states, setStates] = useState(
    JSON.stringify(objectDefinition?.states || DEFAULT_FSM, null, 2)
  );
  const [uiHints, setUiHints] = useState(
    JSON.stringify(objectDefinition?.ui_hints || {}, null, 2)
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate name (slug format)
    if (!name) {
      newErrors.name = 'Name is required';
    } else if (!/^[a-z0-9-_]+$/.test(name)) {
      newErrors.name = 'Name must be lowercase with hyphens or underscores only';
    }

    // Validate display name
    if (!displayName) {
      newErrors.displayName = 'Display name is required';
    }

    // Validate JSON Schema
    try {
      const parsedSchema = JSON.parse(schema);
      if (parsedSchema.type !== 'object') {
        newErrors.schema = 'Schema root type must be "object"';
      }
      if (!parsedSchema.properties) {
        newErrors.schema = 'Schema must have "properties" field';
      }
    } catch (err) {
      newErrors.schema = 'Invalid JSON syntax';
    }

    // Validate FSM
    try {
      const parsedFSM = JSON.parse(states);
      if (!parsedFSM.initial) {
        newErrors.states = 'FSM must have an "initial" state';
      }
      if (!parsedFSM.states || !Array.isArray(parsedFSM.states)) {
        newErrors.states = 'FSM must have a "states" array';
      }
    } catch (err) {
      newErrors.states = 'Invalid JSON syntax';
    }

    // Validate UI Hints
    try {
      JSON.parse(uiHints);
    } catch (err) {
      newErrors.uiHints = 'Invalid JSON syntax';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const token = await getAccessToken();

      const data: CreateObjectDefinitionRequest | UpdateObjectDefinitionRequest = {
        name: isEdit ? undefined : name,
        display_name: displayName,
        description: description || undefined,
        schema: JSON.parse(schema),
        states: JSON.parse(states),
        ui_hints: JSON.parse(uiHints),
      };

      let result: ObjectDefinition;

      if (isEdit && objectDefinition) {
        // Update existing
        result = await objectDefinitionsAPI.update(
          objectDefinition.id,
          data as UpdateObjectDefinitionRequest,
          token || undefined
        );
        toast({
          title: 'Success',
          description: 'Object definition updated successfully',
        });
      } else {
        // Create new
        result = await objectDefinitionsAPI.create(
          data as CreateObjectDefinitionRequest,
          token || undefined
        );
        toast({
          title: 'Success',
          description: 'Object definition created successfully',
        });
      }

      // Redirect to view page
      router.push(`/backoffice/object-definitions/${result.id}`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save object definition';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>
            Fundamental properties of the object definition
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="client_pf"
                disabled={isEdit}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Unique identifier (lowercase, hyphens, underscores)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">
                Display Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Cliente Pessoa Física"
                className={errors.displayName ? 'border-destructive' : ''}
              />
              {errors.displayName && (
                <p className="text-sm text-destructive">{errors.displayName}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Human-readable name
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this object represents..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Optional description for documentation
            </p>
          </div>
        </CardContent>
      </Card>

      {/* JSON Schema */}
      <Card>
        <CardHeader>
          <CardTitle>JSON Schema</CardTitle>
          <CardDescription>
            Define the structure and validation rules for instances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaEditor
            value={schema}
            onChange={setSchema}
            error={errors.schema}
            height="400px"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Must be a valid JSON Schema Draft 7 with type "object"
          </p>
        </CardContent>
      </Card>

      {/* State Machine */}
      <Card>
        <CardHeader>
          <CardTitle>State Machine (FSM)</CardTitle>
          <CardDescription>
            Define the lifecycle states and transitions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaEditor
            value={states}
            onChange={setStates}
            error={errors.states}
            height="300px"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Must include "initial", "states" array, and "transitions" array
          </p>
        </CardContent>
      </Card>

      {/* UI Hints */}
      <Card>
        <CardHeader>
          <CardTitle>UI Hints</CardTitle>
          <CardDescription>
            Configure how fields should be rendered in forms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SchemaEditor
            value={uiHints}
            onChange={setUiHints}
            error={errors.uiHints}
            height="300px"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Optional JSON object with rendering hints (widgets, labels, etc.)
          </p>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              {isEdit ? 'Update' : 'Create'}
            </>
          )}
        </Button>
      </div>

      {/* Global Errors */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please fix the validation errors above before submitting
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}

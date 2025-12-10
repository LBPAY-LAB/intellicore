'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, GitBranch, Link2, CheckCircle2 } from 'lucide-react';
import { ObjectDefinitionPreview as PreviewType } from '@/lib/api/assistant';

interface ObjectDefinitionPreviewProps {
  preview: PreviewType;
}

export function ObjectDefinitionPreview({ preview }: ObjectDefinitionPreviewProps) {
  return (
    <Card className="p-6 ml-11 max-w-2xl bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
          <FileText className="w-6 h-6 text-blue-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900">{preview.display_name}</h3>
          <p className="text-sm text-slate-600 mt-1">{preview.description}</p>
          <code className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded mt-2 inline-block">
            {preview.name}
          </code>
        </div>
      </div>

      <Separator className="my-4" />

      {/* Fields Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-slate-600" />
          <h4 className="font-semibold text-slate-900">
            Campos ({preview.fields.length})
          </h4>
        </div>
        <div className="grid gap-2">
          {preview.fields.map((field, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-white border border-slate-200"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{field.name}</span>
                  {field.required && (
                    <Badge variant="destructive" className="text-xs">
                      obrigatório
                    </Badge>
                  )}
                  {field.validation && (
                    <Badge variant="secondary" className="text-xs">
                      validado
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{field.type}</span>
                  {field.validation && (
                    <span className="text-xs text-slate-500">
                      • {field.validation}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Separator className="my-4" />

      {/* States Section */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <GitBranch className="w-4 h-4 text-slate-600" />
          <h4 className="font-semibold text-slate-900">
            Estados ({preview.states.length})
          </h4>
        </div>
        <div className="flex flex-wrap items-center gap-2 p-4 rounded-lg bg-white border border-slate-200">
          {preview.states.map((state, index) => (
            <React.Fragment key={index}>
              <Badge variant="outline" className="px-3 py-1">
                {state}
              </Badge>
              {index < preview.states.length - 1 && (
                <span className="text-slate-400">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Relationships Section */}
      {preview.relationships.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Relacionamentos</h4>
            </div>
            <div className="grid gap-2">
              {preview.relationships.map((rel, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200"
                >
                  <Link2 className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-medium text-slate-900">{rel.type}</span>
                      <span className="text-slate-500 mx-2">→</span>
                      <span className="text-slate-700">{rel.target}</span>
                    </div>
                    <span className="text-xs text-slate-500">({rel.cardinality})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Validations Section */}
      {preview.validations.length > 0 && (
        <>
          <Separator className="my-4" />
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-slate-600" />
              <h4 className="font-semibold text-slate-900">Validações Automáticas</h4>
            </div>
            <div className="grid gap-2">
              {preview.validations.map((validation, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 rounded bg-green-50 border border-green-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-900">{validation}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </Card>
  );
}

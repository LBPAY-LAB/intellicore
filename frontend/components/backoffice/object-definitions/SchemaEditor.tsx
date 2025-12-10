'use client';

import React from 'react';
import Editor from '@monaco-editor/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SchemaEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  height?: string;
  readOnly?: boolean;
}

export function SchemaEditor({
  value,
  onChange,
  error,
  height = '400px',
  readOnly = false,
}: SchemaEditorProps) {
  const [localError, setLocalError] = React.useState<string | undefined>(error);

  const handleChange = (value: string | undefined) => {
    if (!value) return;

    // Validate JSON
    try {
      JSON.parse(value);
      setLocalError(undefined);
      onChange(value);
    } catch (err) {
      setLocalError(
        err instanceof Error ? err.message : 'Invalid JSON syntax'
      );
    }
  };

  return (
    <div className="space-y-2">
      <div className="border rounded-md overflow-hidden">
        <Editor
          height={height}
          defaultLanguage="json"
          value={value}
          onChange={handleChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {(localError || error) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{localError || error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

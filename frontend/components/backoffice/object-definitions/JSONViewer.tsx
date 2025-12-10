'use client';

import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/hljs/json';
import { vs2015 } from 'react-syntax-highlighter/dist/cjs/styles/hljs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

SyntaxHighlighter.registerLanguage('json', json);

interface JSONViewerProps {
  data: any;
  title?: string;
  className?: string;
}

export function JSONViewer({ data, title, className }: JSONViewerProps) {
  const jsonString = React.useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return '{}';
    }
  }, [data]);

  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <SyntaxHighlighter
          language="json"
          style={vs2015}
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '0.875rem',
            maxHeight: '500px',
            overflow: 'auto',
          }}
          showLineNumbers
        >
          {jsonString}
        </SyntaxHighlighter>
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OracleManagementProps {
  className?: string;
}

export function OracleManagement({ className }: OracleManagementProps) {
  const [loading, setLoading] = useState(false);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>OracleManagement</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={() => setLoading(true)}>
            Action
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

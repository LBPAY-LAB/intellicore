'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Circle } from 'lucide-react';
import { FSMState } from '@/lib/types/object-definition';

interface FSMViewerProps {
  fsm?: FSMState;
  className?: string;
}

export function FSMViewer({ fsm, className }: FSMViewerProps) {
  if (!fsm || !fsm.states || fsm.states.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-lg">State Machine</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No state machine defined
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">State Machine</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Initial State */}
        <div>
          <h4 className="text-sm font-medium mb-2">Initial State</h4>
          <Badge variant="success">{fsm.initial}</Badge>
        </div>

        {/* All States */}
        <div>
          <h4 className="text-sm font-medium mb-3">States</h4>
          <div className="flex flex-wrap gap-2">
            {fsm.states.map((state) => (
              <Badge
                key={state}
                variant={state === fsm.initial ? 'success' : 'secondary'}
              >
                <Circle className="h-3 w-3 mr-1" />
                {state}
              </Badge>
            ))}
          </div>
        </div>

        {/* Transitions */}
        {fsm.transitions && fsm.transitions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Transitions</h4>
            <div className="space-y-2">
              {fsm.transitions.map((transition, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 rounded-lg border bg-muted/50"
                >
                  <Badge variant="outline">{transition.from}</Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <Badge variant="outline">{transition.to}</Badge>
                  <div className="flex-1 text-right">
                    <span className="text-xs text-muted-foreground">
                      on: <strong>{transition.event}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

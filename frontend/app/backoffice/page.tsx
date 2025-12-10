'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Database, FileText, Users, ArrowRight } from 'lucide-react';

export default function BackofficeDashboard() {
  const router = useRouter();

  const quickLinks = [
    {
      title: 'Object Definitions',
      description: 'Manage object types and their schemas',
      icon: Database,
      href: '/backoffice/object-definitions',
      color: 'text-blue-500',
    },
    {
      title: 'Instances',
      description: 'View and manage object instances',
      icon: FileText,
      href: '/backoffice/instances',
      color: 'text-green-500',
      disabled: true,
    },
    {
      title: 'Users',
      description: 'Manage users and permissions',
      icon: Users,
      href: '/backoffice/users',
      color: 'text-purple-500',
      disabled: true,
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Backoffice Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your SuperCore platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickLinks.map((link) => (
          <Card
            key={link.title}
            className={link.disabled ? 'opacity-50' : 'hover:shadow-lg transition-shadow cursor-pointer'}
            onClick={() => !link.disabled && router.push(link.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg bg-muted ${link.color}`}>
                  <link.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-between"
                disabled={link.disabled}
              >
                {link.disabled ? 'Coming Soon' : 'Open'}
                {!link.disabled && <ArrowRight className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            Quick guide to using the backoffice
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Create Object Definitions</h4>
            <p className="text-sm text-muted-foreground">
              Start by defining the types of objects your platform will manage. Each
              object definition includes a JSON schema, state machine, and validation rules.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Configure State Machines</h4>
            <p className="text-sm text-muted-foreground">
              Define the lifecycle states and transitions for each object type to control
              how instances can change over time.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Add UI Hints</h4>
            <p className="text-sm text-muted-foreground">
              Customize how fields are rendered in forms by adding UI hints like widgets,
              labels, and help text.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

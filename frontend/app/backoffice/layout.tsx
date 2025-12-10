'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter, usePathname } from 'next/navigation';
import { Database, Home, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/backoffice',
      icon: Home,
      current: pathname === '/backoffice',
    },
    {
      name: 'Object Definitions',
      href: '/backoffice/object-definitions',
      icon: Database,
      current: pathname?.startsWith('/backoffice/object-definitions'),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b">
            <h2 className="text-lg font-semibold">Backoffice</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={item.current ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                onClick={() => router.push(item.href)}
              >
                <item.icon className="h-4 w-4 mr-2" />
                {item.name}
              </Button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-200 ease-in-out',
          sidebarOpen ? 'md:pl-64' : 'pl-0'
        )}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-40 h-16 bg-card border-b flex items-center px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  );
}

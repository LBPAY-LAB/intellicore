import DashboardLayout from '@/components/layouts/DashboardLayout';
import { Toaster } from 'sonner';

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardLayout>{children}</DashboardLayout>
      <Toaster position="top-right" richColors />
    </>
  );
}

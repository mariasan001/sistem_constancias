// (server component, SIN "use client")
import SidebarRoot from '@/components/dashboard/SidebarRoot';

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  return <SidebarRoot>{children}</SidebarRoot>;
}

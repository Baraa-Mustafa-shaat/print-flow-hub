import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard,
  FilePlus,
  ClipboardList,
  Users,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  Printer,
  Home,
} from 'lucide-react';

const customerLinks = [
  { to: '/customer', label: 'لوحة التحكم', icon: Home },
  { to: '/customer/new-order', label: 'طلب جديد', icon: FilePlus },
  { to: '/customer/orders', label: 'طلباتي', icon: ClipboardList },
  { to: '/customer/rewards', label: 'هداياي ومكافآتي', icon: Gift },
];

const adminLinks = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { to: '/dashboard/orders', label: 'الطلبات', icon: ClipboardList },
  { to: '/dashboard/new-order', label: 'طلب جديد', icon: FilePlus },
  { to: '/dashboard/customers', label: 'العملاء', icon: Users },
  { to: '/dashboard/rewards', label: 'الهدايا والمكافآت', icon: Gift },
  { to: '/dashboard/reports', label: 'التقارير', icon: BarChart3 },
  { to: '/dashboard/settings', label: 'الإعدادات', icon: Settings },
];

export default function AppSidebar() {
  const { hasRole, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = hasRole('admin') || hasRole('employee');
  const links = isAdmin ? adminLinks : customerLinks;

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="fixed right-0 top-0 z-40 flex h-full w-64 flex-col border-l border-sidebar-border bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-primary">
          <Printer className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-bold">أبو حسني</p>
          <p className="truncate text-xs opacity-70">{profile?.full_name || 'مستخدم'}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  }`}
                >
                  <link.icon className="h-4 w-4 shrink-0" />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  );
}

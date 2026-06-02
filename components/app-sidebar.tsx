'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Package,
  Users,
  ShoppingCart,
  BarChart3,
  Package2,
  Store,
  ClipboardList,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getRole, getUser, logout } from '@/lib/auth';
import { useEffect, useState } from 'react';

const merchantLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/inventory', label: 'Inventory', icon: Package2 },
];

const customerLinks = [
  { href: '/shop', label: 'Browse Shop', icon: Store },
  { href: '/my-orders', label: 'My Orders', icon: ClipboardList },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    setRole(getRole());
    setUserName(getUser()?.name || '');
  }, []);

  const links = role === 'merchant' ? merchantLinks : customerLinks;

  function handleLogout() {
    logout();
  }

  return (
    <aside className="flex flex-col border-r border-border bg-card" style={{ minWidth: 220 }}>
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center gap-2">
          <Package2 className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold text-foreground">Inventory IMS</h1>
        </div>
        {role && (
          <div className="mt-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                role === 'merchant'
                  ? 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
              )}
            >
              {role === 'merchant' ? '🛍 Merchant' : '🛒 Customer'}
            </span>
          </div>
        )}
      </div>

      {userName && (
        <div className="px-6 py-3 border-b border-border">
          <p className="text-xs text-muted-foreground">Signed in as</p>
          <p className="text-sm font-medium text-foreground truncate">{userName}</p>
        </div>
      )}

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3">
        <button
          id="logout-btn"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn, getRole, UserRole } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRole?: UserRole;
}


export function AuthGuard({ children, allowedRole }: AuthGuardProps) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }

    if (allowedRole) {
      const role = getRole();
      if (role !== allowedRole) {
        if (role === 'merchant') {
          router.replace('/dashboard');
        } else {
          router.replace('/shop');
        }
        return;
      }
    }

    setAuthorized(true);
    setChecked(true);
  }, [router, allowedRole]);

  if (!checked || !authorized) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Authenticating…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

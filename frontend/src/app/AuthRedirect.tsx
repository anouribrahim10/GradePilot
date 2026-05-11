'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthRedirect() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(Boolean(data.session));
    });
  }, []);

  if (loggedIn === null) return null;

  if (loggedIn) {
    return (
      <Link href="/classes" className="gp-btn px-5 py-2">
        Go to Classes →
      </Link>
    );
  }

  return (
    <>
      <Link href="/auth" className="gp-btn-ghost">Sign In</Link>
      <Link href="/auth" className="gp-btn">Get Started</Link>
    </>
  );
}

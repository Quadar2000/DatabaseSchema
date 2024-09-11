"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const WithRole = (Component, role) => {
  return () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; 

      if (!session || session.user.role !== role) {
        router.push('/'); 
      }
    }, [session, status]);

    return session?.user.role === role ? <Component /> : null;
  };
};

export default WithRole;
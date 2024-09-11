"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const IsLoggedIn = (Component) => {
  return () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; 

      if (!session) {
        router.push('/'); 
      }
    }, [session, status]);

    return session? <Component /> : null;
  };
};

export default IsLoggedIn;
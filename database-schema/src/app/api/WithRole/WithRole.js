import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const WithRole = (Component, role) => {
  return () => {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'loading') return; // Poczekaj na załadowanie sesji

      // Jeśli użytkownik nie jest zalogowany lub nie ma odpowiedniej roli, przekieruj
      if (!session || session.user.role !== role) {
        router.push('/page'); // Ścieżka do strony bez dostępu
      }
    }, [session, status]);

    // Jeśli użytkownik ma odpowiednią rolę, renderuj stronę
    return session?.user.role === role ? <Component /> : null;
  };
};

export default WithRole;
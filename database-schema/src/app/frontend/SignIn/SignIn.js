"use client";

// import { getCsrfToken, signIn } from "next-auth/react";

// export default function SignIn({ searchParams }) {
//   //const csrfToken = await getCsrfToken();

//   return (
//     <div>
//       <h1>Sign In</h1>
//       <form method="post" action="/api/auth/callback/credentials">
//         {/* <input name="csrfToken" type="hidden" defaultValue={csrfToken} /> */}
//         <label htmlFor="email">Email</label>
//         <input id="email" name="email" type="email" required />
//         <br />
//         <label htmlFor="password">Password</label>
//         <input id="password" name="password" type="password" required />
//         <br />
//         <button type="submit">Sign in</button>
//       </form>
//     </div>
//    // <button onClick = {() => signIn()}>Sign In</button>
//   );

// }

import { getCsrfToken,signIn } from 'next-auth/react';
import { useState } from 'react';

export default function SignIn() {

  const [error, setError] = useState('');
  const csrfToken = getCsrfToken();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const email = event.target.email.value;
    const password = event.target.password.value;

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result.error) {
      setError(result.error); // Obsłuż błędy
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
         <label>Email</label>
         <br />
         <input id="email" name="email" type="email" required />
         <br />
         <br />
         <label>Password</label>
         <br />
         <input id="password" name="password" type="password" required />
         <br />
         <br />
         <button type="submit">Sign in</button>
         <br />
         <br />
         {error && <div>{error}</div>}
    </form>
  );
}



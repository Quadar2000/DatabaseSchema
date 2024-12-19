"use client";

import { getCsrfToken,signIn } from 'next-auth/react';
import { useState } from 'react';
import StyledDiv from '../StyledDiv/StyledDiv';
import StyledButton from '../StyledButton/StyledButton';

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
      setError(result.error); 
    }
  };

  return (
    <StyledDiv>
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
         <StyledButton type="submit">Sign in</StyledButton>
         <br />
         <br />
         {error && <div>{error}</div>}
    </form>
    </StyledDiv>
    
  );
}



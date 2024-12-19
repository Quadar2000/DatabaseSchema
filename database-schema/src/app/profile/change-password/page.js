"use client";

import IsLoggedIn from '@/app/components/IsLoggedIn/IsLoggedIn';
import StyledButton from '@/app/components/StyledButton/StyledButton';
import StyledDiv from '@/app/components/StyledDiv/StyledDiv';
import StyledForm from '@/app/components/StyledForm/StyledForm';
import { getCsrfToken, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [csrfToken, setCsrfToken] = useState('');

  // useEffect(() => {
  //   const fetchCsrfToken = async () => {
  //     const res = await fetch('/api/change-password', {method: "GET"});
  //     const data = await res.json();
  //     setCsrfToken(data.csrfToken);
  //   };

  //   fetchCsrfToken()
  // }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setSuccess("");

    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'csrf-token': csrfToken,
      },
      body: JSON.stringify({
        newPassword: newPassword,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess(data.message);
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong");
    }
  };

  return (
    <StyledDiv style={{height: '600px'}}>
      <StyledForm onSubmit={handleSubmit}>
        <input type="hidden" name="csrfToken" value={csrfToken} />
        <div style={{flexDirection: 'column',display: 'flex'}}>
          <label>New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <div style={{flexDirection: 'column',display: 'flex'}}>
          <label>Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {success && <p style={{ color: "green" }}>{success}</p>}

        <StyledButton type="submit">Change Password</StyledButton>
      </StyledForm>
    </StyledDiv>
    
  );
}


export default IsLoggedIn(ChangePassword);
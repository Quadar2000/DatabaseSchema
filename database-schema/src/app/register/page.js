"use client";

import WithRole from "../components/WithRole/WithRole";
import { getCsrfToken, useSession } from 'next-auth/react';
import { useEffect, useState, useReducer } from 'react';

const formReducer = (state, action) => {
    return {
      ...state,
      [action.name]: action.value
    };
  };

const Register = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [csrfToken, setCsrfToken] = useState('');
  const [newPassword, setNewPassword] = useState("");

  const [formState, dispatch] = useReducer(formReducer, {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token);
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { password, confirmPassword} = formState;

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError("");
    setSuccess("");

    const res = await fetch("/api/register-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formState),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess(data.message);
    } else {
      const data = await res.json();
      setError(data.message || "Something went wrong");
    }
  };

  const handleChange = (e) => {
    dispatch({ name: e.target.name, value: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <div>
        <label>Username</label>
        <input
          type="text"
          name="name"
          value={formState.name}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formState.password}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Confirm Password</label>
        <input
          type="password"
          name="confirmPassword"
          value={formState.confirmPassword}
          onChange={handleChange}
          required
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <button type="submit">Create User</button>
    </form>
  );
}


export default WithRole(Register, 'admin');
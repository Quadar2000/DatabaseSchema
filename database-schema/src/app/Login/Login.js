"use client";

import { useState } from 'react';
//import axios from 'axios'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin =async(e) => {
        // e.preventDefault();
        // try {
        //     const response = await axios.post('http://localhost:8081/api/auth/login', {
        //         username,
        //         password
        //     });

        //     if(!response.data.success){
        //         throw new Error(response.data.message);
        //     }
        //     dispatch({ type: 'LOGIN', payload: {username: username}});

        // } catch (error) {
        //     setError(error.message); 
        // }        
    };

    return (
        <div>
            <form onSubmit={handleLogin}>
                <input type = "text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <input type = "password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
                {error && <div>{error}</div>}
            </form>
        </div>
    );
};

export default Login;
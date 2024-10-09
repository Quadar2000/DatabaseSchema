"use client"

import IsLoggedIn from "../components/IsLoggedIn/IsLoggedIn"
import connectToDatabase from "../backendFunctions/database-client";
import { useState } from "react";

const Connect = () => {
    const [databaseName, setDatabaseName] = useState("");
    const [databaseUsername, setDatabaseUsername] = useState("");
    const [databasePassword, setDatabasePassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        const url = 'postgresql://'+databaseUsername+':'+databasePassword+'@localhost:5432/'+databaseName+'?schema=public';

        console.log("URL: " + url + "\n");

        try {
            const res = await fetch('/api/connect-to-database', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ url }),
            });
      
            const data = await res.json();
      
            if (res.ok) {
              setSuccess('Successfully connected to the database');
            } else {
              setError(data.message || 'Connection failed');
            }
          } catch (error) {
            setError('Connection failed');
          }

    };

    return(
        <div>
            <h1>Connect to Database</h1>
            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name of Database</label>
                    <input
                       type="text"
                       value={databaseName}
                       onChange={(e) => setDatabaseName(e.target.value)}
                       required
                    />
                </div>

                <div>
                    <label>Database Username</label>
                    <input
                       type="text"
                       value={databaseUsername}
                       onChange={(e) => setDatabaseUsername(e.target.value)}
                       required
                    />
                </div>

                <div>
                    <label>Database Username Password</label>
                    <input
                       type="password"
                       value={databasePassword}
                       onChange={(e) => setDatabasePassword(e.target.value)}
                       required
                    />
                </div>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}

                <button type="submit">Connect</button>
            </form>
            
        </div>
    );
}


export default IsLoggedIn(Connect);

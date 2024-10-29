"use client"

import { useEffect, useState } from "react";
import WithRole from "../components/WithRole/WithRole";
import { useRouter } from 'next/navigation';
import '../components/Spinner/spinner.module.css';
import StyledButton from "../components/StyledButton/StyledButton";

const UsersList = () => {
  
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/get-users", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data.users);
        } else {
          const data = await res.json();
          setError(data.message || "Something went wrong");
        }
      } catch (error) {
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const goToUserDetail = async (id) => {
    try {
      const res = await fetch(`/api/generate-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: id,
        })
      });
      const data = await res.json();
      if (res.ok) {
        const token = data.token;
        router.push(`/users/permissions?id=${id}&token=${token}`);
      } else {
        setError(data.message);
      }
    } catch(error){
      setError(error.message);
    }
  };

  return (
    loading ? 
    <div className="spinner"><p>Loading...</p></div> :
    <div>
      <h1>list of users</h1>
      <ul>
        {users.map(user => (
          <li key={user.email}>
            {user.name} ({user.email})
            <StyledButton onClick={() => goToUserDetail(user.id)}>
              See details
            </StyledButton>
          </li>
        ))}
      </ul>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};


export default WithRole(UsersList, 'admin');

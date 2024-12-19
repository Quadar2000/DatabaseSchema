"use client"

import { useEffect, useState } from "react";
import WithRole from "../components/WithRole/WithRole";
import { useRouter } from 'next/navigation';
import '../components/Spinner/spinner.module.css';
import StyledButton from "../components/StyledButton/StyledButton";
import ConfirmModal from "../components/ConfirmModal/ConfirmModal";
import StyledDiv from "../components/StyledDiv/StyledDiv";
import StyledListItem from "../components/StyledListItem/StyledListItem";
import ColumnHeaders from "../components/ColumnHeaders/ColumnHeaders";

const UsersList = () => {
  
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (user) => {
    setSuccess("");
    setError("");
    try {
      const res = await fetch(`/api/delete-user`, {
        method: "DELETE", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({userId: user.id }), 
      });

      if (res.ok) {
        const data = await res.json();
        setSuccess(data.message);
        fetchUsers();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to delete user.");
      }
    } catch (error) {
      setError("Error deleting user");
    }
  };

  const openModal = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setUserToDelete(null);
  };

  const confirmDelete = async () => {
    closeModal();
    await deleteUser(userToDelete);
  };

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
    <StyledDiv>
      <h1>List of users</h1>
       
      <ul>
      <StyledListItem>
        <div className="column">Name</div>
        <div className="column">Email</div>
        <div className="actions"></div>
      </StyledListItem> 
        {users.map((user) => (
          <StyledListItem key={user.email}>
            <div className="column">{user.name}</div>
            <div className="column">{user.email}</div>
            <div className="actions">
              <StyledButton onClick={() => goToUserDetail(user.id)}>
                See details
              </StyledButton>
              <StyledButton onClick={() => openModal(user)}>
                Delete User
              </StyledButton>
            </div>
          </StyledListItem>
        ))}
      </ul>
      {isModalOpen && (
        <ConfirmModal
          message="Are you sure you want to remove this user?"
          onConfirm={confirmDelete}
          onCancel={closeModal}
        />
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </StyledDiv>
  );
};


export default WithRole(UsersList, 'admin');

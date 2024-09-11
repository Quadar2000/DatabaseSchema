"use client";

import IsLoggedIn from '@/app/components/IsLoggedIn/IsLoggedIn';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from "./profile.module.css";

const Profile = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const handleChangePasswordClick = () => { 
        router.push('/profile/change-password'); 
      }
    return(
    <div>
        <h1>Username</h1>
        <p>{session.user.name}</p>
        <h1>Email</h1>
        <p>{session.user.email}</p>
        <button className = {styles.card} onClick = {handleChangePasswordClick}>Change Password</button>
    </div>
        );
}


export default IsLoggedIn(Profile);

"use client";

import IsLoggedIn from '@/app/components/IsLoggedIn/IsLoggedIn';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from "./profile.module.css";
import StyledButton from '../components/StyledButton/StyledButton';
import StyledDiv from '../components/StyledDiv/StyledDiv';

const Profile = () => {
    const { data: session } = useSession();
    const router = useRouter();

    const handleChangePasswordClick = () => { 
        router.push('/profile/change-password'); 
      }
    return(
    <StyledDiv style={{ height: '600px'}}>
        <h1>Username</h1>
        <p>{session.user.name}</p>
        <h1>Email</h1>
        <p>{session.user.email}</p>
        <StyledButton onClick = {handleChangePasswordClick}>Change Password</StyledButton>
    </StyledDiv>
    );
};


export default IsLoggedIn(Profile);

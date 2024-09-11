"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from './Navbar.module.css';
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";

const Navbar = () => {
  const pathname = usePathname();
  const { data: session} = useSession();

  const handleLogout = async () => {
    await signOut();
  };

  if(!session){
    return <div></div>
  }
  return (
    <nav className={styles.navbar}>
      <ul className={styles.navLinks}>
        <li>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/profile">Profile</Link>
        </li>
        <li>
          <Link href="/register">Register</Link>
        </li>
        <li>
          <button onClick={handleLogout}>Logout</button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
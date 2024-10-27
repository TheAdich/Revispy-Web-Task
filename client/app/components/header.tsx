import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
interface User {
    username: string;
    email: string;
    id: string;
}

// Header Component
const Header = () => {
    const router=useRouter();
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUser = sessionStorage.getItem('authUser');

            if (storedUser) setAuthUser(JSON.parse(storedUser));

        }
    }, []);

    const [authUser, setAuthUser] = useState<User | null>(null);

    const handleLogout = () => {
        sessionStorage.removeItem('jwt');
        sessionStorage.removeItem('authUser');
        // Redirect or handle logout as needed
        router.push('/login')
    };

    return (
        <header style={styles.header}>
            <h1 style={styles.title}>Chit Chat</h1>
            <div className='flex items-center gap-6'>
                <p className='text-black font-bold'>{authUser?.username}</p>
                <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
            </div>
        </header>
    );
};


const styles = {
    header: {
        display: 'flex',
        height:'10vh',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: '10px 20px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    title: {
        fontSize: '24px',
        color: '#000',
    },
    logoutButton: {
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
    },
};

export default Header;

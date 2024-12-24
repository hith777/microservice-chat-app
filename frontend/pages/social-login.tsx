// pages/social-login.tsx
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SocialLoginPage() {
    const router = useRouter();

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            // Store the token and redirect to chat
            localStorage.setItem('token', token);
            router.push('/chat');
        } else {
            // If no token is present, redirect to login
            router.push('/login');
        }
    }, [router]);

    return (
        <div style={{
            color:'#fff',
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            height:'100vh',
            background:'#343541'
        }}>
            Processing login...
        </div>
    );
}

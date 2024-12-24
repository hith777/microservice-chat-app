import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/chat');
        }
    }, [router]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            router.push('/chat');
        } else {
            alert('Login failed');
        }
    };

    return (
        <div style={{
            display:'flex',
            justifyContent:'center',
            alignItems:'center',
            height:'100vh',
            flexDirection:'column',
            color:'#fff'
        }}>
            <h1 style={{marginBottom:'20px'}}>Log in to MyGPT</h1>
            <form onSubmit={handleLogin} style={{display:'flex', flexDirection:'column', width:'300px'}}>
                <input
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email"
                    style={{padding:'10px', marginBottom:'10px', borderRadius:'4px', border:'1px solid #555', background:'#40414F', color:'#fff'}}
                />
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    style={{padding:'10px', marginBottom:'10px', borderRadius:'4px', border:'1px solid #555', background:'#40414F', color:'#fff'}}
                />
                <button type="submit" style={{padding:'10px', background:'#10a37f', border:'none', borderRadius:'4px', cursor:'pointer'}}>Login</button>
            </form>
            <div style={{marginTop:'20px'}}>
                <button
                    onClick={() => {window.location.href='http://localhost:3001/auth/google'}}
                    style={{padding:'10px', marginRight:'10px', background:'#545757', border:'none', borderRadius:'4px', cursor:'pointer'}}>
                    Sign in with Google
                </button>
                <button
                    onClick={() => {window.location.href='http://localhost:3001/auth/github'}}
                    style={{padding:'10px', background:'#545757', border:'none', borderRadius:'4px', cursor:'pointer'}}>
                    Sign in with GitHub
                </button>
            </div>
            <p style={{marginTop:'20px'}}>Don’t have an account? <a href="/signup" style={{color:'#10a37f'}}>Sign up</a></p>
        </div>
    );
}

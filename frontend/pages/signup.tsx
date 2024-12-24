import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignupPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            router.push('/chat');
        }
    }, [router]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await fetch('http://localhost:3001/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type':'application/json' },
            body: JSON.stringify({email, password})
        });
        const data = await res.json();
        if (data.token) {
            localStorage.setItem('token', data.token);
            router.push('/chat');
        } else {
            alert('Signup failed: ' + (data.error || 'Unknown error'));
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
            <h1 style={{marginBottom:'20px'}}>Sign Up for MyGPT</h1>
            <form onSubmit={handleSignup} style={{display:'flex', flexDirection:'column', width:'300px'}}>
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
                <button type="submit" style={{padding:'10px', background:'#10a37f', border:'none', borderRadius:'4px', cursor:'pointer'}}>Sign Up</button>
            </form>
            <p style={{marginTop:'20px'}}>Already have an account? <a href="/login" style={{color:'#10a37f'}}>Login</a></p>
        </div>
    );
}

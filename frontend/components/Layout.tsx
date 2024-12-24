// components/Layout.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Layout.module.css';

type Role = 'user' | 'assistant';

interface Message {
    role: Role;
    content: string;
    timestamp?: string;
}

interface HistoryEntry {
    prompt: string;
    response: string;
    timestamp?: string;
}

interface LayoutProps {
    children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    const [history, setHistory] = useState<Message[]>([]);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            (async () => {
                const res = await fetch('http://localhost:3001/history', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json() as HistoryEntry[];
                    // Convert HistoryEntry to a simple list of user messages for the sidebar
                    const histMsgs: Message[] = data.map((msg) => ({
                        role: 'user',
                        content: msg.prompt
                    }));
                    setHistory(histMsgs);
                } else {
                    console.error('Failed to fetch history with status:', res.status);
                }
            })();
        }
    }, []);

    return (
        <div className={styles.container}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h2>MyGPT</h2>
                </div>
                <div className={styles.sidebarContent}>
                    <p style={{color:'#999', fontSize:'14px', marginBottom:'10px'}}>Your chats</p>
                    <ul style={{listStyle:'none', padding:'0'}}>
                        {history.map((h, i) => (
                            <li key={i} style={{marginBottom:'8px', color:'#fff', cursor:'pointer'}}>
                                {h.content.slice(0, 30)}{h.content.length > 30 ? '...' : ''}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.sidebarFooter}>
                    <button onClick={() => {
                        localStorage.removeItem('token');
                        router.push('/login');
                    }} style={{padding:'8px', background:'#10a37f', border:'none', borderRadius:'4px', cursor:'pointer'}}>
                        Logout
                    </button>
                </div>
            </aside>
            <main className={styles.mainContent}>
                {children}
            </main>
        </div>
    );
}

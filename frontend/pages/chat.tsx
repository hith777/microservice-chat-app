// pages/chat.tsx

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import styles from '../styles/Chat.module.css';

type Role = 'user' | 'assistant';

interface Message {
    role: Role;
    content: string;
}

interface HistoryEntry {
    prompt: string;
    response: string;
    timestamp?: string;
}

export default function ChatPage() {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
        }
    }, [router]);

    const handleAsk = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanedPrompt = prompt.trim();
        if (!cleanedPrompt) {
            // Prevent sending empty messages
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) return;

        // Add the user's message to the conversation
        setMessages(prev => [...prev, { role: 'user', content: cleanedPrompt }]);

        const res = await fetch('http://localhost:3001/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ prompt: cleanedPrompt })
        });

        const data = await res.json();
        if (data.response) {
            // Add the assistant's response
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        }

        // Clear input
        setPrompt('');
    };

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const res = await fetch('http://localhost:3001/history', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // If the response is not JSON or is 404, handle gracefully
        if (!res.ok) {
            console.error('Failed to fetch history, status:', res.status);
            return;
        }

        const data = await res.json() as HistoryEntry[];
        // Convert history entries to a sequence of user->assistant messages
        const histMsgs: Message[] = [];
        // data is presumably sorted by newest first or oldest first, adjust as needed
        // If we want oldest first, ensure data is in correct order
        for (const msg of data.reverse()) {
            histMsgs.push({ role: 'user', content: msg.prompt });
            histMsgs.push({ role: 'assistant', content: msg.response });
        }
        setMessages(histMsgs);
    };

    return (
        <Layout>
            <div className={styles.chatContainer}>
                <div className={styles.messagesWrapper}>
                    {!messages.length && (
                        <div className={styles.emptyState}>
                            <h2>Welcome to MyGPT</h2>
                            <p>Ask anything and I will respond!</p>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={i} className={msg.role === 'assistant' ? styles.aiMessage : styles.userMessage}>
                            <div className={styles.messageContent}>{msg.content}</div>
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', background: '#343541', borderTop: '1px solid #3f3f46', padding: '10px' }}>
                    <button onClick={fetchHistory} style={{ padding: '8px 15px', borderRadius: '4px', border:'none', cursor:'pointer', background:'#2A2B32', color:'#fff'}}>
                        Show History
                    </button>
                </div>

                <form className={styles.inputArea} onSubmit={handleAsk}>
                    <input
                        type="text"
                        placeholder="Send a message..."
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className={styles.inputBox}
                    />
                    <button type="submit" className={styles.sendButton}>→</button>
                </form>
            </div>
        </Layout>
    );
}

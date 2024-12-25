import React, { createContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Layout.module.css';

interface Session {
  _id: string;
  userId: string;
  title: string;
  createdAt?: string;
  messages?: Array<{
    role: string;
    content: string;
    timestamp?: string;
  }>;
}

interface LayoutContextValue {
  addSession: (sessionId: string, title: string) => void;
}

// Provide this so children (like chat) can call addSession
export const LayoutContext = createContext<LayoutContextValue>({
  addSession: () => {}
});

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const router = useRouter();

  // On mount, fetch existing sessions for the user
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const res = await fetch('http://localhost:3001/sessions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          console.error('Failed to fetch sessions, status:', res.status);
          return;
        }
        const data: Session[] = await res.json();
        setSessions(data);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      }
    })();
  }, []);

  // Called by chat.tsx after /new-session, so the sidebar updates immediately
  const addSession = (sessionId: string, title: string) => {
    console.log('Adding session:', sessionId, title);
    setSessions(prev => [
      { _id: sessionId, title, userId: '', createdAt: new Date().toISOString() },
      ...prev
    ]);
    console.log('Added session:', sessionId, title);
  };

  const handleNewChat = () => {
    // Just go to /chat with no session, giving a blank conversation
    router.push('/chat');
  };

  const handleSessionClick = (sessionId: string) => {
    router.push(`/chat?sessionId=${sessionId}`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <LayoutContext.Provider value={{ addSession }}>
      <div className={styles.container}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2>MyGPT</h2>
          </div>

          <div className={styles.sidebarContent}>
            <button
              onClick={handleNewChat}
              style={{
                padding: '10px',
                marginBottom: '15px',
                background: '#2A2B32',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
            >
              + New Chat
            </button>

            <ul style={{ listStyle: 'none', padding: 0 }}>
              {sessions.map(s => (
                <li key={s._id} style={{ marginBottom: '8px' }}>
                  <button
                    onClick={() => handleSessionClick(s._id)}
                    style={{
                      background: '#40414F',
                      color: '#fff',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    {s.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.sidebarFooter}>
            <button
              onClick={handleLogout}
              style={{
                padding: '8px',
                background: '#10a37f',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        </aside>

        <main className={styles.mainContent}>
          {children}
        </main>
      </div>
    </LayoutContext.Provider>
  );
}

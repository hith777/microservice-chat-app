// pages/chat.tsx

import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/router';
import styles from '../styles/Chat.module.css';
import { LayoutContext } from '../components/Layout';

type Role = 'user' | 'assistant';
interface ChatMessage {
  role: Role;
  content: string;
}

interface SessionData {
  _id: string;
  title: string;
  messages: ChatMessage[];
}

export default function ChatPage() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const router = useRouter();

  // We can call addSession(...) to update the sidebar
  console.log(useContext(LayoutContext));
  const { addSession } = useContext(LayoutContext);

  useEffect(() => {
    // If no token => login
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // If user clicked an existing chat in sidebar => we have ?sessionId=...
    const urlSessionId = router.query.sessionId as string | undefined;
    if (urlSessionId) {
      // fetch existing messages for that session
      (async () => {
        try {
          const res = await fetch(`http://localhost:3001/sessions/${urlSessionId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) {
            console.error('Failed to fetch existing session:', res.status);
            return;
          }
          const sessionData: SessionData = await res.json();
          // Convert sessionData.messages => local format
          setMessages(sessionData.messages.map(m => ({ role: m.role, content: m.content })));
        } catch (err) {
          console.error('Error fetching session:', err);
        }
      })();
    } else {
      // No session => blank conversation for new chat
      setMessages([]);
    }
  }, [router]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedPrompt = prompt.trim();
    if (!cleanedPrompt) return;

    // 1) Show user message first
    setMessages(prev => [...prev, { role: 'user', content: cleanedPrompt }]);

    // Clear the input
    setPrompt('');

    const token = localStorage.getItem('token');
    if (!token) return;

    // 2) Check if we have an existing session
    let sessionId = router.query.sessionId as string | undefined;
    if (!sessionId) {
      // No session => create one now
      const newRes = await fetch('http://localhost:3001/new-session', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!newRes.ok) {
        console.error('Failed to create new session');
        return;
      }
      const data = await newRes.json(); // { sessionId, title }
      sessionId = data.sessionId;
      console.log('New session created:', sessionId) // for testing
      // 3) Insert this new session in the sidebar
      if(sessionId) {
        console.log('Adding new session to sidebar:', data.title);
        addSession(sessionId, data.title);
      }

      // 4) Update the URL
      router.replace(`/chat?sessionId=${sessionId}`);
    }

    // 5) Send the user’s message to the assistant
    const askRes = await fetch('http://localhost:3001/ask', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt: cleanedPrompt, sessionId })
    });
    if (!askRes.ok) {
      console.error('Error from /ask');
      return;
    }
    const answer = await askRes.json(); // { response: "AI text" }

    // 6) Show assistant's response
    setMessages(prev => [...prev, { role: 'assistant', content: answer.response }]);

    // 7) refetch the session to update the sidebar
    try {
      if(sessionId){
        const fetched = await fetchSessionData(sessionId);
        // fetched.messages should contain both user + assistant messages
        setMessages(fetched.messages);
      }
    } catch (err) {
      console.error('Error re-fetching updated session:', err);
    }    
  };

  async function fetchSessionData(sessionId: string) {
    const token = localStorage.getItem('token');
    const res = await fetch(`http://localhost:3001/sessions/${sessionId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error(`Failed to fetch session. Status ${res.status}`);
    const data = await res.json();
    return data; // { _id, title, messages: [ ... ] }
  }

  return (
      <div className={styles.chatContainer}>
        <div className={styles.messagesWrapper}>
          {!messages.length && (
            <div className={styles.emptyState}>
              <h2>Welcome to MyGPT</h2>
              <p>Ask me anything! Type a message to start!</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === 'assistant' ? styles.aiMessage : styles.userMessage}
            >
              <div className={styles.messageContent}>{msg.content}</div>
            </div>
          ))}
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
  );
}

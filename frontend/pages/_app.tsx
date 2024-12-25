import { useEffect } from 'react';
import { useRouter } from 'next/router';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import Layout from '../components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // List of routes that do NOT require authentication
    const unprotectedRoutes = ['/login', '/signup', '/social-login'];
    
    // Check for token in localStorage (only on client side)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    // If we are on a protected route and have no token, redirect to /login
    if (!unprotectedRoutes.includes(router.pathname) && !token) {
      router.replace('/login');
    }
  }, [router, router.pathname]);

  if (router.pathname === '/login') {
    return <Component {...pageProps} />;
  }
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

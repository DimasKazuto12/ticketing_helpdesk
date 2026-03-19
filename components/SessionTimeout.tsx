'use client';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SessionTimeout() {
    const router = useRouter();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const TIMEOUT_IN_MS = 5 * 60 * 1000; // 5 Menit

    const logout = () => {
        // Ambil URL saat ini
        const currentPath = window.location.pathname;

        // Hapus semua jejak sesi
        localStorage.clear();
        document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // LOGIKA PENGALIHAN:
        if (currentPath.includes('/dashboard_admin')) {
            // Jika dia di dashboard admin, tendang ke login
            router.push('/login');
        } else {
            // Jika dia user biasa (di halaman results/chat), tendang ke home
            // atau ke halaman "Session Expired"
            router.push('/');
        }

        router.refresh();
    };

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(logout, TIMEOUT_IN_MS);
    };

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        resetTimer();

        events.forEach(event => window.addEventListener(event, resetTimer));

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, []);

    return null;
}
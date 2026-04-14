'use client';
import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function SessionTimeout() {
   const router = useRouter();
    const pathname = usePathname();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    
    // Gunakan 10 detik untuk testing (10 * 1000)
    const TIMEOUT_IN_MS = 5 * 60 * 1000; 

    const logout = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        const isAdmin = pathname.startsWith('/dashboard_admin');

        // --- PERUBAHAN 1: Tampilkan toast SEBELUM redirect ---
        if (isAdmin) {
            toast.error("Sesi admin berakhir", {
                duration: 5000,
            });
        } else {
            toast.error("Sesi user berakhir", {
                icon: '⏳',
                duration: 5000,
            });
        }

        // --- PERUBAHAN 2: Beri delay 100ms agar toast sempat muncul ---
        setTimeout(() => {
            localStorage.clear();
            document.cookie = "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

            if (isAdmin) {
                router.push('/login?reason=timeout');
            } else {
                router.push('/?session=expired');
            }
            router.refresh();
        }, 100); 
    };

    const resetTimer = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(logout, TIMEOUT_IN_MS);
    };

    useEffect(() => {
        // --- PERUBAHAN 3: Proteksi Halaman ---
        // Jika sudah di login atau home dengan status expired, jangan nyalakan timer!
        const isAuthPage = pathname === '/login' || pathname === '/';
        const hasParam = typeof window !== 'undefined' && window.location.search.includes('expired');
        
        if (isAuthPage && (pathname === '/login' || hasParam)) {
            return; 
        }

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        resetTimer();
        events.forEach(event => window.addEventListener(event, resetTimer));

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [pathname]); 

    return null;
}
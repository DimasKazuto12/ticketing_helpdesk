'use client';
import React, { useState, useEffect } from 'react';
import { Bot, Zap, ZapOff, Loader2 } from 'lucide-react';
import { toggleGlobalAiAssistant, getGlobalAiStatus } from '@/app/dashboard_admin/action'; // Import action yang tadi kita buat
import Pusher from 'pusher-js';

interface ChatbotProps {
    initialStatus?: boolean; // Tambahkan tanda tanya di sini
}

export default function chatbot({ initialStatus = false }: ChatbotProps) {
    const [isGlobalAi, setIsGlobalAi] = useState(initialStatus);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchInitialStatus = async () => {
            const status = await getGlobalAiStatus();
            setIsGlobalAi(status);
            setIsLoading(false);
        };
        fetchInitialStatus();
    }, []);

    useEffect(() => {
        // Listener Pusher agar tombol sinkron di semua tab Admin
        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusher.subscribe('admin-events');
        channel.bind('global-ai-update', (data: { isActive: boolean }) => {
            setIsGlobalAi(data.isActive);
        });

        return () => {
            pusher.unsubscribe('admin-events');
            pusher.disconnect();
        };
    }, []);

    const handleToggle = async () => {
        setIsLoading(true);
        const newStatus = !isGlobalAi;
        
        // Optimistic UI: Ubah tampilan dulu, urusan database belakangan
        setIsGlobalAi(newStatus);

        const result = await toggleGlobalAiAssistant(newStatus);
        if (!result.success) {
            alert("Gagal sinkronisasi dengan Neural Core");
            setIsGlobalAi(!newStatus); // Revert kalau gagal
        }
        setIsLoading(false);
    };

    return (
       
           <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`group relative flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                isGlobalAi 
                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.1)]' 
                : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
            }`}
        >
            {/* Indikator Titik (Status) */}
            <span className={`w-1.5 h-1.5 rounded-full ${isGlobalAi ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-600'}`} />
            
            <span className="text-[10px] font-black uppercase tracking-widest">
                {isLoading ? 'Processing...' : isGlobalAi ? 'Neural ON' : 'Neural OFF'}
            </span>

            {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
            ) : isGlobalAi ? (
                <Zap size={14} className="fill-indigo-400" />
            ) : (
                <ZapOff size={14} />
            )}

            {/* Efek Glow saat ON */}
            {isGlobalAi && (
                <span className="absolute inset-0 rounded-xl bg-indigo-500/5 blur-sm -z-10"></span>
            )}
        </button>
         
    );
}
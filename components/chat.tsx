'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import styles from '../app/results/[code]/results.module.css';
import VoiceController from './VoiceController';
import Pusher from 'pusher-js';
import { useRouter } from 'next/navigation';

interface Reply {
    id: number;
    ticketId: number;
    userId?: number | null;
    senderType: 'admin' | 'client'; // Harus sinkron dengan enum SenderType
    message: string;
    attachment?: string | null;
    createdAt: string | Date;
}

interface ChatInterfaceProps {
    ticketId: number;
    initialDescription: string;
    existingReplies: Reply[];
    aiSummary?: string;
    ticketStatus: string;
}

export default function ChatInterface({
    ticketId,
    existingReplies,
    aiSummary,
    ticketStatus
}: ChatInterfaceProps) {
    const [attachment, setAttachment] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState('');
    const [replies, setReplies] = useState(existingReplies);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // SOLUSI HYDRATION: State untuk mengecek apakah sudah di client
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setReplies(existingReplies);
    }, [existingReplies]);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [replies]);

    // Ganti bagian useEffect Pusher kamu dengan ini:
    useEffect(() => {
        if (!ticketId) return;

        const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        });

        const channel = pusher.subscribe(`ticket-${ticketId}`);

        channel.bind('new-reply', (data: Reply) => {
            setReplies((prev) => {
                // Cukup cek apakah ID pesan ini sudah ada di layar (cegah duplikat standar)
                const isAlreadyThere = prev.some(r => r.id === data.id);
                if (isAlreadyThere) return prev;

                // Tambahkan pesan asli dari Database ke layar
                return [...prev, data];
            });
        });

        channel.bind('ticket-updated', () => {
            // Ini akan memicu Server Component (ProfessionalTicketResults) 
            // untuk menjalankan ulang getTicketData(code)
            router.refresh();
        });

        return () => {
            channel.unbind_all();
            pusher.unsubscribe(`ticket-${ticketId}`);
            pusher.disconnect();
        };
    }, [ticketId, router]);


    const handleSend = async () => {
        // 1. Validasi awal
        if ((!message.trim() && !attachment) || isLoading) return;

        const currentMsg = message;
        const currentAttachment = attachment;

        // 2. Persiapan UI
        setIsLoading(true);
        setMessage(''); // Kosongkan input agar user tahu sedang diproses
        setAttachment(null);

        try {
            // 3. Kirim ke API (Database)
            const res = await fetch('/api/ticket/replies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId,
                    message: currentMsg || "Sent an attachment",
                    attachment: currentAttachment,
                    sender: 'client'
                }),
            });

            if (!res.ok) throw new Error("Gagal mengirim");

            // --- STOP DI SINI ---
            // Kita tidak perlu memanggil setReplies. 
            // Mengapa? Karena API kita di backend akan menembakkan Pusher.
            // Pusher itu akan ditangkap oleh useEffect di bawah.

        } catch (err) {
            console.error("Link Failure:", err);
            // Jika gagal, kembalikan teks ke input agar tidak hilang
            setMessage(currentMsg);
            setAttachment(currentAttachment);
            alert("Gagal mengirim pesan.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("File too large! Max 2MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachment(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className={styles.chatStream}>
            <div className={styles.logContainer} ref={scrollRef}>

                {/* 1. NEURAL ANALYSIS (AI) */}
                {aiSummary && (
                    <div className="flex w-full mb-4 justify-start">
                        <div className="max-w-[80%] p-3 rounded-lg shadow-lg border border-dashed border-zinc-500/50 bg-zinc-600/10 transition-all">
                            <div className="flex justify-between items-start mb-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                        Hasil analisa
                                    </span>
                                </div>
                                <VoiceController textToSpeak={aiSummary} />
                            </div>
                            <p className="text-sm text-zinc-100 leading-relaxed opacity-90">{aiSummary}</p>
                        </div>
                    </div>
                )}

                {/* 3. REPLIES MAPPING */}
                {replies.map((r, i) => (
                    <div key={i} className={`flex w-full mb-4 ${r.senderType === 'client' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg shadow-lg transition-all ${r.senderType === 'client'
                            ? 'bg-zinc-800/50 border border-zinc-700/50'
                            : 'bg-blue-600/20 border border-blue-500/30'
                            }`}>
                            <p className="text-[10px] uppercase opacity-50 tracking-wider font-bold mb-2">
                                {r.senderType === 'client' ? 'CLIENT_REPLY' : 'ADMIN_RESPONSE'}
                            </p>

                            {r.attachment && (
                                <div className="mb-2 rounded-lg overflow-hidden border border-white/5 shadow-inner bg-black/20">
                                    <img
                                        src={r.attachment}
                                        alt="Neural Attachment"
                                        className="max-w-full h-auto max-h-[300px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setSelectedImage(r.attachment ?? null)}
                                    />
                                </div>
                            )}

                            {r.message && (
                                <p className="text-sm text-zinc-100 leading-relaxed break-words">
                                    {r.message}
                                </p>
                            )}

                            {/* TIMESTAMP DENGAN FIX HYDRATION */}
                            <p
                                suppressHydrationWarning
                                className="text-[8px] mt-2 opacity-30 text-right font-mono"
                            >
                                {isMounted ? new Date(r.createdAt || Date.now()).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : '--:--'}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* INPUT SECTION */}
            <div className={styles.inputWrapper}>
                {attachment && (
                    <div className="relative mb-2 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2 w-fit">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                            <img src={attachment} className="w-full h-full object-cover" alt="preview" onClick={() => setSelectedImage(attachment)} />
                            <button onClick={() => setAttachment(null)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"><X size={14} /></button>
                        </div>
                    </div>
                )}

                <div className={styles.inputBar}>
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-zinc-500"
                        disabled={ticketStatus === 'closed'}
                    >
                        <Paperclip size={18} />
                    </button>

                    <input
                        type="text"
                        placeholder={ticketStatus === 'closed' ? "Transmission closed." : "Ketik pesan..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="border-none outline-none flex-1 bg-transparent border-none focus:ring-0 text-sm text-white py-3 resize-none max-h-32"
                        disabled={ticketStatus === 'closed'}
                    />

                    <button
                        className={styles.sendButtonActive}
                        onClick={handleSend}
                        onKeyDown={(e) => {
                            // Jika tekan Enter tanpa Shift, kirim pesan
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend(); // Panggil fungsi kirim
                            }
                        }}
                        disabled={isLoading || (!message.trim() && !attachment) || ticketStatus === 'closed'}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {/* MODAL ZOOM */}
            {selectedImage && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative animate-in zoom-in-95 duration-200">
                        <img src={selectedImage} className="max-h-[85vh] max-w-full rounded-lg shadow-2xl border border-zinc-800" alt="zoom" />
                    </div>
                </div>
            )}
        </section>
    );
}
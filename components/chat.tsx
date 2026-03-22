'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';
import styles from '../app/results/[code]/results.module.css';
import VoiceController from './VoiceController';

interface ChatInterfaceProps {
    ticketId: number;
    initialDescription: string;
    existingReplies: any[];
    aiSummary?: string;
    ticketStatus: string;
}

export default function ChatInterface({
    ticketId,
    initialDescription,
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
    
    // SOLUSI HYDRATION: State untuk mengecek apakah sudah di client
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [replies]);

    const handleSend = async () => {
        if ((!message.trim() && !attachment) || isLoading) return;
        setIsLoading(true);

        try {
            const response = await fetch('/api/ticket/replies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId,
                    message: message || "Sent an attachment",
                    attachment,
                    sender: 'USER'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setReplies([...replies, data]);
                setMessage('');
                setAttachment(null);
            }
        } catch (err) {
            console.error("Failed to send:", err);
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
                        <div className="max-w-[80%] p-3 rounded-lg shadow-lg border border-dashed border-blue-500/50 bg-blue-600/10 transition-all">
                            <div className="flex justify-between items-start mb-1 gap-4">
                                <span className="text-[10px] uppercase text-blue-400 tracking-wider font-bold">NEURAL_ANALYSIS_CORE</span>
                                <VoiceController textToSpeak={aiSummary} />
                            </div>
                            <p className="text-sm text-zinc-100 leading-relaxed opacity-90">{aiSummary}</p>
                        </div>
                    </div>
                )}

                {/* 3. REPLIES MAPPING */}
                {replies.map((r, i) => (
                    <div key={i} className={`flex w-full mb-4 ${r.senderType === 'client' ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[80%] p-3 rounded-lg shadow-lg transition-all ${
                            r.senderType === 'client'
                                ? 'bg-zinc-800/50 border border-zinc-700/50'
                                : 'bg-blue-600/20 border border-blue-500/30'
                        }`}>
                            <p className="text-[10px] uppercase opacity-50 mb-1 tracking-wider font-bold">
                                {r.senderType === 'client' ? 'CLIENT_REPLY' : 'ADMIN_RESPONSE'}
                            </p>

                            {r.attachment && (
                                <div className="mb-2 rounded-lg overflow-hidden border border-white/5 shadow-inner bg-black/20">
                                    <img
                                        src={r.attachment}
                                        alt="Neural Attachment"
                                        className="max-w-full h-auto max-h-[300px] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => setSelectedImage(r.attachment)}
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
                    <div className="mb-2 flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-700 rounded w-fit">
                        <img src={attachment} className="h-10 w-10 object-cover rounded" alt="preview" />
                        <span className="text-xs text-zinc-400">image_payload.dat</span>
                        <button onClick={() => setAttachment(null)} className="text-red-500"><X size={14} /></button>
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
                        className="text-zinc-500 hover:text-blue-500 transition-colors"
                        disabled={ticketStatus === 'closed'}
                    >
                        <Paperclip size={18} />
                    </button>

                    <input
                        type="text"
                        placeholder={ticketStatus === 'closed' ? "Transmission closed." : "Type your transmission..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        className="bg-transparent border-none outline-none text-zinc-100 placeholder-zinc-600 flex-1"
                        disabled={ticketStatus === 'closed'}
                    />

                    <button
                        className={styles.sendButtonActive}
                        onClick={handleSend}
                        disabled={isLoading || (!message.trim() && !attachment) || ticketStatus === 'closed'}
                        style={{ opacity: (message.trim() || attachment) && ticketStatus !== 'closed' ? 1 : 0.5 }}
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
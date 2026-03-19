'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Send, Terminal, Paperclip, X, Image as ImageIcon } from 'lucide-react';
import styles from '../app/results/[code]/results.module.css';

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
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // Untuk Zoom
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [message, setMessage] = useState('');
    const [replies, setReplies] = useState(existingReplies);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll ke bawah saat ada pesan baru
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
                    attachment, // Kirim base64 ke API
                    sender: 'USER'
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setReplies([...replies, data]);
                setMessage('');
                setAttachment(null); // Reset gambar setelah kirim
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
            if (file.size > 2 * 1024 * 1024) { // Limit 2MB
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

    // Update handleSend untuk menyertakan attachment

    return (
        <section className={styles.chatStream}>
            <div className={styles.streamHeader}>
                <div className={styles.nodeIconBox}><Send size={18} /></div>
                <div className={styles.nodeHeaderText}>
                    <span className={styles.nodeTitle}>Communication Node</span>
                </div>
            </div>

            {/* Tambahkan ref untuk auto-scroll dan hilangkan scrollbar via CSS sebelumnya */}
            <div className={styles.logContainer} ref={scrollRef}>
                {aiSummary && (
                    <div className={styles.bubbleAdmin} style={{ marginTop: '-15px', borderStyle: 'dashed' }}>
                        <span className={styles.bubbleLabelAdmin} style={{ color: '#3b82f6' }}>NEURAL_ANALYSIS_CORE</span>
                        <p className={styles.bubbleText} style={{ opacity: 0.8 }}>{aiSummary}</p>
                    </div>
                )}

                <div className={styles.bubbleClient}>
                    <span className={styles.bubbleLabel}>CLIENT_INITIAL_REQUEST</span>
                    <p className={styles.bubbleText}>"{initialDescription}"</p>
                </div>

                {replies.map((r, i) => (
                    <div key={i} className={r.senderType === 'client' ? styles.bubbleClient : styles.bubbleAdmin}>
                        <span className={r.senderType === 'client' ? styles.bubbleLabel : styles.bubbleLabelAdmin}>
                            {r.senderType === 'client' ? 'CLIENT_REPLY' : 'ADMIN_RESPONSE'}
                        </span>
                        <p className={styles.bubbleText}>{r.message}</p>

                        {/* TAMPILKAN GAMBAR JIKA ADA */}
                        {r.attachment && (
                            <div className="mt-2 border border-zinc-700 rounded overflow-hidden">
                                <img
                                    src={r.attachment}
                                    alt="attachment"
                                    className="max-w-[200px] cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={() => setSelectedImage(r.attachment)}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className={styles.inputWrapper}>
                {attachment && (
                    <div className="mb-2 flex items-center gap-2 p-2 bg-zinc-900 border border-zinc-700 rounded w-fit">
                        <img src={attachment} className="h-10 w-10 object-cover rounded" />
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
                        disabled={ticketStatus === 'closed'}
                    />

                    <button
                        className={styles.sendButtonActive}
                        onClick={handleSend}
                        disabled={isLoading || !message.trim() || ticketStatus === 'closed'}
                        style={{ opacity: (message.trim() && ticketStatus !== 'closed') ? 1 : 0.5 }}

                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>

            {selectedImage && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4" onClick={() => setSelectedImage(null)}>
                    <div className="relative animate-in zoom-in-95 duration-200">
                        <img src={selectedImage} className="max-h-[85vh] max-w-full rounded-lg shadow-2xl border border-zinc-800" />
                    </div>
                </div>
            )}
        </section>
    );
}
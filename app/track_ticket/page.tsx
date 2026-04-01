"use client";
import React, { useState } from 'react';
import { Search, ChevronLeft, Ticket, Clock, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Toaster, toast } from 'sonner';
import styles from './track.module.css';

export default function TrackTicketPage() {
    const [inputCode, setInputCode] = useState("");
    const [ticketData, setTicketData] = useState<any>(null);
    const [isSearching, setIsSearching] = useState(false);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!inputCode) {
            toast.error("Harus diisi", { description: "Tolong isi ticket id yang sudah didapatkan" });
            return;
        }

        setIsSearching(true);
        const toastId = toast.loading('Mencari tiket...');

        try {
            // Kita panggil API yang sudah dibuat sebelumnya
            const res = await fetch(`/api/ticket/track?code=${inputCode.toUpperCase()}`);
            const result = await res.json();

            if (result.success) {
                setTicketData(result.data);
                toast.success('Tiket Ditemukan!', {
                    id: toastId,
                    description: `Status: ${result.data.status.toUpperCase()}`,
                });
            } else {
                setTicketData(null);
                toast.error('Tidak Ditemukan', {
                    id: toastId,
                    description: 'Kami tidak bisa menemukan tiketnya',
                });
            }
        } catch (error) {
            toast.error('Error', { id: toastId, description: 'server error' });
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div className={styles.background}>
            {/* Konfigurasi Notifikasi Sonner agar match dengan UI */}
            <Toaster
                theme="dark"
                position="top-center"
                richColors
                toastOptions={{
                    className: "my-custom-toast",
                    style: {
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        color: '#fff',
                        fontSize: '14px',
                        padding: '12px 16px',
                    },
                }}
            />

            <Link href="/" className="fixed top-5 left-4 z-50 flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-xs uppercase tracking-[0.2em]">
                <ChevronLeft size={16} /> Back
            </Link>

            <div className={styles.card}>
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/5 border border-white/10 mb-6 shadow-xl">
                        <Ticket className="text-white/80" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Cari Tiket</h1>
                    <p className="text-zinc-500 text-sm">Masukkan kode tiket yang kamu peroleh</p>
                </div>

                <form onSubmit={handleTrack}>
                    <div className="relative group mb-4">
                        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${isSearching ? 'text-zinc-500' : 'text-zinc-700 group-focus-within:text-white'}`} size={18} />
                        <input
                            type="text"
                            placeholder="TIX-XXXXXX"
                            className={styles.inputField}
                            value={inputCode}
                            onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                            required
                        />
                    </div>

                    <button type="submit" disabled={isSearching} className={styles.submitBtn}>
                        {isSearching ? "Mencari..." : "Check Status"}
                    </button>
                </form>

                {/* Tampilan Hasil Pencarian */}
                {ticketData && (
                    <div className="mt-8 pt-6 border-t border-white/10 animate-in fade-in slide-in-from-top-2 duration-500">
                        <Link href={`/results/${ticketData.ticketCode}`} className="block group">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-zinc-500/50 hover:bg-white/[0.07] transition-all cursor-pointer group-hover:shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] text-zinc-500 font-mono tracking-widest group-hover:text-zinc-400 transition-colors">
                                        {ticketData.ticketCode}
                                    </span>
                                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md uppercase ${ticketData.status === 'open' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'
                                        }`}>
                                        {ticketData.status === 'open' ? <Clock size={12} /> : <CheckCircle2 size={12} />}
                                        {ticketData.status}
                                    </div>
                                </div>

                                <h2 className="text-sm font-semibold text-white mb-1 flex items-center justify-between">
                                    {ticketData.title}
                                </h2>

                                <p className="text-xs text-zinc-400 line-clamp-2 italic">
                                    "{ticketData.description}"
                                </p>

                                <p className="mt-4 text-[10px] text-zinc-300 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Klik untuk lihat lebih lanjut
                                </p>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
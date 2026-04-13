'use client';
import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AiBubbleProps {
    message: string;
    timestamp: string;
}

export default function AiBubble({ message, timestamp }: AiBubbleProps) {
    return (
        <div className="flex flex-col gap-2 mb-6 group animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Label Identitas AI */}
            <div className="flex items-center gap-2 ml-1">
                <div className="flex items-center justify-center w-5 h-5 bg-indigo-500/20 rounded-md border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                    <Bot size={12} className="text-indigo-400" />
                </div>
                {/* Perubahan Nama Label di Sini */}
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
                    AI_RESPONSE
                </span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span className="text-[9px] text-zinc-500 font-medium tracking-wider">{timestamp}</span>
            </div>

            {/* Bubble Chat */}
            <div className="relative max-w-[85%]">
                {/* Efek Glow di belakang bubble saat di-hover */}
                <div className="absolute -inset-0.5 bg-indigo-500/10 blur-xl rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                
                <div className="relative bg-zinc-950 border border-indigo-500/20 rounded-2xl rounded-tl-none p-4 shadow-2xl">
                    {/* Garis Aksen Vertikal di samping pesan (Ciri khas sistem/AI) */}
                    <div className="absolute left-0 top-4 bottom-4 w-[2px] bg-indigo-500/40 rounded-full" />
                    
                    <div className="pl-3">
                        <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                            {message}
                        </p>
                    </div>

                    {/* Badge Verifikasi AI di Pojok Kanan Bawah */}
                    <div className="flex justify-end mt-3 opacity-30 group-hover:opacity-100 transition-opacity duration-500">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/5 border border-indigo-500/10 rounded-lg">
                            <Sparkles size={10} className="text-indigo-400" />
                            <span className="text-[8px] font-bold text-indigo-400/80 uppercase tracking-tighter">
                                Neural Generated
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
"use client";
import { useState } from 'react';
import { Volume2, Settings, Globe, Play } from 'lucide-react'; // Pastikan sudah install lucide-react

export default function VoiceController({ textToSpeak }: { textToSpeak: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState<'INDO' | 'JAPAN'>('INDO');
    const [speakerId, setSpeakerId] = useState(8); // Default Zundamon
    const [loading, setLoading] = useState(false);

    const handleSpeak = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/ticket/voice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: textToSpeak,
                    mode: mode,
                    speakerId
                }),
            });

            if (!res.ok) throw new Error("Gagal mengambil data suara dari server");

            const blob = await res.blob();
            const audioUrl = URL.createObjectURL(blob);
            const audio = new Audio(audioUrl);

            await audio.play();

            audio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                setLoading(false);
            };
        } catch (err) {
            console.error(err);
            alert("Neural Voice System Error!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative inline-block">
            {/* Tombol Utama (Ikon Speaker) */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full border border-zinc-500 bg-black/40 hover:bg-zinc-800 transition text-zinc-400"
            >
                <Volume2 size={16} />
            </button>

            {/* Popover Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#0d0d0d] border border-gray-800 rounded-lg p-3 shadow-2xl z-50 animate-in fade-in zoom-in duration-200">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-2 flex items-center gap-1">
                        <Settings size={10} /> Voice Protocol
                    </p>

                    {/* Toggle Mode */}
                    <div className="flex gap-1 bg-black p-1 rounded border border-gray-800 mb-3">
                        <button
                            onClick={() => setMode('INDO')}
                            className={`flex-1 text-[10px] py-1 rounded transition ${mode === 'INDO' ? 'bg-red-600 text-white' : 'text-gray-400'}`}
                        >
                            🇮🇩 INDO
                        </button>
                        <button
                            onClick={() => setMode('JAPAN')}
                            className={`flex-1 text-[10px] py-1 rounded transition ${mode === 'JAPAN' ? 'bg-pink-600 text-white' : 'text-gray-400'}`}
                        >
                            🇯🇵 JP
                        </button>
                    </div>

                    {/* Model Selector (Hanya muncul jika mode JAPAN) */}
                    {mode === 'JAPAN' && (
                        <select
                            value={speakerId}
                            onChange={(e) => setSpeakerId(Number(e.target.value))}
                            className="w-full bg-black text-[10px] text-gray-300 border border-gray-800 p-1 mb-3 rounded outline-none"
                        >
                            <option value="3">Zundamon (Ceria)</option>
                            <option value="8">Tsumugi (Ramah)</option>
                            <option value="2">Metan (Elegan)</option>
                        </select>
                    )}

                    <button
                        onClick={handleSpeak}
                        disabled={loading}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white text-[10px] font-bold py-2 rounded flex items-center justify-center gap-2 transition disabled:opacity-50"
                    >
                        {loading ? "..." : <><Play size={10} fill="white" /> PLAY ANALYSYS</>}
                    </button>
                </div>
            )}
        </div>
    );
}
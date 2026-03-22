"use client";
import React, { useState, useEffect, useRef } from 'react';
import {
    BarChart, Bar, XAxis, Tooltip, ResponsiveContainer,
    Cell
} from 'recharts';
import {
    Download, LayoutDashboard, Ticket,
    BrainCircuit, Search, LogOut, X, Eye, ChevronRight,
    Activity, ShieldCheck, Zap, Clock, User, Paperclip, Hash, Calendar, Layers, Maximize2, MessageSquare, Send, Trash2, Edit3
} from 'lucide-react';
import { getAdminDashboardData, analyzeTicketWithAI, getAllTickets, logoutAction, updateTicket, deleteTicket, sendReplyAction } from './action';
import { toast } from 'sonner';
import "./admin.module.css"
import { useRouter } from "next/navigation";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import VoiceController from '@/components/VoiceController'

interface ChatMessage {
    role: 'user' | 'admin';
    content: string;
}

interface TicketData {
    id: string | number;
    replies: ChatMessage[];
    // ... tambahkan properti lain jika perlu
}

// 2. Definisikan Props yang dikirim dari Page Utama
interface ChatProps {
    selectedTicket: TicketData | null;
    setSelectedTicket: (ticket: TicketData | null) => void;
    replyText: string;
    setReplyText: (text: string) => void;
}

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('insights');
    const [tickets, setTickets] = useState<any[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isDownloadOptionsOpen, setIsDownloadOptionsOpen] = useState(false);
    const [attachment, setAttachment] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [replyText, setReplyText] = useState("");
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const [editableData, setEditableData] = useState({
        summary: "",
        category: "",
        priority: "low",
        status: "in_progress"
    });

    useEffect(() => {
        if (selectedTicket?.replies) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [selectedTicket?.replies]);

    useEffect(() => {
        async function loadInitialData() {
            try {
                const [stats, allTickets] = await Promise.all([
                    getAdminDashboardData(),
                    getAllTickets()
                ]);
                setData(stats);

                // Prioritaskan data dari database (allTickets)
                // LocalStorage seringkali menyimpan data "basi" yang bikin status balik lagi
                setTickets(allTickets);

            } catch (error) {
                toast.error("Gagal sinkronisasi data");
            } finally {
                setTimeout(() => setLoading(false), 1200);
            }
        }
        loadInitialData();
    }, []);

    const openDetail = (ticket: any) => {
        setSelectedTicket(ticket);
        setIsAnalyzing(false);

        const priorityMap: { [key: string]: string } = {
            'high': 'Tinggi',
            'medium': 'Sedang',
            'low': 'Rendah',
            'HIGH': 'Tinggi',
            'MEDIUM': 'Sedang',
            'LOW': 'Rendah'
        };

        // 2. Ambil nilai mapping, fallback ke 'Rendah' jika data kosong
        const currentPriority = priorityMap[ticket.priority] || ticket.priority || "Rendah";

        setEditableData({
            summary: ticket.aiSuggestions?.aiSummary || "",
            category: ticket.category?.categoryName || "Other",
            priority: currentPriority,
            status: ticket.status || "in_progress"
        });
    };
    const [isPriorityOpen, setIsPriorityOpen] = useState(false);

    const handleAskAI = async () => {
        if (!selectedTicket) return;
        setIsAnalyzing(true);
        const toastId = toast.loading("AI sedang menscan data & visual...");

        try {
            // Kita kirim teks DAN URL gambar (jika ada) ke fungsi backend kamu
            const result = await analyzeTicketWithAI(
                selectedTicket.description,
                selectedTicket.attachment // Tambahkan parameter ini
            );

            setEditableData({
                summary: result.summary || "",
                category: result.recommendedCategory || "Other",
                priority: result.priority || "Sedang",
                status: editableData.status
            });

            toast.success("Analisis Neural Selesai", { id: toastId });
        } catch (error) {
            toast.error("Gagal sinkronisasi visual", { id: toastId });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleLogout = async () => {
        try { await logoutAction(); toast.success("System Offline"); } catch (error) { toast.error("Gagal logout"); }
    };

    if (loading || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#030303] font-sans">
                <div className="relative flex items-center justify-center">
                    <div className="absolute w-24 h-24 border-t-2 border-blue-600 rounded-full animate-spin"></div>
                    <div className="text-white font-bold text-xl tracking-tighter animate-pulse">D.</div>
                </div>
                <p className="mt-12 text-[10px] uppercase tracking-[0.5em] text-zinc-600">Booting Neural OS</p>
            </div>
        );
    }

    const handleSaveChanges = async () => {
        if (!selectedTicket) return;

        const toastId = toast.loading("Syncing with Neural Database...");
        try {
            const result = await updateTicket(Number(selectedTicket.id), {
                summary: editableData.summary,
                category: editableData.category,
                priority: editableData.priority,
                status: editableData.status
            });

            if (result.success) {
                // 1. Paksa Next.js refresh cache server-side
                router.refresh();

                // 2. Ambil data mentah terbaru
                const [updatedStats, allTickets] = await Promise.all([
                    getAdminDashboardData(),
                    getAllTickets()
                ]);

                // 3. Update state lokal
                setData(updatedStats);
                setTickets(allTickets);

                localStorage.removeItem('neural_records');
                toast.success("Database Sync Complete", { id: toastId });
                setSelectedTicket(null);
            } else {
                toast.error("Sync Error: " + result.error, { id: toastId });
            }
        } catch (error) {
            toast.error("Critical Neural Link Failure", { id: toastId });
        }
    };

    // Logika filter tiket
    const filteredTickets = tickets.filter((ticket) => {
        const searchTerm = searchQuery.toLowerCase();
        return (
            ticket.title.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm) ||
            ticket.id.toString().includes(searchTerm) ||
            ticket.clientEmail.toLowerCase().includes(searchTerm)
        );
    });

    const handleDelete = async (id: number) => {
        // Gunakan toast konfirmasi atau window.confirm
        if (!confirm("Konfirmasi penghapusan data dari Neural Database?")) return;

        const toastId = toast.loading("Wiping record from system...");
        try {
            // Panggil fungsi server action/API kamu
            const result = await deleteTicket(id);

            if (result.success) {
                // Update state lokal agar data langsung hilang dari UI (Optimistic Update)
                setTickets(prev => prev.filter(t => t.id !== id));

                // Refresh data statistik (stats) agar jumlah tiket berkurang
                const updatedStats = await getAdminDashboardData();
                setData(updatedStats);

                toast.success("Record Purged Successfully", { id: toastId });
            } else {
                toast.error("Failed to delete: " + result.error, { id: toastId });
            }
        } catch (error) {
            toast.error("Security Override: Critical Delete Failure", { id: toastId });
        }
    };

    const handleDownloadPDF = () => {
        // Filter berdasarkan tanggal yang dipilih user
        const filteredByDate = tickets.filter(t => {
            const ticketDate = new Date(t.createdAt).toISOString().split('T')[0];
            if (startDate && endDate) {
                return ticketDate >= startDate && ticketDate <= endDate;
            }
            return true; // Jika tidak pilih tanggal, download semua
        });

        if (filteredByDate.length === 0) {
            toast.error("Tidak ada data pada periode tersebut");
            return;
        }

        const doc = new jsPDF();
        // ... (Logika styling PDF sama seperti sebelumnya) ...

        // Tambahkan info periode di PDF
        doc.setFontSize(10);
        doc.text(`Periode: ${startDate || 'All'} s/d ${endDate || 'All'}`, 14, 35);

        const tableRows = filteredByDate.map(t => [
            `ID_${t.id.toString().slice(-8)}`,
            t.title,
            t.clientEmail,
            t.status.toUpperCase(),
            new Date(t.createdAt).toLocaleDateString() // Tambahkan kolom tanggal di PDF
        ]);

        autoTable(doc, {
            head: [["ID", "Title", "Client", "Status", "Date"]],
            body: tableRows,
            startY: 45,
            theme: 'grid',
            // ... (styling autoTable) ...
        });

        doc.save(`report_${startDate || 'all'}_to_${endDate || 'all'}.pdf`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachment(file);
            const reader = new FileReader();
            reader.onloadend = () => setAttachmentPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSendReply = async () => {
        // 1. Validasi: Jangan kirim jika semuanya kosong
        if ((!replyText.trim() && !attachmentPreview) || !selectedTicket || isAnalyzing) return;

        const messageToSend = replyText;
        const imageToSend = attachmentPreview; // Ambil base64 dari state preview

        // 2. Reset UI segera (Optimistic)
        setReplyText("");
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
            const response = await fetch('/api/ticket/replies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: selectedTicket.id,
                    message: messageToSend,
                    sender: 'ADMIN',
                    attachment: imageToSend // Kirim gambar ke database
                }),
            });

            if (response.ok) {
                const newReply = await response.json();

                // 3. Update State Lokal (Agar chat langsung muncul)
                setSelectedTicket((prev: any) => ({
                    ...prev,
                    replies: [...(prev.replies || []), newReply]
                }));

                // Sync dengan list tiket utama
                setTickets((prev) => prev.map(t =>
                    t.id === selectedTicket.id
                        ? { ...t, replies: [...(t.replies || []), newReply] }
                        : t
                ));
            } else {
                // Fallback jika gagal: kembalikan teks ke input
                setReplyText(messageToSend);
                setAttachmentPreview(imageToSend);
                toast.error("Gagal sinkronisasi Neural Core");
            }
        } catch (error) {
            console.error("Link Failure:", error);
            toast.error("Koneksi terputus");
        }
    };

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleAdminSend = async () => {
        // 1. Validasi: Jangan kirim jika semuanya kosong
        if ((!replyText.trim() && !attachmentPreview) || !selectedTicket || isAnalyzing) return;

        // Simpan data ke variabel sementara sebelum state di-reset (untuk fallback jika gagal)
        const messageToSend = replyText;
        const imageToSend = attachmentPreview;

        // 2. Reset UI secara instan (Optimistic UI)
        setReplyText("");
        setAttachment(null);
        setAttachmentPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";

        try {
            const response = await fetch('/api/ticket/replies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: selectedTicket.id,
                    message: messageToSend,
                    sender: 'ADMIN',
                    attachment: imageToSend // Mengirim Base64 dari state attachmentPreview
                }),
            });

            if (response.ok) {
                const newReply = await response.json();

                // 3. Update State agar chat muncul di layar saat itu juga
                setSelectedTicket((prev: any) => ({
                    ...prev,
                    replies: [...(prev.replies || []), newReply]
                }));

                // Update juga di list tiket utama agar data tetap sinkron
                setTickets((prev) => prev.map(t =>
                    t.id === selectedTicket.id
                        ? { ...t, replies: [...(t.replies || []), newReply] }
                        : t
                ));

                toast.success("Transmission Sent");
            } else {
                // Jika gagal, kembalikan teks ke input agar admin tidak perlu ngetik ulang
                setReplyText(messageToSend);
                setAttachmentPreview(imageToSend);
                toast.error("Failed to sync with Neural Core");
            }
        } catch (error) {
            console.error("Link Failure:", error);
            toast.error("Connection Interrupted");
        }
    };

    return (
        <div className=" min-h-screen bg-[#030303] flex font-sans text-zinc-300 antialiased selection:bg-blue-500/30">

            {/* Sidebar */}
            <aside className="w-64 border-r border-zinc-900 bg-[#050505] flex flex-col z-20">
                <div className="p-8 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
                    <span className="text-xl font-bold tracking-tighter text-white">distalk.</span>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    <button onClick={() => setActiveTab('insights')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'insights' ? 'bg-zinc-900 text-white border border-zinc-800 shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'}`}>
                        <LayoutDashboard size={16} /> Dashboard
                    </button>
                    <button onClick={() => setActiveTab('tickets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${activeTab === 'tickets' ? 'bg-zinc-900 text-white border border-zinc-800 shadow-lg' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/40'}`}>
                        <Ticket size={16} /> All Tickets
                    </button>
                    <button
                        onClick={() => setIsDownloadOptionsOpen(!isDownloadOptionsOpen)}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-zinc-500 hover:bg-white/5 transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <Calendar size={18} className="group-hover:text-white" />
                            <span className="text-xs font-bold uppercase tracking-wider">Export Report</span>
                        </div>
                        <ChevronRight size={14} className={`transition-transform ${isDownloadOptionsOpen ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Panel Input Tanggal (Muncul saat di-klik) */}
                    {isDownloadOptionsOpen && (
                        <div className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-1">
                                <label className="text-[8px] text-zinc-500 uppercase ml-1">Start Date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[8px] text-zinc-500 uppercase ml-1">End Date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-lg px-3 py-2 text-[10px] text-white focus:outline-none focus:border-emerald-500/50 transition-colors [color-scheme:dark]"
                                />
                            </div>

                            <button
                                onClick={handleDownloadPDF}
                                className="w-full py-2 bg-white hover:bg-white/35 text-black/100 hover:text-white border border-white/15 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all flex items-center justify-center gap-2"
                            >
                                <Download size={12} />
                            </button>
                        </div>
                    )}
                </nav>

                <div className="p-6">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 hover:text-red-400 border border-zinc-900 rounded-xl transition-all">
                        <LogOut size={14} /> Exit System
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col max-h-screen overflow-hidden">
                <header className="h-20 bg-[#030303]/80 backdrop-blur-xl border-b border-zinc-900 flex items-center justify-between px-10 z-10">
                    <div className="flex items-center bg-zinc-900/30 border border-zinc-800 px-4 py-2.5 rounded-2xl w-96 group focus-within:border-blue-500/50 transition-all">
                        <Search size={14} className="text-zinc-600 group-focus-within:text-blue-400" />
                        <input type="text" value={searchQuery} placeholder="Search across the galaxy..." className="bg-transparent border-none outline-none text-xs w-full ml-3 text-white placeholder:text-zinc-700" onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>

                    <div className="flex items-center gap-5">
                        <div className="text-right">
                            <p className="text-xs font-bold text-white uppercase tracking-tight">Dimas Aditya</p>
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.1em]">Root Admin</p>
                        </div>
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 flex items-center justify-center text-xs font-bold text-white shadow-xl">DA</div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-10 scrollbar-thin 
                    scrollbar-thumb-zinc-800 
                    scrollbar-track-transparent
                    [&::-webkit-scrollbar]:w-1
                    [&::-webkit-scrollbar-track]:bg-transparent
                    [&::-webkit-scrollbar-thumb]:bg-zinc-800
                    [&::-webkit-scrollbar-thumb]:rounded-full
                    hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/50">
                    {activeTab === 'insights' ? (
                        <div className="h-full max-h-[calc(100vh-180px)] w-full max-w-7xl mx-auto flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-700 overflow-hidden">

                            {/* Stats Grid - Tetap ringkas */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                                <StatCard icon={<Activity size={16} />} label="Traffic" value={data.totalTickets} color="text-white" />
                                <StatCard icon={<ShieldCheck size={16} />} label="Resolved" value="94%" color="text-emerald-400" />
                                <StatCard icon={<Zap size={16} />} label="AI Node" value="Online" color="text-blue-400" />
                                <StatCard icon={<Clock size={16} />} label="Latency" value="1.2s" color="text-purple-400" />
                            </div>

                            {/* Main Dashboard Area - Menggunakan flex-1 dan min-h-0 agar elastis */}
                            <div className="grid grid-cols-12 gap-6 flex-1 min-h-0 items-stretch">

                                {/* Chart Section */}
                                <div className="col-span-8 bg-zinc-950/40 border border-zinc-900 p-6 rounded-[2rem] flex flex-col min-h-0">
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2 shrink-0">
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span> Monthly Activity Matrix
                                    </h3>
                                    {/* Kontainer grafik yang akan otomatis menyesuaikan tinggi */}
                                    <div className="flex-1 w-full min-h-0">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={data.monthlyStats} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={10} tick={{ fill: '#52525b' }} dy={10} />
                                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#09090b', border: '1px solid #18181b', borderRadius: '12px' }} />
                                                <Bar dataKey="total" fill="#f66ff" radius={[6, 6, 6, 6]} barSize={12}>
                                                    {data.monthlyStats.map((entry: any, index: number) => (
                                                        <Cell key={`cell-${index}`} fill={index === data.monthlyStats.length - 1 ? '#3b82f6' : '#18181b'} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* Top Segments Section */}
                                <div className="col-span-4 bg-zinc-950/40 border border-zinc-900 p-6 rounded-[2rem] flex flex-col min-h-0">
                                    <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] mb-6 shrink-0">Top Segments</h3>
                                    <div className="flex flex-col justify-between flex-1 min-h-0 overflow-hidden">
                                        {data.categoryData.slice(0, 5).map((cat: any, i: number) => (
                                            <div key={i} className="flex flex-col justify-center">
                                                <div className="flex justify-between text-[11px] mb-2 font-bold tracking-tight uppercase">
                                                    <span className="text-zinc-400">{cat.name}</span>
                                                    <span className="text-white">{cat.count}</span>
                                                </div>
                                                <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-600 rounded-full"
                                                        style={{ width: `${(cat.count / data.categoryData[0].count) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="flex items-center justify-between mb-10">
                                <div>
                                    <h1 className="text-3xl font-bold text-white tracking-tighter">Neural Records</h1>
                                    <p className="text-zinc-500 text-sm mt-1 font-medium italic underline decoration-blue-500/30">Total of {tickets.length} nodes detected in system.</p>
                                </div>
                            </div>

                            <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2.5rem] overflow-hidden backdrop-blur-md shadow-2xl">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b border-zinc-900/50 text-left bg-white/[0.02]">
                                            <th className="pl-10 pr-6 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Neural Node / Client</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Priority</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Protocol Status</th>
                                            <th className="px-6 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Segment</th>
                                            <th className="pr-10 pl-6 py-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-right">Operation</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-900/40 ">
                                        {filteredTickets.map((t) => (
                                            <tr key={t.id} className="group hover:bg-white/[0.02] transition-all duration-300">
                                                <td className="pl-10 pr-6 py-7">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-11 h-11 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 text-zinc-500 group-hover:border-blue-500/50 group-hover:text-blue-500 transition-all">
                                                            <Hash size={18} />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            {/* DATA ASLI DARI DATABASE */}
                                                            <span className="text-sm font-bold text-white group-hover:text-blue-400 tracking-tight transition-colors">{t.title}</span>
                                                            <span className="text-[10px] font-medium text-zinc-600 mt-1 uppercase tracking-widest">{t.ticketCode}</span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Letakkan ini di dalam baris <tr> pada file tabel utama kamu */}
                                                <td className="px-6 py-7">
                                                    {/* Container dengan Border Tipis & Background Glassy */}
                                                    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-lg border transition-all duration-500 w-fit ${(t.priority?.toLowerCase() === 'tinggi' || t.priority?.toLowerCase() === 'high')
                                                        ? 'bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.1)]'
                                                        : (t.priority?.toLowerCase() === 'sedang' || t.priority?.toLowerCase() === 'medium')
                                                            ? 'bg-amber-500/10 border-amber-500/50 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]'
                                                            : 'bg-emerald-500/10 border-emerald-500/50 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                                                        }`}>
                                                        {/* Status Dot */}
                                                        <div className="relative flex items-center justify-center w-1.5 h-1.5">
                                                            {t.priority === 'Tinggi' && (
                                                                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-500/40" />
                                                            )}
                                                            <div className={`w-1.5 h-1.5 rounded-full relative z-10 ${t.priority === 'Tinggi' ? 'bg-red-500' :
                                                                t.priority === 'Sedang' ? 'bg-amber-500' :
                                                                    'bg-zinc-600'
                                                                }`} />
                                                        </div>

                                                        {/* Priority Text */}
                                                        <span className={`text-[9px] font-black tracking-[0.2em] uppercase ${t.priority === 'Tinggi' ? 'text-red-500/90' :
                                                            t.priority === 'Sedang' ? 'text-amber-500/90' :
                                                                'text-zinc-500'
                                                            }`}>
                                                            {t.priority || 'RENDAH'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* STATUS: Dinamis */}
                                                {/* Di dalam kolom Protocol Status pada tabel */}
                                                <td className="px-6 py-7">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1 h-1 rounded-full ${t.status === 'closed' ? 'bg-emerald-500' :
                                                            t.status === 'in_progress' ? 'bg-amber-500' : 'bg-red-500'
                                                            }`} />
                                                        <span className={`text-[10px] font-black tracking-widest ${t.status === 'closed' ? 'text-emerald-500' :
                                                            t.status === 'in_progress' ? 'text-amber-500' : 'text-red-500'
                                                            }`}>
                                                            {/* Mengubah nilai DB menjadi label UI */}
                                                            {t.status === 'closed' ? 'RESOLVED' :
                                                                t.status === 'in_progress' ? 'IN PROGRESS' : 'UNRESOLVED'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* SEGMENT: Dinamis */}
                                                <td className="px-6 py-7">
                                                    <span className={`px-4 py-1.5 border rounded-lg text-[9px] font-bold uppercase tracking-widest 
                                                         ${t.category?.categoryName ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-500'}`}>

                                                        {/* GUNAKAN categoryName, bukan name */}
                                                        {t.category?.categoryName || "Pending_Class"}
                                                    </span>
                                                </td>

                                                <td className="pr-10 pl-6 py-7 text-right">

                                                    <button
                                                        onClick={() => openDetail(t)}
                                                        className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:bg-white hover:text-black hover:border-white transition-all group/edit shadow-lg mr-4"
                                                        title="Open Interface"
                                                    >
                                                        <Edit3 size={16} className="group-hover/edit:rotate-12 transition-transform" />
                                                    </button>

                                                    <button
                                                        onClick={() => handleDelete(t.id)}
                                                        className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all group/del shadow-lg shadow-red-500/5"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={16} className="group-hover/del:scale-110 transition-transform" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* UPGRADED DETAIL MODAL */}
            {selectedTicket && (
                <div className="fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-300 ">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setSelectedTicket(null)}></div>
                    <div className="relative w-full max-w-5xl h-full bg-[#050505] border-l border-zinc-800 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-row animate-in slide-in-from-right duration-500">

                        <div className="flex-1 flex flex-col border-r border-zinc-900 bg-black/20">
                            {/* Area Bubble Chat (Scrollable) */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                {/* Pesan Awal User */}
                                {selectedTicket?.aiSuggestions && (
                                    <div className="mb-6 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 border-dashed relative group">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">
                                                    Neural Analysis Core
                                                </span>
                                            </div>

                                            {/* Masukkan VoiceController di sini */}
                                            <VoiceController textToSpeak={selectedTicket.aiSuggestions.aiSummary} />
                                        </div>

                                        <p className="text-sm text-zinc-300 italic leading-relaxed">
                                            "{selectedTicket.aiSuggestions.aiSummary}"
                                        </p>
                                    </div>
                                )}

                                {/* Histori Balasan (Map dari data balasanmu nanti) */}
                                {/* Area di mana chat seharusnya muncul */}
                                <div className="p-4 space-y-4">
                                    {/* Cari bagian ini di kode kamu */}

                                    {selectedTicket?.replies?.map((msg: any, index: number) => (
                                        <div key={index} className={`flex w-full mb-4 ${msg.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-lg ${msg.senderType === 'admin' ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-zinc-800/50 border border-zinc-700/50'}`}>
                                                <p className="text-[10px] uppercase opacity-50 mb-1">
                                                    {msg.senderType === 'admin' ? 'ADMIN_RESPONSE' : 'CLIENT_REQUEST'}
                                                </p>

                                                {/* TAMBAHKAN LOGIKA GAMBAR DI SINI */}
                                                {msg.attachment && (
                                                    <div className="mb-2 rounded-lg overflow-hidden border border-white/5 shadow-inner">
                                                        <img
                                                            src={msg.attachment}
                                                            alt="Neural Attachment"
                                                            className="max-w-full h-auto cursor-pointer hover:opacity-80 transition-opacity"
                                                            onClick={() => setSelectedImage(msg.attachment)}
                                                        />
                                                    </div>
                                                )}

                                                {/* PESAN TEKS */}
                                                {msg.message && <p className="text-sm text-zinc-100 leading-relaxed">{msg.message}</p>}

                                                {/* TIMESTAMP OPSIONAL */}
                                                <p className="text-[8px] mt-2 opacity-30 text-right">
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                    <div ref={chatEndRef} />
                                </div>
                            </div>

                            {/* Input Balasan (Icon Send Saja) */}
                            <div className="p-6 bg-zinc-950/50 border-t border-zinc-900">
                                <div className="relative group">
                                    {/* Preview Gambar (Muncul melayang di atas input jika ada file) */}
                                    {attachmentPreview && (
                                        <div className="absolute bottom-full left-0 mb-4 p-2 bg-zinc-900 border border-zinc-800 rounded-2xl animate-in fade-in slide-in-from-bottom-2">
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/10">
                                                <img src={attachmentPreview} alt="preview" className="w-full h-full object-cover" />
                                                <button
                                                    onClick={() => { setAttachment(null); setAttachmentPreview(null); }}
                                                    className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex items-end gap-2 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-2 focus-within:border-blue-500/50 transition-all">
                                        {/* Tombol Lampiran (Hidden Input) */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleFileChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="p-3 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <Paperclip size={20} />
                                        </button>

                                        {/* Input Text */}
                                        <textarea
                                            rows={1}
                                            placeholder="Type neural reply..."
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-white py-3 resize-none max-h-32"
                                            value={replyText} // Hubungkan ke state
                                            onChange={(e) => setReplyText(e.target.value)} // Update state saat mengetik
                                            onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement;
                                                target.style.height = 'inherit';
                                                target.style.height = `${target.scrollHeight}px`;
                                            }}
                                            onKeyDown={(e) => {
                                                // Jika tekan Enter tanpa Shift, kirim pesan
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendReply(); // Panggil fungsi kirim
                                                }
                                            }}
                                        />

                                        {/* Tombol Kirim */}
                                        <button
                                            onClick={handleSendReply}
                                            title="Send Reply" // Menghilangkan error "Buttons must have discernible text"
                                            aria-label="Send reply to ticket" // Standar aksesibilitas untuk screen reader
                                            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center"
                                        >
                                            <Send size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-[450px] flex flex-col bg-black">
                            <div className="p-8 border-b border-zinc-900 flex items-center justify-between bg-black/40 backdrop-blur-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-600/10 border border-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500">
                                        <BrainCircuit size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-white tracking-tighter">Node Analysis Center</h2>
                                        <p className="text-[10px] font-mono text-zinc-600 uppercase tracking-[0.2em] mt-0.5">Vector ID: {selectedTicket.id.toString().slice(-16)}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedTicket(null)} className="w-10 h-10 flex items-center justify-center bg-zinc-900 rounded-full text-zinc-500 hover:text-white transition-all">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-12 scrollbar-thin 
                            scrollbar-thumb-zinc-800 
                            scrollbar-track-transparent
                            [&::-webkit-scrollbar]:w-1
                            [&::-webkit-scrollbar-track]:bg-transparent
                            [&::-webkit-scrollbar-thumb]:bg-zinc-800
                            [&::-webkit-scrollbar-thumb]:rounded-full
                            hover:[&::-webkit-scrollbar-thumb]:bg-blue-500/50">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2"><User size={10} /> Requester</p>
                                        <p className="text-xs font-bold text-white truncate">#{selectedTicket.ticketCode}</p>
                                    </div>
                                    <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-2xl">
                                        <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-2 flex items-center gap-2"><Calendar size={10} /> Timestamp</p>
                                        <p className="text-xs font-bold text-white uppercase">{new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <section>
                                    <div className="bg-zinc-900/40 border-l-2 border-blue-600 p-8 rounded-tr-3xl rounded-br-3xl">
                                        <h3 className="text-lg font-bold text-white mb-4 tracking-tight leading-snug">{selectedTicket.title}</h3>
                                        <p className="text-sm text-zinc-400 leading-relaxed font-medium">"{selectedTicket.description}"</p>
                                    </div>
                                </section>

                                {selectedTicket?.attachment && (
                                    <div className="mb-6 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                            <Eye size={12} className="text-blue-500" /> Neural Visual Feed
                                        </label>

                                        <div
                                            className="relative group overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-2 min-h-[150px] flex items-center justify-center cursor-zoom-in"
                                            onClick={() => setIsPreviewOpen(true)} // Klik untuk perbesar
                                        >
                                            <img
                                                src={selectedTicket.attachment}
                                                alt="Ticket Evidence"
                                                className="w-full h-auto max-h-[350px] object-contain rounded-xl transition-transform duration-500 group-hover:scale-[1.02] z-10"
                                            />

                                            {/* Overlay Hover */}
                                            <div className="absolute inset-0 bg-blue-600/0 transition-colors z-20 flex items-center justify-center">
                                                <Maximize2 size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </div>

                                            {isAnalyzing && (
                                                <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                                                    <div className="w-full h-[2px] bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan opacity-70"></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                )}

                                <section className="space-y-8 ">
                                    <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">AI Processing Engine</h4>
                                        <button onClick={handleAskAI} disabled={isAnalyzing} className="flex items-center gap-3 px-5 py-2.5 bg-blue-600/10 border border-blue-600/20 text-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all disabled:opacity-30">
                                            <Zap size={14} className={isAnalyzing ? "animate-pulse" : "fill-current"} />
                                            {isAnalyzing ? "Computing..." : "Run Neural Sync"}
                                        </button>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="relative group">
                                            <div className="flex items-center justify-between mb-3">
                                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block">
                                                    Problem Abstract / Answer
                                                </label>

                                                <VoiceController textToSpeak={editableData.summary || ""} />
                                            </div>
                                            <textarea
                                                value={editableData.summary}
                                                onChange={(e) => setEditableData({ ...editableData, summary: e.target.value })}
                                                className="w-full bg-black border border-zinc-800 rounded-2xl p-6 text-sm focus:border-blue-600 outline-none transition-all min-h-[160px] text-zinc-300 placeholder:text-zinc-800 font-medium leading-relaxed [&::-webkit-scrollbar]:pointer-events-none
                                            [&::-webkit-scrollbar]:hidden
                                            [-ms-overflow-style:none] 
                                            [scrollbar-width:none]"
                                                placeholder="System waiting for neural sync..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                                    <Layers size={12} /> Segment Analysis
                                                </label>

                                                <div className="relative ">
                                                    {/* Toggle Button */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                                                        className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl px-6 py-4 flex items-center justify-between group/btn hover:border-blue-500/50 transition-all shadow-2xl"
                                                    >
                                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">
                                                            {/* 3. PERBAIKAN: Tampilkan label berdasarkan status.id yang terpilih */}
                                                            {editableData.status === 'open' ? 'UNRESOLVED' :
                                                                editableData.status === 'in_progress' ? 'IN PROGRESS' :
                                                                    editableData.status === 'closed' ? 'RESOLVED' : 'SELECT STATUS'}
                                                        </span>
                                                        <ChevronRight size={14} className={`text-zinc-500 transition-transform duration-300 ${isCategoryOpen ? 'rotate-90 text-blue-500' : ''}`} />
                                                    </button>

                                                    {/* Dropdown List Status */}
                                                    {isCategoryOpen && (
                                                        <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-[#080808] border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-2xl">
                                                            {[
                                                                { id: 'open', label: 'UNRESOLVED', color: 'bg-red-500' },
                                                                { id: 'in_progress', label: 'IN PROGRESS', color: 'bg-amber-500' },
                                                                { id: 'closed', label: 'RESOLVED', color: 'bg-emerald-500' },
                                                            ].map((status) => (
                                                                <button
                                                                    key={status.id}
                                                                    onClick={() => {
                                                                        // Mengirim status.id ('open', 'in_progress', atau 'closed') ke database
                                                                        setEditableData({ ...editableData, status: status.id });
                                                                        setIsCategoryOpen(false);
                                                                    }}
                                                                    className={`w-full flex flex-col items-start p-4 rounded-xl transition-all mb-1 last:mb-0 group/item ${editableData.status === status.id ? 'bg-white/[0.05]' : 'hover:bg-white/[0.02]'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2">
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${status.color} ${editableData.status === status.id ? 'shadow-[0_0_8px_rgba(255,255,255,0.3)]' : 'opacity-40'}`} />
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${editableData.status === status.id ? 'text-white' : 'text-zinc-500'
                                                                            }`}>
                                                                            {status.label}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                                    <Activity size={12} /> Priority Level
                                                </label>

                                                <div className="relative group">
                                                    {/* Toggle Button (Tampilan saat dropdown tertutup) */}
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                                                        className="w-full bg-zinc-900/40 backdrop-blur-xl border border-zinc-800 rounded-2xl px-6 py-4 flex items-center justify-between group/btn hover:border-blue-500/50 transition-all shadow-2xl"
                                                    >
                                                        <span className="text-[11px] font-black text-white uppercase tracking-widest">
                                                            {editableData.priority === 'Tinggi' ? 'Tinggi' :
                                                                editableData.priority === 'Sedang' ? 'Sedang' : 'Rendah'}
                                                        </span>
                                                        <ChevronRight size={14} className={`text-zinc-500 transition-transform duration-300 ${isPriorityOpen ? 'rotate-90 text-blue-500' : ''}`} />
                                                    </button>

                                                    {/* Custom neural Dropdown List (Tampilan saat terbuka) */}
                                                    {isPriorityOpen && (
                                                        <div className="absolute top-full left-0 right-0 mt-3 p-2 bg-[#080808] border border-zinc-800 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-top-2 duration-200 backdrop-blur-2xl">
                                                            {[
                                                                { id: 'Rendah', label: 'Rendah' },
                                                                { id: 'Sedang', label: 'Sedang' },
                                                                { id: 'Tinggi', label: 'Tinggi' }
                                                            ].map((opt) => (
                                                                <button
                                                                    key={opt.id}
                                                                    onClick={() => {
                                                                        setEditableData({ ...editableData, priority: opt.id });
                                                                        setIsPriorityOpen(false);
                                                                    }}
                                                                    className={`w-full flex flex-col items-start p-3 rounded-xl transition-all mb-2 last:mb-0 group/item ${editableData.priority === opt.id
                                                                        ? 'bg-blue-600/10 border border-blue-500/20'
                                                                        : 'hover:bg-white/[0.03] border border-transparent hover:border-zinc-800'
                                                                        }`}
                                                                >
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <div className={`w-1.5 h-1.5 rounded-full ${editableData.priority === opt.id ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-zinc-700'
                                                                            }`} />
                                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${editableData.priority === opt.id ? 'text-blue-400' : 'text-zinc-400'
                                                                            }`}>
                                                                            {opt.label}
                                                                        </span>
                                                                    </div>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <div className="p-7 border-t border-zinc-900 bg-black/60 backdrop-blur-xl">
                                <button onClick={handleSaveChanges} className="w-full py-5 bg-white text-black rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98] shadow-2xl">
                                    Commit Change Record
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Full Image Preview Modal */}
                    {isPreviewOpen && (
                        <div
                            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-10 animate-in fade-in duration-200"
                            onClick={() => setIsPreviewOpen(false)}
                        >
                            <button
                                className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors"
                                onClick={() => setIsPreviewOpen(false)}
                            >
                                <X size={40} strokeWidth={1} />
                            </button>

                            <img
                                src={selectedTicket.attachment}
                                alt="Full Evidence"
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
                            />

                            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-900/80 border border-zinc-800 rounded-full text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                                Neural_Analysis_Mode: Full_Frame_View
                            </div>
                        </div>
                    )}

                    {selectedImage && (
                        <div
                            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-80 p-4 outline-none"
                            onClick={() => setSelectedImage(null)} // Klik di mana saja untuk menutup
                        >
                            <div className="relative max-w-4xl w-full flex justify-center">
                                <img
                                    src={selectedImage}
                                    alt="Enlarged"
                                    className="max-h-[90vh] object-contain rounded-md shadow-2xl"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color, icon }: { label: string, value: any, color: string, icon: React.ReactElement }) {
    return (
        <div className="bg-zinc-950/40 border border-zinc-900 rounded-[2rem] p-7 hover:border-zinc-700 transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                {React.cloneElement(icon, { size: 80 } as any)}
            </div>
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2.5 bg-zinc-900 rounded-xl text-zinc-600 group-hover:text-blue-500 transition-colors">
                    {icon}
                </div>
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">{label}</span>
            </div>
            <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
        </div>
    );
}
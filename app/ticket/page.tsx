"use client";
import React, { useState, useRef } from 'react';
import { X, Upload, ChevronLeft, ChevronDown, Layers, Code, CreditCard, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import ReCAPTCHA from "react-google-recaptcha";
import { Toaster, toast } from 'sonner';
import styles from './ticket.module.css';
import { createTicket } from './action';
import { useRouter } from 'next/navigation';

export default function TicketPage() {
  const router = useRouter();
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState("");
  const [fileName, setFileName] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const url = URL.createObjectURL(file); // Buat URL sementara
      setPreviewUrl(url);
    }
  };

  const clearFile = () => {
    setFileName("");
    setPreviewUrl(null);
    const fileInput = document.getElementById('file') as HTMLInputElement;
    if (fileInput) fileInput.value = ""; // Reset input file-nya juga
  };

  const categories = [
    { id: '1', label: 'UI/UX Bug'},
    { id: '2', label: 'Software' },
    { id: '3', label: 'Hardware' },
    { id: '4', label: 'Other'},
  ];

  async function handleSubmit(formData: FormData) {
    setIsSending(true);

    const token = recaptchaRef.current?.getValue();

    if (!token) {
      toast.error('Verifikasi Dibutuhkan', {
        description: 'Tolong lengkapi CAPTCHA.',
      });
      setIsSending(false);
      return;
    }

    const toastId = toast.loading('Sedang mengirim tiket...');
    const result = await createTicket(formData, token);

    if (result.success) {
      // Notifikasi Berhasil yang Modern
      toast.success('Tiket Terkirim!', {
        id: toastId, // Mengganti loading toast tadi
        description: `Tiket Kode: ${result.data.ticketCode}`,
        duration: 3000,
      });

      // Tunggu sebentar lalu pindah halaman
      setTimeout(() => {
        router.push(`/results/${result.data.ticketCode}`);
      }, 2000);

    } else {
      setIsSending(false);
      recaptchaRef.current?.reset();
      toast.error('Gagal Mengirim', {
        id: toastId,
        description: 'Cek koneksi kamu!',
      });
    }
  }

  return (
    <div className={styles.background}>
      <Toaster
        theme="dark"
        position="top-center"
        richColors
        toastOptions={{
          className: "my-custom-toast",
          style: {
            background: 'rgba(255, 255, 255, 0.05)', // Transparan
            backdropFilter: 'blur(10px)',            // Efek blur kaca
            WebkitBackdropFilter: 'blur(10px)',      // Dukungan Safari
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
          },
        }}
      />

      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <Link href="/" className="fixed top-5 left-4 z-50 flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-xs uppercase tracking-[0.2em]">
          <ChevronLeft size={14} /> Back
        </Link>

        <div className={styles.glassCard}>
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight">Buat Tiket</h1>
            <p className="text-zinc-500 text-xs">Isi data ini untuk membantu kami meneliti masalah anda</p>
          </header>

          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            handleSubmit(formData);
          }}
            className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.inputBox}>
                <label>Nama</label>
                <input type="text" name="name" placeholder="Your Name" required />
              </div>
              <div className={styles.inputBox}>
                <label>Email Aktif</label>
                <input type="email" name='email' placeholder="name@email.com" required />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={styles.inputBox}>
                <label>Masalah</label>
                <input type="text" name="subject" placeholder="Brief title" required />
              </div>

              {/* Custom Category Dropdown */}
              <div className={styles.inputBox}>
                <label>Kategori</label>
                <div className="relative">
                  <div
                    onClick={() => setIsOpen(!isOpen)}
                    className={`${styles.customSelect} ${isOpen ? styles.active : ''}`}
                  >
                    <span className={category ? "text-white" : "text-zinc-600"}>
                      {category ? categories.find(c => c.id === category)?.label : "Select category"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-zinc-500`}
                    />
                  </div>

                  {isOpen && (
                    <div className={styles.dropdownMenu}>
                      {categories.map((item) => (
                        <div
                          key={item.id}
                          className={styles.dropdownItem}
                          onClick={() => {
                            setCategory(item.id);
                            setIsOpen(false);
                          }}
                        >
                          <span className="text-zinc-500"></span>
                          {item.label}
                        </div>
                      ))}
                    </div>
                  )}
                  <input type="hidden" name="category" value={category} required />
                </div>
              </div>
            </div>

            <div className={styles.inputBox}>
              <label>Deskripsi</label>
              <textarea name="description" rows={3} placeholder="Tell us what happened..." className="resize-none"></textarea>
            </div>

            <div className="flex justify-center py-2 overflow-hidden">
              <div className="scale-[0.85] sm:scale-100 origin-center">
                <ReCAPTCHA
                  ref={recaptchaRef}
                  theme="dark" // Agar cocok dengan UI kamu yang dark
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""}
                />
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <div className={styles.fileButton}>
                <input type="file" name="attachment" id="file" className="hidden" onChange={handleFileChange}
                  accept="image/*" />
                {!fileName ? (
                  <label htmlFor="file" className="cursor-pointer flex items-center gap-2">
                    <Upload size={14} /> Pilih Gambar
                  </label>
                ) : (
                  <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10 transition-all">
                    {/* Nama File - Klik langsung buka gambar */}
                    <button
                      type="button"
                      onClick={() => setShowModal(true)}
                      className="text-xs text-zinc-300 hover:text-white truncate max-w-[120px]"
                      title="Click to preview image"
                    >
                      {fileName}
                    </button>

                    {/* Pemisah Kecil */}
                    <div className="w-[1px] h-3 bg-white/10 mx-1"></div>

                    {/* Tombol Silang buat Hapus */}
                    <button
                      type="button"
                      onClick={clearFile}
                      className="text-zinc-500 hover:text-red-400 transition-colors p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" disabled={isSending} className={styles.btnSubmit}>
                 {isSending ? "Memproses..." : "Kirim Tiket"}
              </button>
            </div>
          </form>
        </div>
      </div>
      {/* MODAL PREVIEW - Klik Luar untuk Tutup */}
      {showModal && previewUrl && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md cursor-zoom-out"
          onClick={() => setShowModal(false)} // Klik area overlay/luar untuk tutup
        >
          <div className="relative max-w-4xl w-full flex flex-col items-center">
            <div
              className="relative cursor-default"
              onClick={(e) => e.stopPropagation()} // Mencegah klik pada gambar ikut menutup modal
            >
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-[85vh] w-auto rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 object-contain animate-in zoom-in-95 duration-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
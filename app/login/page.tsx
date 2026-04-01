"use client";
import style from './login.module.css';
import { Mail, Lock, ChevronLeft } from "lucide-react";
import { loginAction } from "./action";
import { useState } from "react";
import { toast, Toaster } from "sonner";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {

    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleLogin(formData: FormData) {
        setIsPending(true);

        const toastId = toast.loading('Memverifikasi...'); // Munculkan loading dulu biar keren
        const result = await loginAction(formData);

        if (result?.success) {
            toast.success('Akses Didapatkan', {
                id: toastId, // Ganti loading tadi jadi success
                description: 'Selamat datang di dashboard admin',
                duration: 2000,
            });

            // Pindah ke dashboard setelah 2 detik
            setTimeout(() => {
                router.push("/dashboard_admin");
            }, 2000);
        } else {
            setIsPending(false);
            toast.error('Akses Ditolak', {
                id: toastId, // Ganti loading tadi jadi error
                description: result?.error || 'Email atau Password salah',
            });
        }
    }

    return (
        <div className={style.loginContainer}>
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-xs uppercase tracking-[0.2em] z-10">
                <ChevronLeft size={14} /> Back
            </Link>
            <Toaster
                theme="dark"
                position="top-center"
                richColors
                toastOptions={{
                    style: {
                        background: 'rgba(255, 255, 255, 0.05)', // Transparan tipis
                        backdropFilter: 'blur(10px)',           // Efek kaca blur
                        WebkitBackdropFilter: 'blur(10px)',     // Support Safari
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '16px',
                        color: '#fff',
                    },
                }}
            />
            <div className={style.loginBackground}>
                <main className={style.loginWrapper}>
                    <div className={style.loginCard}>
                        <div className={style.header}>
                            <div className={style.logo}>
                                <div className={style.logoIcon}></div>
                            </div>
                            <h1 className={style.loginTitle}>Login Akun</h1>
                            <p className={style.loginSubtitle}>Masuk ke Dashboard Admin dengan Akun yang Sudah Ada</p>
                        </div>

                        <form action={handleLogin} className={style.form}>
                            <div className={style.inputGroup}>
                                <Mail className={style.icon} size={20} />
                                <input type="email" name="email" placeholder="Email Address" required />
                            </div>

                            <div className={style.inputGroup}>
                                <Lock className={style.icon} size={20} />
                                <input type="password" name="password" placeholder="Password" required />
                            </div>

                            <button type="submit" disabled={isPending} className={style.loginBtn}>
                                {isPending ? "Memproses..." : "Masuk"}
                            </button>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
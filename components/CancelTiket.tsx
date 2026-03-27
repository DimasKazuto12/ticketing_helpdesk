"use client";
import { Trash2 } from "lucide-react";
import { cancelTicketAction } from "@/app/action";
import styles from "@/app/results/[code]/results.module.css";
import { toast, Toaster } from "sonner";

export default function CancelTicketButton({ ticketId }: { ticketId: number }) {
  const handleCancel = async () => {
    toast.warning("ABORT PROTOCOL", {
      description: "Yakin ingin membatalkan tiket?",
      duration: Infinity, // Agar notif tidak hilang sendiri sebelum dijawab
      action: {
        label: "IYA",
        onClick: async () => {
          const toastId = toast.loading("Sedang menghapus data...");
          try {
            const result = await cancelTicketAction(ticketId);
            if (result?.error) {
              toast.error("Gagal", { description: result.error, id: toastId });
            } else {
              toast.success("Berhasil", { description: "Tiket telah dibatalkan.", id: toastId });
            }
          } catch (error) {
            toast.error("Sistem Error", { id: toastId });
          }
        },
      },
      cancel: {
        label: "TIDAK",
        onClick: () => toast.dismiss(),
      },
    });
  };

  return (
    <>
      <Toaster theme="dark" position="top-center" toastOptions={{
        className: "my-custom-toast",
        style: {
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          color: '#fff',
        },
      }}/>
      <button onClick={handleCancel} className={styles.cancelBtn}>
        <Trash2 size={14} />
        <span>BATALKAN</span>
      </button>
    </>
  );
}
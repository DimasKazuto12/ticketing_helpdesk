import React from 'react';
import { Activity, ChevronLeft } from 'lucide-react';
import styles from './results.module.css';
import Link from 'next/link';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
// Import komponen chat yang baru dibuat
import ChatInterface from '@/components/chat'; 

async function getTicketData(code: string) {
  const ticket = await prisma.ticket.findUnique({
    where: { ticketCode: code },
    include: { 
      category: true,
      aiSuggestions: true,
      replies: {
        orderBy: { createdAt: 'asc' } // Ambil semua balasan yang sudah ada di DB
      }
    }
  });
  return ticket;
}

export default async function ProfessionalTicketResults({ params }: { params: { code: string } }) {
  const resolvedParams = await params;
  const code = resolvedParams.code;
  const ticket = await getTicketData(code);

  if (!ticket) {
    notFound();
  }

  return (
    <div className={styles.appContainer}>
      {/* 1. TOP NAVBAR */}
      <nav className={styles.navbar}>
        <div className={styles.navLeft}>
          <div className={styles.systemBadge}>
            <Activity size={14} className="text-blue-500 animate-pulse" />
            <span>DISTALK PROTOCOL v.2.0</span>
          </div>
        </div>
        <div className={styles.navRight}>
          <div className={styles.trackingChip}>
            <span className={styles.chipLabel}>TRACKING ID</span>
            <span className={styles.chipValue}>{ticket.ticketCode}</span>
          </div>
        </div>
      </nav>

      <main className={styles.workspace}>
        {/* 2. SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.statusSection}>
            <div className={styles.badgeWrapper}>
              <span className={`${styles.statusBadge} ${ticket.status === 'open' ? styles.statusOpen : styles.statusClosed}`}>
                {ticket.status.toUpperCase()}
              </span>
              <span className={styles.priorityBadge}>
                {ticket.priority.toUpperCase()}
              </span>
            </div>
            <h1 className={styles.ticketTitle}>{ticket.title}</h1>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <label>CATEGORY</label>
              <p>{ticket.category?.categoryName || 'General Support'}</p>
            </div>
            <div className={styles.detailItem}>
              <label>TIMESTAMP</label>
              <p>{new Date(ticket.createdAt).toLocaleString('id-ID')}</p>
            </div>
          </div>

          <div className={styles.descriptionBox}>
            <label>REPORTED ISSUE</label>
            <p>{ticket.description}</p>
          </div>

          <Link href="/track_ticket" className={styles.backButton}>
            <ChevronLeft size={16} /> <span>KELUAR</span>
          </Link>
        </aside>

        {/* 3. CENTER AREA (CHAT INTERFACE) */}
        {/* Kita ganti seluruh section chat lama dengan komponen ChatInterface.
           Kirimkan ID tiket, deskripsi awal, dan balasan yang sudah ada di DB.
        */}
        <ChatInterface 
          ticketId={ticket.id} 
          initialDescription={ticket.description} 
          existingReplies={ticket.replies}
          aiSummary={ticket.aiSuggestions?.aiSummary}
          ticketStatus={ticket.status}
        />
      </main>
    </div>
  );
}
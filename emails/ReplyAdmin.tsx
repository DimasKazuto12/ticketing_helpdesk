import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button
} from "@react-email/components";
import * as React from "react";

// Perhatikan: Kita ganti 'title' menjadi 'replyMessage'
export const AdminReplyEmail = ({ ticketCode, replyMessage }: { ticketCode: string, replyMessage: string }) => (
  <Html>
    <Head />
    <Preview>Admin telah membalas tiket Anda [{ticketCode}]</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>DISTALK PROTOCOL</Text>
        </Section>
        <Heading style={h1}>Ada Balasan Baru</Heading>
        <Text style={text}>
          Halo, Admin kami baru saja menanggapi laporan Anda <strong>{ticketCode}</strong>:
        </Text>
        
        {/* Box untuk menampilkan cuplikan pesan dari admin */}
        <Section style={messageBox}>
          <Text style={messageLabel}>PESAN DARI ADMIN:</Text>
          <Text style={messageContent}>{replyMessage}</Text>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={`${process.env.NEXT_RESPONSIVE_URL}/results/${ticketCode}`}>
            Lihat & Balas Chat
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          ID Tiket: {ticketCode} | Silakan klik tombol di atas untuk masuk ke ruang percakapan.
        </Text>
      </Container>
    </Body>
  </Html>
);

// --- STYLING ---
const main = { backgroundColor: "#f6f9fc", fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif' };
const container = { backgroundColor: "#ffffff", borderRadius: "8px", margin: "0 auto", padding: "40px", maxWidth: "600px" };
const header = { borderBottom: "1px solid #eee", marginBottom: "20px" };
const logo = { fontSize: "14px", fontWeight: "bold", color: "#3b82f6", letterSpacing: "1px" };
const h1 = { color: "#1a1a1a", fontSize: "22px", fontWeight: "bold" };
const text = { color: "#444", fontSize: "16px", lineHeight: "24px" };
const messageBox = { background: "#f8fafc", borderLeft: "4px solid #3b82f6", padding: "15px 20px", margin: "20px 0" };
const messageLabel = { fontSize: "11px", fontWeight: "bold", color: "#64748b", marginBottom: "8px" };
const messageContent = { fontSize: "15px", color: "#1e293b", margin: "0", fontStyle: "italic" };
const buttonContainer = { textAlign: "center" as const, margin: "30px 0" };
const button = { backgroundColor: "#2563eb", borderRadius: "5px", color: "#fff", fontSize: "15px", fontWeight: "bold", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px" };
const hr = { borderColor: "#eeeeee", margin: "30px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
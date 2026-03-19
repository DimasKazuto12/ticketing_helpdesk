import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button, Link
} from "@react-email/components";
import * as React from "react";

export const TicketCreatedEmail = ({ ticketCode, title }: { ticketCode: string, title: string }) => (
  <Html>
    <Head />
    <Preview>Laporan Anda dengan kode {ticketCode} telah diterima.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={logo}>DISTALK PROTOCOL</Text>
        </Section>
        <Heading style={h1}>Tiket Berhasil Dibuat</Heading>
        <Text style={text}>
          Halo, laporan Anda mengenai <strong>"{title}"</strong> telah berhasil kami terima dalam sistem.
        </Text>
        
        <Section style={codeBox}>
          <Text style={codeLabel}>NOMOR TIKET UNIK ANDA</Text>
          <Text style={codeValue}>{ticketCode}</Text>
        </Section>

        <Section style={buttonContainer}>
          <Button style={button} href={`${process.env.NEXT_PUBLIC_APP_URL}/track_ticket`}>
            Lacak Status Tiket
          </Button>
        </Section>

        <Text style={text}>
          Simpan nomor tiket ini untuk memantau perkembangan laporan Anda. Anda akan menerima email lagi jika admin memberikan balasan.
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          Ini adalah email otomatis. Mohon tidak membalas email ini secara langsung.
        </Text>
      </Container>
    </Body>
  </Html>
);

// --- STYLING (In-line CSS untuk Email) ---
const main = { backgroundColor: "#f6f9fc", fontFamily: 'HelveticaNeue,Helvetica,Arial,sans-serif' };
const container = { backgroundColor: "#ffffff", border: "1px solid #e1e1e1", borderRadius: "8px", margin: "0 auto", padding: "40px", maxWidth: "600px" };
const header = { borderBottom: "1px solid #eee", marginBottom: "20px" };
const logo = { fontSize: "14px", fontWeight: "bold", color: "#3b82f6", letterSpacing: "1px" };
const h1 = { color: "#1a1a1a", fontSize: "24px", fontWeight: "bold", margin: "30px 0" };
const text = { color: "#444", fontSize: "16px", lineHeight: "26px" };
const codeBox = { background: "#f4f4f5", borderRadius: "4px", padding: "20px", textAlign: "center" as const, margin: "20px 0" };
const codeLabel = { fontSize: "12px", color: "#71717a", margin: "0 0 5px 0" };
const codeValue = { fontSize: "32px", fontWeight: "bold", color: "#18181b", letterSpacing: "4px", margin: "0" };
const buttonContainer = { textAlign: "center" as const, margin: "30px 0" };
const button = { backgroundColor: "#2563eb", borderRadius: "5px", color: "#fff", fontSize: "16px", fontWeight: "bold", textDecoration: "none", textAlign: "center" as const, display: "block", padding: "12px" };
const hr = { borderColor: "#eeeeee", margin: "40px 0" };
const footer = { color: "#8898aa", fontSize: "12px", textAlign: "center" as const };
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button, Link, Img
} from "@react-email/components";
import * as React from "react";

export const TicketCreatedEmail = ({ ticketCode, title }: { ticketCode: string, title: string }) => (
  <Html>
    <Head />
    <Preview>Mission Control: Tiket {ticketCode} Berhasil Diverifikasi</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Glow Top Accent */}
        <Section style={topAccent} />

        <Section style={header}>
          <Text style={logo}>
            <span style={logoIcon}>◈</span> DISTALK <span style={logoBold}>PROTOCOL</span>
          </Text>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>System Entry Confirmed</Heading>
          <Text style={text}>
            Halo, laporan Anda mengenai <span style={highlight}>"{title}"</span> telah berhasil di-enkripsi dan masuk ke dalam antrean prioritas kami.
          </Text>
          
          <Section style={codeBox}>
            <Text style={codeLabel}>UNIQUE ACCESS KEY</Text>
            <Text style={codeValue}>{ticketCode}</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_RESPONSIVE_URL}/track_ticket`}>
              INITIALIZE TRACKING
            </Button>
          </Section>

          <Text style={subText}>
            Gunakan akses kunci di atas untuk memantau status sistem. Anda akan menerima notifikasi otomatis jika ada pembaruan dari Neural Core kami.
          </Text>
        </Section>

        <Hr style={hr} />
        
        <Section style={footerSection}>
          <Text style={footerText}>
            © 2026 Distalk Protocol — Automated Intelligence Response
          </Text>
          <Text style={footerSubText}>
            Security Level: Class-A Encrypted System
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// --- FUTURISTIC STYLING ---
const main = {
  backgroundColor: "#09090b", // Dark Zinc
  fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#18181b", // Darker Zinc
  border: "1px solid #27272a",
  borderRadius: "16px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden",
};

const topAccent = {
  background: "linear-gradient(to right, #3b82f6, #8b5cf6)",
  height: "6px",
  width: "100%",
};

const header = {
  padding: "30px",
  textAlign: "center" as const,
};

const logo = {
  fontSize: "16px",
  color: "#a1a1aa",
  letterSpacing: "3px",
  margin: "0",
};

const logoBold = { color: "#ffffff", fontWeight: "bold" };
const logoIcon = { color: "#3b82f6", marginRight: "8px" };

const contentSection = { padding: "0 40px 40px 40px" };

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "20px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
};

const text = {
  color: "#a1a1aa",
  fontSize: "16px",
  lineHeight: "28px",
  textAlign: "center" as const,
};

const highlight = { color: "#60a5fa", fontWeight: "bold" };

const codeBox = {
  background: "linear-gradient(145deg, #27272a 0%, #18181b 100%)",
  border: "1px border-solid #3f3f46",
  borderRadius: "12px",
  padding: "30px",
  textAlign: "center" as const,
  margin: "30px 0",
};

const codeLabel = {
  fontSize: "11px",
  color: "#71717a",
  letterSpacing: "2px",
  margin: "0 0 10px 0",
  fontWeight: "bold",
};

const codeValue = {
  fontSize: "36px",
  fontWeight: "bold",
  color: "#ffffff",
  letterSpacing: "8px",
  margin: "0",
  fontFamily: "monospace",
};

const buttonContainer = { textAlign: "center" as const, margin: "35px 0" };

const button = {
  backgroundColor: "#3b82f6",
  backgroundImage: "linear-gradient(to right, #2563eb, #3b82f6)",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
};

const subText = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "22px",
  textAlign: "center" as const,
  fontStyle: "italic",
};

const hr = { borderColor: "#27272a", margin: "0" };

const footerSection = { padding: "30px", backgroundColor: "#0f0f12" };

const footerText = {
  color: "#52525b",
  fontSize: "12px",
  textAlign: "center" as const,
  margin: "0",
};

const footerSubText = {
  color: "#3f3f46",
  fontSize: "10px",
  textAlign: "center" as const,
  marginTop: "5px",
  letterSpacing: "1px",
};
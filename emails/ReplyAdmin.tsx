import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text, Button
} from "@react-email/components";
import * as React from "react";

export const AdminReplyEmail = ({ ticketCode, replyMessage }: { ticketCode: string, replyMessage: string }) => (
  <Html>
    <Head />
    <Preview>Response Detected: Admin telah menanggapi tiket Anda [{ticketCode}]</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Glow Top Accent - Sesuai dengan desain sebelumnya */}
        <Section style={topAccent} />

        <Section style={header}>
          <Text style={logo}>
            <span style={logoIcon}>◈</span> DISTALK <span style={logoBold}>PROTOCOL</span>
          </Text>
        </Section>

        <Section style={contentSection}>
          <Heading style={h1}>Balasan Terbaru</Heading>
          
          <Text style={text}>
            Sistem kami mendeteksi balasan baru dari Admin untuk tiket dengan enkripsi ID: <span style={highlight}>{ticketCode}</span>
          </Text>
          
          {/* Futuristic Message Box */}
          <Section style={messageBox}>
            <Text style={messageLabel}>ENCRYPTED MESSAGE CONTENT</Text>
            <Text style={messageContent}>"{replyMessage}"</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button style={button} href={`${process.env.NEXT_RESPONSIVE_URL}/results/${ticketCode}`}>
              OPEN SECURE CHANNEL
            </Button>
          </Section>

          <Text style={subText}>
            Klik tombol di atas untuk masuk ke ruang percakapan terenkripsi dan memberikan respons balik.
          </Text>
        </Section>

        <Hr style={hr} />
        
        <Section style={footerSection}>
          <Text style={footerText}>
            © 2026 Distalk Protocol — Neural Response Interface
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

// --- FUTURISTIC STYLING (MATCHING THE THEME) ---
const main = {
  backgroundColor: "#09090b",
  fontFamily: '"Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#18181b",
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
  fontSize: "26px",
  fontWeight: "bold",
  textAlign: "center" as const,
  margin: "20px 0",
  textTransform: "uppercase" as const,
  letterSpacing: "2px",
};

const text = {
  color: "#a1a1aa",
  fontSize: "15px",
  lineHeight: "26px",
  textAlign: "center" as const,
};

const highlight = { color: "#60a5fa", fontWeight: "bold", fontFamily: "monospace" };

const messageBox = {
  background: "linear-gradient(145deg, #27272a 0%, #1c1c1f 100%)",
  borderLeft: "4px solid #3b82f6",
  borderRadius: "0 12px 12px 0",
  padding: "25px",
  margin: "30px 0",
};

const messageLabel = {
  fontSize: "10px",
  color: "#71717a",
  letterSpacing: "2px",
  margin: "0 0 12px 0",
  fontWeight: "bold",
};

const messageContent = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#e4e4e7",
  margin: "0",
  fontStyle: "italic",
};

const buttonContainer = { textAlign: "center" as const, margin: "35px 0" };

const button = {
  backgroundColor: "#3b82f6",
  backgroundImage: "linear-gradient(to right, #2563eb, #3b82f6)",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "13px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 32px",
  letterSpacing: "1px",
  boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
};

const subText = {
  color: "#71717a",
  fontSize: "13px",
  lineHeight: "20px",
  textAlign: "center" as const,
};

const hr = { borderColor: "#27272a", margin: "0" };

const footerSection = { padding: "30px", backgroundColor: "#0f0f12" };

const footerText = {
  color: "#52525b",
  fontSize: "11px",
  textAlign: "center" as const,
  margin: "0",
};
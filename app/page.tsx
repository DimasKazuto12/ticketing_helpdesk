"use client";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Search, User, Github, Facebook, Linkedin, Cpu, ShieldCheck, Headphones } from "lucide-react";
import Link from "next/link";
import style from './home.module.css';

function ParallaxUniverse() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Background Nebula (Gerak pelan)
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);

  // Elemen 3D / Ring (Gerak lebih cepat ke atas)
  const elementY = useTransform(scrollYProgress, [0, 1], ["150px", "-150px"]);
  const elementScale = useTransform(scrollYProgress, [0, 1], [0.8, 1.1]);
  const elementRotate = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  return (
    <section ref={ref} className={style.parallaxSection}>
      <div className={style.parallaxWindow}>
        {/* Lapisan 1: Background Nebula */}
        <motion.div
          style={{ y: backgroundY }}
          className={style.customDimension}
        >
          <div className={style.nebulaSpotWhite}></div>
          <div className={style.nebulaSpotBlue}></div>
          <div className={style.starsPattern}></div>

          <div className={style.twinklingStar} style={{ top: '20%', left: '15%' }}></div>
          <div className={style.twinklingStar} style={{ top: '60%', left: '80%' }}></div>
          <div className={style.twinklingStar} style={{ top: '40%', left: '45%', animationDelay: '1s' }}></div>

          <div className={style.shootingStarSmall}></div>
          <div className={style.shootingStarMedium}></div>
          <div className={style.shootingStarLarge}></div>
        </motion.div>

        <motion.div
          style={{ y: elementY, scale: elementScale, rotate: elementRotate }}
          className={style.parallaxElement}
        >
          <img src="/image/kimi.png" alt="3D Background" />
        </motion.div>
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className={style.container}>
      <div className={style.background}>
        <div className={style.starsLayerSmall}></div>
        <div className={style.starsLayerMedium}></div>
        <div className={style.starsLayerLarge}></div>

        {/* NAVBAR DENGAN EFEK GLASSMORPHISM */}
        <nav className={style.nav}>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className={style.iconContainer}>
              <img src="/image/icon.png" alt="icon" className={style.navIcon} />
            </div>
          </div>

          <div className="flex items-center gap-4 mr-7">
            <Link href="/login" className="no-underline">
              <button className="text-sm font-medium text-gray-400 hover:text-white transition">Log in</button>
            </Link>
            <User className="w-5 h-5 cursor-pointer text-white opacity-70 hover:opacity-100 transition" />
          </div>
        </nav>

        {/* MAIN HERO CONTENT */}
        <main className={style.konten}>
          <h1 className={style.title}>
            Menyelesaikan Masalah Teknologi<br />
            <span className="text-gray-500">Dengan Cepat</span>
          </h1>

          <p className={style.subtitle}>
            Dikerjakan oleh orang yang berbakat dan hebat di
            bidangnya secara cepat dan pasti tuntas
          </p>

          <div className="flex flex-row sm:flex-row gap-4 relative z-20">
            <Link href="/ticket" className="bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              Ticket
            </Link>
            <Link href="/track_ticket" className="flex items-center gap-2 border border-neutral-800 bg-black/40 backdrop-blur-md px-6 py-3 rounded-full font-bold hover:bg-neutral-900 transition-all active:scale-95">
              {/* Ikon Search dibuat putih agar monokrom */}
              <Search className="w-5 h-5 text-white opacity-80" />
              <span className="text-white">Cari Ticket</span>
            </Link>
          </div>
        </main>
      </div>

      <section className={style.benefitsSection}>
        <div className="mb-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">
            Kenapa Memilih Kami?
          </h2>
        </div>

        <div className={style.benefitsGrid}>
          <div className={style.benefitCard}>
            <div className={style.iconWrapper}>
              <div className={style.iconGlowBody}></div>
              <Cpu size={24} className="relative z-10 text-white opacity-90" />
            </div>
            <h3>AI Solution</h3>
            <p>
              Gunakan teknologi kecerdasan buatan untuk menjawab tiket bantuan secara otomatis dan akurat dalam hitungan detik.
            </p>
          </div>

          <div className={style.benefitCard}>
            <div className={style.iconWrapper}>
              <div className={style.iconGlowBody}></div>
              <Headphones size={24} className="relative z-10 text-white opacity-90" />
            </div>
            <h3>Operator 24 Jam</h3>
            <p>
              Tim dukungan profesional kami siap sedia membantu kendala Anda kapan saja, siang maupun malam tanpa henti.
            </p>
          </div>

          <div className={style.benefitCard}>
            <div className={style.iconWrapper}>
              <div className={style.iconGlowBody}></div>
              <ShieldCheck size={24} className="relative z-10 text-white opacity-90" />
            </div>
            <h3>Keamanan Terjamin</h3>
            <p>
              Data dan privasi perusahaan Anda dilindungi dengan enkripsi tingkat militer dan protokol keamanan yang ketat.
            </p>
          </div>

        </div>
      </section>

      <ParallaxUniverse />

      <section className={style.testiSection}>
        <div className={style.testiHeader}>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-white mb-4">Testimoni</h2>
        </div>

        <div className={style.testiGrid}>
          {/* Testimoni 1 */}
          <div className={style.testiCard}>
            <div className={style.testiUser}>
              <img
                src="/image/bill_gates.jpg"
                alt="Bill Gates"
                className={style.userAvatar}
              />
              <div>
                <h4 className="text-white font-bold text-sm">Bill Gates</h4>
                <p className="text-gray-500 text-xs">CO-Founded, Microsoft</p>
              </div>
            </div>
            <p className={style.testiText}>
              "Implementasi AI-nya sangat presisi. Membantu kami mengelola infrastruktur data seolah-olah tanpa hambatan gravitasi."
            </p>
          </div>

          {/* Testimoni 2 */}
          <div className={style.testiCard}>
            <div className={style.testiUser}>
              <img
                src="/image/elon_musk.jpg"
                alt="Elon Musk"
                className={style.userAvatar}
              />
              <div>
                <h4 className="text-white font-bold text-sm">Elon Musk</h4>
                <p className="text-gray-500 text-xs">Leadership, X</p>
              </div>
            </div>
            <p className={style.testiText}>
              "Desain sistemnya benar-benar futuristik. Performa website kami naik drastis setelah integrasi dengan Distalk."
            </p>
          </div>

          {/* Testimoni 3 */}
          <div className={style.testiCard}>
            <div className={style.testiUser}>
              <img
                src="https://investidorsardinha.r7.com/wp-content/uploads/2021/08/larry-page-2048x1365.jpeg"
                alt="Larry Page"
                className={style.userAvatar}
              />
              <div>
                <h4 className="text-white font-bold text-sm">Larry Page</h4>
                <p className="text-gray-500 text-xs">CO-Founded, Google</p>
              </div>
            </div>
            <p className={style.testiText}>
              "Keamanan datanya luar biasa. Enkripsi yang mereka gunakan sekuat tarikan lubang hitam, tak ada yang bisa lolos."
            </p>
          </div>

          <div className={style.testiCard}>
            <div className={style.testiUser}>
              <img
                src="https://s.yimg.com/ny/api/res/1.2/XII_1UdgwTutW_P56yvikw--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEyMDA7aD05MDA-/https://media.zenfs.com/en/business_insider_articles_888/72ea8683ae377aa8c309f10e4ab89800"
                alt="Mark Zuckerberg"
                className={style.userAvatar}
              />
              <div>
                <h4 className="text-white font-bold text-sm">Mark Zuckerberg</h4>
                <p className="text-gray-500 text-xs">CEO, Facebook</p>
              </div>
            </div>
            <p className={style.testiText}>
              "Keamanan datanya luar biasa. Enkripsi yang mereka gunakan sekuat tarikan lubang hitam, tak ada yang bisa lolos."
            </p>
          </div>
        </div>
      </section>

      <footer className={style.modernFooter}>
        <div className={style.footerGlowLine}></div>

        <div className={style.footerMainContent}>
          {/* SISI KIRI: LOGO & TAGLINE */}
          <div className={style.footerBrand}>
            <img
              src="/image/icon.png"
              alt="Distalk Logo"
              width={180} // Ukuran diperbesar agar lebih jelas
              height={52}
              className={style.footerLogoImg}
            />
            <p className={style.footerTagline}>BERSAMA SELESAIKAN MASALAH</p>
          </div>

          {/* SISI KANAN: SOSIAL MEDIA (Dirapatkan ke arah kiri sedikit) */}
          <div className={style.footerSocial}>
            <a href="#" className={style.socialLink}><Facebook size={22} strokeWidth={1.5} /></a>
            <a href="#" className={style.socialLink}><Github size={22} strokeWidth={1.5} /></a>
            <a href="#" className={style.socialLink}><Linkedin size={22} strokeWidth={1.5} /></a>
          </div>
        </div>

        <div className={style.footerBottomStrip}>
          <div className="flex items-center gap-4">
            <span className={style.copyright}>© 2026 DISTALK LABS</span>
            <div className={style.systemStatus}>
              <div className={style.statusPulse}></div>
              <span>SISTEM OPERASIONAL</span>
            </div>
          </div>
          <div className={style.legalLinks}>
            <span>PRIVACY</span>
            <span>TERMS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
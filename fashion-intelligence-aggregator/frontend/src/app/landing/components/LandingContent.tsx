"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Footer } from "./Footer";
import { LandingImage } from "./LandingImage";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   Animation Variants
   ═══════════════════════════════════════════════════════════════════════════ */

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardHover = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
};

// Fashion-only images (Unsplash)
const FASHION_IMAGES: Record<string, string> = {
  hero: "1441984904996-e0b6ba687e04",
  problem: "1546213290-e1b492ab3eee",
  solution: "1556909114-f6e7ad7d3136",
  goals: "1490481651871-ab68de25d43d",
  chat: "1515886657613-9f3515b0c78f",
  personalize: "1558618666-fcd25c85cd64",
  shopping: "1472851294608-062f824d29cc",
  tryon: "1531746020798-e6953c6e8e04",
  recs: "1445205170230-053b83016050",
  tech: "1509631179647-0177331693ae",
};

const IMG = (id: string, w = 800) => {
  const photoId = FASHION_IMAGES[id] || FASHION_IMAGES.hero;
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&q=80`;
};

/* ═══════════════════════════════════════════════════════════════════════════
   Sub-Components
   ═══════════════════════════════════════════════════════════════════════════ */

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 dark:bg-accent/20 text-accent text-xs font-semibold uppercase tracking-widest">
      {children}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
      {children}
    </h2>
  );
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl">
      {children}
    </p>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  index,
}: {
  icon: string;
  title: string;
  description: string;
  index: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={fadeInUp}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={cardHover}
      className="group relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-elevation-2 hover:shadow-elevation-4 hover:border-accent/30 dark:hover:border-accent/30 transition-all duration-500"
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-accent/5 via-transparent to-violet/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="relative mb-6 w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/10 to-violet/10 dark:from-accent/20 dark:to-violet/20 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <div className="relative">
        <h3 className="font-headline font-semibold text-xl text-zinc-900 dark:text-white mb-3">
          {title}
        </h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
          {description}
        </p>
      </div>
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

function StepCard({ step, title, index }: { step: number; title: string; index: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col items-center text-center"
    >
      <div className="relative mb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-accent flex items-center justify-center text-white font-bold text-lg shadow-button group-hover:shadow-button-hover transition-shadow duration-300">
          {step}
        </div>
        <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-accent/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      <p className="text-sm sm:text-base font-medium text-zinc-800 dark:text-zinc-200 max-w-[140px]">
        {title}
      </p>
    </motion.div>
  );
}

function StatItem({ value, label, index }: { value: string; label: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className="text-center"
    >
      <div className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-gradient mb-2">
        {value}
      </div>
      <div className="text-sm text-zinc-400 uppercase tracking-wider font-medium">
        {label}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════════════════ */

export function LandingContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const statsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((el) => {
        gsap.to(el, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 1.5 },
        });
      });
      gsap.utils.toArray<HTMLElement>(".reveal-scale").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.95, opacity: 0.5 },
          { scale: 1, opacity: 1, duration: 1, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", end: "top 50%", scrub: 1 } }
        );
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[var(--bg)]">
      {/* HERO SECTION */}
      <section ref={heroRef} className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <LandingImage src={IMG("hero", 1920)} alt="" fill className="object-cover" sizes="100vw" priority />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-900/50 via-zinc-950/80 to-fuchsia-900/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-zinc-950/40" />
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeroInView ? { opacity: 0.4, scale: 1.2 } : {}}
            transition={{ duration: 2.5, ease: "easeOut" }}
          >
            <div className="w-[min(90vw,36rem)] h-[min(90vw,36rem)] rounded-full bg-gradient-accent opacity-20 blur-[100px] animate-pulse-glow" />
          </motion.div>
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        <motion.div style={{ opacity: heroOpacity, scale: heroScale }} className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={isHeroInView ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2, duration: 0.6 }}>
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              AI-Powered Fashion Intelligence
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight mb-6"
          >
            <span className="block">The Universal Intelligence Layer for</span>
            <span className="text-gradient bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              Digital Reality.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg sm:text-xl md:text-2xl text-zinc-300/90 max-w-3xl mx-auto leading-relaxed mb-10"
          >
            Bridging the $100B gap between digital intent and physical fit. From AI-powered fashion concierges to immersive 1:1 spiritual guides, we build the spatial engine that powers the next generation of commerce and culture.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/login"
              className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-zinc-900 font-semibold text-lg shadow-elevation-4 hover:shadow-elevation-5 transition-all duration-300 hover:-translate-y-1"
            >
              <span>Start Exploring</span>
              <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </Link>
            <Link
              href="/personalize"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
            >
              Personalize Your Style
            </Link>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2">
            <motion.div className="w-1 h-2 rounded-full bg-white/60" animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
          </div>
        </motion.div>
      </section>

      {/* GROUND ZERO: PROBLEM & SOLUTION CARDS */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-[var(--bg)] overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-16 sm:mb-20">
            <motion.div variants={fadeInUp}><SectionBadge>Ground Zero</SectionBadge></motion.div>
            <motion.div variants={fadeInUp} className="mt-6"><SectionTitle>The Problem & Solution</SectionTitle></motion.div>
            <motion.p variants={fadeInUp} className="mt-4 text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">
              One spatial engine. Three domains.
            </motion.p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: "🛒", title: "The Retail Bottleneck", description: "Static shopping is broken. We replace guesswork with 'Fit Certainty' using a 5-parameter neural engine—Visual, Fit, Movement, Lighting, and Risk." },
              { icon: "🌐", title: "The Immersive Future", description: "Beyond retail. Our spatial engine creates 1:1 digital twins for Hajj, Umrah, and Global Tourism—preparing users for reality before they even land." },
              { icon: "🏗️", title: "The Precision Auditor", description: "Construction redefined. Leveraging BIM and AI-vision to reduce rework and synchronize site data in real-time." },
            ].map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* CONCIERGE FEATURE BREAKDOWN — Timeline / editorial list (unique layout) */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--tw-gradient-stops))] from-transparent via-violet-500/[0.02] to-transparent dark:via-violet-400/[0.03]" />
        <div className="relative mx-auto max-w-4xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-20 sm:mb-24">
            <motion.div variants={fadeInUp}><SectionBadge>Concierge</SectionBadge></motion.div>
            <motion.div variants={fadeInUp} className="mt-6">
              <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white leading-[1.1] tracking-tight">
                Your Personal Fashion Architect.
              </h2>
            </motion.div>
          </motion.div>

          {/* Vertical timeline: line + nodes + content */}
          <div className="relative">
            <div className="absolute left-[19px] sm:left-6 top-0 bottom-0 w-px bg-gradient-to-b from-accent/40 via-violet-400/30 to-transparent" />
            {[
              { num: "01", title: "Multi-Brand Aggregation", description: "Shop Zara, H&M, and luxury labels in a single, unified interface." },
              { num: "02", title: "Neural Styling Assistant", description: "A personal stylist that knows your budget, your body, and your occasion." },
              { num: "03", title: "Photorealistic VTON", description: "Don't just see the clothes; see yourself wearing them in any lighting." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-40px" }}
                variants={fadeInUp}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative flex gap-6 sm:gap-8 pb-16 last:pb-0 group"
              >
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-full border-2 border-accent/50 dark:border-accent/60 bg-[var(--bg)] dark:bg-zinc-900 flex items-center justify-center font-mono text-sm font-bold text-accent group-hover:border-accent group-hover:bg-accent/10 dark:group-hover:bg-accent/20 transition-colors duration-300 z-10">
                    {feature.num}
                  </div>
                </div>
                <div className="flex-1 min-w-0 pt-0.5 pl-0">
                  <h3 className="font-headline font-semibold text-xl sm:text-2xl text-zinc-900 dark:text-white mb-2 group-hover:text-accent dark:group-hover:text-accent transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-[var(--bg)] overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="space-y-8">
              <motion.div variants={fadeInUp}><SectionBadge>The Problem</SectionBadge></motion.div>
              <motion.div variants={fadeInUp}><SectionTitle>Fashion shopping is broken</SectionTitle></motion.div>
              <motion.div variants={fadeInUp}>
                <SectionDescription>
                  Endless scrolling across multiple sites. Generic recommendations that don't understand your body or style. No way to visualize how clothes actually look on you.
                </SectionDescription>
              </motion.div>
              <motion.ul variants={staggerContainer} className="space-y-4">
                {["Scattered shopping across dozens of sites", "Recommendations that miss your unique style", "No way to try before you buy online", "Size confusion and fit uncertainty", "Decision fatigue from too many choices"].map((item) => (
                  <motion.li key={item} variants={fadeInUp} className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                    </span>
                    <span className="text-zinc-700 dark:text-zinc-300">{item}</span>
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevation-5 reveal-scale">
                <LandingImage src={IMG("problem", 800)} alt="Shopping confusion" fill className="object-cover parallax-img" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/30 to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-2xl bg-gradient-accent opacity-20 blur-2xl" />
              <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-violet/20 blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 to-zinc-950" />
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div ref={statsRef} className="relative mx-auto max-w-6xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {[{ value: "1", label: "Concierge" }, { value: "5+", label: "Countries" }, { value: "∞", label: "Styles" }, { value: "AI", label: "Try-On" }].map((stat, i) => (
              <StatItem key={stat.label} value={stat.value} label={stat.label} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 hero-gradient" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative order-2 lg:order-1">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevation-5 reveal-scale">
                <LandingImage src={IMG("solution", 800)} alt="One app solution" fill className="object-cover parallax-img" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/30 to-transparent" />
              </div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }} className="absolute -bottom-6 -right-6 sm:bottom-8 sm:right-8 p-4 sm:p-6 rounded-2xl glass-strong shadow-elevation-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center text-white">✨</div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">AI-Powered</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Personalized for you</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="space-y-8 order-1 lg:order-2">
              <motion.div variants={fadeInUp}><SectionBadge>The Solution</SectionBadge></motion.div>
              <motion.div variants={fadeInUp}><SectionTitle>One app. Infinite possibilities.</SectionTitle></motion.div>
              <motion.div variants={fadeInUp}>
                <SectionDescription>
                  We bring chat, personalization, live shopping, virtual try-on, and smart recommendations into a single seamless experience. You talk, we understand, and together we find your perfect style.
                </SectionDescription>
              </motion.div>
              <motion.div variants={fadeInUp} className="pt-4">
                <Link href="/chat" className="btn-primary">Try It Now →</Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="relative mx-auto max-w-7xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16 sm:mb-20">
            <motion.div variants={fadeInUp}><SectionBadge>Our Mission</SectionBadge></motion.div>
            <motion.div variants={fadeInUp} className="mt-6"><SectionTitle>What we're building</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: "🌐", title: "Democratize Discovery", description: "Make personalized fashion advice and virtual try-on accessible to every shopper, everywhere." },
              { icon: "⚡", title: "Reduce Decision Fatigue", description: "One intelligent assistant that truly understands your fit, style, and budget preferences." },
              { icon: "🔗", title: "Bridge Online & Real", description: "Real products from real merchants, with AI-powered guidance and virtual try-on technology." },
            ].map((feature, i) => (
              <FeatureCard key={feature.title} {...feature} index={i} />
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.8 }} className="mt-16 relative aspect-[21/9] rounded-3xl overflow-hidden shadow-elevation-5">
            <LandingImage src={IMG("goals", 1400)} alt="Fashion goals" fill className="object-cover" sizes="100vw" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 via-transparent to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-950 dark:to-zinc-900" />
        <div className="absolute inset-0 bg-dots opacity-30 dark:opacity-20" />
        <div className="relative mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16 sm:mb-20">
            <motion.div variants={fadeInUp}><SectionBadge>How It Works</SectionBadge></motion.div>
            <motion.div variants={fadeInUp} className="mt-6"><SectionTitle>Five simple steps</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-8 sm:gap-4">
            {["Chat with the concierge", "Set your profile & style", "Search real products", "Try on virtually", "Get personalized picks"].map((step, i) => (
              <StepCard key={step} step={i + 1} title={step} index={i} />
            ))}
          </div>
          <div className="hidden sm:block absolute top-[calc(50%+60px)] left-[15%] right-[15%] h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>
      </section>

      {/* AUDIENCE SECTION */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="relative mx-auto max-w-6xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-12">
            <motion.div variants={fadeInUp}><SectionBadge>Who It's For</SectionBadge></motion.div>
            <motion.div variants={fadeInUp} className="mt-6"><SectionTitle>Built for modern shoppers</SectionTitle></motion.div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {["Shoppers seeking one place for discovery", "Style enthusiasts who care about fit", "Anyone wanting to try before buying", "Users who prefer AI over endless filters"].map((item) => (
              <motion.div key={item} variants={fadeInUp} className="p-6 rounded-2xl bg-white dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/50 text-center hover:border-accent/30 transition-colors duration-300">
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FEATURE SHOWCASE SECTIONS */}
      {[
        { badge: "Feature", title: "AI fashion concierge", description: "Chat naturally about fit, budget, occasion, style, fabric, or try-on. Our AI understands context and provides relevant, actionable recommendations with citations.", image: "chat", reverse: false },
        { badge: "Feature", title: "Your profile, your style", description: "Your measurements, fit preferences, budget, occasions, fabrics, and style tags all power a personalized experience across chat, recommendations, and try-on.", image: "personalize", reverse: true },
        { badge: "Feature", title: "Live shopping search", description: "Search real products via Google Shopping across India, US, UK, UAE, and Canada. See prices, merchants, and open store links or trigger try-on directly.", image: "shopping", reverse: false },
        { badge: "Feature", title: "Virtual try-on", description: "Upload your photo once. Pick any product from search, and see an AI-generated image of you wearing it. Make confident decisions before you buy.", image: "tryon", reverse: true },
        { badge: "Feature", title: "Smart recommendations", description: "Products ranked by your unique style and occasion tags. Every recommendation explains why it matches, so you can trust and explore with confidence.", image: "recs", reverse: false },
      ].map((section) => (
        <section key={section.title} className={`relative py-24 sm:py-32 px-4 sm:px-6 ${section.reverse ? "bg-zinc-50 dark:bg-zinc-900/50" : ""}`}>
          <div className="relative mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className={`space-y-6 ${section.reverse ? "lg:order-2" : ""}`}>
                <motion.div variants={fadeInUp}><SectionBadge>{section.badge}</SectionBadge></motion.div>
                <motion.div variants={fadeInUp}><SectionTitle>{section.title}</SectionTitle></motion.div>
                <motion.div variants={fadeInUp}><SectionDescription>{section.description}</SectionDescription></motion.div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: section.reverse ? -50 : 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className={section.reverse ? "lg:order-1" : ""}>
                <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevation-5">
                  <LandingImage src={IMG(section.image, 800)} alt={section.title} fill className="object-cover parallax-img" sizes="(max-width: 768px) 100vw, 50vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/20 to-transparent" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      ))}

      {/* TESTIMONIALS */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="relative mx-auto max-w-5xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={fadeInUp}><SectionBadge>Testimonials</SectionBadge></motion.div>
            <motion.div variants={fadeInUp} className="mt-6"><SectionTitle>What people are saying</SectionTitle></motion.div>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { quote: "Finally, one place to chat, search, and try on. The concierge actually understands my style preferences.", author: "Happy Shopper" },
              { quote: "Recommendations that actually match what I'm looking for. No more endless scrolling through irrelevant results.", author: "Style Enthusiast" },
            ].map((testimonial, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="testimonial-card">
                <p className="text-lg text-zinc-700 dark:text-zinc-300 italic leading-relaxed">"{testimonial.quote}"</p>
                <p className="mt-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">— {testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6">
        <div className="relative mx-auto max-w-3xl">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="text-center mb-16">
            <motion.div variants={fadeInUp}><SectionBadge>FAQ</SectionBadge></motion.div>
            <motion.div variants={fadeInUp} className="mt-6"><SectionTitle>Common questions</SectionTitle></motion.div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="space-y-4">
            {[
              { q: "Is this free to use?", a: "Yes! You can chat, personalize, search, and try on. Some advanced features may have usage limits." },
              { q: "Where do products come from?", a: "Live search uses Google Shopping so you see real products and prices from actual merchants." },
              { q: "How does virtual try-on work?", a: "Upload a profile photo once. When you pick a product, we use AI to generate an image of you wearing it." },
              { q: "Is my data saved?", a: "Your profile (measurements, preferences, style) is stored to keep recommendations personal. Clear anytime in Settings." },
            ].map((faq) => (
              <motion.div key={faq.q} variants={fadeInUp} className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/50 hover:border-accent/30 transition-colors duration-300">
                <h3 className="font-headline font-semibold text-zinc-900 dark:text-white mb-2">{faq.q}</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* TECH STACK */}
      <section className="relative py-24 sm:py-32 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="relative mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-elevation-5">
                <LandingImage src={IMG("tech", 800)} alt="Technology stack" fill className="object-cover parallax-img" sizes="(max-width: 768px) 100vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/30 to-transparent" />
              </div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="space-y-6">
              <motion.div variants={fadeInUp}><SectionBadge>Technology</SectionBadge></motion.div>
              <motion.div variants={fadeInUp}><SectionTitle>Built for scale & reliability</SectionTitle></motion.div>
              <motion.div variants={fadeInUp}>
                <SectionDescription>
                  Next.js frontend, Express backend, MongoDB for profiles, optional Redis for chat history. Gemini AI for chat and try-on, SerpAPI for live shopping, AWS S3 for images. Responsive, accessible, and ready for millions.
                </SectionDescription>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative py-32 sm:py-40 px-4 sm:px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-violet/10 to-fuchsia/10 dark:from-accent/20 dark:via-violet/15 dark:to-fuchsia/15" />
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="relative mx-auto max-w-3xl text-center">
          <h2 className="font-headline text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-900 dark:text-white tracking-tight mb-6">
            Ready to transform your <span className="text-gradient">shopping experience</span>?
          </h2>
          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto">
            Open the concierge and discover fashion that's truly personalized for you.
          </p>
          <Link href="/chat" className="btn-primary text-lg">Start Your Journey →</Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

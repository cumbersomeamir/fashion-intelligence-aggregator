"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Footer } from "./Footer";
import { LandingImage } from "./LandingImage";

gsap.registerPlugin(ScrollTrigger);

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const sectionReveal = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" as const },
  transition: { duration: 0.7 },
};

const cardHover = { scale: 1.02, transition: { duration: 0.2 } };
const cardTap = { scale: 0.98 };

// Fashion-only images (Unsplash). LandingImage shows gradient fallback on error.
const FASHION_IMAGES: Record<string, string> = {
  hero: "1441984904996-e0b6ba687e04",           // fashion store interior
  problem: "1558769132-cb1aea913002",            // clothing rack / retail
  solution: "1556909114-f6e7ad7d3136",           // fashion retail
  goals: "1490481651871-ab68de25d43d",           // clothing / style
  chat: "1515886657613-9f3515b0c78f",            // woman fashion / style
  personalize: "1558618666-fcd25c85cd64",       // wardrobe / closet
  shopping: "1472851294608-062f824d29cc",        // fashion shopping
  tryon: "1531746020798-e6953c6e8e04",          // fashion portrait
  recs: "1445205170230-053b83016050",            // apparel / clothing
  tech: "1509631179647-0177331693ae",            // fashion / style
};
const IMG = (id: string, w = 800) => {
  const photoId = FASHION_IMAGES[id] || FASHION_IMAGES.hero;
  return `https://images.unsplash.com/photo-${photoId}?w=${w}&q=80`;
};

export function LandingContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });
  const problemSectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((el) => {
        gsap.to(el, {
          yPercent: -20,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
      gsap.utils.toArray<HTMLElement>(".reveal-scale").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.92, opacity: 0.3 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              end: "top 50%",
              scrub: 1,
            },
          }
        );
      });
      if (statsRef.current) {
        gsap.fromTo(
          statsRef.current.querySelectorAll(".stat-num"),
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.15,
            scrollTrigger: {
              trigger: statsRef.current,
              start: "top 80%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* —— 1. Hero —— */}
      <section
        ref={heroRef}
        className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <LandingImage
              src={IMG("hero", 1920)}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/40 via-zinc-950/75 to-fuchsia-600/40" />
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeroInView ? { opacity: 0.2, scale: 1.15 } : {}}
            transition={{ duration: 2, ease: "easeOut" }}
          >
            <div className="w-[min(80vw,28rem)] h-[min(80vw,28rem)] rounded-full bg-accent/30 blur-[80px]" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-zinc-200 text-sm font-medium mb-6"
          >
            B2C • AI-Powered Fashion
          </motion.span>
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight drop-shadow-lg">
            Fashion Intelligence
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-zinc-200/95 max-w-2xl mx-auto leading-relaxed">
            Your AI fashion concierge. Personalize, search real products, try on virtually, and get recommendations—all in one place.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="mt-10"
          >
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-white font-semibold text-lg shadow-xl shadow-accent/40 hover:bg-accent/90 hover:shadow-accent/50 transition-all duration-300 hover:scale-105 active:scale-100"
            >
              Try it instantly →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* —— 2. Problem (redesigned) —— */}
      <section
        ref={problemSectionRef}
        className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-zinc-100 to-white dark:from-zinc-900/60 dark:to-zinc-950"
      >
        <motion.div
          {...sectionReveal}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 lg:gap-16 items-center"
        >
          <div className="space-y-6">
            <motion.span
              variants={item}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-accent font-semibold text-sm uppercase tracking-widest"
            >
              The problem
            </motion.span>
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
              The problem we solve
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              Shoppers waste time jumping between stores, filters, and guesswork. Outfits don’t match body type or style.
              Virtual try-on is rare, and recommendations feel generic—not personal.
            </p>
            <motion.ul
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="space-y-4"
            >
              {[
                "Scattered shopping across many sites",
                "No single place for fit, style, and budget",
                "Generic recommendations",
                "Little or no virtual try-on",
                "No AI assistant for fashion",
              ].map((text, i) => (
                <motion.li
                  key={text}
                  variants={item}
                  className="flex items-center gap-3 text-zinc-700 dark:text-zinc-300"
                >
                  <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
                  {text}
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <motion.div
            className="relative h-[340px] sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl reveal-scale parallax-img border border-zinc-200/50 dark:border-zinc-700/50"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <LandingImage
              src={IMG("problem", 800)}
              alt="Shopping confusion"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* —— 3. Stats (NEW) —— */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-zinc-900 text-white">
        <div ref={statsRef} className="mx-auto max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
          {[
            { num: "1", label: "Concierge" },
            { num: "5+", label: "Countries" },
            { num: "∞", label: "Styles" },
            { num: "AI", label: "Try-on" },
          ].map(({ num, label }) => (
            <div key={label} className="stat-num text-center">
              <div className="font-headline text-4xl sm:text-5xl font-bold text-accent">{num}</div>
              <div className="mt-1 text-sm text-zinc-400 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* —— 4. Solution —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.08),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />
        <motion.div
          {...sectionReveal}
          className="relative mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[340px] sm:h-[440px] rounded-3xl overflow-hidden shadow-2xl parallax-img border border-zinc-200/50 dark:border-zinc-700/50">
            <LandingImage
              src={IMG("solution", 800)}
              alt="One app solution"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Our solution</span>
            <h2 className="font-headline text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-900 dark:text-white leading-tight">
              One app. One concierge.
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              We bring chat, personalization, live shopping search, virtual try-on, and smart recommendations into a single B2C experience.
              You talk, we personalize—and you discover and try on with confidence.
            </p>
          </div>
        </motion.div>
      </section>

      {/* —— 5. Goals (cards with hover) —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div {...sectionReveal} className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Mission</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-2">
              Our goals
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Democratize discovery", desc: "Make personalized fashion advice and try-on available to every shopper.", icon: "🌐" },
              { title: "Reduce decision fatigue", desc: "One assistant that knows your fit, style, and budget.", icon: "⚡" },
              { title: "Bridge online and real", desc: "Real products, real merchants, AI-powered guidance and try-on.", icon: "🔗" },
            ].map((goal, i) => (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.5 }}
                whileHover={cardHover}
                whileTap={cardTap}
                className="p-7 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg shadow-zinc-200/50 dark:shadow-none hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 transition-shadow"
              >
                <span className="text-3xl mb-4 block">{goal.icon}</span>
                <h3 className="font-headline font-semibold text-xl text-zinc-900 dark:text-white">{goal.title}</h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">{goal.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div
            className="mt-12 relative h-[260px] sm:h-[320px] rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-700"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <LandingImage src={IMG("goals", 1200)} alt="Goals" fill className="object-cover" sizes="100vw" />
          </motion.div>
        </motion.div>
      </section>

      {/* —— 6. How it works (timeline style) —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-100 dark:from-zinc-950 dark:to-zinc-900/80" />
        <motion.div {...sectionReveal} className="relative mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Flow</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-2">
              How it works
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-8 sm:gap-4">
            {[
              "Chat with the concierge",
              "Set your profile & style",
              "Search real products",
              "Try on virtually",
              "Get ranked recommendations",
            ].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                className="flex-1 flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-accent/30 group-hover:shadow-accent/50 transition-shadow">
                  {i + 1}
                </div>
                <p className="mt-3 text-sm font-medium text-zinc-900 dark:text-white max-w-[140px]">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* —— 7. Who it's for (NEW) —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div {...sectionReveal} className="mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Audience</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-2">
              Who it’s for
            </h2>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              "Shoppers who want one place for discovery",
              "People who care about fit and style",
              "Anyone who wants to try before buying",
              "Users who prefer talking to an AI over filters",
            ].map((text, i) => (
              <motion.div
                key={text}
                variants={item}
                className="p-5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center"
              >
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* —— 8. Feature: AI Concierge —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <motion.div
          {...sectionReveal}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          <div className="space-y-5">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Feature</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              AI fashion concierge
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              Chat in natural language about fit, budget, occasion, style, fabric, comparison, or try-on.
              Topic-aware responses and citations keep answers relevant and actionable.
            </p>
          </div>
          <div className="relative h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 parallax-img">
            <LandingImage src={IMG("chat", 800)} alt="AI Concierge" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
      </section>

      {/* —— 9. Feature: Personalization —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          {...sectionReveal}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50">
            <LandingImage src={IMG("personalize", 800)} alt="Personalization" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Feature</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Your profile, your style
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              Measurements, fit preference, sleeve and length, budget tier, occasions, fabric preferences, climate,
              favorite brands, and style tags. One profile powers chat, recommendations, and try-on.
            </p>
          </div>
        </motion.div>
      </section>

      {/* —— 10. Feature: Live Shopping —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <motion.div
          {...sectionReveal}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          <div className="space-y-5">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Feature</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Live shopping search
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              Search real products via Google Shopping (SerpAPI). Choose country (India, US, UK, UAE, Canada),
              see prices and merchants, and open store links or trigger try-on from results.
            </p>
          </div>
          <div className="relative h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 parallax-img">
            <LandingImage src={IMG("shopping", 800)} alt="Live shopping" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
      </section>

      {/* —— 11. Feature: Virtual Try-On —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          {...sectionReveal}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50">
            <LandingImage src={IMG("tryon", 800)} alt="Virtual try-on" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Feature</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Virtual try-on
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              Upload your photo once. Pick a product from search—we generate a “you wearing it” image with AI (Gemini).
              See the result on the chat page and visit the store when you’re ready.
            </p>
          </div>
        </motion.div>
      </section>

      {/* —— 12. Feature: Recommendations —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <motion.div
          {...sectionReveal}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          <div className="space-y-5">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Feature</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Smart recommendations
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              Products ranked by your style and occasion tags. “Why recommended” explains matches so you
              can trust the order and explore the catalog with confidence.
            </p>
          </div>
          <div className="relative h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50 parallax-img">
            <LandingImage src={IMG("recs", 800)} alt="Recommendations" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
      </section>

      {/* —— 13. Testimonials (NEW) —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div {...sectionReveal} className="mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Social proof</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-2">
              What people say
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { quote: "Finally one place to chat, search, and try on. The concierge gets my style.", who: "— Shopper" },
              { quote: "Recommendations actually match my preferences. No more endless scrolling.", who: "— Style seeker" },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-lg"
              >
                <p className="text-zinc-700 dark:text-zinc-300 italic">"{t.quote}"</p>
                <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{t.who}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* —— 14. FAQ (NEW) —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6">
        <motion.div {...sectionReveal} className="mx-auto max-w-3xl">
          <div className="text-center mb-14">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Help</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white mt-2">
              FAQ
            </h2>
          </div>
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              { q: "Is this free to use?", a: "Yes. You can chat, personalize, search, and try on. Some features may have limits." },
              { q: "Where do products come from?", a: "Live search uses Google Shopping (SerpAPI) so you see real products and prices from merchants." },
              { q: "How does try-on work?", a: "Upload a profile photo once. When you pick a product from search, we use AI (Gemini) to generate an image of you wearing it." },
              { q: "Is my data saved?", a: "Your profile (measurements, preferences, style) is stored so recommendations and chat stay personal. You can clear it in Settings." },
            ].map((faq, i) => (
              <motion.div
                key={faq.q}
                variants={item}
                className="p-5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700"
              >
                <h3 className="font-headline font-semibold text-zinc-900 dark:text-white">{faq.q}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* —— 15. Tech —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          {...sectionReveal}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-14 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[320px] sm:h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200/50 dark:border-zinc-700/50">
            <LandingImage src={IMG("tech", 800)} alt="Technology" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-2 space-y-5">
            <span className="text-accent font-semibold text-sm uppercase tracking-widest">Stack</span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Built for reliability
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-lg leading-relaxed">
              Next.js frontend, Express backend, MongoDB for profile, optional Redis for chat history.
              Gemini for chat and try-on, SerpAPI for live shopping, AWS S3 for profile images.
              Responsive, accessible, and ready for scale.
            </p>
          </div>
        </motion.div>
      </section>

      {/* —— 16. Final CTA —— */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-br from-accent/15 via-violet-500/10 to-fuchsia-500/15 dark:from-accent/20 dark:via-violet-500/15 dark:to-fuchsia-500/20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            Ready to try?
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400 text-lg">
            Open the concierge and ask anything about fit, style, or products.
          </p>
          <Link
            href="/chat"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-white font-semibold text-lg shadow-xl shadow-accent/30 hover:bg-accent/90 hover:scale-105 transition-all"
          >
            Open Concierge Chat →
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Footer } from "./Footer";

gsap.registerPlugin(ScrollTrigger);

const sectionAnimation = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" as const },
  transition: { duration: 0.6 },
};

const imageUrls = {
  hero: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&q=80",
  problem: "https://images.unsplash.com/photo-1558769132-cb1aea913002?w=800&q=80",
  solution: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  goals: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80",
  chat: "https://images.unsplash.com/photo-1531746795393-6cde5e488c66?w=800&q=80",
  personalize: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  shopping: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
  tryon: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
  recommendations: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
  tech: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
};

export function LandingContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useInView(heroRef, { once: true });

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((el) => {
        gsap.to(el, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* 1. Hero — Try /chat CTA */}
      <section
        ref={heroRef}
        className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 sm:px-6 overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0">
            <Image src={imageUrls.hero} alt="" fill className="object-cover" sizes="100vw" priority />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 via-zinc-950/70 to-fuchsia-500/30" />
          <motion.div
            className="absolute inset-0 pointer-events-none flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isHeroInView ? { opacity: 0.25, scale: 1.1 } : {}}
            transition={{ duration: 1.5 }}
          >
            <div className="w-64 h-64 sm:w-96 sm:h-96 rounded-full border-4 border-accent/40 blur-2xl" />
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <h1 className="font-headline text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
            Fashion Intelligence
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-zinc-300 max-w-2xl mx-auto">
            Your AI fashion concierge. Personalize, search real products, try on virtually, and get recommendations—all in one place.
          </p>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8"
          >
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-white font-semibold text-lg shadow-lg shadow-accent/30 hover:bg-accent/90 transition-colors"
            >
              Try it instantly →
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. Problem */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              The problem we solve
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Shoppers waste time jumping between stores, filters, and guesswork. Outfits don’t match body type or style. 
              Virtual try-on is rare, and recommendations feel generic—not personal.
            </p>
            <ul className="mt-6 space-y-3 text-zinc-700 dark:text-zinc-300">
              {["Scattered shopping across many sites", "No single place for fit, style, and budget", "Generic recommendations", "Little or no virtual try-on", "No AI assistant for fashion"].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden parallax-img">
            <Image src={imageUrls.problem} alt="Shopping confusion" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
      </section>

      {/* 3. Solution */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[300px] sm:h-[400px] rounded-2xl overflow-hidden parallax-img">
            <Image src={imageUrls.solution} alt="One app solution" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              One app. One concierge.
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              We bring chat, personalization, live shopping search, virtual try-on, and smart recommendations into a single B2C experience. 
              You talk, we personalize—and you discover and try on with confidence.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 4. Goals */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl"
        >
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white text-center mb-12">
            Our goals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "Democratize discovery", desc: "Make personalized fashion advice and try-on available to every shopper." },
              { title: "Reduce decision fatigue", desc: "One assistant that knows your fit, style, and budget." },
              { title: "Bridge online and real", desc: "Real products, real merchants, AI-powered guidance and try-on." },
            ].map((goal, i) => (
              <motion.div
                key={goal.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm"
              >
                <h3 className="font-headline font-semibold text-lg text-zinc-900 dark:text-white">{goal.title}</h3>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{goal.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12 relative h-[280px] rounded-2xl overflow-hidden">
            <Image src={imageUrls.goals} alt="Goals" fill className="object-cover" sizes="100vw" />
          </div>
        </motion.div>
      </section>

      {/* 5. How it works */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl"
        >
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white text-center mb-12">
            How it works
          </h2>
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-4">
            {["Chat with the concierge", "Set your profile & style", "Search real products", "Try on virtually", "Get ranked recommendations"].map((step, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex-1 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-accent text-white font-bold flex items-center justify-center mx-auto mb-3">
                  {i + 1}
                </div>
                <p className="text-sm font-medium text-zinc-900 dark:text-white">{step}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 6. Feature: AI Concierge */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              AI fashion concierge
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Chat in natural language about fit, budget, occasion, style, fabric, comparison, or try-on. 
              Topic-aware responses and citations keep answers relevant and actionable.
            </p>
          </div>
          <div className="relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
            <Image src={imageUrls.chat} alt="AI Concierge" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
      </section>

      {/* 7. Feature: Personalization */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
            <Image src={imageUrls.personalize} alt="Personalization" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Your profile, your style
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Measurements, fit preference, sleeve and length, budget tier, occasions, fabric preferences, climate, 
              favorite brands, and style tags. One profile powers chat, recommendations, and try-on.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 8. Feature: Live Shopping */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Live shopping search
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Search real products via Google Shopping (SerpAPI). Choose country (India, US, UK, UAE, Canada), 
              see prices and merchants, and open store links or trigger try-on from results.
            </p>
          </div>
          <div className="relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
            <Image src={imageUrls.shopping} alt="Live shopping" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
      </section>

      {/* 9. Feature: Virtual Try-On */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
            <Image src={imageUrls.tryon} alt="Virtual try-on" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Virtual try-on
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Upload your photo once. Pick a product from search—we generate a “you wearing it” image with AI (Gemini). 
              See the result on the chat page and visit the store when you’re ready.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 10. Feature: Recommendations */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-zinc-100 dark:bg-zinc-900/50">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Smart recommendations
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Products ranked by your style and occasion tags. “Why recommended” explains matches so you 
              can trust the order and explore the catalog with confidence.
            </p>
          </div>
          <div className="relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
            <Image src={imageUrls.recommendations} alt="Recommendations" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
        </motion.div>
      </section>

      {/* 11. Tech / Why us */}
      <section className="py-16 sm:py-24 px-4 sm:px-6">
        <motion.div
          initial={sectionAnimation.initial}
          whileInView={sectionAnimation.whileInView}
          viewport={sectionAnimation.viewport}
          transition={sectionAnimation.transition}
          className="mx-auto max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div className="order-2 lg:order-1 relative h-[300px] sm:h-[380px] rounded-2xl overflow-hidden">
            <Image src={imageUrls.tech} alt="Technology" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
              Built for reliability
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Next.js frontend, Express backend, MongoDB for profile, optional Redis for chat history. 
              Gemini for chat and try-on, SerpAPI for live shopping, AWS S3 for profile images. 
              Responsive, accessible, and ready for scale.
            </p>
          </div>
        </motion.div>
      </section>

      {/* 12. Final CTA */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 bg-gradient-to-br from-accent/10 to-fuchsia-500/10 dark:from-accent/20 dark:to-fuchsia-500/20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl text-center"
        >
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-white">
            Ready to try?
          </h2>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Open the concierge and ask anything about fit, style, or products.
          </p>
          <Link
            href="/chat"
            className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-accent text-white font-semibold text-lg shadow-lg shadow-accent/30 hover:bg-accent/90 transition-colors"
          >
            Open Concierge Chat →
          </Link>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}

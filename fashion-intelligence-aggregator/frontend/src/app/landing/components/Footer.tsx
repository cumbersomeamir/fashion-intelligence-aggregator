"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const productLinks = [
  { href: "/chat", label: "Try Concierge" },
  { href: "/personalize", label: "Personalize" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/try-on", label: "Try-On" },
  { href: "/settings", label: "Settings" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "#" },
];

export function Footer() {
  return (
    <footer className="relative bg-zinc-950 text-zinc-400 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid opacity-5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-accent/5 to-transparent rounded-full blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 sm:py-20">
        {/* Main content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/landing" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-accent flex items-center justify-center shadow-button group-hover:shadow-button-hover transition-shadow duration-300">
                <span className="text-white font-bold">FI</span>
              </div>
              <span className="font-headline text-xl font-bold text-white">
                Fashion Intelligence
              </span>
            </Link>
            <p className="text-sm text-zinc-500 max-w-md leading-relaxed">
              Your AI-powered fashion concierge. Discover, personalize, and try on fashion with confidence. One place for every style.
            </p>

            {/* Social links placeholder */}
            <div className="flex items-center gap-3 pt-2">
              {["Twitter", "Instagram", "LinkedIn"].map((social) => (
                <button
                  key={social}
                  className="w-10 h-10 rounded-xl bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 flex items-center justify-center text-zinc-500 hover:text-white transition-all duration-300"
                  aria-label={social}
                >
                  <span className="text-xs font-medium">{social[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Product
            </h4>
            <ul className="space-y-3">
              {productLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors duration-300 inline-flex items-center gap-2 group"
                  >
                    <span>{label}</span>
                    <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-5">
              Legal
            </h4>
            <ul className="space-y-3">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li className="pt-4 text-sm text-zinc-600">
                © {new Date().getFullYear()} Fashion Intelligence
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 pt-8 border-t border-zinc-800/50"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
            <p>B2C • Built for shoppers who want smarter, personalized fashion discovery.</p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

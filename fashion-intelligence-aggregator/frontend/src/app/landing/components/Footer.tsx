"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const links = [
  { href: "/chat", label: "Try Concierge" },
  { href: "/personalize", label: "Personalize" },
  { href: "/recommendations", label: "Recommendations" },
  { href: "/try-on", label: "Try-On" },
  { href: "/settings", label: "Settings" },
];

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <Link href="/landing" className="font-headline text-xl font-bold text-white">
              Fashion Intelligence
            </Link>
            <p className="mt-3 text-sm text-zinc-400 max-w-md">
              One place to discover, personalize, and try on fashion. AI-powered concierge for every style.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm hover:text-accent transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>© {new Date().getFullYear()} Fashion Intelligence</li>
            </ul>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-12 pt-8 border-t border-zinc-800 text-center text-xs text-zinc-500"
        >
          B2C • Built for shoppers who want smarter, personalized fashion discovery.
        </motion.div>
      </div>
    </footer>
  );
}

import Link from "next/link";

export default function VendorRegisterPage() {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 sm:px-6 bg-[var(--bg)]">
      <div className="absolute inset-0 bg-mesh opacity-30" />
      <div className="relative max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-accent/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🏪</span>
        </div>
        <h1 className="font-headline text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
          Vendor Registration
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          This flow is under development. We&apos;ll handle vendor onboarding in a future update.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-accent text-white font-semibold shadow-button hover:shadow-button-hover transition-all duration-200"
        >
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}

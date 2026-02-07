import { Suspense } from "react";
import { ProfileContent } from "./components/ProfileContent";

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[var(--bg)]"><div className="animate-pulse text-zinc-500">Loading...</div></div>}>
      <ProfileContent />
    </Suspense>
  );
}

import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { isAdminEmail } from "@/lib/admin";
import { AdminContent } from "./components/AdminContent";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email ?? null;

  if (!session) {
    redirect("/login");
  }

  if (!isAdminEmail(email)) {
    return (
      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-16">
        <h1 className="font-headline text-2xl font-bold text-zinc-900 dark:text-white">Admin</h1>
        <p className="mt-3 text-zinc-600 dark:text-zinc-300">
          Access denied. Your account is not configured as admin.
        </p>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Add your email in <code>ADMIN_EMAILS</code> to enable reel uploads.
        </p>
      </div>
    );
  }

  return <AdminContent />;
}

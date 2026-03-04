import { redirect } from "next/navigation";

export default function AvatarPage() {
  redirect("/chat?mode=avatar");
}

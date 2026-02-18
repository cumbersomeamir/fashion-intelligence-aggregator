import { ChatGuard } from "../chat/components/ChatGuard";
import { ReelsFeed } from "./components/ReelsFeed";

export default function ReelsPage() {
  return (
    <ChatGuard>
      <ReelsFeed />
    </ChatGuard>
  );
}

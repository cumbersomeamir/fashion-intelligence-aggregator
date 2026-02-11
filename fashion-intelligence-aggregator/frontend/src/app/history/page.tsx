import { ChatGuard } from "../chat/components/ChatGuard";
import { HistoryContent } from "./components/HistoryContent";

export default function HistoryPage() {
  return (
    <ChatGuard>
      <HistoryContent />
    </ChatGuard>
  );
}

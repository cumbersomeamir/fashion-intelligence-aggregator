import { ChatGuard } from "./components/ChatGuard";
import { ChatPageContent } from "./components/ChatPageContent";

export default function ChatPage() {
  return (
    <ChatGuard>
      <ChatPageContent />
    </ChatGuard>
  );
}

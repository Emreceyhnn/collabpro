import { AppShell } from "@/components/shell/app-shell";
import { ChatPanel } from "@/components/assistant/chat-panel";

export default function AssistantPage() {
  return (
    <AppShell>
      <ChatPanel />
    </AppShell>
  );
}

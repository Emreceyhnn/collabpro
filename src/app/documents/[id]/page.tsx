import { AppShell } from "@/components/shell/app-shell";
import { PlaceholderPage } from "@/components/shell/placeholder-page";

interface DocumentPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;

  return (
    <AppShell>
      <PlaceholderPage
        title={`Document · ${id}`}
        description="The real-time collaborative document editor — block-based editing with live cursors and presence, powered by Socket.io."
      />
    </AppShell>
  );
}

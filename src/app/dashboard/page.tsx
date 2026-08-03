import { AppShell } from "@/components/shell/app-shell";
import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function DashboardPage() {
  return (
    <AppShell>
      <PlaceholderPage
        title="Dashboard"
        description="Your workspace overview — recent documents, boards, and tasks assigned to you across every team you belong to."
      />
    </AppShell>
  );
}

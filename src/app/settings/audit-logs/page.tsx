import { AppShell } from "@/components/shell/app-shell";
import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function AuditLogsPage() {
  return (
    <AppShell>
      <PlaceholderPage
        title="Audit Logs"
        description="A searchable history of security-relevant events across your organization — logins, permission changes, and document access."
      />
    </AppShell>
  );
}

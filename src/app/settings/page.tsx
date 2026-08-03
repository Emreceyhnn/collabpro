import { AppShell } from "@/components/shell/app-shell";
import { PlaceholderPage } from "@/components/shell/placeholder-page";

export default function SettingsPage() {
  return (
    <AppShell>
      <PlaceholderPage
        title="Organization Settings"
        description="Manage your organization profile, team members, roles, and billing — the control center for admins."
      />
    </AppShell>
  );
}

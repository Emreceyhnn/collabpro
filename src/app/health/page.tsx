import { headers } from "next/headers";
import { AppShell } from "@/components/shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { HealthResponse } from "@/app/api/health/route";

async function getHealth(): Promise<HealthResponse> {
  const headerList = await headers();
  const host = headerList.get("host");
  const protocol = host?.startsWith("localhost") || host?.startsWith("127.0.0.1")
    ? "http"
    : "https";

  const response = await fetch(`${protocol}://${host}/api/health`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}

export default async function HealthPage() {
  const health = await getHealth();

  return (
    <AppShell>
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-3">
          <CardTitle>System Health</CardTitle>
          <Badge variant={health.status === "ok" ? "default" : "secondary"}>
            {health.status}
          </Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-body">
          <p>
            <span className="text-muted-foreground">Timestamp: </span>
            {health.timestamp}
          </p>
          <p>
            <span className="text-muted-foreground">Uptime: </span>
            {health.uptime.toFixed(2)}s
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

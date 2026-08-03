import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <Badge>Coming soon</Badge>
      <h1 className="text-h1">CollabPro</h1>
      <p className="max-w-md text-body text-muted-foreground">
        Real-time team collaboration: documents, boards, and tasks in one
        workspace. This is the Foundations phase — no auth or live data yet.
      </p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
        <Link href="/signup">
          <Button variant="outline">Sign up</Button>
        </Link>
      </div>
    </main>
  );
}

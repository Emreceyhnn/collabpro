import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-2 text-center">
          <Badge>Coming soon</Badge>
          <CardTitle>Log in to CollabPro</CardTitle>
          <p className="text-caption text-muted-foreground">
            Authentication isn&apos;t wired up yet — this screen will host the
            NextAuth.js sign-in flow.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button disabled className="w-full">
            Continue with email
          </Button>
          <p className="text-center text-caption text-muted-foreground">
            No account?{" "}
            <Link href="/signup" className="font-medium text-primary">
              Sign up
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

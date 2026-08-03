import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="items-center gap-2 text-center">
          <Badge>Coming soon</Badge>
          <CardTitle>Create your CollabPro account</CardTitle>
          <p className="text-caption text-muted-foreground">
            Signup will create your organization and first workspace once
            auth and the database are connected.
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Button disabled className="w-full">
            Create account
          </Button>
          <p className="text-center text-caption text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary">
              Log in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

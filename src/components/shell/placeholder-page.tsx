import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <CardTitle>{title}</CardTitle>
        <Badge>Coming soon</Badge>
      </CardHeader>
      <CardContent>
        <p className="text-body text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  icon: Icon,
  accent = "text-primary bg-brand-50",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-5">
        <div className={cn("flex size-10 items-center justify-center rounded-control", accent)}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="font-display text-xl font-semibold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MetricCard;

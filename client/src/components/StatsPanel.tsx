import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsPanelProps {
  stats: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    subtitle?: string;
  }[];
}

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="p-6" data-testid={`card-stat-${index}`}>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </p>
                {stat.subtitle && (
                  <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                )}
              </div>
              <div
                className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                  stat.color || "bg-primary/10"
                }`}
              >
                <Icon className="h-6 w-6" />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

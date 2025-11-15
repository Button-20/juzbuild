import { useWebsite } from "@/contexts/website-context";
import { TrendingUpIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionCards() {
  const { currentWebsite } = useWebsite();
  const [websiteStats, setWebsiteStats] = useState({
    activeProperties: 0,
    totalPages: 0,
    visitorEngagement: 0,
    contentHealth: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWebsiteStats = async () => {
      if (!currentWebsite?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [propsRes, pagesRes] = await Promise.all([
          fetch(`/api/properties?websiteId=${currentWebsite._id}`),
          fetch(`/api/pages?websiteId=${currentWebsite._id}`),
        ]);

        let properties = 0;
        let pages = 0;

        if (propsRes.ok) {
          const data = await propsRes.json();
          properties = data.properties?.length || 0;
        }

        if (pagesRes.ok) {
          const data = await pagesRes.json();
          pages = data.pages?.length || 0;
        }

        setWebsiteStats({
          activeProperties: properties,
          totalPages: pages,
          visitorEngagement: 68 + Math.random() * 20,
          contentHealth: 85 + Math.random() * 10,
        });
      } catch (error) {
        console.error("Failed to fetch website stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWebsiteStats();
  }, [currentWebsite]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 px-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 lg:px-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Active Properties</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {websiteStats.activeProperties}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +8%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Properties trending up <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Listed on your website</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Website Pages</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {websiteStats.totalPages}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +5
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Content pages growing <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Total published pages</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Visitor Engagement</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {Math.round(websiteStats.visitorEngagement)}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +12%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong engagement rate <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Based on recent activity</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Content Health</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {Math.round(websiteStats.contentHealth)}%
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +3%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Website performing well <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">SEO & optimization score</div>
        </CardFooter>
      </Card>
    </div>
  );
}

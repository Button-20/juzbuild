import { PROPERTY_ANALYTICS } from "@/constants/analytics";
import { TrendingUp } from "lucide-react";
import Container from "../global/container";

const PropertyAnalytics = () => {
  return (
    <div className="relative flex flex-col items-center justify-center max-w-5xl py-20 mx-auto">
      <Container>
        <div className="flex flex-col items-center justify-center w-full max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-heading font-medium !leading-snug mb-6">
            Track 15+ key{" "}
            <span className="font-subheading italic">property metrics</span> in
            real-time
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Get comprehensive insights into your property listings, lead
            generation, and website performance with advanced analytics built
            for real estate professionals.
          </p>
        </div>
      </Container>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 items-start justify-start max-w-4xl mx-auto pt-10 relative w-full">
        <div className="absolute top-1/2 -translate-y-1/2 right-1/4 w-3/5 h-14 lg:h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full -rotate-12 blur-[10rem] -z-10"></div>

        {PROPERTY_ANALYTICS.map((metric, idx) => (
          <Container
            key={metric.code}
            delay={0.05 * idx}
            className="flex items-center space-x-3 text-sm text-muted-foreground hover:text-primary transition-colors h-auto p-3 rounded-lg border bg-card/50 backdrop-blur-sm"
          >
            <span className="text-2xl">{metric.icon}</span>
            <div className="flex flex-col">
              <span className="text-base font-medium text-foreground">
                {metric.name}
              </span>
              <span className="text-xs text-muted-foreground">
                {metric.description}
              </span>
            </div>
          </Container>
        ))}
        <div className="flex items-center space-x-3 text-sm text-muted-foreground p-3 rounded-lg border bg-card/50 backdrop-blur-sm">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
            <TrendingUp size={16} className="text-primary" />
          </span>
          <div className="flex flex-col">
            <span className="text-base font-medium text-foreground">
              Custom Metrics
            </span>
            <span className="text-xs text-muted-foreground">
              Track what matters to you
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalytics;

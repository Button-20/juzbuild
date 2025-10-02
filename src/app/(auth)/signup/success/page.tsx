"use client";

import Container from "@/components/global/container";
import WaitingList from "@/components/marketing/waiting-list";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isLive } from "@/constants";
import { ArrowRight, CheckCircle, Globe, Settings } from "lucide-react";
import Link from "next/link";

export default function SignupSuccessPage() {
  // Redirect to waitlist if app is not live
  if (!isLive) {
    return <WaitingList />;
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 py-12 px-4">
      <Container className="max-w-4xl mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
        </div>

        {/* Main Message */}
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Welcome to Juzbuild!
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Your account has been created successfully! Your AI-powered real
          estate website is being built and will be ready within the next few
          minutes.
        </p>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-green-900 dark:text-green-100">
                Account Created
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-green-700 dark:text-green-300">
                Your account and business profile have been successfully set up.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-blue-900 dark:text-blue-100">
                Website Building
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-blue-700 dark:text-blue-300">
                Your custom real estate website is being built with your
                selected layout and features.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950">
            <CardHeader className="pb-3">
              <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-2">
                <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-purple-900 dark:text-purple-100">
                Plan Activated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-purple-700 dark:text-purple-300">
                Your subscription is active and marketing tools are being
                configured.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Next Steps */}
        <Card className="text-left mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              What's Happening Next?
            </CardTitle>
            <CardDescription>
              Here's what we're working on behind the scenes:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Building Your Website</h4>
                    <p className="text-sm text-muted-foreground">
                      Creating your custom real estate website with your
                      selected layout and property types
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Setting Up Lead Capture</h4>
                    <p className="text-sm text-muted-foreground">
                      Configuring your preferred contact methods and lead
                      generation forms
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Activating Your Plan</h4>
                    <p className="text-sm text-muted-foreground">
                      Processing your subscription and unlocking all features
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Marketing Integration</h4>
                    <p className="text-sm text-muted-foreground">
                      Setting up your advertising platform connections and
                      marketing tools
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Dashboard Preparation</h4>
                    <p className="text-sm text-muted-foreground">
                      Creating your analytics dashboard and property management
                      interface
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <h4 className="font-medium">Final Testing</h4>
                    <p className="text-sm text-muted-foreground">
                      Making sure everything works perfectly before launch
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold mb-4">What's Next?</h3>
          <p className="text-muted-foreground mb-6">
            While we finish setting up your website, you can explore our
            platform or check out some resources.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="px-8">
                <ArrowRight className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="px-8">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-12 p-6 bg-muted/50 rounded-lg border">
          <h4 className="font-semibold mb-4">Estimated Timeline</h4>
          <div className="flex justify-between items-center text-sm">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Account Created</p>
              <p className="text-muted-foreground">Just now</p>
            </div>
            <div className="flex-1 h-0.5 bg-muted mx-4"></div>
            <div className="text-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mx-auto mb-2 animate-pulse"></div>
              <p className="font-medium">Website Building</p>
              <p className="text-muted-foreground">5-10 minutes</p>
            </div>
            <div className="flex-1 h-0.5 bg-muted mx-4"></div>
            <div className="text-center">
              <div className="w-3 h-3 bg-muted rounded-full mx-auto mb-2"></div>
              <p className="font-medium">Ready to Use</p>
              <p className="text-muted-foreground">10-15 minutes</p>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Questions? Email us at{" "}
            <a
              href="mailto:support@juzbuild.com"
              className="text-primary hover:underline"
            >
              support@juzbuild.com
            </a>{" "}
            or check our{" "}
            <Link href="/help" className="text-primary hover:underline">
              help center
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}

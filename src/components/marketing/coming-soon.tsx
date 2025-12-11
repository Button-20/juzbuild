"use client";

import { useState } from "react";
import Image from "next/image";
import Container from "../global/container";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import Icons from "../global/icons";
import { OrbitingCircles } from "../ui/orbiting-circles";

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setMessage("🎉 Thanks for signing up! You'll be among the first to know when we launch.");
        setEmail("");
      } else {
        const data = await res.json();
        setMessage(
          data.message || "Oops! Something went wrong. Please try again."
        );
      }
    } catch (error) {
      setMessage("Oops! Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[100dvh] md:min-h-screen py-10 md:py-20 px-4 bg-slate-950">
      <div className="absolute flex lg:hidden size-32 md:size-40 rounded-full bg-blue-600 blur-[8rem] md:blur-[10rem] top-0 left-1/2 -translate-x-1/2 -z-10"></div>

      <Container className="hidden lg:flex absolute inset-0 top-0 mb-auto flex-col items-center justify-center w-full min-h-screen -z-10">
        <OrbitingCircles speed={0.5} radius={300}>
          <Icons.circle1 className="size-4 text-foreground/70" />
          <Icons.circle2 className="size-1 text-foreground/80" />
        </OrbitingCircles>
        <OrbitingCircles speed={0.25} radius={400}>
          <Icons.circle2 className="size-1 text-foreground/50" />
          <Icons.circle1 className="size-4 text-foreground/60" />
          <Icons.circle2 className="size-1 text-foreground/90" />
        </OrbitingCircles>
        <OrbitingCircles speed={0.1} radius={500}>
          <Icons.circle2 className="size-1 text-foreground/50" />
          <Icons.circle2 className="size-1 text-foreground/90" />
          <Icons.circle1 className="size-4 text-foreground/60" />
          <Icons.circle2 className="size-1 text-foreground/90" />
        </OrbitingCircles>
      </Container>

      <div className="flex flex-col items-center justify-center gap-y-6 md:gap-y-8 relative animate-in fade-in-0 duration-1000">
        <div className="flex flex-col items-center justify-center text-center gap-y-3 md:gap-y-4 bg-background/0">
          <Container className="relative">
            <Image
              src="/images/feature-one.svg"
              alt="Coming Soon Illustration"
              width={200}
              height={200}
              className="mx-auto mb-4 md:mb-6 opacity-80 w-32 h-32 md:w-48 md:h-48 lg:w-52 lg:h-52"
            />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-3">
              Coming Soon
            </h1>
            <p className="text-lg md:text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-6">
              Juzbuild is Launching Soon
            </p>
            <p className="text-sm md:text-md mb-6 md:mb-8 text-muted-foreground max-w-lg mx-auto px-4">
              We're building the future of AI-powered real estate platforms. Get notified when we launch and be among the first to experience the revolution.
            </p>
            
            <div className="bg-blue-950/50 border border-blue-800 rounded-lg p-4 md:p-6 mb-6 md:mb-8 max-w-lg mx-auto">
              <p className="text-sm md:text-base text-white">
                ⏰ <strong>Launching Q1 2025</strong>
              </p>
              <p className="text-xs md:text-sm text-gray-300 mt-2">
                Be the first to access our platform and transform how you do business.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 md:gap-4 max-w-md mx-auto w-full px-4"
            >
              <Label htmlFor="email" className="text-left text-sm md:text-base font-semibold">
                Get Early Access
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="h-11 md:h-12"
              />
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11 md:h-12 text-sm md:text-base font-semibold"
              >
                {loading ? "Signing Up..." : "🎉 Notify Me"}
              </Button>
            </form>
            {message && (
              <p
                className={`mt-3 md:mt-4 text-sm md:text-md px-4 ${
                  message.includes("Thanks")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            <div className="mt-8 md:mt-12 pt-8 md:pt-12 border-t border-border max-w-lg mx-auto">
              <p className="text-xs text-muted-foreground mb-4">
                What's Coming:
              </p>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="text-left">
                  <p className="text-xs md:text-sm font-semibold">🤖 AI Automation</p>
                  <p className="text-xs text-muted-foreground">Smart workflows</p>
                </div>
                <div className="text-left">
                  <p className="text-xs md:text-sm font-semibold">📊 Analytics</p>
                  <p className="text-xs text-muted-foreground">Real insights</p>
                </div>
                <div className="text-left">
                  <p className="text-xs md:text-sm font-semibold">🏠 Lead Gen</p>
                  <p className="text-xs text-muted-foreground">More clients</p>
                </div>
                <div className="text-left">
                  <p className="text-xs md:text-sm font-semibold">⚡ Fast Deploy</p>
                  <p className="text-xs text-muted-foreground">Minutes, not months</p>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;

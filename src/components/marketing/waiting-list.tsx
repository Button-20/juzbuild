"use client";

import Image from "next/image";
import { useState } from "react";
import Container from "../global/container";
import Icons from "../global/icons";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { OrbitingCircles } from "../ui/orbiting-circles";

const WaitingList = () => {
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
        setMessage("🎉 Welcome aboard! You're now on the exclusive waitlist.");
        setEmail("");
      } else {
        setMessage("Oops! Something went wrong. Please try again.");
      }
    } catch (error) {
      setMessage("Oops! Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center w-full min-h-[100dvh] md:min-h-screen py-10 md:py-20 px-4">
      <div className="absolute flex lg:hidden size-32 md:size-40 rounded-full bg-blue-500 blur-[8rem] md:blur-[10rem] top-0 left-1/2 -translate-x-1/2 -z-10"></div>

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
              alt="Waiting List Illustration"
              width={200}
              height={200}
              className="mx-auto mb-4 md:mb-6 opacity-80 w-32 h-32 md:w-48 md:h-48 lg:w-52 lg:h-52"
            />
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Early Access to Juzbuild
            </h1>
            <p className="text-sm md:text-md mb-6 md:mb-8 text-muted-foreground max-w-lg mx-auto px-4">
              Join thousands of property professionals waiting to transform
              their business with our AI-powered platform.
            </p>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-3 md:gap-4 max-w-md mx-auto w-full px-4"
            >
              <Label htmlFor="email" className="text-left text-sm md:text-base">
                Your Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email to join"
                className="h-11 md:h-12"
              />
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-11 md:h-12 text-sm md:text-base"
              >
                {loading ? "Joining..." : "🚀 Join the Revolution"}
              </Button>
            </form>
            {message && (
              <p
                className={`mt-3 md:mt-4 text-sm md:text-md px-4 ${
                  message.includes("Welcome")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}
          </Container>
        </div>
      </div>
    </div>
  );
};

export default WaitingList;

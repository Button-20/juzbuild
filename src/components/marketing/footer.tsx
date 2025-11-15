"use client";

import Link from "next/link";
import Container from "../global/container";
import Icons from "../global/icons";
import { Mail, Github, Linkedin, Twitter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/juzbuild", label: "Twitter" },
    {
      icon: Linkedin,
      href: "https://linkedin.com/company/juzbuild",
      label: "LinkedIn",
    },
    { icon: Github, href: "https://github.com/juzbuild", label: "GitHub" },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setEmail(""); // Clear the input
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="flex flex-col relative items-center justify-center border-t border-foreground/5 pt-16 pb-8 px-6 lg:px-8 w-full max-w-6xl mx-auto lg:pt-32">
      <div className="grid gap-12 md:gap-16 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 w-full">
        {/* Logo Column */}
        <div className="flex flex-col items-start justify-start">
          <div className="flex items-center gap-2">
            <Icons.icon className="w-auto h-5" />
            <span className="text-base md:text-lg font-medium text-foreground">
              Juzbuild
            </span>
          </div>
          <p className="text-muted-foreground mt-4 text-sm text-start">
            AI-powered platform that transforms your marketing workflow in
            seconds.
          </p>
        </div>

        {/* Product Column */}
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-foreground">Product</h3>
          <ul className="mt-4 text-sm text-muted-foreground space-y-3">
            <li>
              <Link
                href="/#features"
                className="link hover:text-foreground transition-all duration-300"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/#pricing"
                className="link hover:text-foreground transition-all duration-300"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/blog"
                className="link hover:text-foreground transition-all duration-300"
              >
                Blog
              </Link>
            </li>
          </ul>
        </div>

        {/* Support Column */}
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-foreground">Support</h3>
          <ul className="mt-4 text-sm text-muted-foreground space-y-3">
            <li>
              <Link
                href="/#contact"
                className="link hover:text-foreground transition-all duration-300"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="link hover:text-foreground transition-all duration-300"
              >
                About
              </Link>
            </li>
            <li>
              <Link
                href="/privacy-policy"
                className="link hover:text-foreground transition-all duration-300"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-of-service"
                className="link hover:text-foreground transition-all duration-300"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Connect Column */}
        <div className="flex flex-col">
          <h3 className="text-base font-medium text-foreground">Connect</h3>
          <div className="mt-4 space-y-4">
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </a>
                );
              })}
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Stay updated</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 px-3"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-12 lg:mt-20 pt-8 border-t border-foreground/5">
        <div className="flex items-center justify-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Juzbuild. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

"use client";

import { motion } from "framer-motion";
import Container from "@/components/global/container";
import Link from "next/link";
import { Zap, Users, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function About() {
  const stats = [
    { label: "Websites Created", value: "1000+", icon: "🌐" },
    { label: "Active Users", value: "5000+", icon: "👥" },
    { label: "Countries Served", value: "50+", icon: "🌍" },
  ];

  const values = [
    {
      icon: Zap,
      title: "Innovation",
      description:
        "Cutting-edge solutions that keep real estate professionals ahead of the competition.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Users,
      title: "Community",
      description:
        "Building a vibrant ecosystem where agents grow, share, and succeed together.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      title: "Accessibility",
      description:
        "Professional tools accessible to everyone, regardless of technical experience or budget.",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const timeline = [
    {
      year: "2020",
      title: "Founded",
      description: "Started with a vision to simplify real estate marketing",
    },
    {
      year: "2021",
      title: "First Users",
      description: "Launched beta with 500+ agents",
    },
    {
      year: "2022",
      title: "Major Growth",
      description: "Expanded to 3000+ active users",
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Now serving 50+ countries worldwide",
    },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col items-center">
      {/* Hero Section with Gradient Background */}
      <div className="relative pt-20 pb-32 overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-3xl" />
        <div className="flex justify-center">
          <Container className="max-w-6xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-8"
            >
              <Link href="/">
                <Button variant="outline" size="sm" className="mb-8">
                  ← Back to Home
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-center space-y-6"
            >
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                About Juzbuild
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Empowering real estate professionals to build stunning online
                presence and grow their business
              </p>
            </motion.div>
          </Container>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="w-full flex justify-center">
        <Container className="max-w-4xl py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center space-y-4"
          >
            <h2 className="text-3xl font-bold">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              To democratize professional web presence for real estate
              professionals worldwide. We believe every agent deserves access to
              enterprise-grade tools that help them succeed, regardless of their
              technical background or budget.
            </p>
          </motion.div>
        </Container>
      </div>

      {/* Stats Section */}
      <div className="py-20 border-t border-border w-full flex justify-center">
        <Container className="max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="p-8 rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/30 hover:border-foreground/20 transition-all"
              >
                <div className="text-4xl mb-3">{stat.icon}</div>
                <div className="text-5xl font-bold text-blue-500 mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>

      {/* Values Section */}
      <div className="w-full flex justify-center">
        <Container className="max-w-5xl py-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground">
              Principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="group p-8 rounded-xl border border-border bg-gradient-to-br from-muted/50 to-muted/30 hover:border-foreground/30 transition-all hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div
                    className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${value.color} mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </Container>
      </div>

      {/* Timeline Section */}
      <div className="py-20 border-t border-border w-full flex justify-center">
        <Container className="max-w-5xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
            <p className="text-muted-foreground">From vision to reality</p>
          </motion.div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                className="flex gap-6 items-start"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    {item.year}
                  </div>
                  {index !== timeline.length - 1 && (
                    <div className="w-0.5 h-20 bg-gradient-to-b from-blue-500/50 to-transparent mt-4" />
                  )}
                </div>
                <div className="pt-2 pb-8">
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>

      {/* CTA Section */}
      <div className="w-full flex justify-center">
        <Container className="max-w-4xl py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-12"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of real estate professionals who are already
              building their online presence with Juzbuild.
            </p>
            <Link href="/auth/signup">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-6 text-lg">
                Create Your Website
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </Container>
      </div>
    </div>
  );
}

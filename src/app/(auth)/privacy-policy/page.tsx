"use client";

import { motion } from "framer-motion";
import Container from "@/components/global/container";
import Link from "next/link";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col items-center">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 blur-3xl" />
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
            <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 border border-green-500/30">
              <Shield className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Your privacy and data security are our top priorities. Learn how we protect and manage your information.
            </p>
          </motion.div>
        </Container>
        </div>
      </div>

      {/* Detailed Policy */}
      <div className="w-full flex justify-center">
      <Container className="max-w-4xl py-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-12"
        >
          <div className="text-muted-foreground text-sm mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </div>

          <section>
            <h2 className="text-2xl font-bold mb-4">1. Information Collection & Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information you provide directly, including account credentials, profile information, and 
              communication preferences. We also automatically collect usage data, device information, and browsing 
              behavior to improve our service and prevent fraud.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Your information helps us personalize your experience, provide customer support, send important 
              notifications, and comply with legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We implement comprehensive security measures including encryption, firewalls, and regular security 
              audits. All sensitive data is encrypted both in transit and at rest using industry-standard protocols.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we 
              strive to protect your data, we cannot guarantee absolute security. You are responsible for maintaining 
              the confidentiality of your account credentials.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. Third-Party Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We do not sell your personal information. We may share data with trusted partners who assist us in 
              operating our service, subject to confidentiality agreements. These include payment processors, analytics 
              providers, and hosting providers.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We may disclose information when required by law or to protect our rights, privacy, safety, or property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Your Privacy Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Depending on your location, you may have rights including:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li>• Right to access your personal data</li>
              <li>• Right to rectification of inaccurate data</li>
              <li>• Right to erasure ("right to be forgotten")</li>
              <li>• Right to restrict processing</li>
              <li>• Right to data portability</li>
              <li>• Right to object to processing</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              To exercise these rights, please contact us at support@juzbuild.com.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Cookies & Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience, remember preferences, and 
              analyze usage patterns. You can control cookie settings in your browser, though some features may be 
              affected. We use both session and persistent cookies for legitimate business purposes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Children's Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              Juzbuild is not intended for individuals under 18 years of age. We do not knowingly collect personal 
              information from children. If we become aware that a child has provided us with personal information, we 
              will delete such information promptly and terminate the child's account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Policy Updates</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy periodically. Significant changes will be communicated via email or prominent 
              notice on our website. Continued use of our service constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-xl p-8 mt-12">
            <h2 className="text-2xl font-bold mb-4">Questions?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any concerns about our privacy practices or would like to exercise your rights, please 
              contact our Data Protection Officer.
            </p>
            <a href="mailto:privacy@juzbuild.com" className="text-green-500 hover:text-green-600 font-semibold">
              privacy@juzbuild.com
            </a>
          </section>
        </motion.div>
      </Container>
      </div>
    </div>
  );
}

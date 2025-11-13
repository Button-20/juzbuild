"use client";

import { motion } from "framer-motion";
import Container from "@/components/global/container";
import Link from "next/link";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background overflow-hidden flex flex-col items-center">
      {/* Hero Section */}
      <div className="relative pt-20 pb-32 overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 blur-3xl" />
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
            <div className="inline-flex p-3 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30">
              <Scale className="w-8 h-8 text-orange-500" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Terms of Service
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Please read these terms carefully before using Juzbuild. By accessing our service, you agree to be bound by these terms.
            </p>
          </motion.div>
        </Container>
        </div>
      </div>

      {/* Terms Content */}
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
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using Juzbuild, you accept and agree to be bound by the terms and provisions of this 
              agreement. If you do not agree to abide by these terms, please do not use this service. We reserve the 
              right to modify these terms at any time. Continued use of our service following modifications constitutes 
              your acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Subject to your compliance with these terms, we grant you a limited, non-exclusive, non-transferable 
              license to:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li>• Access and use Juzbuild for personal and commercial purposes</li>
              <li>• Create and manage your real estate portfolio</li>
              <li>• Publish content and property listings on your website</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              You may not: modify, copy, distribute, or create derivative works of our service; attempt to reverse 
              engineer or decompile any software; use the service for unlawful purposes; or interfere with its operation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">3. User Accounts & Security</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you create an account, you agree to provide accurate and complete information. You are entirely 
              responsible for:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Maintaining the confidentiality of your login credentials</li>
              <li>• All activities that occur under your account</li>
              <li>• Notifying us immediately of unauthorized access</li>
              <li>• Complying with all applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">4. Content & Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You retain ownership of content you create and publish. By uploading content to Juzbuild, you grant us 
              a worldwide, non-exclusive license to use, reproduce, modify, and distribute your content for service 
              operation purposes.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You represent and warrant that your content does not violate any third-party intellectual property rights, 
              is not defamatory, and does not violate any laws or regulations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">5. Prohibited Activities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use Juzbuild for:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li>• Illegal activities or content</li>
              <li>• Harassment, abuse, or discrimination</li>
              <li>• Spam, malware, or viruses</li>
              <li>• Intellectual property infringement</li>
              <li>• Unauthorized access or hacking attempts</li>
              <li>• Commercial spam or unsolicited communications</li>
              <li>• Impersonation or fraudulent activity</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Violation of these prohibitions may result in immediate account suspension and legal action.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">6. Disclaimers & Limitations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>AS-IS BASIS:</strong> Juzbuild is provided "as is" without warranties of any kind, express or 
              implied, including merchantability, fitness for a particular purpose, or non-infringement.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              <strong>SERVICE AVAILABILITY:</strong> We do not warrant that the service will be uninterrupted or error-free. 
              We may perform maintenance or updates that temporarily affect availability.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>NO LIABILITY FOR INDIRECT DAMAGES:</strong> We are not liable for lost profits, lost data, or 
              indirect, incidental, special, or consequential damages arising from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Our total liability for any claims arising from your use of Juzbuild shall not exceed the amount you paid 
              us in the 12 months preceding the claim. Some jurisdictions do not allow the exclusion of certain warranties 
              or limitation of liability, so these provisions may not apply to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">8. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless Juzbuild, its founders, employees, and agents from any claims, 
              damages, or costs (including legal fees) arising from your violation of these terms, your use of the service, 
              or your content.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may suspend or terminate your account at any time for:
            </p>
            <ul className="space-y-2 text-muted-foreground mb-4">
              <li>• Violation of these terms</li>
              <li>• Unlawful conduct</li>
              <li>• Inactivity for an extended period</li>
              <li>• Non-payment of fees</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              You may delete your account at any time. Upon termination, we may retain your data as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">10. Governing Law & Disputes</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms are governed by applicable law in the jurisdiction where Juzbuild operates. Any disputes 
              shall be resolved through binding arbitration or in the courts of that jurisdiction, as applicable.
            </p>
          </section>

          <section className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-xl p-8 mt-12">
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-muted-foreground mb-6">
              If you have any questions or concerns about these Terms of Service, please don't hesitate to reach out.
            </p>
            <a href="mailto:legal@juzbuild.com" className="text-orange-500 hover:text-orange-600 font-semibold">
              legal@juzbuild.com
            </a>
          </section>
        </motion.div>
      </Container>
      </div>
    </div>
  );
}

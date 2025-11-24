"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  CheckCircle2,
  CreditCard,
  Globe,
  HelpCircle,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Shield,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const faqs = [
  {
    category: "Getting Started",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    items: [
      {
        question: "How do I create my first real estate website?",
        answer:
          "Getting started is easy! After signing up, you'll be guided through our onboarding process where you can choose from our professional real estate templates, customize your branding, and add your first property listings. The entire setup takes less than 10 minutes.",
      },
      {
        question: "What templates are available for real estate websites?",
        answer:
          "We offer multiple professionally designed templates specifically for real estate professionals including modern property showcase layouts, agent portfolio designs, and brokerage-focused themes. Each template is fully customizable and mobile-responsive.",
      },
      {
        question: "Can I import my existing property listings?",
        answer:
          "Yes! You can easily import your property listings from CSV files, MLS feeds, or manually add them through our intuitive property management interface. We also support bulk uploads for large property portfolios.",
      },
      {
        question: "Do I need any technical skills to use Juzbuild?",
        answer:
          "No technical skills required! Juzbuild is designed for real estate professionals. Our drag-and-drop editor and intuitive interface make it easy for anyone to create and manage a professional website. If you have any questions, our support team is always here to help.",
      },
      {
        question: "How long does it take to set up my website?",
        answer:
          "Most users can have a fully functional website up and running in 5-8 minutes. This includes choosing a template, adding your branding, and uploading your first few properties. You can always refine and expand your website later.",
      },
      {
        question: "Can I try Juzbuild before purchasing?",
        answer:
          "Yes! We offer a 14-day free trial with full access to all features. No credit card required to start. This gives you plenty of time to explore and see if Juzbuild is right for your business.",
      },
      {
        question: "What support is available during onboarding?",
        answer:
          "We provide comprehensive onboarding support including video tutorials, step-by-step guides, live chat assistance, and optional one-on-one setup calls for Pro and Agency plan members.",
      },
    ],
  },
  {
    category: "Website Management",
    icon: Globe,
    color: "bg-green-500/10 text-green-600 border-green-500/20",
    items: [
      {
        question: "How do I add new property listings to my website?",
        answer:
          "Navigate to the Properties section in your dashboard. Click 'Add New Property' and fill in the details including photos, description, price, and location. Your listing will be automatically added to your website and search functionality.",
      },
      {
        question: "Can I customize the design and layout of my website?",
        answer:
          "Absolutely! Use our drag-and-drop editor to customize colors, fonts, layouts, and sections. You can also upload your own logo, change the header/footer, and modify the property listing display styles to match your brand.",
      },
      {
        question: "How do I connect my own domain name?",
        answer:
          "Custom domains are available for Pro and Agency plan users. Go to Settings > Domain, enter your domain name, and follow the DNS setup instructions. We'll guide you through the entire process.",
      },
      {
        question: "Is my website mobile-friendly?",
        answer:
          "Yes! All our templates are fully responsive and optimized for mobile devices. Your website will look great and function perfectly on smartphones, tablets, and desktop computers.",
      },
      {
        question: "Can I have multiple websites with one account?",
        answer:
          "Yes! Agency and Pro plans support multiple websites. You can manage up to 5 websites with a Pro plan and unlimited websites with an Agency plan. Each website can have its own branding and property listings.",
      },
      {
        question: "How do I change my website's color scheme and branding?",
        answer:
          "Go to Themes > Branding and upload your logo, select your primary colors, and customize fonts. Our intelligent color system will automatically apply your branding throughout the entire website for a cohesive look.",
      },
      {
        question: "Can I add custom pages to my website?",
        answer:
          "Yes! Pro and Agency plans include the ability to create custom pages using our page builder. Add About Us, Services, Team, or any other pages you need to tell your real estate story.",
      },
      {
        question: "How do I optimize my website for search engines?",
        answer:
          "We handle most SEO automatically, including XML sitemap generation and meta tag optimization. You can also manually customize page titles, descriptions, and keywords for each property and custom page.",
      },
      {
        question: "Can I add a blog to my website?",
        answer:
          "Yes! Pro and Agency plans include a full-featured blog. Write and publish articles about real estate market trends, tips, and insights to attract more visitors and improve your SEO ranking.",
      },
    ],
  },
  {
    category: "Lead Management",
    icon: Users,
    color: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    items: [
      {
        question: "How do I track leads from my website?",
        answer:
          "All inquiries from your website contact forms, property inquiries, and phone calls are automatically tracked in your Leads dashboard. You'll receive email notifications and can manage follow-ups directly from the platform.",
      },
      {
        question: "Can I integrate with my existing CRM?",
        answer:
          "Yes! We offer integrations with popular CRM systems. Export your leads to CSV or use our API to connect with your preferred CRM solution. Contact support for specific integration assistance.",
      },
      {
        question: "How do I respond to property inquiries?",
        answer:
          "When someone inquires about a property, you'll receive an email notification with their contact details and message. You can respond directly from your dashboard or use the provided contact information to follow up.",
      },
      {
        question: "Can I set up automated email responses?",
        answer:
          "Yes! Pro and Agency plans include automated email responses. Set up auto-replies for property inquiries and general contact form submissions to acknowledge inquiries instantly.",
      },
      {
        question: "How do I manage follow-ups with leads?",
        answer:
          "Use our Lead Management system to track all interactions, set reminders, and add notes about each lead. You can assign leads to team members and track the status of each potential client.",
      },
      {
        question: "Can I export my leads?",
        answer:
          "Yes! You can export all your leads to CSV format at any time. This allows you to backup your data or integrate with other tools and services.",
      },
      {
        question: "What information do I collect from leads?",
        answer:
          "By default, we collect name, email, phone number, and message. Pro plans allow you to add custom fields to collect additional information like budget, timeline, or specific property preferences.",
      },
    ],
  },
  {
    category: "Analytics & Performance",
    icon: Zap,
    color: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    items: [
      {
        question: "What analytics are available for my website?",
        answer:
          "Track property views, lead generation, contact form submissions, search rankings, page performance, and visitor behavior. Our comprehensive analytics help you understand which properties are most popular and optimize your marketing strategy.",
      },
      {
        question: "How can I improve my website's search engine ranking?",
        answer:
          "Our platform includes built-in SEO optimization for property listings, automatic sitemap generation, and meta tag management. We also provide SEO recommendations and can help optimize your content for local search results.",
      },
      {
        question: "Can I see which properties are getting the most views?",
        answer:
          "Yes! The Analytics section shows detailed metrics for each property including views, inquiries, and engagement. This helps you understand market demand and adjust your pricing or marketing strategies accordingly.",
      },
      {
        question: "How do I track visitor behavior on my website?",
        answer:
          "Our analytics dashboard shows where visitors are coming from, which pages they visit, how long they spend on your site, and conversion funnels. Use this data to optimize your website layout and content.",
      },
      {
        question: "Can I see real-time visitor data?",
        answer:
          "Yes! View real-time visitor activity, current users on your site, and live lead notifications. This helps you understand traffic patterns and stay responsive to inquiries.",
      },
      {
        question: "What is a lead conversion rate?",
        answer:
          "A lead conversion rate is the percentage of website visitors who become leads (fill out a contact form or inquiry). For example, if 100 people visit your site and 5 become leads, your conversion rate is 5%. Our analytics help you track and improve this metric.",
      },
      {
        question: "Can I track phone calls and inquiries?",
        answer:
          "Yes! We provide phone tracking numbers and track all inquiries. You can see which properties and pages generate the most phone calls and qualified leads.",
      },
      {
        question: "How often are analytics updated?",
        answer:
          "Your analytics are updated in real-time. You can view current visitor activity and new leads instantly from your dashboard.",
      },
    ],
  },
  {
    category: "Billing & Plans",
    icon: CreditCard,
    color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    items: [
      {
        question: "What's included in each plan?",
        answer:
          "Starter plan includes basic website features and property listings. Pro plan adds custom domains, advanced analytics, and lead management tools. Agency plan includes multiple websites, team collaboration, and priority support.",
      },
      {
        question: "Can I upgrade or downgrade my plan anytime?",
        answer:
          "Yes! You can change your plan at any time from the Settings > Billing section. Upgrades take effect immediately, while downgrades will apply at your next billing cycle.",
      },
      {
        question: "Do you offer refunds?",
        answer:
          "We offer a 30-day money-back guarantee for new subscribers. If you're not satisfied with our service within the first 30 days, contact support for a full refund.",
      },
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe.",
      },
      {
        question: "Is there an annual billing option?",
        answer:
          "Yes! Annual billing is available on all plans and typically offers 2-3 months of savings compared to monthly billing. Switch to annual billing anytime from your account settings.",
      },
      {
        question: "What happens when my subscription expires?",
        answer:
          "Your website remains live for 30 days after your subscription expires. During this time, you can renew your subscription. If not renewed, your website will be archived and can be reactivated later.",
      },
      {
        question: "Can I change my billing cycle?",
        answer:
          "Yes! You can switch between monthly and annual billing at any time. If you're upgrading with annual billing, you'll receive a prorated credit for your remaining monthly subscription.",
      },
      {
        question: "Is tax included in the pricing?",
        answer:
          "Pricing shown is before applicable taxes. Taxes will be calculated and added at checkout based on your location. For businesses with a tax ID, we can exclude sales tax from your invoice.",
      },
    ],
  },
  {
    category: "Security & Privacy",
    icon: Shield,
    color: "bg-red-500/10 text-red-600 border-red-500/20",
    items: [
      {
        question: "Is my data secure?",
        answer:
          "Absolutely! We use industry-standard encryption (SSL/TLS) for all data transmission and storage. Your property listings, client information, and personal data are protected with bank-level security measures.",
      },
      {
        question: "Who can access my website and listings?",
        answer:
          "Your website is public and can be viewed by anyone online (which helps with lead generation). However, your dashboard, client information, and analytics are private and only accessible to you and any team members you invite.",
      },
      {
        question: "Do you backup my data?",
        answer:
          "Yes! We automatically backup all your data multiple times daily. Your property listings, images, and client information are safely stored and can be restored if needed.",
      },
      {
        question: "What is your data center location?",
        answer:
          "Your data is stored in secure, redundant data centers with automatic backups. We use industry-leading cloud infrastructure to ensure 99.9% uptime and data protection.",
      },
      {
        question: "Is my password secure?",
        answer:
          "Yes! Passwords are encrypted using bcrypt with a cost factor of 12, making them extremely resistant to hacking. We also support two-factor authentication for added security.",
      },
      {
        question: "Can I enable two-factor authentication?",
        answer:
          "Yes! Pro and Agency plan members can enable two-factor authentication for their accounts. This adds an extra layer of security by requiring a second verification method when logging in.",
      },
      {
        question: "Do you comply with GDPR and privacy laws?",
        answer:
          "Yes! We comply with GDPR, CCPA, and other privacy regulations. We have detailed privacy policies and provide tools for data export and deletion upon request.",
      },
      {
        question: "Can I delete my account and data?",
        answer:
          "Yes! You can request account deletion from your account settings. All your data will be permanently deleted within 30 days, except where we're required to retain it for legal purposes.",
      },
    ],
  },
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const filteredFaqs = faqs.filter((category) => {
    if (selectedCategory && category.category !== selectedCategory)
      return false;
    if (!searchTerm) return true;

    return category.items.some(
      (item) =>
        item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/support/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactForm),
      });

      if (response.ok) {
        toast.success(
          "Message sent successfully! We'll get back to you within 24 hours."
        );
        setContactForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = faqs.map((faq) => ({
    name: faq.category,
    icon: faq.icon,
    color: faq.color,
    count: faq.items.length,
  }));

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="@container/main flex flex-1 flex-col gap-8">
            {/* Header Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-8 h-8 text-blue-600" />
                <h1 className="text-3xl font-bold">Help & Support</h1>
              </div>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Find answers to common questions about building and managing
                your real estate website.
              </p>
            </div>

            {/* Quick Support Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <MessageCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">Live Chat</CardTitle>
                      <CardDescription className="text-xs">
                        Instant help from our team
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <Mail className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">Email Support</CardTitle>
                      <CardDescription className="text-xs">
                        24-hour response guarantee
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card className="border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <Phone className="w-5 h-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-base">Schedule Call</CardTitle>
                      <CardDescription className="text-xs">
                        1-on-1 personalized session
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Search Section */}
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>Search Knowledge Base</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search FAQs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Categories Filter */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Browse by Category</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  onClick={() => setSelectedCategory(null)}
                  size="sm"
                >
                  All Categories
                </Button>
                {categories.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Button
                      key={category.name}
                      variant={
                        selectedCategory === category.name
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setSelectedCategory(category.name)}
                      size="sm"
                    >
                      <Icon className="w-3 h-3 mr-1" />
                      {category.name}
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {category.count}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* FAQs Grid */}
            <div className="space-y-4">
              {filteredFaqs.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">
                      No FAQs found
                    </h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or browse all categories.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredFaqs.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card
                      key={category.category}
                      className="border border-border"
                    >
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg border ${category.color}`}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <CardTitle>{category.category}</CardTitle>
                            <CardDescription>
                              {category.items.length} questions
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                          {category.items.map((item, index) => (
                            <AccordionItem
                              key={index}
                              value={`${category.category}-${index}`}
                              className="border-b border-border/50 last:border-b-0"
                            >
                              <AccordionTrigger className="text-sm font-medium hover:text-primary">
                                {item.question}
                              </AccordionTrigger>
                              <AccordionContent className="text-sm text-muted-foreground pt-2">
                                {item.answer}
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Contact Form Section */}
            <Card className="border border-border">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <div>
                    <CardTitle>Still need help?</CardTitle>
                    <CardDescription>
                      Can't find what you're looking for? Send us a message.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Name</label>
                      <Input
                        type="text"
                        placeholder="Your Name"
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            name: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        placeholder="Your Email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({
                            ...contactForm,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input
                      type="text"
                      placeholder="What is this about?"
                      value={contactForm.subject}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          subject: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      placeholder="Describe your question or issue..."
                      value={contactForm.message}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          message: e.target.value,
                        })
                      }
                      rows={4}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>

                <Separator className="my-6" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>2-4 hour response</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Average support response time
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>24/7 Available</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Support for urgent issues
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Expert Guidance</span>
                    </div>
                    <p className="text-xs text-muted-foreground pl-6">
                      Real estate website expertise
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}

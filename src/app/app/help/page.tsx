"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Mail,
  MessageCircle,
  HelpCircle,
  BookOpen,
  Settings,
  Globe,
  Users,
  CreditCard,
  Zap,
  Shield,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

const faqs = [
  {
    category: "Getting Started",
    icon: BookOpen,
    color: "bg-blue-500",
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
    ],
  },
  {
    category: "Website Management",
    icon: Globe,
    color: "bg-green-500",
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
    ],
  },
  {
    category: "Lead Management",
    icon: Users,
    color: "bg-purple-500",
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
    ],
  },
  {
    category: "Analytics & Performance",
    icon: Zap,
    color: "bg-orange-500",
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
    ],
  },
  {
    category: "Billing & Plans",
    icon: CreditCard,
    color: "bg-emerald-500",
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
    ],
  },
  {
    category: "Security & Privacy",
    icon: Shield,
    color: "bg-red-500",
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find answers to common questions about building and managing your real
          estate website with Juzbuild.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card className="border-2 border-blue-200 hover:border-blue-300 transition-colors cursor-pointer">
          <CardHeader className="text-center pb-4">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <CardTitle className="text-lg">Live Chat</CardTitle>
            <CardDescription>Get instant help from our team</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-green-200 hover:border-green-300 transition-colors cursor-pointer">
          <CardHeader className="text-center pb-4">
            <Mail className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <CardTitle className="text-lg">Email Support</CardTitle>
            <CardDescription>Send us a detailed message</CardDescription>
          </CardHeader>
        </Card>

        <Card className="border-2 border-purple-200 hover:border-purple-300 transition-colors cursor-pointer">
          <CardHeader className="text-center pb-4">
            <Phone className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <CardTitle className="text-lg">Schedule Call</CardTitle>
            <CardDescription>Book a 1-on-1 session</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Categories Filter */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Browse by Category</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="mb-2"
          >
            All Categories
          </Button>
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                onClick={() => setSelectedCategory(category.name)}
                className="mb-2"
              >
                <Icon className="w-4 h-4 mr-2" />
                {category.name}
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FAQs Section */}
        <div className="lg:col-span-2">
          <div className="space-y-8">
            {filteredFaqs.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.category}>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${category.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {category.category}
                        </CardTitle>
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
                        >
                          <AccordionTrigger className="text-left">
                            {item.question}
                          </AccordionTrigger>
                          <AccordionContent className="text-muted-foreground">
                            {item.answer}
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredFaqs.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <HelpCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No FAQs found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse all categories.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Contact Form Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Mail className="w-5 h-5" />
                <span>Still Need Help?</span>
              </CardTitle>
              <CardDescription>
                Can't find what you're looking for? Send us a message and we'll
                get back to you within 24 hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="Your Name"
                    value={contactForm.name}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    value={contactForm.email}
                    onChange={(e) =>
                      setContactForm({ ...contactForm, email: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    placeholder="Subject"
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
                <div>
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
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Average response time: 2-4 hours</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>24/7 support for urgent issues</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span>Expert real estate website guidance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

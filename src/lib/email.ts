// Client-safe email utilities for Next.js
// Prevents email services from being bundled in client-side code

let sendWaitlistWelcomeEmail: (email: string, baseUrl?: string) => Promise<void>;
let sendWaitlistNotificationEmail: (email: string) => Promise<void>;
let sendWebsiteCreationEmail: (websiteData: {
  userEmail: string;
  companyName: string;
  websiteName: string;
  domain: string;
  theme: string;
  layoutStyle: string;
  websiteUrl: string;
  createdAt: string;
}, baseUrl?: string) => Promise<void>;
let sendContactEmail: ({
  name,
  email,
  phone,
  company,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
}, baseUrl?: string) => Promise<void>;
let sendUserWelcomeEmail: (userData: {
  fullName: string;
  email: string;
  companyName: string;
  domainName: string;
  selectedPlan: string;
  selectedTheme: string;
}, baseUrl?: string) => Promise<void>;
let sendPasswordResetEmail: (resetData: {
  email: string;
  resetUrl: string;
}, baseUrl?: string) => Promise<void>;

if (typeof window === "undefined") {
  // Server-side: initialize email service
  // Use Promise.all to load all dependencies dynamically
  const emailServicePromise = Promise.all([
    import("resend"),
    import("handlebars"),
    import("./templates"),
  ]).then(([resendModule, handlebarsModule, templatesModule]) => {
    const { Resend } = resendModule;
    const handlebars = handlebarsModule.default;
    const { emailTemplates } = templatesModule;

    const resend = new Resend(process.env.RESEND_API_KEY);

    // Cache for compiled templates
    const templateCache: { [key: string]: any } = {};

    /**
     * Get template with organized module imports and environment variable fallback
     */
    function getTemplate(templateName: string): any {
      if (templateCache[templateName]) {
        return templateCache[templateName];
      }

      let templateSource: string | null = null;

      // First try imported templates
      if (emailTemplates[templateName as keyof typeof emailTemplates]) {
        templateSource =
          emailTemplates[templateName as keyof typeof emailTemplates];
      }

      // Fallback to environment variable
      if (!templateSource) {
        const envTemplateKey = `EMAIL_TEMPLATE_${templateName
          .toUpperCase()
          .replace("-", "_")}`;
        const envTemplate = process.env[envTemplateKey];

        if (envTemplate) {
          templateSource = envTemplate;
        }
      }

      if (!templateSource) {
        throw new Error(
          `Template "${templateName}" not found. Available templates: ${Object.keys(
            emailTemplates
          ).join(
            ", "
          )}. You can also set environment variable: EMAIL_TEMPLATE_${templateName
            .toUpperCase()
            .replace("-", "_")}`
        );
      }

      const template = handlebars.compile(templateSource);
      templateCache[templateName] = template;
      return template;
    }

    /**
     * Send email using HBS template with Resend
     */
    async function sendTemplateEmail(
      to: string,
      templateName: string,
      templateData: Record<string, any>,
      options: {
        subject: string;
        from?: string;
      }
    ): Promise<void> {
      const template = getTemplate(templateName);
      const html = template(templateData);

      const fromEmail =
        options.from ||
        process.env.RESEND_FROM_EMAIL ||
        "onboarding@resend.dev";

      try {
        const response = await resend.emails.send({
          from: fromEmail,
          to,
          subject: options.subject,
          html,
        });

        if (response.error) {
          throw new Error(`Resend error: ${response.error.message}`);
        }

        console.log(`Email sent successfully to ${to}`, response.data?.id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error(`Email send failed for ${to}:`, errorMessage);
        throw new Error(`Failed to send email to ${to}: ${errorMessage}`);
      }
    }

    async function sendContactEmailsInternal(
      {
        name,
        email,
        phone,
        company,
        subject,
        message,
      }: {
        name: string;
        email: string;
        phone?: string;
        company?: string;
        subject: string;
        message: string;
      },
      baseUrl?: string
    ) {
      const finalBaseUrl = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
      const currentYear = new Date().getFullYear();
      const submittedAt = new Date().toLocaleString();

      // Determine if this is a high priority message
      const prioritySubjects = [
        "urgent",
        "emergency",
        "asap",
        "immediate",
        "demo",
        "partnership",
      ];
      const isPriority = prioritySubjects.some(
        (keyword) =>
          subject.toLowerCase().includes(keyword) ||
          message.toLowerCase().includes(keyword)
      );

      // Send confirmation email to the user
      await sendTemplateEmail(
        email,
        "contact-confirmation",
        {
          name,
          email,
          phone: phone || "",
          company: company || "",
          subject,
          message,
          baseUrl: finalBaseUrl,
          currentYear: currentYear.toString(),
        },
        {
          subject: `Thank you for contacting Juzbuild - ${subject}`,
        }
      );

      // Send notification email to the admin/team
      const adminEmail = process.env.ADMIN_EMAIL || "admin@juzbuild.com";
      if (adminEmail) {
        await sendTemplateEmail(
          adminEmail,
          "contact-notification",
          {
            name,
            email,
            phone: phone || "",
            company: company || "",
            subject,
            message,
            submittedAt,
            isPriority,
          },
          {
            subject: `${
              isPriority ? "🚨 [HIGH PRIORITY] " : ""
            }New Contact: ${subject}`,
            from: process.env.RESEND_FROM_EMAIL || "info@juzbuild.com",
          }
        );
      }
    }

    return {
      sendWaitlistEmail: async (email: string, baseUrl?: string): Promise<void> => {
        const appUrl =
          baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
        const unsubscribeUrl = `${appUrl}/unsubscribe?email=${encodeURIComponent(
          email
        )}`;

        await sendTemplateEmail(
          email,
          "waitlist-welcome",
          {
            email,
            appUrl,
            baseUrl: appUrl,
            unsubscribeUrl,
          },
          {
            subject:
              "🎉 Welcome to Juzbuild - You're on the Exclusive Waitlist!",
          }
        );
      },
      sendWaitlistNotification: async (userEmail: string): Promise<void> => {
        const adminEmail = process.env.ADMIN_EMAIL || "admin@juzbuild.com";
        const signupTime = new Date().toLocaleString();

        await sendTemplateEmail(
          adminEmail,
          "waitlist-notification",
          {
            userEmail,
            signupTime,
            currentYear: new Date().getFullYear().toString(),
          },
          {
            subject: "🎉 New Waitlist Signup - Juzbuild",
            from: process.env.RESEND_FROM_EMAIL || "info@juzbuild.com",
          }
        );
      },
      sendWebsiteCreationEmail: async (websiteData: {
        userEmail: string;
        companyName: string;
        websiteName: string;
        domain: string;
        theme: string;
        layoutStyle: string;
        websiteUrl: string;
        createdAt: string;
      }, baseUrl?: string): Promise<void> => {
        const finalBaseUrl =
          baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
        const dashboardUrl = `${finalBaseUrl}/dashboard`;
        const currentYear = new Date().getFullYear();

        await sendTemplateEmail(
          websiteData.userEmail,
          "website-creation",
          {
            ...websiteData,
            baseUrl: finalBaseUrl,
            dashboardUrl,
            currentYear: currentYear.toString(),
          },
          {
            subject: `🎉 Your Website is Live! - ${websiteData.companyName}`,
          }
        );
      },
      sendContactEmails: sendContactEmailsInternal,
      sendUserWelcomeEmail: async (userData: {
        fullName: string;
        email: string;
        companyName: string;
        domainName: string;
        selectedPlan: string;
        selectedTheme: string;
      }, baseUrl?: string): Promise<void> => {
        const finalBaseUrl =
          baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
        const dashboardUrl = `${finalBaseUrl}/app/dashboard`;
        const settingsUrl = `${finalBaseUrl}/app/settings`;
        const helpUrl = `${finalBaseUrl}/app/help`;
        const currentYear = new Date().getFullYear();

        await sendTemplateEmail(
          userData.email,
          "user-welcome",
          {
            ...userData,
            baseUrl: finalBaseUrl,
            dashboardUrl,
            settingsUrl,
            helpUrl,
            currentYear: currentYear.toString(),
          },
          {
            subject: `🎉 Welcome to Juzbuild, ${userData.fullName}!`,
          }
        );
      },
      sendPasswordResetEmail: async (resetData: {
        email: string;
        resetUrl: string;
      }, baseUrl?: string): Promise<void> => {
        const finalBaseUrl =
          baseUrl || process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
        const currentYear = new Date().getFullYear();

        await sendTemplateEmail(
          resetData.email,
          "password-reset",
          {
            ...resetData,
            baseUrl: finalBaseUrl,
            currentYear: currentYear.toString(),
          },
          {
            subject: "Reset Your Juzbuild Password",
          }
        );
      },
    };
  });

  sendWaitlistWelcomeEmail = async (email: string, baseUrl?: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendWaitlistEmail(email, baseUrl);
  };

  sendWaitlistNotificationEmail = async (email: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendWaitlistNotification(email);
  };

  sendWebsiteCreationEmail = async (websiteData: {
    userEmail: string;
    companyName: string;
    websiteName: string;
    domain: string;
    theme: string;
    layoutStyle: string;
    websiteUrl: string;
    createdAt: string;
  }, baseUrl?: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendWebsiteCreationEmail(websiteData, baseUrl);
  };

  sendContactEmail = async (contactData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
  }, baseUrl?: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendContactEmails(contactData, baseUrl);
  };

  sendUserWelcomeEmail = async (userData: {
    fullName: string;
    email: string;
    companyName: string;
    domainName: string;
    selectedPlan: string;
    selectedTheme: string;
  }, baseUrl?: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendUserWelcomeEmail(userData, baseUrl);
  };

  sendPasswordResetEmail = async (resetData: {
    email: string;
    resetUrl: string;
  }, baseUrl?: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendPasswordResetEmail(resetData, baseUrl);
  };
} else {
  // Client-side: provide error stub
  sendWaitlistWelcomeEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );

  sendWaitlistNotificationEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );

  sendWebsiteCreationEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );

  sendContactEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );

  sendUserWelcomeEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );

  sendPasswordResetEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );
}

export {
  sendContactEmail,
  sendPasswordResetEmail,
  sendUserWelcomeEmail,
  sendWaitlistNotificationEmail,
  sendWaitlistWelcomeEmail,
  sendWebsiteCreationEmail,
};

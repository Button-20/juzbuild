// Client-safe email utilities for Next.js
// Prevents email services from being bundled in client-side code

let sendWaitlistWelcomeEmail: (email: string) => Promise<void>;
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
}) => Promise<void>;
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
}) => Promise<void>;
let sendUserWelcomeEmail: (userData: {
  fullName: string;
  email: string;
  companyName: string;
  domainName: string;
  selectedPlan: string;
  selectedTheme: string;
}) => Promise<void>;
let sendPasswordResetEmail: (resetData: {
  email: string;
  resetUrl: string;
}) => Promise<void>;

if (typeof window === "undefined") {
  // Server-side: initialize email service
  // Use Promise.all to load all dependencies dynamically
  const emailServicePromise = Promise.all([
    import("nodemailer"),
    import("handlebars"),
    import("./templates"),
  ]).then(([nodemailerModule, handlebarsModule, templatesModule]) => {
    const nodemailer = nodemailerModule.default;
    const handlebars = handlebarsModule.default;
    const { emailTemplates } = templatesModule;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000, // 10 seconds
      socketTimeout: 10000, // 10 seconds
      pool: {
        maxConnections: 5,
        maxMessages: 100,
        rateDelta: 1000, // 1 second
        rateLimit: 5, // 5 emails per second
      },
    } as any);

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
     * Send email using HBS template with retry logic
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

      const mailOptions = {
        from: options.from || `Juzbuild <${process.env.EMAIL_USER}>`,
        to,
        subject: options.subject,
        html,
      };

      // Retry logic with exponential backoff
      let lastError: Error | null = null;
      const maxRetries = 3;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          await transporter.sendMail(mailOptions);
          return; // Success
        } catch (error) {
          lastError = error as Error;
          console.error(
            `Email send attempt ${attempt + 1}/${maxRetries} failed for ${to}:`,
            error
          );

          // Don't retry on specific errors
          if (
            lastError.message.includes("Invalid email") ||
            lastError.message.includes("Authentication failed")
          ) {
            throw lastError;
          }

          // Wait before retrying (exponential backoff: 1s, 2s, 4s)
          if (attempt < maxRetries - 1) {
            const delayMs = Math.pow(2, attempt) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delayMs));
          }
        }
      }

      // All retries failed
      throw new Error(
        `Failed to send email to ${to} after ${maxRetries} attempts: ${lastError?.message}`
      );
    }

    async function sendContactEmailsInternal({
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
    }) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
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
          baseUrl,
          currentYear: currentYear.toString(),
        },
        {
          subject: `Thank you for contacting Juzbuild - ${subject}`,
        }
      );

      // Send notification email to the admin/team
      const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
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
            from: `Juzbuild Notifications <${process.env.EMAIL_USER}>`,
          }
        );
      }
    }

    return {
      sendWaitlistEmail: async (email: string): Promise<void> => {
        const appUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
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
        const adminEmail = "jasonaddy51@gmail.com";
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
            from: `Juzbuild Notifications <${process.env.EMAIL_USER}>`,
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
      }): Promise<void> => {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
        const dashboardUrl = `${baseUrl}/dashboard`;
        const currentYear = new Date().getFullYear();

        await sendTemplateEmail(
          websiteData.userEmail,
          "website-creation",
          {
            ...websiteData,
            baseUrl,
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
      }): Promise<void> => {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
        const dashboardUrl = `${baseUrl}/app/dashboard`;
        const settingsUrl = `${baseUrl}/app/settings`;
        const helpUrl = `${baseUrl}/app/help`;
        const currentYear = new Date().getFullYear();

        await sendTemplateEmail(
          userData.email,
          "user-welcome",
          {
            ...userData,
            baseUrl,
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
      }): Promise<void> => {
        const baseUrl =
          process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
        const currentYear = new Date().getFullYear();

        await sendTemplateEmail(
          resetData.email,
          "password-reset",
          {
            ...resetData,
            baseUrl,
            currentYear: currentYear.toString(),
          },
          {
            subject: "Reset Your Juzbuild Password",
          }
        );
      },
    };
  });

  sendWaitlistWelcomeEmail = async (email: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendWaitlistEmail(email);
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
  }): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendWebsiteCreationEmail(websiteData);
  };

  sendContactEmail = async (contactData: {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    subject: string;
    message: string;
  }): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendContactEmails(contactData);
  };

  sendUserWelcomeEmail = async (userData: {
    fullName: string;
    email: string;
    companyName: string;
    domainName: string;
    selectedPlan: string;
    selectedTheme: string;
  }): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendUserWelcomeEmail(userData);
  };

  sendPasswordResetEmail = async (resetData: {
    email: string;
    resetUrl: string;
  }): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendPasswordResetEmail(resetData);
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

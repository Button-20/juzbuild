// Client-safe email utilities for Next.js
// Prevents email services from being bundled in client-side code

let sendWaitlistWelcomeEmail: (email: string) => Promise<void>;
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
    });

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
        console.log(`Using imported template: ${templateName}`);
      }

      // Fallback to environment variable
      if (!templateSource) {
        const envTemplateKey = `EMAIL_TEMPLATE_${templateName
          .toUpperCase()
          .replace("-", "_")}`;
        const envTemplate = process.env[envTemplateKey];

        if (envTemplate) {
          templateSource = envTemplate;
          console.log(
            `Using template from environment variable: ${envTemplateKey}`
          );
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
     * Send email using HBS template
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

      await transporter.sendMail(mailOptions);
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
      sendContactEmails: sendContactEmailsInternal,
    };
  });

  sendWaitlistWelcomeEmail = async (email: string): Promise<void> => {
    const emailService = await emailServicePromise;
    return emailService.sendWaitlistEmail(email);
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
} else {
  // Client-side: provide error stub
  sendWaitlistWelcomeEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );

  sendContactEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );
}

export { sendContactEmail, sendWaitlistWelcomeEmail };

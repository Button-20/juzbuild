// Client-safe email utilities for Next.js
// Prevents email services from being bundled in client-side code

let sendWaitlistWelcomeEmail: (email: string) => Promise<void>;

if (typeof window === "undefined") {
  // Server-side: initialize email service
  // Use Promise.all to load all dependencies dynamically
  const emailServicePromise = Promise.all([
    import("nodemailer"),
    import("handlebars"),
    import("fs"),
    import("path"),
  ]).then(([nodemailerModule, handlebarsModule, fsModule, pathModule]) => {
    const nodemailer = nodemailerModule.default;
    const handlebars = handlebarsModule.default;
    const fs = fsModule.default;
    const path = pathModule.default;

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
     * Load and compile HBS template with fallback paths for production
     */
    function getTemplate(templateName: string): any {
      if (templateCache[templateName]) {
        return templateCache[templateName];
      }

      // Multiple potential paths for different deployment environments
      const possiblePaths = [
        // Development path
        path.join(process.cwd(), "src/lib/templates", `${templateName}.hbs`),
        // Public directory (accessible in production)
        path.join(process.cwd(), "public/templates", `${templateName}.hbs`),
        // Vercel production paths
        path.join(
          process.cwd(),
          ".next/server/src/lib/templates",
          `${templateName}.hbs`
        ),
        path.join("/var/task", "src/lib/templates", `${templateName}.hbs`),
        path.join(
          "/var/task",
          ".next/server/src/lib/templates",
          `${templateName}.hbs`
        ),
        path.join("/var/task", "public/templates", `${templateName}.hbs`),
        // Generic build output paths
        path.join(
          process.cwd(),
          "build/src/lib/templates",
          `${templateName}.hbs`
        ),
        path.join(
          process.cwd(),
          "dist/src/lib/templates",
          `${templateName}.hbs`
        ),
        path.join(
          process.cwd(),
          "build/public/templates",
          `${templateName}.hbs`
        ),
        path.join(
          process.cwd(),
          "dist/public/templates",
          `${templateName}.hbs`
        ),
        // Relative to current file
        path.join(__dirname, "templates", `${templateName}.hbs`),
        path.join(__dirname, "../templates", `${templateName}.hbs`),
        path.join(__dirname, "../../public/templates", `${templateName}.hbs`),
      ];

      let templateSource: string | null = null;
      let usedPath: string | null = null;

      // Try each path until we find the file
      for (const templatePath of possiblePaths) {
        try {
          if (fs.existsSync(templatePath)) {
            templateSource = fs.readFileSync(templatePath, "utf8");
            usedPath = templatePath;
            break;
          }
        } catch (error) {
          // Continue to next path
          continue;
        }
      }

      // If file-based loading fails, try to get template from environment variable as fallback
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
          `Template "${templateName}.hbs" not found in any of the following paths:\n${possiblePaths.join(
            "\n"
          )}\n\nCurrent working directory: ${process.cwd()}\n__dirname: ${__dirname}\n\nYou can also set the template content in environment variable: EMAIL_TEMPLATE_${templateName
            .toUpperCase()
            .replace("-", "_")}`
        );
      }

      console.log(`Successfully loaded template from: ${usedPath}`);
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
        from: options.from || process.env.EMAIL_USER,
        to,
        subject: options.subject,
        html,
      };

      await transporter.sendMail(mailOptions);
    }

    return async (email: string): Promise<void> => {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
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
          subject: "🎉 Welcome to Juzbuild - You're on the Exclusive Waitlist!",
        }
      );
    };
  });

  sendWaitlistWelcomeEmail = async (email: string): Promise<void> => {
    const emailFunction = await emailServicePromise;
    return emailFunction(email);
  };
} else {
  // Client-side: provide error stub
  sendWaitlistWelcomeEmail = () =>
    Promise.reject(
      new Error("Email operations are not available on the client side")
    );
}

export { sendWaitlistWelcomeEmail };

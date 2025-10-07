import nodemailer from "nodemailer";

// Email configuration interface
export interface EmailConfig {
  to: string;
  from: string;
  subject: string;
  html: string;
  text?: string;
}

// Create nodemailer transporter
export const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    // For Gmail specifically
    ...(process.env.SMTP_HOST === "smtp.gmail.com" && {
      service: "gmail",
    }),
  };

  return nodemailer.createTransport(config);
};

// Send email function
export const sendEmail = async (emailConfig: EmailConfig): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    // Verify connection configuration
    await transporter.verify();

    // Send email
    const info = await transporter.sendMail({
      from: emailConfig.from,
      to: emailConfig.to,
      subject: emailConfig.subject,
      html: emailConfig.html,
      text: emailConfig.text,
    });

    console.log("Email sent successfully:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};

// Get email configuration from environment variables
export const getEmailConfig = () => {
  return {
    to: process.env.CONTACT_EMAIL_TO || "jasonaddy51@gmail.com",
    from: process.env.CONTACT_EMAIL_FROM || "noreply@yourdomain.com",
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  };
};

// Validate email configuration
export const validateEmailConfig = () => {
  const config = getEmailConfig();
  const requiredFields = ["smtpHost", "smtpPort", "smtpUser", "smtpPass"];

  const missingFields = requiredFields.filter(
    (field) => !config[field as keyof typeof config]
  );

  if (missingFields.length > 0) {
    throw new Error(`Missing email configuration: ${missingFields.join(", ")}`);
  }

  return config;
};

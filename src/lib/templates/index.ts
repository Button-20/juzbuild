import { contactConfirmationTemplate } from "./contact-confirmation";
import { contactNotificationTemplate } from "./contact-notification";
import { passwordResetTemplate } from "./password-reset";
import { userWelcomeTemplate } from "./user-welcome";
import { websiteCreationTemplate } from "./website-creation";

// Export all email templates
export const emailTemplates = {
  "password-reset": passwordResetTemplate,
  "contact-confirmation": contactConfirmationTemplate,
  "contact-notification": contactNotificationTemplate,
  "website-creation": websiteCreationTemplate,
  "user-welcome": userWelcomeTemplate,
} as const;

// Type for template names
export type TemplateName = keyof typeof emailTemplates;

// Helper function to get template by name
export function getEmailTemplate(templateName: TemplateName): string {
  return emailTemplates[templateName];
}

// List all available templates
export const availableTemplates = Object.keys(emailTemplates) as TemplateName[];

# Email Templates

This directory contains organized email templates for the Juzbuild application.

## Structure

```
src/lib/templates/
├── index.ts                 # Main exports and template registry
├── waitlist-welcome.ts      # Waitlist welcome email template
├── password-reset.ts        # Password reset email template
└── README.md               # This file
```

## Adding New Templates

### 1. Create a new template file

Create a new `.ts` file in this directory (e.g., `user-verification.ts`):

```typescript
export const userVerificationTemplate = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Verify Your Email</title>
    <!-- Your HTML content here -->
  </head>
  <body>
    <div style="padding: 40px 20px;">
      <!-- Template content with {{variables}} -->
      <p>Hi {{email}}, please verify your account by clicking {{verificationUrl}}</p>
    </div>
  </body>
</html>`;
```

### 2. Register the template

Add your template to `index.ts`:

```typescript
import { userVerificationTemplate } from "./user-verification";

export const emailTemplates = {
  "waitlist-welcome": waitlistWelcomeTemplate,
  "password-reset": passwordResetTemplate,
  "user-verification": userVerificationTemplate, // Add your template here
} as const;
```

### 3. Use the template

The template will be automatically available in your email service:

```typescript
await sendTemplateEmail(
  "user@example.com",
  "user-verification",
  {
    email: "user@example.com",
    verificationUrl: "https://app.com/verify?token=...",
  },
  {
    subject: "Please verify your email address",
  }
);
```

## Template Variables

Templates use Handlebars syntax with double curly braces: `{{variableName}}`

### Common variables:

- `{{email}}` - Recipient's email address
- `{{baseUrl}}` - Application base URL
- `{{appUrl}}` - Application URL
- `{{unsubscribeUrl}}` - Unsubscribe link

### Template-specific variables:

- **waitlist-welcome**: `email`, `appUrl`, `baseUrl`, `unsubscribeUrl`
- **password-reset**: `email`, `resetUrl`, `currentYear`

## Best Practices

1. **Keep templates organized**: One template per file
2. **Use semantic naming**: `user-verification.ts`, `order-confirmation.ts`
3. **Include all required variables**: Document variables in template comments
4. **Test templates**: Always test with actual data before deploying
5. **Mobile-friendly**: Ensure templates work on mobile devices
6. **Fallback content**: Always provide fallback text for images

## Environment Variables

You can also override any template using environment variables:

```
EMAIL_TEMPLATE_WAITLIST_WELCOME="<html>...</html>"
EMAIL_TEMPLATE_PASSWORD_RESET="<html>...</html>"
```

This is useful for:

- A/B testing different template versions
- Quick template fixes without code deployment
- Environment-specific template content

## Template Development

For easier template development, you can:

1. Create your template as a separate HTML file first
2. Test it in a browser
3. Convert it to a TypeScript template string
4. Replace dynamic content with Handlebars variables

## Production Deployment

Templates are bundled with the application code, ensuring they're always available in production environments like Vercel, AWS Lambda, etc. No additional file system setup is required.

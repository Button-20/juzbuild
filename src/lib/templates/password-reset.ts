export const passwordResetTemplate = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Reset Your Juzbuild Password</title>
    <style>
      body { margin: 0; padding: 0; background-color: #0f0f0f; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .email-container { max-width: 600px; margin: 0 auto; background-color: #1a1a1a; border-radius: 12px; overflow: hidden; }
      .email-header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
      .logo-img { max-width: 150px; height: auto; margin: 0 auto 16px; display: block; }
      .logo-text { font-size: 22px; font-weight: 700; color: #ffffff; margin: 0; }
      .email-content { padding: 40px 30px; color: #ffffff; }
      .reset-title { font-size: 24px; font-weight: 700; color: #ffffff; margin: 0 0 16px 0; }
      .reset-message { font-size: 15px; line-height: 1.6; color: #e5e7eb; margin: 0 0 30px 0; }
      .reset-button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 30px 0; }
      .email-footer { background-color: #0f0f0f; padding: 30px; text-align: center; color: #9ca3af; font-size: 12px; }
    </style>
  </head>
  <body>
    <div style="padding: 40px 20px;">
      <div class="email-container">
        <div class="email-header">
          <img src="https://res.cloudinary.com/dho8jec7k/image/upload/v1759285901/icon_hdlovp.png" alt="Juzbuild Logo" style="height: 35px; width: auto; margin: 0 auto 12px; display: block;" />
          <h1 class="logo-text">Juzbuild</h1>
        </div>
        <div class="email-content">
          <h2 class="reset-title">Reset Your Password</h2>
          <p class="reset-message">
            Hi {{email}},<br><br>
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center;">
            <a href="{{resetUrl}}" class="reset-button">Reset Password</a>
          </div>
          <p class="reset-message">
            This link will expire in 24 hours. If you didn't request this reset, you can safely ignore this email.
          </p>
        </div>
        <div class="email-footer">
          <p>© {{currentYear}} Juzbuild. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

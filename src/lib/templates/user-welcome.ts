export const userWelcomeTemplate = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome to Juzbuild</title>
    <style>
      /* Reset and base styles */
      body, table, td, p, a, li, blockquote {
      -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
      table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
      img { -ms-interpolation-mode: bicubic; }

      /* Base styles */
      body {
        margin: 0 !important;
        padding: 0 !important;
        background-color: #0f0f0f;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      /* Container */
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #1a1a1a;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
      }

      /* Header */
      .email-header {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        padding: 40px 30px;
        text-align: center;
        position: relative;
      }
      .email-header::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
                    radial-gradient(circle at 70% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
      }
      .logo {
        font-size: 22px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
        position: relative;
        z-index: 1;
        letter-spacing: -0.5px;
      }
      .tagline {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        margin: 8px 0 0 0;
        position: relative;
        z-index: 1;
      }

      /* Content */
      .email-content { padding: 40px 30px; color: #ffffff; }
      .welcome-title {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 16px 0;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        line-height: 1.2;
      }
      .welcome-message {
        font-size: 15px;
        line-height: 1.6;
        color: #e5e7eb;
        margin: 0 0 30px 0;
      }

      .account-info {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 8px;
        padding: 24px;
        margin: 30px 0;
      }
      .account-title {
        font-size: 16px;
        font-weight: 600;
        color: #3b82f6;
        margin: 0 0 12px 0;
      }
      .account-detail {
        font-size: 14px;
        line-height: 1.5;
        color: #d1d5db;
        margin: 4px 0;
      }

      .next-steps {
        margin: 30px 0;
      }
      .step-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 16px;
      }
      .step-number {
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 16px;
        flex-shrink: 0;
        margin-top: 2px;
        font-size: 12px;
        font-weight: bold;
        color: white;
      }
      .step-text {
        font-size: 14px;
        line-height: 1.5;
        color: #e5e7eb;
        margin: 0;
      }

      .feature-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 30px 0;
      }
      .feature-item {
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
      }
      .feature-icon {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 12px;
        font-size: 16px;
      }
      .feature-title {
        font-size: 14px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 4px 0;
      }
      .feature-desc {
        font-size: 12px;
        color: #9ca3af;
        margin: 0;
        line-height: 1.4;
      }

      /* CTA Button */
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        text-align: center;
        margin: 30px 0;
        box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        transition: all 0.3s ease;
      }
      .cta-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
      }

      /* Footer */
      .email-footer {
        background-color: #0f0f0f;
        padding: 30px;
        text-align: center;
        border-top: 1px solid #374151;
      }
      .footer-links {
        margin: 20px 0;
      }
      .footer-link {
        color: #9ca3af;
        text-decoration: none;
        margin: 0 10px;
        font-size: 12px;
      }
      .footer-link:hover {
        color: #3b82f6;
      }
      .footer-text {
        font-size: 11px;
        color: #6b7280;
        margin: 10px 0 0 0;
        line-height: 1.4;
      }
      .social-links {
        margin: 20px 0 10px 0;
      }
      .social-link {
        display: inline-block;
        width: 32px;
        height: 32px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        margin: 0 4px;
        text-decoration: none;
        color: #9ca3af;
        font-size: 14px;
        line-height: 32px;
        text-align: center;
      }
      .social-link:hover {
        background: #3b82f6;
        color: #ffffff;
      }

      /* Responsive */
      @media only screen and (max-width: 600px) {
        .email-container { margin: 0; border-radius: 0; }
        .email-header, .email-content, .email-footer { padding-left: 20px; padding-right: 20px; }
        .feature-grid { grid-template-columns: 1fr; gap: 16px; }
        .welcome-title { font-size: 20px; }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <!-- Header -->
      <div class="email-header">
        <img 
          src="https://res.cloudinary.com/dho8jec7k/image/upload/v1759285901/icon_hdlovp.png" 
          alt="Juzbuild Logo" 
          style="height: 35px; width: auto; margin-bottom: 10px;" 
        />
        <h1 class="logo">Juzbuild</h1>
        <p class="tagline">AI-Powered Real Estate Websites</p>
      </div>

      <!-- Content -->
      <div class="email-content">
        <h2 class="welcome-title">Welcome to Juzbuild, {{fullName}}! 🎉</h2>

        <p class="welcome-message">
          Congratulations! Your account has been successfully created and your real estate website is now being built.
          We're excited to help you establish a powerful online presence for your real estate business.
        </p>

        <!-- Account Information -->
        <div class="account-info">
          <h3 class="account-title">Your Account Details</h3>
          <p class="account-detail"><strong>Company:</strong> {{companyName}}</p>
          <p class="account-detail"><strong>Domain:</strong> {{domainName}}.juzbuild.com</p>
          <p class="account-detail"><strong>Plan:</strong> {{selectedPlan}} Plan</p>
          <p class="account-detail"><strong>Theme:</strong> {{selectedTheme}}</p>
        </div>

        <!-- Next Steps -->
        <div class="next-steps">
          <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 20px 0;">What's Next?</h3>

          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-text">
              <strong>Website Creation:</strong> Your website is currently being generated with your selected theme and content. This usually takes 5-10 minutes.
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-text">
              <strong>Access Your Dashboard:</strong> Once ready, you'll receive a notification. Use your dashboard to manage properties, view analytics, and customize your site.
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-text">
              <strong>Add Your Properties:</strong> Start adding property listings to showcase your real estate portfolio and attract potential buyers.
            </div>
          </div>

          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-text">
              <strong>Customize & Optimize:</strong> Personalize your website design, optimize for SEO, and connect your preferred marketing tools.
            </div>
          </div>
        </div>

        <!-- Features Grid -->
        <div class="feature-grid">
          <div class="feature-item">
            <div class="feature-icon">🏠</div>
            <h4 class="feature-title">Property Management</h4>
            <p class="feature-desc">Easily add, edit, and manage your property listings with our intuitive interface.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">📊</div>
            <h4 class="feature-title">Lead Analytics</h4>
            <p class="feature-desc">Track inquiries, view conversion rates, and optimize your marketing efforts.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">🎨</div>
            <h4 class="feature-title">Custom Design</h4>
            <p class="feature-desc">Personalize your website with custom branding, colors, and layouts.</p>
          </div>

          <div class="feature-item">
            <div class="feature-icon">📱</div>
            <h4 class="feature-title">Mobile Optimized</h4>
            <p class="feature-desc">Your website looks great on all devices - desktop, tablet, and mobile.</p>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center;">
          <a href="{{dashboardUrl}}" class="cta-button">Access Your Dashboard →</a>
        </div>

        <p style="font-size: 14px; color: #9ca3af; text-align: center; margin: 20px 0;">
          Need help getting started? Check out our <a href="{{helpUrl}}" style="color: #3b82f6; text-decoration: none;">Help Center</a> or
          <a href="{{settingsUrl}}" style="color: #3b82f6; text-decoration: none;">update your preferences</a>.
        </p>
      </div>

      <!-- Footer -->
      <div class="email-footer">
        <div class="social-links">
          <a href="#" class="social-link">📘</a>
          <a href="#" class="social-link">🐦</a>
          <a href="#" class="social-link">📷</a>
          <a href="#" class="social-link">💼</a>
        </div>

        <div class="footer-links">
          <a href="{{baseUrl}}/privacy" class="footer-link">Privacy Policy</a>
          <a href="{{baseUrl}}/terms" class="footer-link">Terms of Service</a>
          <a href="{{helpUrl}}" class="footer-link">Help Center</a>
          <a href="{{baseUrl}}/contact" class="footer-link">Contact Us</a>
        </div>

        <p class="footer-text">
          You're receiving this email because you signed up for Juzbuild.<br>
          © {{currentYear}} Juzbuild. All rights reserved.<br>
          <a href="{{baseUrl}}/unsubscribe" style="color: #6b7280;">Unsubscribe</a> from future emails.
        </p>
      </div>
    </div>
  </body>
</html>`;

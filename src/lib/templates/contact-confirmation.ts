export const contactConfirmationTemplate = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Thank you for contacting Juzbuild</title>
    <style>
      /* Reset and base styles */
      body, table, td, p, a, li, blockquote {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      
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
      }
      
      .logo {
        font-size: 22px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }
      
      /* Content */
      .email-content {
        padding: 40px 30px;
        color: #ffffff;
      }
      
      .content-title {
        font-size: 24px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 16px 0;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .content-message {
        font-size: 15px;
        line-height: 1.6;
        color: #e5e7eb;
        margin: 0 0 20px 0;
      }
      
      .contact-details {
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
        border: 1px solid rgba(59, 130, 246, 0.2);
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
      }
      
      .detail-row {
        display: flex;
        margin-bottom: 10px;
      }
      
      .detail-label {
        font-weight: 600;
        width: 100px;
        color: #3b82f6;
      }
      
      .detail-value {
        flex: 1;
        color: #e5e7eb;
      }
      
      /* CTA Button */
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 14px;
        text-align: center;
        margin: 30px 0;
      }
      
      /* Footer */
      .email-footer {
        background-color: #0f0f0f;
        padding: 30px;
        text-align: center;
        color: #9ca3af;
        font-size: 12px;
        border-top: 1px solid #374151;
      }
      
      /* Responsive */
      @media only screen and (max-width: 600px) {
        .email-container {
          margin: 10px;
          border-radius: 8px;
        }
        
        .email-header,
        .email-content,
        .email-footer {
          padding: 20px;
        }
        
        .content-title {
          font-size: 22px;
        }
        
        .content-message {
          font-size: 14px;
        }
        
        .contact-details {
          padding: 15px;
        }
        
        .detail-row {
          flex-direction: column;
          margin-bottom: 15px;
        }
        
        .detail-label {
          width: auto;
          margin-bottom: 5px;
        }
      }
    </style>
  </head>
  <body>
    <div style="background-color: #0f0f0f; padding: 40px 20px;">
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <img
            src="https://res.cloudinary.com/dho8jec7k/image/upload/v1759285901/icon_hdlovp.png"
            alt="Juzbuild Logo"
            style="height: 35px; width: auto; margin-bottom: 10px;"
          />
          <h1 class="logo">Juzbuild</h1>
        </div>

        <!-- Content -->
        <div class="email-content">
          <h2 class="content-title">Thank You for Reaching Out! 🚀</h2>

          <p class="content-message">
            Hi {{name}},<br><br>
            Thank you for contacting Juzbuild! We've received your message and our team will get back to you within 24 hours.
          </p>

          <div class="contact-details">
            <h3 style="margin: 0 0 15px 0; color: #3b82f6; font-size: 16px;">Your Message Details:</h3>
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">{{name}}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">{{email}}</span>
            </div>
            {{#if phone}}
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">{{phone}}</span>
            </div>
            {{/if}}
            {{#if company}}
            <div class="detail-row">
              <span class="detail-label">Company:</span>
              <span class="detail-value">{{company}}</span>
            </div>
            {{/if}}
            <div class="detail-row">
              <span class="detail-label">Subject:</span>
              <span class="detail-value">{{subject}}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Message:</span>
              <span class="detail-value">{{message}}</span>
            </div>
          </div>

          <p class="content-message">
            In the meantime, feel free to explore our platform and learn more about how Juzbuild can transform your real estate business with AI-powered tools.
          </p>

          <div style="text-align: center;">
            <a href="{{baseUrl}}" class="cta-button">
              Explore Juzbuild
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div class="email-footer">
          <p>
            Questions? We're here to help! Reach out to us at
            <a href="mailto:hello@juzbuild-ai.com" style="color: #3b82f6;">hello@juzbuild-ai.com</a>
          </p>
          <p style="margin-top: 20px;">© {{currentYear}} Juzbuild. All rights reserved.</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

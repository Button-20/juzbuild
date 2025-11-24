export const contactNotificationTemplate = `<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>New Contact Form Submission - Juzbuild</title>
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
        padding: 30px;
        text-align: center;
      }
      
      .logo {
        font-size: 20px;
        font-weight: 700;
        color: #ffffff;
        margin: 0;
      }
      
      /* Content */
      .email-content {
        padding: 30px;
        color: #ffffff;
      }
      
      .content-title {
        font-size: 22px;
        font-weight: 700;
        color: #ffffff;
        margin: 0 0 20px 0;
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      
      .urgent-tag {
        display: inline-block;
        background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 15px;
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
        margin-bottom: 12px;
        align-items: flex-start;
      }
      
      .detail-label {
        font-weight: 600;
        width: 100px;
        color: #3b82f6;
        flex-shrink: 0;
      }
      
      .detail-value {
        flex: 1;
        color: #e5e7eb;
        word-wrap: break-word;
      }
      
      .message-content {
        background-color: #111827;
        border-left: 4px solid #3b82f6;
        padding: 15px;
        margin: 15px 0;
        border-radius: 0 8px 8px 0;
      }
      
      .priority-high {
        border-left-color: #ef4444;
      }
      
      /* Action buttons */
      .action-buttons {
        display: flex;
        gap: 10px;
        margin: 25px 0;
        flex-wrap: wrap;
      }
      
      .action-button {
        display: inline-block;
        padding: 10px 20px;
        border-radius: 6px;
        text-decoration: none;
        font-weight: 600;
        font-size: 14px;
        text-align: center;
        min-width: 120px;
      }
      
      .btn-primary {
        background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
        color: #ffffff;
      }
      
      .btn-secondary {
        background: rgba(107, 114, 128, 0.2);
        color: #e5e7eb;
        border: 1px solid rgba(107, 114, 128, 0.3);
      }
      
      /* Footer */
      .email-footer {
        background-color: #0f0f0f;
        padding: 25px;
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
          font-size: 20px;
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
        
        .action-buttons {
          flex-direction: column;
        }
        
        .action-button {
          width: 100%;
        }
      }
    </style>
  </head>
  <body>
    <div style="background-color: #0f0f0f; padding: 20px;">
      <div class="email-container">
        <!-- Header -->
        <div class="email-header">
          <img 
            src="https://res.cloudinary.com/dho8jec7k/image/upload/v1759285901/icon_hdlovp.png" 
            alt="Juzbuild Logo" 
            style="height: 35px; width: auto; margin-bottom: 10px;" 
          />
          <h1 class="logo">🚨 New Contact Submission</h1>
        </div>

        <!-- Content -->
        <div class="email-content">
          {{#if isPriority}}
          <span class="urgent-tag">HIGH PRIORITY</span>
          {{/if}}
          
          <h2 class="content-title">Contact Form Submission</h2>
          
          <p style="color: #e5e7eb; margin-bottom: 20px;">
            A new contact form has been submitted on the Juzbuild website. Please review the details below and respond accordingly.
          </p>

          <div class="contact-details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value"><strong>{{name}}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Email:</span>
              <span class="detail-value">
                <a href="mailto:{{email}}" style="color: #60a5fa; text-decoration: none;">{{email}}</a>
              </span>
            </div>
            {{#if phone}}
            <div class="detail-row">
              <span class="detail-label">Phone:</span>
              <span class="detail-value">
                <a href="tel:{{phone}}" style="color: #60a5fa; text-decoration: none;">{{phone}}</a>
              </span>
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
              <span class="detail-value"><strong>{{subject}}</strong></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Submitted:</span>
              <span class="detail-value">{{submittedAt}}</span>
            </div>
          </div>

          <div class="message-content {{#if isPriority}}priority-high{{/if}}">
            <strong style="color: #3b82f6; display: block; margin-bottom: 10px;">Message:</strong>
            <div style="color: #e5e7eb; line-height: 1.6;">{{message}}</div>
          </div>

          <div class="action-buttons">
            <a href="mailto:{{email}}?subject=Re: {{subject}}" class="action-button btn-primary">
              Reply via Email
            </a>
            {{#if phone}}
            <a href="tel:{{phone}}" class="action-button btn-secondary">
              Call {{phone}}
            </a>
            {{/if}}
          </div>

          <p style="color: #9ca3af; font-size: 13px; margin-top: 30px;">
            <strong>Response Time Goal:</strong> Please respond within 24 hours to maintain our service standards.
          </p>
        </div>

        <!-- Footer -->
        <div class="email-footer">
          <p>This is an automated notification from the Juzbuild contact form.</p>
          <p style="margin-top: 10px;">Juzbuild Admin Panel | Contact Management</p>
        </div>
      </div>
    </div>
  </body>
</html>`;

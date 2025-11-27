export const websiteCreationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Website is Ready!</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            line-height: 1.6; 
            margin: 0; 
            padding: 0; 
            background-color: #f5f5f5; 
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            text-align: center; 
            padding: 40px 20px; 
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 700; 
        }
        .content { 
            padding: 40px 30px; 
        }
        .success-badge {
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
        }
        .website-info {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #374151;
        }
        .info-value {
            color: #667eea;
            font-weight: 500;
        }
        .cta-button { 
            display: inline-block; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 15px 30px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 10px 20px 0; 
            transition: transform 0.2s;
            font-size: 16px;
            font-weight: 600;
        }
        .cta-button:hover { 
            transform: translateY(-2px); 
        }
        .secondary-button { 
            display: inline-block; 
            background: white; 
            color: #667eea; 
            border: 2px solid #667eea;
            padding: 13px 28px; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: 600; 
            margin: 20px 10px 20px 0; 
            transition: all 0.2s;
        }
        .secondary-button:hover { 
            background: #667eea;
            color: white;
        }
        .features {
            margin: 30px 0;
        }
        .feature-item {
            display: flex;
            align-items: center;
            margin: 15px 0;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
        }
        .feature-icon {
            width: 50px;
            height: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 15px;
            color: white;
            font-weight: bold;
            font-size: 24px;
            flex-shrink: 0;
        }
        .footer { 
            background: #f8fafc; 
            text-align: center; 
            padding: 30px 20px; 
            color: #6b7280; 
            border-top: 1px solid #e5e7eb;
        }
        .footer a { 
            color: #667eea; 
            text-decoration: none; 
        }
        .next-steps {
            background: #eff6ff;
            border: 1px solid #dbeafe;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .next-steps h3 {
            color: #1e40af;
            margin-top: 0;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin: 10px 0;
        }
        .step-number {
            background: #667eea;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            margin-right: 12px;
            flex-shrink: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img 
              src="https://res.cloudinary.com/dho8jec7k/image/upload/v1759285901/icon_hdlovp.png" 
              alt="Juzbuild Logo" 
              style="height: 35px; width: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;" 
            />
            <h1>🎉 Your Website is Live!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your professional real estate website has been created successfully</p>
        </div>
        
        <div class="content">
            <div class="success-badge">✅ Website Created Successfully</div>
            
            <h2>Hello {{companyName}}!</h2>
            <p>Great news! Your professional real estate website has been automatically created and is now live. Here are your website details:</p>
            
            <div class="website-info">
                <div class="info-item">
                    <span class="info-label">Website Name:</span>
                    <span class="info-value">{{websiteName}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Company:</span>
                    <span class="info-value">{{companyName}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Domain:</span>
                    <span class="info-value">{{domain}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Theme:</span>
                    <span class="info-value">{{theme}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Layout:</span>
                    <span class="info-value">{{layoutStyle}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Created:</span>
                    <span class="info-value">{{createdAt}}</span>
                </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{{websiteUrl}}" class="cta-button" style="color: white !important;">🌐 View Your Website</a>
                <a href="{{dashboardUrl}}" class="secondary-button">📊 Manage Website</a>
            </div>

            <div class="features">
                <h3>What's included in your website:</h3>
                
                <div class="feature-item">
                    <div class="feature-icon">🏠</div>
                    <div>
                        <strong>Property Listings</strong><br>
                        Professional property showcase with sample listings ready for your content
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">📱</div>
                    <div>
                        <strong>Mobile Responsive</strong><br>
                        Your website looks perfect on all devices - desktop, tablet, and mobile
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">🎨</div>
                    <div>
                        <strong>Professional Design</strong><br>
                        Modern, clean design that builds trust with your potential clients
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">⚡</div>
                    <div>
                        <strong>Fast Loading</strong><br>
                        Optimized for speed to provide the best user experience
                    </div>
                </div>
            </div>

            <div class="next-steps">
                <h3>🚀 Next Steps</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div>
                        <strong>Visit your website</strong> at <a href="{{websiteUrl}}">{{domain}}</a> to see how it looks
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div>
                        <strong>Access your dashboard</strong> to customize content, add properties, and manage settings
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div>
                        <strong>Add your properties</strong> and customize the content to match your brand
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div>
                        <strong>Share your website</strong> with clients and start generating leads
                    </div>
                </div>
            </div>

            <p><strong>Need help?</strong> Our support team is here to assist you. Reply to this email or visit our help center.</p>
        </div>
        
        <div class="footer">
            <p><strong>Juzbuild</strong> - Professional Real Estate Websites</p>
            <p>
                <a href="{{baseUrl}}">Visit Juzbuild</a> | 
                <a href="{{baseUrl}}/support">Get Support</a> | 
                <a href="{{baseUrl}}/dashboard">Dashboard</a>
            </p>
            <p style="font-size: 12px; margin-top: 20px;">
                This email was sent to {{userEmail}} because you created a website with Juzbuild.<br>
                © {{currentYear}} Juzbuild. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
`;

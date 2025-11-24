export const waitlistNotificationTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Waitlist Signup - Juzbuild</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f5f5f5;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 40px auto;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header .emoji {
            font-size: 48px;
            margin-bottom: 10px;
            display: block;
        }
        .content {
            padding: 40px 30px;
        }
        .signup-info {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .signup-info h3 {
            margin: 0 0 15px 0;
            color: #495057;
            font-size: 18px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: 600;
            color: #6c757d;
        }
        .info-value {
            color: #495057;
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .stats {
            background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
        }
        .stats h3 {
            margin: 0 0 10px 0;
            color: #495057;
        }
        .stats p {
            margin: 5px 0;
            color: #6c757d;
        }
        .action-buttons {
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            transition: transform 0.2s;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .footer {
            background: #f8f9fa;
            padding: 20px 30px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
            border-top: 1px solid #e9ecef;
        }
        .footer p {
            margin: 5px 0;
        }
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            .header, .content {
                padding: 20px;
            }
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
            <span class="emoji">🎉</span>
            <h1>New Waitlist Signup!</h1>
        </div>
        
        <div class="content">
            <p>Great news! Someone just joined the Juzbuild waitlist.</p>
            
            <div class="signup-info">
                <h3>Signup Details</h3>
                <div class="info-row">
                    <span class="info-label">Email:</span>
                    <span class="info-value">{{userEmail}}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Time:</span>
                    <span class="info-value">{{signupTime}}</span>
                </div>
            </div>
            
            <div class="stats">
                <h3>📊 Quick Actions</h3>
                <p>You might want to:</p>
                <p>• Add them to your email marketing list</p>
                <p>• Send a personalized follow-up</p>
                <p>• Check their profile for business potential</p>
            </div>
            
            <div class="action-buttons">
                <a href="https://juzbuild.com/admin/waitlist" class="btn">View All Signups</a>
                <a href="mailto:{{userEmail}}" class="btn">Send Personal Email</a>
            </div>
            
            <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; text-align: center;">
                <strong>Tip:</strong> Early engagement is key! Consider reaching out within 24 hours for best results.
            </p>
        </div>
        
        <div class="footer">
            <p><strong>Juzbuild Admin Notifications</strong></p>
            <p>© {{currentYear}} Juzbuild. All rights reserved.</p>
            <p style="margin-top: 10px; font-size: 12px;">
                This is an automated notification. You can manage your admin preferences in the dashboard.
            </p>
        </div>
    </div>
</body>
</html>
`;

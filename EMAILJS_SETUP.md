# EmailJS Setup Guide for Taskly

## Overview
EmailJS allows you to send emails directly from your application without a backend server. It's perfect for client-side and serverless applications.

## Step-by-Step Setup

### 1. Create EmailJS Account

1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Click **Sign Up** and create a free account
3. Verify your email address

### 2. Add Email Service

1. In your EmailJS dashboard, go to **Email Services**
2. Click **Add New Service**
3. Choose your email provider:
   - **Gmail** (recommended for testing)
   - **Outlook**
   - **Yahoo**
   - Or any other supported service
4. Follow the connection steps for your chosen provider
5. **Copy the Service ID** (e.g., `service_abc123`)

### 3. Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Use this template structure:

**Template Settings:**
- **Template Name**: Team Invitation
- **Subject**: `You're invited to join {{team_name}} on Taskly`

**Template Content (HTML):**
```html
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1a1a1a; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .role-box { background: #e8e8e8; padding: 15px; margin: 20px 0; border-radius: 8px; }
        .button { display: inline-block; padding: 12px 30px; background: #1a1a1a; color: white; text-decoration: none; border-radius: 8px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Taskly</h1>
        </div>
        <div class="content">
            <h2>You're invited to join {{team_name}}!</h2>
            <p>Hi {{to_name}},</p>
            <p><strong>{{inviter_name}}</strong> ({{inviter_email}}) has invited you to join their team on Taskly.</p>
            
            <div class="role-box">
                <p><strong>Your Access Level: {{role}}</strong></p>
                <p>{{role_description}}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{{invite_link}}" class="button">Accept Invitation</a>
            </p>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #a855f7;">{{invite_link}}</p>
        </div>
        <div class="footer">
            <p>This invitation was intended for {{to_email}}. If you did not expect this invitation, you can ignore this email.</p>
        </div>
    </div>
</body>
</html>
```

4. **Save the template** and **copy the Template ID** (e.g., `template_xyz789`)

### 4. Get Your API Keys

1. Go to **Account** → **General** in EmailJS dashboard
2. Find your **Public Key** (e.g., `user_abc123xyz`)
3. Go to **Account** → **Security**
4. Create a **Private Key** if you don't have one
5. **Copy both keys**

### 5. Configure Convex Environment Variables

1. Open your Convex dashboard at [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these four variables:

```
EMAILJS_SERVICE_ID=service_abc123
EMAILJS_TEMPLATE_ID=template_xyz789
EMAILJS_PUBLIC_KEY=user_abc123xyz
EMAILJS_PRIVATE_KEY=your_private_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Replace with your actual values from EmailJS dashboard!**

### 6. Restart Convex

```bash
# Stop convex dev (Ctrl+C in terminal)
# Then restart:
npx convex dev
```

### 7. Test the Invitation

1. Click **"Add Member"** in your app
2. Enter an email address
3. Select an access level (Admin, Member, or Viewer)
4. Click **"Send Invite"**
5. Check the Convex terminal for logs
6. Check your email inbox (and spam folder)

## Template Variables Reference

These variables are automatically populated when sending invitations:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{to_email}}` | Recipient's email | `user@example.com` |
| `{{to_name}}` | Recipient's name (or email prefix) | `John Doe` |
| `{{inviter_name}}` | Person sending invite | `Jane Smith` |
| `{{inviter_email}}` | Inviter's email | `jane@taskly.com` |
| `{{team_name}}` | Team name | `Marketing Team` |
| `{{invite_link}}` | Invitation acceptance link | `http://localhost:3000/invite/abc123` |
| `{{role}}` | Access level | `Admin`, `Member`, or `Viewer` |
| `{{role_description}}` | Detailed role permissions | Full description text |

## Troubleshooting

### Error: "EmailJS configuration is incomplete"
- You haven't added all environment variables to Convex dashboard
- Or you haven't restarted `npx convex dev`

### Emails not arriving
1. **Check EmailJS Dashboard** → **Email History** to see if email was sent
2. **Check spam folder**
3. **Verify email service** is properly connected in EmailJS
4. **Check monthly quota** (free tier: 200 emails/month)

### 403 Forbidden Error
- Your private key is incorrect
- Or your service is not properly configured

### Template not found
- Template ID is incorrect
- Or template was deleted from EmailJS dashboard

## Free Tier Limits

EmailJS free tier includes:
- **200 emails per month**
- **2 email services**
- **2 email templates**
- **Basic support**

For production, consider upgrading to a paid plan for more emails and features.

## Email Service Recommendations

### For Testing:
- **Gmail**: Easy to set up, works immediately
- **Outlook**: Good alternative to Gmail

### For Production:
- **Custom SMTP**: Use your own email server
- **Professional email service**: Better deliverability
- **Verify domain**: Set up SPF/DKIM records

## Best Practices

1. **Test with your own email first** before inviting real users
2. **Monitor EmailJS dashboard** for delivery status
3. **Keep template simple** for better compatibility
4. **Use descriptive subject lines**
5. **Include unsubscribe option** for production
6. **Monitor monthly quota** to avoid hitting limits

## Production Checklist

- [ ] Create EmailJS account
- [ ] Connect email service
- [ ] Create and test email template
- [ ] Get all API keys (Service ID, Template ID, Public Key, Private Key)
- [ ] Add environment variables to Convex dashboard
- [ ] Test invitation flow end-to-end
- [ ] Verify emails arrive in inbox (not spam)
- [ ] Monitor EmailJS dashboard for delivery stats
- [ ] Consider upgrading plan for higher limits

## Support

- EmailJS Docs: https://www.emailjs.com/docs/
- EmailJS Dashboard: https://dashboard.emailjs.com/
- Convex Docs: https://docs.convex.dev

## Migration from Resend

If you previously used Resend:
- ✅ Resend and React Email packages have been uninstalled
- ✅ EmailJS package has been installed
- ✅ Invitation code has been updated to use EmailJS
- ✅ Email template is now managed in EmailJS dashboard (not code)
- ⚠️ Remove old Resend environment variables from Convex dashboard
- ⚠️ Delete `RESEND_SETUP.md` file if no longer needed

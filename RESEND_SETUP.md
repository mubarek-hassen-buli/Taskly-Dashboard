# Resend Email Setup Guide for Taskly

## Problem
Emails are not being sent because Convex actions run on Convex servers and don't have access to your local `.env` file.

## Solution
You need to configure environment variables in the Convex dashboard.

## Step-by-Step Setup

### 1. Get Your Resend API Key

1. Go to [https://resend.com](https://resend.com) and sign up/login
2. Navigate to **API Keys** in the dashboard
3. Click **Create API Key**
4. Give it a name (e.g., "Taskly Production")
5. Select **Full Access** or **Sending Access**
6. Copy the API key (starts with `re_`)

### 2. Configure Domain (Important!)

**Without domain verification, you can only send to your own email address.**

#### Option A: Use Resend's Test Domain (Quick Testing)
- You can send to any email using `onboarding@resend.dev` as the sender
- This works immediately but emails may go to spam

#### Option B: Verify Your Own Domain (Recommended for Production)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown (SPF, DKIM, MX)
5. Wait for verification (usually 5-30 minutes)
6. Once verified, you can send from `noreply@yourdomain.com`

### 3. Set Environment Variables in Convex

1. Open your Convex dashboard at [https://dashboard.convex.dev](https://dashboard.convex.dev)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
RESEND_API_KEY=re_your_actual_api_key_here
RESEND_FROM_EMAIL=Taskly <onboarding@resend.dev>
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important Notes:**
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- If you verified a domain, use `Taskly <noreply@yourdomain.com>` instead
- For production, change `NEXT_PUBLIC_APP_URL` to your actual domain

### 4. Restart Convex Dev Server

After adding environment variables:
1. Stop the `npx convex dev` terminal (Ctrl+C)
2. Restart it: `npx convex dev`

### 5. Test the Invitation

1. Click "Add Member" in your app
2. Enter an email address
3. Select an access level
4. Click "Send Invite"
5. Check the Convex terminal for logs:
   - You should see: "Sending invitation email to: ..."
   - And: "Email sent successfully: ..."

### 6. Check Email Delivery

- **Check spam folder** if not in inbox
- **Resend Dashboard**: Go to **Emails** to see delivery status
- **Test emails**: Use `delivered@resend.dev` to test successful delivery

## Troubleshooting

### Error: "RESEND_API_KEY environment variable is not set"
- You haven't added the environment variable to Convex dashboard
- Or you haven't restarted `npx convex dev`

### Emails not arriving
1. **Check Resend Dashboard** → Emails tab to see if email was sent
2. **Check spam folder**
3. **Domain not verified**: You can only send to your own email without verification
4. **Wrong from address**: Make sure it matches your verified domain

### 403 Error
- Your domain is not verified
- Use `onboarding@resend.dev` for testing

### Rate Limit (429 Error)
- Free tier: 100 emails/day
- Upgrade plan if needed

## Testing Addresses

Resend provides special test addresses:
- `delivered@resend.dev` - Simulates successful delivery
- `bounced@resend.dev` - Simulates bounce
- `complained@resend.dev` - Simulates spam complaint

## Production Checklist

- [ ] Verify your domain in Resend
- [ ] Set production environment variables in Convex
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production URL
- [ ] Update `RESEND_FROM_EMAIL` to use your verified domain
- [ ] Test invitation flow end-to-end
- [ ] Monitor Resend dashboard for delivery issues

## Support

- Resend Docs: https://resend.com/docs
- Resend Status: https://status.resend.com
- Convex Docs: https://docs.convex.dev

# Environment Setup for 10k-hours

## The `state_mismatch` Error

This error occurs when the OAuth callback URL doesn't match what's configured in your authentication setup. The most common cause is that `BETTER_AUTH_URL` is not properly set in your Cloudflare Pages deployment.

## What You Need to Set in Cloudflare Pages Dashboard

Go to your Cloudflare Pages project → Settings → Environment variables

### Environment Variables (Plain Text - Not Secrets)

These can be stored as plain text environment variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `BETTER_AUTH_URL` | `https://10k-hours.pages.dev` | **REQUIRED** - This is the main fix for your issue |
| `GOOGLE_CLIENT_ID` | `[your Google client ID]` | Public identifier |
| `GITHUB_CLIENT_ID` | `[your GitHub client ID]` | Public identifier |

### Secrets (Encrypted - Required for Security)

These must be stored as encrypted secrets:

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `BETTER_AUTH_SECRET` | `[generate with: openssl rand -base64 32]` | **REQUIRED** - For signing tokens |
| `GOOGLE_CLIENT_SECRET` | `[from Google Cloud Console]` | **REQUIRED** for Google OAuth |
| `GITHUB_CLIENT_SECRET` | `[from GitHub Developer Settings]` | **REQUIRED** for GitHub OAuth |

## Quick Setup Commands

### Generate a secure BETTER_AUTH_SECRET:
```bash
openssl rand -base64 32
```

### Get your OAuth credentials:

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `https://10k-hours.pages.dev/api/auth/callback/google`

**GitHub:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create OAuth App
3. Add callback URL: `https://10k-hours.pages.dev/api/auth/callback/github`

## Common Issues

### Issue 1: `state_mismatch` error
**Cause:** `BETTER_AUTH_URL` is not set in Cloudflare Pages environment
**Fix:** Add `BETTER_AUTH_URL = https://10k-hours.pages.dev` as an environment variable

### Issue 2: OAuth provider not working
**Cause:** Callback URLs don't match exactly
**Fix:** Ensure callback URLs in OAuth provider settings match exactly:
- Google: `https://10k-hours.pages.dev/api/auth/callback/google`
- GitHub: `https://10k-hours.pages.dev/api/auth/callback/github`

### Issue 3: Authentication fails completely
**Cause:** `BETTER_AUTH_SECRET` not set or too short
**Fix:** Generate a 32+ character secret and add it as a secret

## Local Development

For local development, these are already set in `wrangler.toml`:
- `BETTER_AUTH_URL = "http://localhost:8788"`

You'll need to create a `.dev.vars` file with your secrets for local development.

## After Making Changes

1. **Redeploy** your Cloudflare Pages project
2. **Clear browser cache** and cookies for your site
3. **Test** the authentication flow again

## Verification Checklist

- [ ] `BETTER_AUTH_URL` is set as an environment variable (not secret)
- [ ] `BETTER_AUTH_SECRET` is set as a secret (32+ characters)
- [ ] Google OAuth callback URL matches exactly
- [ ] GitHub OAuth callback URL matches exactly
- [ ] Project has been redeployed after changes

# OAuth Integration Setup Guide

This guide will help you set up Garmin Connect and Strava OAuth integrations.

## Prerequisites

1. Database initialized (run `python init_db.py`)
2. Backend dependencies installed (`pip install -r requirements.txt`)

## Step 1: Generate Encryption Key

Generate a secure encryption key for storing OAuth tokens:

```bash
cd backend
python generate_encryption_key.py
```

Copy the generated key to your `.env` file.

## Step 2: Configure OAuth Providers

### Garmin Connect Setup

1. Visit [Garmin Developer Portal](https://developer.garmin.com/gc-developer-program/)
2. Create a developer account (if needed)
3. Register your application:
   - Application Name: Your app name
   - Redirect URI: `http://localhost:8000/api/integrations/garmin/oauth/callback`
   - For production: Use your production domain
4. Copy the **Client ID** and **Client Secret**

### Strava Setup

1. Visit [Strava API Settings](https://www.strava.com/settings/api)
2. Create a new application:
   - Application Name: Your app name
   - Category: Choose appropriate category
   - Website: Your website URL
   - Authorization Callback Domain: `localhost` (for development)
   - Redirect URI: `http://localhost:8000/api/integrations/strava/oauth/callback`
3. Copy the **Client ID** and **Client Secret**
4. For webhooks (optional but recommended):
   - Set webhook URL: `http://your-domain.com/api/integrations/strava/webhook`
   - Generate a webhook secret (random string)
   - Set verify token (random string)

## Step 3: Update Environment Variables

Add to `backend/.env`:

```env
# Garmin OAuth
GARMIN_CLIENT_ID=your_garmin_client_id
GARMIN_CLIENT_SECRET=your_garmin_client_secret
GARMIN_OAUTH_REDIRECT_URI=http://localhost:8000/api/integrations/garmin/oauth/callback

# Strava OAuth
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_OAUTH_REDIRECT_URI=http://localhost:8000/api/integrations/strava/oauth/callback
STRAVA_WEBHOOK_SECRET=your_webhook_secret
STRAVA_VERIFY_TOKEN=your_verify_token

# Token Encryption (from Step 1)
OAUTH_TOKEN_ENCRYPTION_KEY=your_generated_fernet_key
```

## Step 4: Verify Setup

Run the setup checker:

```bash
python setup_oauth.py
```

This will verify all required variables are set.

## Step 5: Test OAuth Setup

Run the test suite:

```bash
python test_oauth_setup.py
```

This will test:
- Configuration variables
- PKCE generation
- OAuth URL generation
- Database connection and tables

## Step 6: Initialize Database (if not done)

Make sure the `oauth_tokens` table exists:

```bash
python init_db.py
```

## Step 7: Migrate Existing Tokens (if applicable)

If you have existing tokens in `User.oauthTokens` JSON field:

```bash
python migrate_oauth_tokens.py
```

## API Endpoints

Once set up, these endpoints are available:

### Garmin OAuth Flow

1. **Get Authorization URL:**
   ```
   GET /api/integrations/garmin/oauth/authorize
   Authorization: Bearer <your_jwt_token>
   ```
   Returns: `{ "authorization_url": "...", "session_id": "...", "state": "..." }`

2. **User authorizes** → Redirected to callback

3. **Callback handles token exchange:**
   ```
   GET /api/integrations/garmin/oauth/callback?code=...&state=...&session_id=...
   ```

4. **Sync Activities:**
   ```
   GET /api/integrations/garmin/activities/{athlete_id}?start_date=2024-01-01&end_date=2024-01-31
   ```

5. **Disconnect:**
   ```
   POST /api/integrations/garmin/oauth/disconnect
   Authorization: Bearer <your_jwt_token>
   ```

### Strava OAuth Flow

Same pattern as Garmin, but with `/strava/` endpoints.

### Webhook (Strava)

For production, set up webhook subscription:

1. Subscribe to webhook:
   ```
   POST https://www.strava.com/api/v3/push_subscriptions
   {
     "client_id": "...",
     "client_secret": "...",
     "callback_url": "http://your-domain.com/api/integrations/strava/webhook",
     "verify_token": "your_verify_token"
   }
   ```

2. Verify subscription (GET request):
   ```
   GET /api/integrations/strava/webhook?mode=subscribe&token=your_verify_token&challenge=...
   ```

## Testing the Integration

### Manual Test Flow

1. Start backend server:
   ```bash
   python run.py
   # or
   uvicorn app.main:app --reload --port 8000
   ```

2. Get authorization URL (requires authentication):
   ```bash
   curl -X GET "http://localhost:8000/api/integrations/garmin/oauth/authorize" \
     -H "Authorization: Bearer <your_jwt_token>"
   ```

3. Open the `authorization_url` in browser

4. Authorize the application

5. You'll be redirected back with a code

6. The callback endpoint will exchange the code for tokens

7. Test activity sync:
   ```bash
   curl -X GET "http://localhost:8000/api/integrations/garmin/activities/1" \
     -H "Authorization: Bearer <your_jwt_token>"
   ```

## Troubleshooting

### "OAUTH_TOKEN_ENCRYPTION_KEY must be set"
- Run `python generate_encryption_key.py`
- Add the key to `.env`

### "Invalid or expired session"
- Sessions expire after 10 minutes
- Make sure to use the session_id from the authorize endpoint

### "State mismatch"
- The state parameter must match between authorize and callback
- This is a security feature to prevent CSRF attacks

### "OAuth exchange failed"
- Check that redirect URI matches exactly (no trailing slashes)
- Verify client ID and secret are correct
- Check that PKCE code_verifier matches the challenge

### Database errors
- Make sure `oauth_tokens` table exists: `python init_db.py`
- Check database connection in `.env`

## Security Notes

1. **Never commit `.env` file** - It contains secrets
2. **Use different keys for dev/prod** - Generate separate encryption keys
3. **Rotate keys periodically** - If compromised, generate new keys
4. **Protect webhook secrets** - Strava webhook signature verification is critical
5. **HTTPS in production** - Always use HTTPS for OAuth redirects in production

## Production Checklist

- [ ] Generate production encryption key
- [ ] Set up production redirect URIs
- [ ] Configure webhook endpoint (Strava)
- [ ] Set up HTTPS
- [ ] Test OAuth flow end-to-end
- [ ] Monitor token refresh logs
- [ ] Set up webhook signature verification (Strava)
- [ ] Document production redirect URIs

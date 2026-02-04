# Production Deployment Checklist

Use this checklist before deploying to production.

## Security ✅

- [x] **Input Validation**: Added Pydantic validators for all endpoints
- [x] **Parameter Validation**: All IDs validated (must be > 0)
- [x] **CORS Configuration**: Restricted in production mode
- [x] **Security Warnings**: Added checks for default SECRET_KEY
- [x] **Error Handling**: Improved error messages and API error handling
- [ ] **Authentication**: Implement full JWT authentication (structure created in `app/core/auth.py`)
- [ ] **Rate Limiting**: Add rate limiting middleware
- [ ] **HTTPS**: Ensure all production traffic uses HTTPS
- [ ] **SECRET_KEY**: Generate strong random SECRET_KEY (minimum 32 characters)
- [ ] **Database Credentials**: Use strong, unique database passwords
- [ ] **Environment Variables**: Review all sensitive values in production `.env`

## Configuration ✅

- [x] **Environment Detection**: Added `ENVIRONMENT` setting
- [x] **Production Warnings**: Added warnings for insecure configurations
- [ ] **Production .env**: Create production `.env` with:
  - `ENVIRONMENT=production`
  - Strong `SECRET_KEY`
  - Production `DATABASE_URL`
  - Production `CORS_ORIGINS` (no localhost)
- [ ] **Frontend .env.local**: Update `NEXT_PUBLIC_API_URL` to production API URL

## Database

- [x] **Database Tables**: All tables created and verified
- [ ] **Database Backups**: Set up automated backups
- [ ] **Connection Pooling**: Verify connection pool settings
- [ ] **Migrations**: If using migrations, ensure they're applied

## Code Quality ✅

- [x] **Input Validation**: Added Field validators
- [x] **Error Handling**: Improved error messages
- [x] **Type Safety**: Using Pydantic models
- [ ] **Code Review**: Review all TODO comments
- [ ] **Testing**: Add unit and integration tests
- [ ] **Logging**: Set up proper logging (structured logs in production)

## Frontend

- [x] **Error Handling**: Improved API error handling
- [ ] **npm Audit**: Fix security vulnerabilities (`npm audit fix`)
- [ ] **Build**: Test production build (`npm run build`)
- [ ] **Environment Variables**: Verify `NEXT_PUBLIC_API_URL` is correct

## Infrastructure

- [ ] **Server**: Set up production server (e.g., AWS, GCP, Heroku)
- [ ] **Database**: Set up production PostgreSQL instance
- [ ] **Domain**: Configure custom domain and SSL certificate
- [ ] **Monitoring**: Set up application monitoring (e.g., Sentry, DataDog)
- [ ] **Logging**: Set up centralized logging
- [ ] **Backups**: Configure automated database backups

## Performance

- [ ] **Database Indexes**: Verify indexes are created
- [ ] **Caching**: Consider adding Redis for caching
- [ ] **CDN**: Set up CDN for frontend assets
- [ ] **Load Testing**: Perform load testing

## Documentation

- [x] **API Documentation**: FastAPI auto-generates docs at `/docs`
- [ ] **API Versioning**: Consider API versioning strategy
- [ ] **Deployment Docs**: Document deployment process
- [ ] **Runbook**: Create operational runbook

## Pre-Deployment Testing

- [ ] **Health Check**: Verify `/health` endpoint works
- [ ] **API Endpoints**: Test all critical endpoints
- [ ] **Frontend**: Test frontend connects to backend
- [ ] **Database**: Verify database connectivity
- [ ] **Error Scenarios**: Test error handling

## Post-Deployment

- [ ] **Monitor Logs**: Check application logs for errors
- [ ] **Monitor Metrics**: Check CPU, memory, database connections
- [ ] **Test Endpoints**: Verify all endpoints work in production
- [ ] **User Testing**: Perform smoke tests as end user

## Critical Security Items (Must Do Before Production)

1. **Change SECRET_KEY**: Generate a strong random string:
   ```python
   import secrets
   print(secrets.token_urlsafe(32))
   ```

2. **Update CORS_ORIGINS**: Remove localhost, add production frontend URL:
   ```env
   CORS_ORIGINS=["https://yourdomain.com"]
   ```

3. **Secure Database**: Use strong password, restrict network access

4. **Enable HTTPS**: All traffic must use HTTPS in production

5. **Implement Authentication**: Complete the auth system in `app/core/auth.py`

## Notes

- The authentication system structure is in place (`app/core/auth.py`) but needs to be fully implemented
- All endpoints currently accept `coach_id` and `athlete_id` as parameters - these should come from JWT tokens in production
- Integration endpoints (Garmin, Strava) have TODO comments - implement before using in production
- PAIRS notification system needs to be implemented

## Quick Production Setup

1. **Generate SECRET_KEY**:
   ```bash
   python3 -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Update backend/.env**:
   ```env
   ENVIRONMENT=production
   SECRET_KEY=<generated-key>
   DATABASE_URL=postgresql://user:password@prod-db-host:5432/endurance_training
   CORS_ORIGINS=["https://yourdomain.com"]
   ```

3. **Update frontend/.env.local**:
   ```env
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

4. **Review and implement authentication** in `app/core/auth.py`

5. **Run security audit**:
   ```bash
   cd frontend && npm audit fix
   ```

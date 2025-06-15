# HTTPS Setup Guide for Laravel Spin Application

This application has been configured to force HTTPS connections for enhanced security. Here's how the HTTPS implementation works and how to configure it.

## ✅ What's Implemented

### 1. **ForceHttps Middleware**
- **Location**: `app/Http/Middleware/ForceHttps.php`
- **Function**: Redirects all HTTP requests to HTTPS
- **Features**:
  - Respects environment settings
  - Handles proxy headers (load balancers, CDNs)
  - Configurable via `FORCE_HTTPS` environment variable

### 2. **TrustProxies Middleware**
- **Location**: `app/Http/Middleware/TrustProxies.php`
- **Function**: Handles HTTPS headers from proxies and load balancers
- **Supports**: Cloudflare, AWS ELB, and standard proxy headers

### 3. **AppServiceProvider Configuration**
- **Location**: `app/Providers/AppServiceProvider.php`
- **Function**: Forces Laravel to generate HTTPS URLs
- **Automatic**: Enabled in production or when `FORCE_HTTPS=true`

## 🔧 Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Force HTTPS (set to true in production)
FORCE_HTTPS=false

# Update APP_URL to use HTTPS in production
APP_URL=https://yourdomain.com
```

### Environment-Specific Behavior

#### **Local Development** (`APP_ENV=local`)
- HTTPS forcing is **disabled by default**
- Can be enabled with `FORCE_HTTPS=true`
- Allows normal HTTP development workflow

#### **Production** (`APP_ENV=production`)
- HTTPS forcing is **enabled automatically**
- All HTTP requests redirect to HTTPS (301 redirects)
- Laravel generates HTTPS URLs

## 🚀 Deployment Configuration

### Docker Compose Files

The production docker-compose files are configured with:

```yaml
environment:
  FORCE_HTTPS: true
  APP_URL: https://your-domain.com/
```

### Proxy Headers Supported

The application automatically detects HTTPS through these headers:

- `X-Forwarded-Proto: https`
- `X-Forwarded-SSL: on`
- `X-Forwarded-Port: 443`
- `X-Forwarded-Scheme: https`
- `CF-Visitor: {"scheme":"https"}` (Cloudflare)

## 🛡️ Security Features

### 1. **Automatic Redirects**
- 301 permanent redirects from HTTP to HTTPS
- Preserves query parameters and request paths
- SEO-friendly redirect implementation

### 2. **Proxy-Aware**
- Works with load balancers and CDNs
- Prevents redirect loops
- Respects proxy HTTPS headers

### 3. **Environment-Aware**
- Development-friendly (HTTP allowed locally)
- Production-secure (HTTPS enforced)
- Configurable per environment

## 📋 Setup Checklist

### For Production Deployment:

1. **SSL Certificate**: Ensure your domain has a valid SSL certificate
2. **Environment Variables**: Set `FORCE_HTTPS=true` in production
3. **APP_URL**: Update to use `https://` scheme
4. **Load Balancer**: Configure to pass HTTPS headers if using proxies
5. **Testing**: Verify HTTP requests redirect to HTTPS

### For Development:

1. **Local HTTPS** (Optional): Set `FORCE_HTTPS=true` if testing HTTPS locally
2. **SSL Certificate**: Use self-signed certificate or tools like mkcert
3. **APP_URL**: Update to `https://localhost` if forcing HTTPS

## 🧪 Testing HTTPS

### 1. **Test HTTP Redirect**
```bash
curl -I http://yourdomain.com
# Should return 301 redirect to https://
```

### 2. **Test HTTPS Access**
```bash
curl -I https://yourdomain.com
# Should return 200 OK
```

### 3. **Test with Proxy Headers**
```bash
curl -H "X-Forwarded-Proto: https" http://yourdomain.com
# Should not redirect (proxy indicates HTTPS)
```

## 🔍 Troubleshooting

### Common Issues:

1. **Redirect Loops**
   - Check proxy configuration
   - Verify `TrustProxies` middleware is working
   - Ensure load balancer passes correct headers

2. **Mixed Content Warnings**
   - Verify `APP_URL` uses HTTPS
   - Check that `URL::forceScheme('https')` is active
   - Update any hardcoded HTTP URLs in templates

3. **Local Development Issues**
   - Set `FORCE_HTTPS=false` for local development
   - Use `APP_URL=http://localhost` locally

### Debug Commands:

```bash
# Check current environment
php artisan env

# Verify middleware registration
php artisan route:list --middleware

# Test URL generation
php artisan tinker
>>> url('/')  // Should return HTTPS URL in production
```

## 📝 Notes

- The middleware respects Laravel's environment detection
- HTTPS enforcement only applies in production or when explicitly enabled
- Proxy headers are checked to prevent unnecessary redirects
- The implementation is compatible with Laravel Spin's Docker setup

## 🔒 Security Recommendations

1. **HSTS Headers**: Consider adding HTTP Strict Transport Security headers
2. **Secure Cookies**: Ensure session cookies are marked as secure
3. **Content Security Policy**: Implement CSP headers to prevent mixed content
4. **Regular Updates**: Keep SSL certificates updated and renewed

For more information about Laravel security best practices, see the [Laravel Security Documentation](https://laravel.com/docs/security). 
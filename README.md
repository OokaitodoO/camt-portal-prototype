<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## CAMT Portal Configuration

### HTTPS Configuration

This application is configured to force HTTPS in production environments. To enable HTTPS:

1. **Environment Variables**: Set the following in your `.env` file:
   ```
   FORCE_HTTPS=true
   SESSION_SECURE_COOKIE=true
   APP_URL=https://yourdomain.com
   ```

2. **Docker Build**: The Dockerfile automatically runs `npm run build` during the build process to compile frontend assets.

3. **Proxy Configuration**: The application is configured to trust proxies for proper HTTPS detection behind load balancers.

### Environment Setup

Key environment variables for production:
- `FORCE_HTTPS`: Set to `true` to force HTTPS redirects
- `SESSION_SECURE_COOKIE`: Set to `true` to ensure cookies are only sent over HTTPS
- `CMU_CLIENT_ID`: CMU OAuth client ID
- `CMU_CLIENT_SECRET`: CMU OAuth client secret
- `CMU_REDIRECT_URI`: CMU OAuth callback URL

### Troubleshooting

**500 Internal Server Error:**
If you encounter a 500 error after deployment, here are debugging steps:

1. **Check application logs:**
   ```bash
   # View container logs
   docker logs [container-name]
   
   # View Laravel logs inside container
   docker exec [container-name] tail -f /var/www/html/storage/logs/laravel.log
   ```

2. **Enable debug mode temporarily:**
   Add to your environment variables:
   ```env
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```

3. **Check required environment variables:**
   ```env
   APP_KEY=base64:your_key_here
   DB_CONNECTION=sqlite  # or your database config
   ```

4. **Common fixes:**
   ```bash
   # Generate app key if missing
   php artisan key:generate
   
   # Clear all caches
   php artisan cache:clear
   php artisan config:clear
   php artisan route:clear
   php artisan view:clear
   
   # Run database migrations
   php artisan migrate
   ```

**Scripts not loading (CORS errors from localhost:5173):**
If you see CORS errors trying to load scripts from `localhost:5173` in production, this means Laravel is trying to use the Vite development server instead of built assets. This is caused by the `public/hot` file existing. The Dockerfile automatically removes this file, but if deploying manually:

```bash
# Remove the hot file
rm -f public/hot

# Rebuild assets
npm run build

# Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

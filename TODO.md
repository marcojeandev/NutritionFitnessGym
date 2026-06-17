# Security hardening checklist (Backend)

- [x] Fix duplicated middleware registration in `Backend/bootstrap/app.php`
- [x] Restrict CORS in `Backend/config/cors.php` to env-driven allowlist (no more `*`)
- [x] Remove exception message leakage from API/Auth responses in `Backend/app/Http/Controllers/Api/AuthController.php`
- [x] Remove exception message leakage + strengthen OR generation in `Backend/app/Http/Controllers/Admin/UserController.php`
- [x] Fix misleading abort message in `Backend/app/Http/Middleware/MemberMiddleware.php`

- [x] Quick sanity checks: PHP lint / clear caches (no hosting/railway changes)



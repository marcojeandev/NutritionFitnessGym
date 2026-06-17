# Backend Architecture and API Documentation

This document outlines the technology stack and folder structure for the Gym Management Backend system. It is designed to serve as a robust, scalable RESTful API to communicate with a Typescript + React frontend application.

## Technology Stack

- **Framework**: [Laravel](https://laravel.com/) (PHP) - A robust MVC framework for building the core logic and routing.
- **Database**: **MySQL** - Relational database for storing users, memberships, products, and transactions.
- **Authentication**: **Laravel Sanctum** - Used to issue lightweight API tokens for authenticating requests from the React frontend.
- **API Architecture**: **RESTful API** - The frontend will consume data via JSON-based HTTP requests (GET, POST, PUT, DELETE).
- **Environment**: PHP 8.3+

---

## Folder Structure & File Definitions

Below is a breakdown of the critical directories and files in this backend project, detailing what each is responsible for in the context of an API backend.

### `/app`
Contains the core application logic.

- **`/app/Http/Controllers`**: 
  - *Purpose*: The brain of the API. Controllers receive HTTP requests from the React frontend, interact with the Models/Services to process data, and return JSON responses.
  - *Example*: `AuthController.php` (handles login/tokens), `MemberController.php` (handles member CRUD operations).
- **`/app/Http/Middleware`**: 
  - *Purpose*: Intercepts incoming requests before they hit the controller. Useful for checking if the React app sent a valid authentication token or has the right role (e.g., admin vs cashier).
- **`/app/Http/Requests`**: 
  - *Purpose*: Form Request validation classes. These validate the incoming data payload from the React frontend (e.g., ensuring a new member has a valid email format) before it reaches the controller.
- **`/app/Models`**: 
  - *Purpose*: Eloquent ORM classes that represent your database tables (e.g., `User.php`, `Membership.php`, `Product.php`). They define relationships (like a Member has many Transactions) and database interactions.
- **`/app/Services`**: 
  - *Purpose*: Contains business logic separated from controllers to keep the code clean and reusable.
- **`/app/Policies`**: 
  - *Purpose*: Authorization logic. Determines if a specific user is allowed to perform a specific action (e.g., only admins can delete a membership).

### `/routes`
Defines the entry points for the application.

- **`api.php`**: 
  - *Purpose*: **CRITICAL FILE**. All routes that the React frontend will call are defined here. These routes are automatically prefixed with `/api` and do not use session state, relying on token authentication (Sanctum) instead.
- **`web.php`**: 
  - *Purpose*: Typically used for browser-based routing with views, but in this API-only backend, it is mostly unused except for maybe a fallback route or a welcome page.
- **`console.php`**: 
  - *Purpose*: Defines custom Artisan terminal commands.

### `/database`
Manages the database structure and dummy data.

- **`/database/migrations`**: 
  - *Purpose*: Version control for the database schema. These files define how to create or modify tables (e.g., `create_users_table`, `create_memberships_table`). When you run `php artisan migrate`, it builds the MySQL database based on these files.
- **`/database/seeders`**: 
  - *Purpose*: Scripts to populate the database with initial or test data. Extremely useful for testing the React frontend against populated API endpoints.
- **`/database/factories`**: 
  - *Purpose*: Blueprints for generating fake data to be used by the seeders.

### `/config`
- *Purpose*: Contains all configuration files for the application (e.g., database connection settings, CORS settings, authentication settings). The React frontend will need `cors.php` properly configured to allow requests from the frontend domain/port.

### `/storage`
- *Purpose*: Used to store uploaded files (like member profile pictures or product images), application logs (`/storage/logs/laravel.log`), and framework-generated files. The frontend will request images stored here via public URLs.

### `/tests`
- *Purpose*: Contains automated tests (Unit and Feature tests) to ensure the API endpoints return the correct JSON structure and status codes.

### Key Root Files

- **`.env`**: 
  - *Purpose*: Environment variables. This is where you configure your MySQL database credentials, application keys, and API environment specifics. **Never commit this file to version control.**
- **`composer.json`**: 
  - *Purpose*: The PHP dependency manager configuration. It lists all the third-party packages installed in the project (like Laravel Framework, Sanctum, etc.).
- **`artisan`**: 
  - *Purpose*: The command-line interface included with Laravel. Used to run migrations, create controllers, and clear caches.

---

## Connecting to the Frontend

To connect the React + Typescript frontend to this backend:

1. Ensure the backend is running locally (`php artisan serve` typically on `http://127.0.0.1:8000`).
2. In the React app, set the base API URL to `http://127.0.0.1:8000/api`.
3. Ensure **CORS** (Cross-Origin Resource Sharing) is configured in the backend (usually via `config/cors.php`) to accept requests from the React app's development server (e.g., `http://localhost:5173` if using Vite).
4. Authenticate users via the `/api/login` endpoint to receive a Sanctum token, and include this token in the `Authorization: Bearer <token>` header for all subsequent protected API requests.


  
  GET|HEAD        / ...................................................... routes/web.php:5
  GET|HEAD        api/admin/attendance attendance.index › Admin\AttendanceController@index
  POST            api/admin/attendance attendance.store › Admin\AttendanceController@store
  GET|HEAD        api/admin/attendance/{attendance} attendance.show › Admin\AttendanceCont…
  PUT|PATCH       api/admin/attendance/{attendance} attendance.update › Admin\AttendanceCo…
  DELETE          api/admin/attendance/{attendance} attendance.destroy › Admin\AttendanceC…
  GET|HEAD        api/admin/contracts .... contracts.index › Admin\ContractController@index
  POST            api/admin/contracts .... contracts.store › Admin\ContractController@store
  GET|HEAD        api/admin/contracts/{contract} contracts.show › Admin\ContractController…
  PUT|PATCH       api/admin/contracts/{contract} contracts.update › Admin\ContractControll…
  DELETE          api/admin/contracts/{contract} contracts.destroy › Admin\ContractControl…
  GET|HEAD        api/admin/products ....... products.index › Admin\ProductController@index
  POST            api/admin/products ....... products.store › Admin\ProductController@store
  GET|HEAD        api/admin/products-paycheck products-paycheck.index › Admin\ProductPaych…
  POST            api/admin/products-paycheck products-paycheck.store › Admin\ProductPaych…
  GET|HEAD        api/admin/products-paycheck/{products_paycheck} products-paycheck.show  …
  PUT|PATCH       api/admin/products-paycheck/{products_paycheck} products-paycheck.update…
  DELETE          api/admin/products-paycheck/{products_paycheck} products-paycheck.destro…
  GET|HEAD        api/admin/products/{product} products.show › Admin\ProductController@show
  PUT|PATCH       api/admin/products/{product} products.update › Admin\ProductController@u…
  DELETE          api/admin/products/{product} products.destroy › Admin\ProductController@…
  GET|HEAD        api/admin/reports .......... reports.index › Admin\ReportController@index
  POST            api/admin/reports .......... reports.store › Admin\ReportController@store
  GET|HEAD        api/admin/reports/{report} ... reports.show › Admin\ReportController@show
  PUT|PATCH       api/admin/reports/{report} reports.update › Admin\ReportController@update
  DELETE          api/admin/reports/{report} reports.destroy › Admin\ReportController@dest…
  GET|HEAD        api/admin/reservations reservations.index › Admin\ReservationController@…
  POST            api/admin/reservations reservations.store › Admin\ReservationController@…
  GET|HEAD        api/admin/reservations/{reservation} reservations.show › Admin\Reservati…
  PUT|PATCH       api/admin/reservations/{reservation} reservations.update › Admin\Reserva…
  DELETE          api/admin/reservations/{reservation} reservations.destroy › Admin\Reserv…
  GET|HEAD        api/admin/trainers ....... trainers.index › Admin\TrainerController@index
  POST            api/admin/trainers ....... trainers.store › Admin\TrainerController@store
  GET|HEAD        api/admin/trainers/{trainer} trainers.show › Admin\TrainerController@show
  PUT|PATCH       api/admin/trainers/{trainer} trainers.update › Admin\TrainerController@u…
  DELETE          api/admin/trainers/{trainer} trainers.destroy › Admin\TrainerController@…
  GET|HEAD        api/admin/users ................ users.index › Admin\UserController@index
  POST            api/admin/users ................ users.store › Admin\UserController@store
  POST            api/admin/users/systemAccount ... Admin\UserController@storeSystemAccount
  GET|HEAD        api/admin/users/{user} ........... users.show › Admin\UserController@show
  PUT|PATCH       api/admin/users/{user} ....... users.update › Admin\UserController@update
  DELETE          api/admin/users/{user} ..... users.destroy › Admin\UserController@destroy
  PATCH           api/admin/users/{user}/approve ......... Admin\UserController@approveUser
  PATCH           api/admin/users/{user}/archive ......... Admin\UserController@archiveUser
  PATCH           api/admin/users/{user}/deactivate ... Admin\UserController@deactivateUser
  PATCH           api/admin/users/{user}/role ............. Admin\UserController@updateRole
  GET|HEAD        api/admin/walkins ...... walkins.index › Admin\WalkInInfoController@index
  POST            api/admin/walkins ...... walkins.store › Admin\WalkInInfoController@store
  GET|HEAD        api/admin/walkins-attendance walkins-attendance.index › Admin\WalkInAtte…
  POST            api/admin/walkins-attendance walkins-attendance.store › Admin\WalkInAtte…
  GET|HEAD        api/admin/walkins-attendance/{walkins_attendance} walkins-attendance.sho…
  PUT|PATCH       api/admin/walkins-attendance/{walkins_attendance} walkins-attendance.upd…
  DELETE          api/admin/walkins-attendance/{walkins_attendance} walkins-attendance.des…
  GET|HEAD        api/admin/walkins/{walkin} walkins.show › Admin\WalkInInfoController@show
  PUT|PATCH       api/admin/walkins/{walkin} walkins.update › Admin\WalkInInfoController@u…
  DELETE          api/admin/walkins/{walkin} walkins.destroy › Admin\WalkInInfoController@…
  GET|HEAD        api/cashier/contracts contracts.index › Cashier\ContractController@index
  POST            api/cashier/contracts contracts.store › Cashier\ContractController@store
  GET|HEAD        api/cashier/contracts/{contract} contracts.show › Cashier\ContractContro…
  PUT|PATCH       api/cashier/contracts/{contract} contracts.update › Cashier\ContractCont…
  DELETE          api/cashier/contracts/{contract} contracts.destroy › Cashier\ContractCon…
  GET|HEAD        api/cashier/products-paycheck products-paycheck.index › Cashier\ProductP…
  POST            api/cashier/products-paycheck products-paycheck.store › Cashier\ProductP…
  GET|HEAD        api/cashier/products-paycheck/{products_paycheck} products-paycheck.show…
  PUT|PATCH       api/cashier/products-paycheck/{products_paycheck} products-paycheck.upda…
  DELETE          api/cashier/products-paycheck/{products_paycheck} products-paycheck.dest…
  GET|HEAD        api/cashier/users ............ users.index › Cashier\UserController@index
  POST            api/cashier/users ............ users.store › Cashier\UserController@store
  POST            api/cashier/users/systemAccount Cashier\UserController@storeSystemAccount
  GET|HEAD        api/cashier/users/{user} ....... users.show › Cashier\UserController@show
  PUT|PATCH       api/cashier/users/{user} ... users.update › Cashier\UserController@update
  DELETE          api/cashier/users/{user} . users.destroy › Cashier\UserController@destroy
  PATCH           api/cashier/users/{user}/approve ..... Cashier\UserController@approveUser
  PATCH           api/cashier/users/{user}/deactivate Cashier\UserController@deactivateUser
  GET|HEAD        api/cashier/walkins .. walkins.index › Cashier\WalkInInfoController@index
  POST            api/cashier/walkins .. walkins.store › Cashier\WalkInInfoController@store
  GET|HEAD        api/cashier/walkins-attendance walkins-attendance.index › Cashier\WalkIn…
  POST            api/cashier/walkins-attendance walkins-attendance.store › Cashier\WalkIn…
  GET|HEAD        api/cashier/walkins-attendance/{walkins_attendance} walkins-attendance.s…
  PUT|PATCH       api/cashier/walkins-attendance/{walkins_attendance} walkins-attendance.u…
  DELETE          api/cashier/walkins-attendance/{walkins_attendance} walkins-attendance.d…
  GET|HEAD        api/cashier/walkins/{walkin} walkins.show › Cashier\WalkInInfoController…
  PUT|PATCH       api/cashier/walkins/{walkin} walkins.update › Cashier\WalkInInfoControll…
  DELETE          api/cashier/walkins/{walkin} walkins.destroy › Cashier\WalkInInfoControl…
  POST            api/change-password ................... Api\AuthController@changePassword
  POST            api/login ...................................... Api\AuthController@login
  POST            api/logout .................................... Api\AuthController@logout
  POST            api/register ................................ Api\AuthController@register
  GET|HEAD        api/user .............................................. routes/api.php:35
  GET|HEAD        sanctum/csrf-cookie sanctum.csrf-cookie › Laravel\Sanctum › CsrfCookieCo…
  GET|HEAD        storage/{path} storage.local › vendor/laravel/framework/src/Illuminate/F…
  PUT             storage/{path} storage.local.upload › vendor/laravel/framework/src/Illum…
  GET|HEAD        up vendor/laravel/framework/src/Illuminate/Foundation/Configuration/Appl…

                                                                        Showing [93] routes

                                
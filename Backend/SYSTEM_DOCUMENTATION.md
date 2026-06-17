# Iron Gym Management System - Project Overview & Business Rules

## 1. Project Overview

The Iron Gym Management System centralizes gym operations by tracking members, attendance, walk-ins, payments, POS product transactions, workout plans, and reports. 

### Main System Modules
- Authentication
- Dashboard
- Memberships & Contracts
- Attendance Tracking (QR)
- Walk-ins Management
- POS (Point of Sale) & Products
- Reports & Analytics
- Profile & Settings

---

## 2. Actors & Use Cases

### Administrator (Admin)
Full system control.
- **Access:** Unrestricted access to all modules, override capabilities, system configuration, user management, and financial records.
- **Functions:**
  - Full CRUD on Members, Cashiers, and Admins.
  - Process and override Memberships & Contracts.
  - Scan QR, view full attendance logs, and make manual time adjustments.
  - Manage all financial payments, process refunds, and view sales.
  - Manage Gym Settings (Pricing, System configs).
  - View comprehensive Reports (Revenue, Attendance, Sales).
  - chat system in reports (full crud)

### Cashier (Staff)
Handles daily front-desk operations.
- **Access:** Membership processing, Attendance, Payments, Walk-ins, POS.
- **Restrictions:** No staff management, no reports access, no settings access, no user deletion.
- **Functions:**
  - View/Search members and profiles (cannot edit sensitive data).
  - Create and renew memberships/contracts.
  - Scan QR and record attendance.
  - Record face-to-face payments (Memberships, Renewals, Walk-ins, POS) and print receipts.
  - Register Walk-ins.
  - Process POS transactions (Add to cart, checkout).

### Member
End-user gym client.
- **Access:** Own membership, own attendance, own workout planner, own payment history.
- **Restrictions:** Cannot access admin/cashier panels, cannot approve payments, cannot upload payment proofs.
- **Functions:**
  - View membership status and expiration.
  - View QR code for attendance scanning.
  - Create, edit, and track personal Workout Plans.
  - View personal payment transaction history and reference codes.
  - Edit personal profile and password.

---

## 3. System Workflows

### Member Registration Flow // DONE
Register → Pending Approval → Payment → Verification → Membership Activated 

### Contract Renewal Flow // DONE
Contract Expired → Renew Contract → Payment Verification → New Contract Activated

### Attendance Flow // PENDING
Scan QR → Verify Membership Status → Time In → Time Out // no time out needed

### Walk-in Flow // DONE
Register Walk-in → Payment → Attendance Entry

### POS Flow // PENDING
Add Products → Checkout → Payment → Invoice

---

## 4. Membership and Contract Rules

### Purpose
This section defines the structure, lifecycle, and payment rules for Gym Memberships and Gym Contracts, including how payments are processed.
> Important: Membership and Contract are two separate entities with different purposes and lifecycles.

### Membership
A Membership is a one-time registration fee required for a user to officially become a gym member.
- **Purpose**: Grants initial access to the gym system, establishes the user as a registered member.
- **Rules**: One-time payment only, cannot be renewed, cannot be repurchased once completed, required before any contract activation, created only during first registration.
- **Lifecycle**: User Registration → Membership Payment → Account Activated as Gym Member.

### Contract
A Contract is a renewable subscription that determines a member’s gym access duration.
- **Purpose**: Controls gym access period, determines active/inactive status of member access (e.g., QR attendance).
- **Contract Types**: Monthly, Quarterly, Yearly.
- **Rules**: Renewable subscription, only one active contract per member at a time, expired contract disables gym access, renewal creates a new contract record (does not update old one).
- **Lifecycle**: Select Contract Plan → Payment → Contract Activated → Contract Expiration → Renewal (New Contract Created).

### Payment Rules
- **General Policy**: All payments in the system are strictly **face-to-face transactions only**.
- **Accepted Methods**: Cash or GCash. 
  - *Note on GCash:* The member transfers funds face-to-face at the counter. The system does NOT support self-serve member uploads of GCash receipts or payment proofs.
- **Cashier / Admin Role**: Receives the physical cash or verifies the GCash transfer, creates the payment record, enters the reference code (OR number for cash, or GCash Reference Number), and immediately marks the payment as approved.
- **Member Role**: Cannot upload payment proofs, cannot approve payments, can only view transaction history.

### Reference Code
A reference code is used to track and verify physical payments (e.g., OR Number, Official Receipt Number, Transaction Reference Code).
Format Examples: `REF-2026-0001`, `OR-000238`.

### Payment Status
Allowed statuses:
- `approved` → Payment confirmed and recorded
- `refunded` → (optional)
> Note: A “pending” status is not required because all payments are processed and approved immediately at the gym.


## Important Note for Contract Auto Expire
# Local Development:
You must keep php artisan schedule:work running in an active terminal. If you close the terminal, the schedule stops and contracts will not auto-expire.

# Production:
A single cron job runs php artisan schedule:run every minute. Once configured, Laravel automatically checks your schedule and executes the expiration command when due. No terminal needs to stay open. The server handles everything in the background. 

## added tabel schema:
# products
- id PK
- name
- description (nullable)
- price DECIMAL(10,2)
- quantity INT (current stock)
- sold INT (total sold count)
- created_at
- updated_at

# product_paycheck (rename to product_transactions)
- id PK
- product_id FK (products.id)
- sold_by FK (users.id) - cashier/admin
- paid_by FK (users.id) NULL - member who bought
- paid_by_name VARCHAR(255) NULL - walk-in/guest name
- quantity INT
- unit_price DECIMAL(10,2) - price at time of sale
- total_price DECIMAL(10,2) - quantity × unit_price
- payment_type ENUM('cash','gcash')
- or_number VARCHAR(255) UNIQUE
- transaction_id VARCHAR(255) NULL - GCash reference
- payment_status ENUM('pending','paid','failed') DEFAULT 'paid'
- created_at

## GYMBACKEND - FUNCTIONAL FEATURES
# AUTHENTICATION
•	POST /api/register - Register user
•	POST /api/login - Login + token
•	GET /api/user - Get current user
•	POST /api/logout - Logout
•	POST /api/change-password - Change password
# USERS (Admin/Cashier)
•	GET /api/users - List users
•	POST /api/users - Create user
•	GET /api/users/{id} - View user
•	PUT/PATCH /api/users/{id} - Update user
•	DELETE /api/users/{id} - Delete user
•	PATCH /api/users/{id}/role - Update role
•	PATCH /api/users/{id}/approve - Approve user
# CONTRACTS
•	GET /api/contracts - List contracts
•	POST /api/contracts - Create contract
•	GET /api/contracts/{id} - View contract
•	PUT/PATCH /api/contracts/{id} - Update contract
•	DELETE /api/contracts/{id} - Delete contract
# PRODUCTS
•	GET /api/products - List products
•	POST /api/products - Create product
•	GET /api/products/{id} - View product
•	PUT/PATCH /api/products/{id} - Update product
•	DELETE /api/products/{id} - Delete product
# PRODUCT PAYCHECK
•	GET /api/products-paycheck - List sales
•	POST /api/products-paycheck - Create sale
•	GET /api/products-paycheck/{id} - View sale
•	PUT/PATCH /api/products-paycheck/{id} - Update sale
•	DELETE /api/products-paycheck/{id} - Delete sale
# WALK-INS
•	GET /api/walkins - List walk-ins
•	POST /api/walkins - Create walk-in
•	GET /api/walkins/{id} - View walk-in
•	PUT/PATCH /api/walkins/{id} - Update walk-in
•	DELETE /api/walkins/{id} - Delete walk-in
# WALK-IN ATTENDANCE
•	GET /api/walkins-attendance - List attendance
•	POST /api/walkins-attendance - Check-in
•	GET /api/walkins-attendance/{id} - View
•	PUT/PATCH /api/walkins-attendance/{id} - Update
•	DELETE /api/walkins-attendance/{id} - Delete
# REPORTS
•	GET /api/reports - List reports
•	POST /api/reports - Create report
•	GET /api/reports/{id} - View report
•	PUT/PATCH /api/reports/{id} - Update report
•	DELETE /api/reports/{id} - Delete report
# MISSING
•	❌ Member QR Attendance endpoints
•	❌ Dashboard Stats endpoint


## add table for products sold that is Foreigned to product_paycheck
# Product_sales
- id
- paycheck_id
- product_id

## May bug sa products mamaya kona ayusin

## additional for this system
# trainers table
# contract data not addition but changed
# contract_payment data have addiotion for trainers
 
 ## copy paste
 $env:Path = '\php;' + $env:Path
 cd c:\xampp\htdocs\gymsys\backend
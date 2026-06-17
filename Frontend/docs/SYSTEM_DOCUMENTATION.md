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

### Member Registration Flow
Register → Pending Approval → Payment → Verification → Membership Activated

### Contract Renewal Flow
Contract Expired → Renew Contract → Payment Verification → New Contract Activated

### Attendance Flow
Scan QR → Verify Membership Status → Time In → Time Out

### Walk-in Flow
Register Walk-in → Payment → Attendance Entry

### POS Flow
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

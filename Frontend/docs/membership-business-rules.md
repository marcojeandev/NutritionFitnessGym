# Membership and Contract Rules

## Purpose

This document defines the structure, lifecycle, and payment rules for **Gym Memberships** and **Gym Contracts**, including how payments are processed in the system.

> Important: Membership and Contract are two separate entities with different purposes and lifecycles.

---

# Membership

## Definition

A **Membership** is a one-time registration fee required for a user to officially become a gym member.

## Purpose

* Grants initial access to the gym system
* Establishes the user as a registered member

## Rules

* One-time payment only
* Cannot be renewed
* Cannot be repurchased once completed
* Required before any contract activation
* Created only during first registration

## Membership Types

* **Regular Member:** Standard membership requiring basic details.
* **Student Member:** Requires upload or capture of a Valid Student ID during registration/contract creation.

## Example

```txt
Membership Fee: ₱500
Status: Paid
```

## Lifecycle

```txt
User Registration (Auto-generates unique QR code for Member role)
→ Membership Payment
→ Account Activated as Gym Member
```

---

# Contract

## Definition

A **Contract** is a renewable subscription that determines a member’s gym access duration.

## Purpose

* Controls gym access period
* Determines active/inactive status of member access (e.g., QR attendance)

## Contract Types

* Monthly
* Quarterly
* Yearly

## Rules

* Renewable subscription
* Only one active contract per member at a time
* Expired contract disables gym access (e.g., QR attendance is locked and blurred out)
* Renewal creates a new contract record (does not update old one)
* Contracts can optionally include a **Trainer Package**, which requires selecting a specific assigned trainer (`trainer_id`).

## Lifecycle

```txt
Select Contract Plan
→ Payment
→ Contract Activated
→ Contract Expiration
→ Renewal (New Contract Created)
```

## Example

```txt
Contract Type: Monthly
Trainer Package: 15 Days Package (Optional)
Assigned Trainer: John Doe (Optional)
Start Date: Jan 1, 2026
End Date: Feb 1, 2026
Status: Active
```

---

# Walk-ins

## Definition

Walk-ins are users who pay a per-visit fee instead of having an active subscription contract.

## Walk-in Categories

* **Existing Member (Expired):** User has a gym account but no active contract. Fee: ₱50.
* **Walk-in Profile (Non-member):** User does not have a gym account and registers basic details just for the visit. Fee: ₱60.

---

# Court Rentals

## Definition

A system module allowing users to rent the basketball court on an hourly basis.

## Rules

* Requires booking a specific time slot.
* Payment is collected physically by Cashier/Admin.
* Supports both members and walk-ins.

---

# Payment Rules

## General Payment Policy

All payments in the system are strictly **face-to-face transactions only**.

The system does NOT support:

* Online payments
* GCash / e-wallet uploads
* Payment proof uploads
* Member-side payment approval

All payments must be handled and recorded by authorized staff only.

---

# Payment Processing Roles

## Cashier / Admin

* Receives physical payment
* Creates payment record in the system
* Enters reference code (OR / receipt number)
* Immediately marks payment as approved

## Member

* Cannot upload payment proofs
* Cannot approve payments
* Can only view payment and transaction history

---

# Membership Payment Flow

```txt
Member visits gym
→ Cashier receives payment
→ Cashier records membership transaction
→ Cashier inputs reference code
→ System marks payment as approved
→ Membership becomes active
```

---

# Contract Payment Flow

```txt
Member chooses contract plan
→ Cashier receives payment
→ Cashier creates contract transaction
→ Cashier inputs reference code
→ System marks payment as approved
→ Contract becomes active
```

---

# Reference Code

## Purpose

A reference code is used to track and verify physical payments.

## Examples

* OR Number
* Official Receipt Number
* Transaction Reference Code

## Example Format

```txt
REF-2026-0001
OR-000238
```

## Fields

* reference_code
* payment_type (membership / contract / other)
* amount
* cashier_id
* member_id
* created_at

---

# Payment Status

Allowed statuses:

* `approved` → Payment confirmed and recorded
* `refunded` → (optional, if system supports refunding)

> Note: A “pending” status is not required because all payments are processed and approved immediately at the gym.

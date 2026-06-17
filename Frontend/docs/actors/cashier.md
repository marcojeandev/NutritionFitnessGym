# cashier.md

# Purpose

Defines cashier frontend scope, permissions, pages, sidebar navigation, and workflows.

Cashier manages memberships, attendance, walk-ins, payments, and POS.

---

# Sidebar Navigation

```txt
Dashboard
Members
Memberships
Attendance
Payments
Walk-ins
POS
Profile
```

---

# Dashboard

## Widgets

* Today's Revenue
* Today's Walk-ins
* Membership Renewals
* Active Members
* Recent Transactions

---

# Features

## Members

Functions:

* View members
* Search members
* View member profile

Restrictions:

* Cannot edit sensitive data
* Cannot delete members

---

## Memberships

Functions:

* Create membership
* Renew membership
* View membership details
* View membership status

Rules:

* One active membership only
* Renewal creates new membership record
* No overlapping memberships

---

## Attendance

Functions:

* Scan QR attendance
* Record attendance
* Verify membership status

Rules:

* Active membership required
* Expired membership denied access

---

## Payments

Purpose:
Record face-to-face payments.

Functions:

* Create payment record
* Process membership payment
* Process renewal payment
* Record walk-in payment
* Record POS payment
* Enter reference code
* View payment history
* Print receipt

Payment Types:

* Membership
* Renewal
* Walk-in
* Product Purchase

Workflow:

```txt
Receive payment
→ Create transaction
→ Enter reference code
→ Approve payment
```

Rules:

* Cashier handles all payments
* Payments approved immediately
* No payment upload system

---

## Walk-ins

Functions:

* Register walk-in
* Record payment
* View walk-in history

---

## POS

Functions:

* Add item to cart
* Checkout
* Print receipt
* View transactions

---

# Permissions

Cashier Access:

* Membership processing
* Attendance
* Payments
* Walk-ins
* POS

Restrictions:

* No staff management
* No reports access
* No settings access
* No user deletion

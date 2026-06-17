# admin.md

# Purpose

Defines admin frontend scope, permissions, pages, sidebar navigation, and workflows.

Admin has full system access.

---

# Sidebar Navigation

```txt
Dashboard
Members
Memberships
Attendance
Payments
Walk-ins
Products
POS Sales
Staff Management
Reports
Settings
Profile
```

---

# Dashboard

## Widgets

* Total Members
* Active Memberships
* Expired Memberships
* Monthly Revenue
* Walk-ins Today
* Product Sales Summary
* Attendance Overview
* Membership Renewal Statistics

## Charts

* Revenue Analytics
* Membership Growth
* Attendance Analytics

---

# Features

## Dashboard

Functions:

* View gym analytics
* Monitor system activity
* View revenue summary

---

## Members

Functions:

* View all members
* Search members
* Filter members
* Approve registrations
* Edit member information
* Suspend member
* View member profile

Restrictions:

* Cannot permanently delete records

---

## Memberships

Functions:

* Create membership
* Renew membership
* View membership history
* View active memberships
* View expired memberships

Business Rules:

* One active membership only
* Renewal creates new membership record
* Expired membership disables QR access

---

## Attendance

Functions:

* View attendance logs
* Search attendance
* Filter attendance
* Export attendance reports

---

## Payments

Purpose:
Manage gym payment records.

Functions:

* Create payment record
* Approve payment
* View payment history
* View transaction details

Payment Types:

* Membership
* Renewal
* Walk-in
* Product Purchase

Rules:

* Payments happen face-to-face
* Admin records payment
* Reference code required
* No online payment system

---

## Walk-ins

Functions:

* Register walk-in
* Record walk-in payment
* View walk-in history

Rules:

* Walk-ins are not members

---

## Products

Functions:

* Add product
* Edit product
* Archive product
* Manage inventory

---

## POS Sales

Functions:

* Create sale
* View receipt
* View sales history

---

## Staff Management

Functions:

* Create cashier account
* Edit cashier account
* Disable cashier account

---

## Reports

Functions:

* Revenue reports
* Attendance reports
* Membership reports
* Walk-in reports
* Sales reports

---

## Settings

Functions:

* Manage gym information
* Membership pricing
* System configuration

---

# Permissions

Admin Access:

* Full system access

Restrictions:

* None

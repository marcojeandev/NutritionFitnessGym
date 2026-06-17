# member.md

# Purpose

Defines member frontend scope, permissions, pages, sidebar navigation, and workflows.

Members manage gym membership, attendance, workout planner, and account information.

---

# Sidebar Navigation

```txt
Dashboard
Membership
Workout Planner
Attendance
Payments
Profile
```

---

# Dashboard

## Widgets

* Membership Status
* Membership Expiration
* Attendance Summary
* Upcoming Workout
* Recent Attendance
* Recent Payments

Example:

```txt
Today's Workout:
Leg Day
4 Exercises Planned
```

---

# Features

## Membership

Functions:

* View membership details
* View membership status
* View expiration date
* View membership history

States:

* No Membership
* Active Membership
* Expired Membership

Rules:

* One active membership only
* Renewals processed face-to-face

---

## Workout Planner

Purpose:
Simple routine planner and workout notes.

Functions:

* Create routine
* Edit routine
* Delete routine
* Add workout notes
* Weekly planner
* Calendar view
* Mark workout completed

Example:

```txt
Monday → Leg Day

Notes:
- Squats 4x12
- Leg Press 3x10
- Calf Raise 3x20
```

UI Requirements:

* Calendar view
* Weekly planner
* Simple note editor
* Mobile friendly

Rules:

* Member manages own routines only

---

## Attendance

Functions:

* View attendance history
* View QR code

Rules:

* QR disabled when membership expired

---

## Payments

Purpose:
View gym transaction records.

Functions:

* View payment history
* View transaction details
* View reference code

Visible Information:

* payment date
* membership type
* amount
* reference code
* status

Rules:

* Payments handled face-to-face
* Member cannot upload payment proof
* Member cannot process payment

---

## Profile

Functions:

* Edit profile
* Change password
* View account information

---

# Permissions

Member Access:

* Own membership
* Own attendance
* Own workout planner
* Own payment history

Restrictions:

* No admin access
* No cashier access
* No system management

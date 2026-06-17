# Frontend Workflows
---

## Member Registration Flow

Register (Auto-generates unique QR code for Member role)
→ Pending Approval
→ Payment
→ Verification
→ Membership Activated

---

## Contract Renewal Flow

Contract Expired
→ Renew Contract
→ Payment Verification
→ New Contract Activated

---

## Attendance Flow

Scan QR
→ Verify Active Contract Status (NOT just Membership account)
→ If No Active Contract → Show Lock/Error
→ If Active Contract → Time In
→ Time Out

---

## Walk-in Flow

Select Category (Existing Member / Walk-in Profile)
→ Record Details
→ Payment (₱50 / ₱60)
→ Attendance Entry

---

## Court Rentals Flow

Select Court / Schedule
→ Log Renter Details
→ Payment
→ Rental Active
→ Rental Completed

---

## POS Flow

Add Products
→ Checkout
→ Payment
→ Invoice

---

## Dashboard Routing

### Admin
/admin/*

### Cashier
/cashier/*

### Member
/member/*
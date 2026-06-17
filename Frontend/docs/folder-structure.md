# Folder Structure
├── hooks/
├── services/
├── store/
├── lib/
├── types/
├── utils/
├── constants/
├── assets/
└── styles/

---

## Feature Structure

features/
│
├── auth/
├── memberships/
├── attendance/
├── walkins/
├── products/
├── reports/
└── profile/

---

## Component Rules

### Shared Components
Place reusable UI in:

components/

### Feature Components
Place feature-specific UI inside:

features/[feature-name]/components/

---

## Naming Conventions

### Components
PascalCase

Example:
- MembershipCard.tsx
- DashboardSidebar.tsx

### Hooks
camelCase with use prefix

Example:
- useAuth.ts
- useMemberships.ts

### Pages
PascalCase

Example:
- AdminDashboard.tsx

---

## Import Rules

Prefer aliases:

@/components
@/features
@/hooks
@/services
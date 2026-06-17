import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import AdminOverview from './pages/admin/Overview';
import AdminMembers from './pages/admin/Members';
import AdminMemberships from './pages/admin/Memberships';
import AdminPOS from './pages/admin/POS';
import AdminAttendance from './pages/admin/Attendance';
import AdminPayments from './pages/admin/Payments';
import AdminWalkins from './pages/admin/Walkins';
import AdminProducts from './pages/admin/Products';
import AdminStaff from './pages/admin/StaffManagement';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';
import AdminProfile from './pages/admin/Profile';
import AdminTrainers from './pages/admin/Trainers';
import CashierOverview from './pages/cashier/Overview';
import CashierMembers from './pages/cashier/Members';
import CashierMemberships from './pages/cashier/Memberships';
import CashierPOS from './pages/cashier/POS';
import CashierAttendance from './pages/cashier/Attendance';
import CashierPayments from './pages/cashier/Payments';
import CashierWalkins from './pages/cashier/Walkins';
import CashierCourtRentals from './pages/cashier/CourtRentals';
import CashierProfile from './pages/cashier/Profile';
import AdminCourtRentals from './pages/admin/CourtRentals';

import MemberOverview from './pages/member/Overview';
import MemberMembership from './pages/member/Membership';
import MemberPlanner from './pages/member/Planner';
import MemberAttendance from './pages/member/Attendance';
import MemberPayments from './pages/member/Payments';
import MemberProfile from './pages/member/Profile';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Toaster position="top-right" duration={3000} />
        <main className="min-h-screen bg-background text-foreground">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminOverview />} />
            <Route path="/admin/members" element={<AdminMembers />} />
            <Route path="/admin/memberships" element={<AdminMemberships />} />
            <Route path="/admin/attendance" element={<AdminAttendance />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/walk-ins" element={<AdminWalkins />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/pos" element={<AdminPOS />} />
            <Route path="/admin/court-rentals" element={<AdminCourtRentals />} />
            <Route path="/admin/trainers" element={<AdminTrainers />} />
            <Route path="/admin/staff" element={<AdminStaff />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
          
          {/* Cashier Routes */}
          <Route element={<ProtectedRoute allowedRoles={['cashier']} />}>
          <Route path="/cashier" element={<CashierOverview />} />
          <Route path="/cashier/members" element={<CashierMembers />} />
          <Route path="/cashier/memberships" element={<CashierMemberships />} />
          <Route path="/cashier/attendance" element={<CashierAttendance />} />
          <Route path="/cashier/payments" element={<CashierPayments />} />
          <Route path="/cashier/walk-ins" element={<CashierWalkins />} />
          <Route path="/cashier/pos" element={<CashierPOS />} />
          <Route path="/cashier/court-rentals" element={<CashierCourtRentals />} />
          <Route path="/cashier/profile" element={<CashierProfile />} />

          </Route>

          {/* Member Routes */}
          <Route element={<ProtectedRoute allowedRoles={['member']} />}>
            <Route path="/member" element={<MemberOverview />} />
            <Route path="/member/membership" element={<MemberMembership />} />
            <Route path="/member/planner" element={<MemberPlanner />} />
            <Route path="/member/attendance" element={<MemberAttendance />} />
            <Route path="/member/payments" element={<MemberPayments />} />
            <Route path="/member/profile" element={<MemberProfile />} />
          </Route>
        </Routes>
      </main>
    </Router>
    </QueryClientProvider>
  );
}

export default App;

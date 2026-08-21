import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import Login from './features/auth/Login';
import Register from './features/auth/Register';

// Superadmin
import SuperadminLayout from './features/superadmin/SuperadminLayout';
import SuperadminDashboard from './features/superadmin/views/SuperadminDashboard';
import RegionsManagement from './features/superadmin/views/RegionsManagement';
import RegionalAdminsManagement from './features/superadmin/views/RegionalAdminsManagement';
import PricingManagement from './features/superadmin/views/PricingManagement';
import AuditLedger from './features/superadmin/views/AuditLedger';
import UserGovernance from './features/superadmin/views/UserGovernance';

// Regional
import RegionalLayout from './features/regional/RegionalLayout';
import AdminRegionalDashboard from './features/regional/views/AdminRegionalDashboard';
import PosMitraManagement from './features/regional/views/PosMitraManagement';
import OperatorPosPage from './features/regional/views/OperatorPosManagement';
import VerificationCenterPage from './features/regional/views/VerificationCenter';
import TripOrderPage from './features/regional/views/TripOrderMonitoring';
import ArmadaKurirTabs from './features/regional/views/ArmadaKurirTabs';
import FinancialReportPage from './features/regional/views/FinancialReportPage';

// Operator Pos
import OperatorLayout from './features/operator-pos/OperatorLayout';
import OperatorDashboard from './features/operator-pos/views/OperatorDashboard';
import OperatorInspection from './features/operator-pos/views/OperatorInspection';
import OperatorDualScanner from './features/operator-pos/views/OperatorDualScanner';
import OperatorHandover from './features/operator-pos/views/OperatorHandover';

// Mitra
import MitraLayout from './features/mitra/MitraLayout';
import MitraDashboard from './features/mitra/views/MitraDashboard';
import MitraOnboarding from './features/mitra/views/MitraOnboarding';
import MitraTripManagement from './features/mitra/views/MitraTripManagement';
import MitraQrDisplay from './features/mitra/views/MitraQrDisplay';
import MitraBalance from './features/mitra/views/MitraBalance';
import MitraChat from './features/mitra/views/MitraChat';

// Customer
import CustomerLayout from './features/customer/CustomerLayout';
import BiometricOnboarding from './features/customer/views/BiometricOnboarding';
import SearchTrip from './features/customer/views/SearchTrip';
import MyTickets from './features/customer/views/MyTickets';

// Peta role login -> halaman awal setelah masuk
const ROLE_HOME = {
  admin: '/admin/dashboard',
  regional: '/regional/dashboard',
  operator: '/operator-pos/dashboard',
  mitra: '/mitra/dashboard',
  customer: '/customer/onboarding',
};

export default function App() {
  const navigate = useNavigate();

  const handleLogin = (role) => {
    navigate(ROLE_HOME[role] || ROLE_HOME.admin, { replace: true });
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route
        path="/login"
        element={
          <Login
            onSwitchToRegister={() => navigate('/register')}
            onLogin={handleLogin}
          />
        }
      />
      <Route
        path="/register"
        element={<Register onSwitchToLogin={() => navigate('/login')} />}
      />

      {/* Superadmin */}
      <Route path="/admin" element={<SuperadminLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SuperadminDashboard />} />
        <Route path="wilayah" element={<RegionsManagement />} />
        <Route path="admin-wilayah" element={<RegionalAdminsManagement />} />
        <Route path="tarif" element={<PricingManagement />} />
        <Route path="audit" element={<AuditLedger />} />
        <Route path="governance" element={<UserGovernance />} />
      </Route>

      {/* Admin Regional */}
      <Route path="/regional" element={<RegionalLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminRegionalDashboard />} />
        <Route path="pos-mitra" element={<PosMitraManagement />} />
        <Route path="operator-pos" element={<OperatorPosPage />} />
        <Route path="verifikasi" element={<VerificationCenterPage />} />
        <Route path="trip-order" element={<TripOrderPage />} />
        <Route path="armada-kurir" element={<ArmadaKurirTabs />} />
        <Route path="laporan" element={<FinancialReportPage />} />
      </Route>

      {/* Operator Pos */}
      <Route path="/operator-pos" element={<OperatorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<OperatorDashboard />} />
        <Route path="inspection" element={<OperatorInspection />} />
        <Route path="scanner" element={<OperatorDualScanner />} />
        <Route path="handover" element={<OperatorHandover />} />
      </Route>

      {/* Mitra */}
      <Route path="/mitra" element={<MitraLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<MitraDashboard />} />
        <Route path="onboarding" element={<MitraOnboarding />} />
        <Route path="trip" element={<MitraTripManagement />} />
        <Route path="qr" element={<MitraQrDisplay />} />
        <Route path="saldo" element={<MitraBalance />} />
        <Route path="chat" element={<MitraChat />} />
      </Route>

      {/* Customer */}
      <Route path="/customer" element={<CustomerLayout />}>
        <Route index element={<Navigate to="onboarding" replace />} />
        <Route path="onboarding" element={<BiometricOnboarding />} />
        <Route path="booking" element={<SearchTrip />} />
        <Route path="tickets" element={<MyTickets />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

import React, { useState, useEffect } from 'react';
import Login from './features/auth/Login';
import Register from './features/auth/Register';

// Superadmin Components & Views
import SuperadminSidebar from './features/superadmin/components/SuperadminSidebar';
import SuperadminDashboard from './features/superadmin/views/SuperadminDashboard';
import RegionsManagement from './features/superadmin/views/RegionsManagement'; 
import RegionalAdminsManagement from './features/superadmin/views/RegionalAdminsManagement'; 
import PricingManagement from './features/superadmin/views/PricingManagement';
import AuditLedger from './features/superadmin/views/AuditLedger';
import UserGovernance from './features/superadmin/views/UserGovernance';

// Regional Components & Views
import RegionalSidebar from './features/regional/components/RegionalSidebar';
import AdminRegionalDashboard from './features/regional/views/AdminRegionalDashboard';
import PosMitraManagement from './features/regional/views/PosMitraManagement';
import OperatorPosPage from './features/regional/views/OperatorPosManagement';
import VerificationCenterPage from './features/regional/views/VerificationCenter';
import TripOrderPage from './features/regional/views/TripOrderMonitoring';
import ArmadaPage from './features/regional/views/ArmadaPage';
import KurirPage from './features/regional/views/KurirPage';
import FinancialReportPage from './features/regional/views/FinancialReportPage';

// Operator Pos Components & Views
import OperatorSidebar from './features/operator-pos/components/OperatorSidebar';
import OperatorDashboard from './features/operator-pos/views/OperatorDashboard';
import OperatorInspection from './features/operator-pos/views/OperatorInspection';
import OperatorDualScanner from './features/operator-pos/views/OperatorDualScanner';
import OperatorHandover from './features/operator-pos/views/OperatorHandover';

// Mitra Components & Views
import MitraSidebar from './features/mitra/components/MitraSidebar';
import MitraDashboard from './features/mitra/views/MitraDashboard';
import MitraOnboarding from './features/mitra/views/MitraOnboarding';
import MitraTripManagement from './features/mitra/views/MitraTripManagement';
import MitraQrDisplay from './features/mitra/views/MitraQrDisplay';
import MitraBalance from './features/mitra/views/MitraBalance';
import MitraChat from './features/mitra/views/MitraChat';

// Customer Components & Views
import CustomerSidebar from './features/customer/components/CustomerSidebar';
import BiometricOnboarding from './features/customer/views/BiometricOnboarding';
import SearchTrip from './features/customer/views/SearchTrip';
import MyTickets from './features/customer/views/MyTickets';

export default function App() {
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('nebeng_currentView') || 'login';
  });
  
  const [activeMenu, setActiveMenu] = useState(() => {
    return localStorage.getItem('nebeng_activeMenu') || 'Onboarding Biometrik';
  });

  useEffect(() => {
    localStorage.setItem('nebeng_currentView', currentView);
  }, [currentView]);

  useEffect(() => {
    localStorage.setItem('nebeng_activeMenu', activeMenu);
  }, [activeMenu]);

  if (currentView === 'login') {
    return (
      <Login 
        onSwitchToRegister={() => setCurrentView('register')} 
        onLogin={(role) => {
          if (role === 'regional') {
            setCurrentView('regional');
            setActiveMenu('Dashboard Wilayah');
          } else if (role === 'operator') {
            setCurrentView('operator-pos');
            setActiveMenu('Dashboard Pos');
          } else if (role === 'mitra') {
            setCurrentView('mitra');
            setActiveMenu('Dashboard Mitra');
          } else if (role === 'customer') {
            setCurrentView('customer');
            setActiveMenu('Onboarding Biometrik');
          } else {
            setCurrentView('admin');
            setActiveMenu('Dashboard');
          }
        }} 
      />
    );
  }

  if (currentView === 'register') {
    return (
      <Register onSwitchToLogin={() => setCurrentView('login')} />
    );
  }

  // Tampilan Super Admin
  if (currentView === 'admin') {
    const renderContent = () => {
      switch (activeMenu) {
        case 'Dashboard': return <SuperadminDashboard />;
        case 'Manajemen Wilayah': return <RegionsManagement />;
        case 'Admin Wilayah': return <RegionalAdminsManagement />;
        case 'Konfigurasi Tarif': return <PricingManagement />;
        case 'Audit & Keuangan': return <AuditLedger />;
        case 'User Governance': return <UserGovernance />;
        default: return <SuperadminDashboard />;
      }
    };

    return (
      <div className="flex min-h-screen bg-[#f8f9fa]">
        <SuperadminSidebar 
          activeMenu={activeMenu} 
          onMenuSelect={(menuName) => setActiveMenu(menuName)}
          onLogout={() => {
            setCurrentView('login');
            localStorage.clear();
          }} 
        />
        <div className="flex-1 ml-64 min-h-screen">{renderContent()}</div>
      </div>
    );
  }

  // Tampilan Admin Regional
  if (currentView === 'regional') {
    const renderRegionalContent = () => {
      switch (activeMenu) {
        case 'Dashboard Wilayah': return <AdminRegionalDashboard />;
        case 'Kelola Pos Mitra': return <PosMitraManagement />;
        case 'Operator Pos': return <OperatorPosPage />;
        case 'Pusat Verifikasi': return <VerificationCenterPage />;
        case 'Trip & Order': return <TripOrderPage />;
        case 'Armada & Kurir': return <ArmadaKurirWrapper />; 
        case 'Laporan Finansial': return <FinancialReportPage />;
        default: return <AdminRegionalDashboard />;
      }
    };

    return (
      <div className="flex min-h-screen bg-[#f8f9fa]">
        <RegionalSidebar 
          activeMenu={activeMenu} 
          onMenuSelect={(menuName) => setActiveMenu(menuName)}
          onLogout={() => {
            setCurrentView('login');
            localStorage.clear();
          }} 
        />
        <div className="flex-1 ml-64 min-h-screen">{renderRegionalContent()}</div>
      </div>
    );
  }

  // Tampilan Operator Pos
  if (currentView === 'operator-pos') {
    const renderOperatorContent = () => {
      switch (activeMenu) {
        case 'Dashboard Pos': 
          return <OperatorDashboard />;
        case 'Inspection & Sealing': 
          return <OperatorInspection />;
        case 'Dual QR Scanner': 
          return <OperatorDualScanner />;
        case 'Handover Verification': 
          return <OperatorHandover />;
        default: 
          return <OperatorDashboard />;
      }
    };

    return (
      <div className="flex min-h-screen bg-[#f8f9fa]">
        <OperatorSidebar 
          activeMenu={activeMenu} 
          onMenuSelect={(menuName) => setActiveMenu(menuName)}
          onLogout={() => {
            setCurrentView('login');
            localStorage.clear();
          }} 
        />
        <div className="flex-1 ml-64 min-h-screen">{renderOperatorContent()}</div>
      </div>
    );
  }

  // Tampilan Mitra Pos
  if (currentView === 'mitra') {
    const renderMitraContent = () => {
      switch (activeMenu) {
        case 'Dashboard Mitra': 
          return <MitraDashboard />;
        case 'Onboarding & Verifikasi': 
          return <MitraOnboarding />;
        case 'Kelola Trip & Jadwal': 
          return <MitraTripManagement />;
        case 'Digital QR Trip': 
          return <MitraQrDisplay />;
        case 'Kelola Paket Pos': 
          return <MitraTransactions />;
        case 'Saldo & Komisi': 
          return <MitraBalance />;
        case 'Chat Pelanggan': 
          return <MitraChat />;
        default: 
          return <MitraDashboard />;
      }
    };

    return (
      <div className="flex min-h-screen bg-[#f8f9fa]">
        <MitraSidebar 
          activeMenu={activeMenu} 
          onMenuSelect={(menuName) => setActiveMenu(menuName)}
          onLogout={() => {
            setCurrentView('login');
            localStorage.clear();
          }} 
        />
        <div className="flex-1 ml-64 min-h-screen">{renderMitraContent()}</div>
      </div>
    );
  }

  // Tampilan Customer (Pelanggan)
  if (currentView === 'customer') {
    const renderCustomerContent = () => {
      switch (activeMenu) {
        case 'Onboarding Biometrik': 
          return <BiometricOnboarding />;
        case 'Cari & Booking Trip': 
          return <SearchTrip />;
        case 'Tickets & Digital QR': 
          return <MyTickets />;
        default: 
          return <BiometricOnboarding />;
      }
    };

    return (
      <div className="flex min-h-screen bg-[#f8f9fa]">
        <CustomerSidebar 
          activeMenu={activeMenu} 
          onMenuSelect={(menuName) => setActiveMenu(menuName)}
          onLogout={() => {
            setCurrentView('login');
            localStorage.clear();
          }} 
        />
        <div className="flex-1 ml-64 min-h-screen">{renderCustomerContent()}</div>
      </div>
    );
  }

  return null;
}

function ArmadaKurirWrapper() {
  const [subTab, setSubTab] = useState('armada');
  return (
    <div>
      <div className="ml-64 px-8 pt-6 bg-[#f8f9fa] flex gap-3">
        <button 
          onClick={() => setSubTab('armada')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${subTab === 'armada' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}
        >
          Data Armada Kendaraan
        </button>
        <button 
          onClick={() => setSubTab('kurir')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer ${subTab === 'kurir' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'}`}
        >
          Data Kurir & Driver
        </button>
      </div>
      {subTab === 'armada' ? <ArmadaPage /> : <KurirPage />}
    </div>
  );
}
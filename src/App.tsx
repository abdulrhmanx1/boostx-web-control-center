import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';
import { OfficialWebsite } from './components/OfficialWebsite';
import { PartnerDashboard } from './components/dashboards/PartnerDashboard';
import { TechnicianDashboard } from './components/dashboards/TechnicianDashboard';
import { DriverDashboard } from './components/dashboards/DriverDashboard';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { AppExperienceManager } from './components/dashboards/AppExperienceManager';

// Route guard blocked component for unauthorized roles
const RouteGuardBlocked = ({ path, userRole }: { path: string; userRole: string }) => {
  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white', textAlign: 'center', padding: 24, fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontSize: '2.5rem', marginBottom: 20 }}>🛑</div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: 8 }}>منطقة غير مصرح بها</h2>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', maxWidth: 400, marginBottom: 24, lineHeight: 1.6 }}>
        عذراً، لا تمتلك الصلاحيات الكافية للوصول إلى المسار <strong>{path}</strong> بصفتك <strong>{userRole}</strong>. الرجاء تسجيل الدخول بحساب شريك أو إداري معتمد.
      </p>
      <button className="btn btn-primary" onClick={() => { window.location.href = '/'; }}>العودة للرئيسية</button>
    </div>
  );
};

export default function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Set high-privilege default session so that the control center handles all dashboards in local testing
  const currentUser = {
    id: 'usr_admin_1',
    name: 'عبدالرحمن العتيبي (المدير العام)',
    role: 'superadmin',
    email: 'admin@boostx.sa'
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  // --- Render active view based on location path ---
  if (currentPath === '/partner') {
    const isAllowed = currentUser.role === 'partner' || ['admin', 'superadmin', 'super_admin'].includes(currentUser.role);
    if (!isAllowed) {
      return <RouteGuardBlocked path="/partner" userRole={currentUser.role} />;
    }
    return (
      <div style={{ background: '#120b1f', minHeight: '100vh', width: '100vw' }}>
        <div style={{ position: 'fixed', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: 'rgba(157, 78, 221, 0.9)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 15px rgba(157,78,221,0.5)', pointerEvents: 'none' }}>
          لوحة الشريك المعتمد 🏪
        </div>
        <PartnerDashboard onBack={() => navigateTo('/')} />
      </div>
    );
  }

  if (currentPath === '/technician') {
    const isAllowed = currentUser.role === 'technician' || ['admin', 'superadmin', 'super_admin'].includes(currentUser.role);
    if (!isAllowed) {
      return <RouteGuardBlocked path="/technician" userRole={currentUser.role} />;
    }
    return (
      <div style={{ background: '#120b1f', minHeight: '100vh', width: '100vw' }}>
        <div style={{ position: 'fixed', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: 'rgba(59, 130, 246, 0.9)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 15px rgba(59,130,246,0.5)', pointerEvents: 'none' }}>
          بوابة الفني المحترف 🛠️
        </div>
        <TechnicianDashboard onBack={() => navigateTo('/')} />
      </div>
    );
  }

  if (currentPath === '/driver') {
    const isAllowed = currentUser.role === 'driver' || ['admin', 'superadmin', 'super_admin'].includes(currentUser.role);
    if (!isAllowed) {
      return <RouteGuardBlocked path="/driver" userRole={currentUser.role} />;
    }
    return (
      <div style={{ background: '#120b1f', minHeight: '100vh', width: '100vw' }}>
        <div style={{ position: 'fixed', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: 'rgba(16, 185, 129, 0.9)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 15px rgba(16,185,129,0.5)', pointerEvents: 'none' }}>
          بوابة مندوب التوصيل 🛵
        </div>
        <DriverDashboard onBack={() => navigateTo('/')} />
      </div>
    );
  }

  if (currentPath === '/admin') {
    const isAllowed = ['admin', 'superadmin', 'super_admin'].includes(currentUser.role);
    if (!isAllowed) {
      return <RouteGuardBlocked path="/admin" userRole={currentUser.role} />;
    }
    return (
      <div style={{ background: '#120b1f', minHeight: '100vh', width: '100vw' }}>
        <div style={{ position: 'fixed', top: '15px', left: '20px', zIndex: 99999, display: 'flex', gap: 10 }}>
          <button 
            onClick={() => navigateTo('/admin/app-experience')}
            style={{ background: 'rgba(168, 85, 247, 0.85)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(168,85,247,0.3)' }}
          >
            ⚙️ إدارة تجربة التطبيق (App UX)
          </button>
        </div>
        <AdminDashboard onBack={() => navigateTo('/')} />
      </div>
    );
  }

  if (currentPath === '/admin/app-experience') {
    const isAllowed = ['admin', 'superadmin', 'super_admin'].includes(currentUser.role);
    if (!isAllowed) {
      return <RouteGuardBlocked path="/admin/app-experience" userRole={currentUser.role} />;
    }
    return (
      <div style={{ background: '#120b1f', minHeight: '100vh', width: '100vw' }}>
        <AppExperienceManager onBack={() => navigateTo('/admin')} />
      </div>
    );
  }

  if (currentPath === '/super-admin') {
    const isAllowed = ['superadmin', 'super_admin'].includes(currentUser.role);
    if (!isAllowed) {
      return <RouteGuardBlocked path="/super-admin" userRole={currentUser.role} />;
    }
    return (
      <div style={{ background: '#120b1f', minHeight: '100vh', width: '100vw' }}>
        <div style={{ position: 'fixed', top: '15px', left: '20px', zIndex: 99999, display: 'flex', gap: 10 }}>
          <button 
            onClick={() => navigateTo('/super-admin/settings')}
            style={{ background: 'rgba(236, 72, 153, 0.85)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 'var(--radius-pill)', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 15px rgba(236,72,153,0.3)' }}
          >
            ⚙️ إعدادات التحكم العليا Overrides
          </button>
        </div>
        <SuperAdminDashboard onBack={() => navigateTo('/')} />
      </div>
    );
  }

  if (currentPath === '/super-admin/settings') {
    const isAllowed = ['superadmin', 'super_admin'].includes(currentUser.role);
    if (!isAllowed) {
      return <RouteGuardBlocked path="/super-admin/settings" userRole={currentUser.role} />;
    }
    return (
      <div style={{ background: '#120b1f', minHeight: '100vh', width: '100vw' }}>
        <div style={{ position: 'fixed', top: '15px', left: '50%', transform: 'translateX(-50%)', zIndex: 99999, background: 'rgba(236, 72, 153, 0.9)', color: 'white', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 800, border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 15px rgba(236,72,153,0.5)', pointerEvents: 'none' }}>
          بوابة التحكم العليا بقيم النظام ⚙️
        </div>
        <AppExperienceManager onBack={() => navigateTo('/super-admin')} />
      </div>
    );
  }

  // Fallback to website portals and official homepage landing UI
  return (
    <OfficialWebsite 
      currentPath={currentPath} 
      onNavigate={(path) => navigateTo(path)} 
    />
  );
}

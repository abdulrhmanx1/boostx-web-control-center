import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BarChart2, ShieldAlert, AlertTriangle, Home as HomeIcon, MapPin, Database, Activity, Terminal, ArrowRight
} from 'lucide-react';

export const SuperAdminDashboard = ({ onBack }: { onBack?: () => void }) => {
  const [activeTab, setActiveTab] = useState<'roles' | 'geography' | 'finance' | 'ops' | 'health'>('roles');

  const stats = [
    { label: 'الشركاء النشطين', val: '٣,٤٥٢ شريك', icon: <Users size={20} /> },
    { label: 'المناديب النشطين', val: '٨,٩٢٠ مندوب', icon: <Activity size={20} /> },
    { label: 'إجمالي المبيعات', val: '١,٤٢٠,٠٠٠ ر.س', icon: <BarChart2 size={20} /> },
    { label: 'بلاغات أمنية نشطة', val: '٢ بلاغات', icon: <ShieldAlert size={20} /> }
  ];

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', padding: '30px', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      {/* Dashboard Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {onBack && (
            <button className="btn btn-secondary" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', color: 'white', fontSize: '0.82rem' }}>
              <ArrowRight size={16} /> العودة للرئيسية
            </button>
          )}
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>لوحة الإشراف المتقدمة (SuperAdmin Panel)</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', margin: '4px 0 0 0' }}>الإشراف على النطاق الجغرافي والتحكم بالصلاحيات والأمان</p>
          </div>
        </div>
        <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '6px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800 }}>
          بيئة تحكم مغلقة (Super Secure) 🔒
        </div>
      </div>

      {/* Grid Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map((s, idx) => (
          <div key={idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '20px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(168,85,247,0.15)', color: 'var(--color-accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.icon}
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.label}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '4px 0 0 0' }}>{s.val}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '24px' }}>
        {[
          { id: 'roles', label: 'التحكم بالصلاحيات 👥' },
          { id: 'geography', label: 'التحكم الجغرافي والبلدان 🇸🇦 🇪🇬' },
          { id: 'finance', label: 'التقارير المالية والتحصيلات 💳' },
          { id: 'ops', label: 'مراقبة العمليات الحية ⚡' },
          { id: 'health', label: 'صحة النظام وقواعد البيانات 💾' }
        ].map(t => (
          <button 
            key={t.id} 
            className={`search-tag ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => setActiveTab(t.id as any)}
            style={{ fontSize: '0.85rem' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: '24px', borderRadius: '20px' }}>
        {activeTab === 'roles' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>إدارة أدوار الموظفين والمسؤولين</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>ترقية مستخدمين أو سحب صلاحيات من المشرفين والمدراء الماليين في السعودية ومصر.</p>
            {/* Table Mockup */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
              {[
                { name: 'محمد القحطاني', email: 'qah@boostx.sa', role: 'مدير عمليات السعودية', status: 'نشط' },
                { name: 'أحمد الجمال', email: 'gamal@boostx.eg', role: 'مشرف مالي مصر', status: 'نشط' }
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', display: 'block' }}>{row.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{row.email}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', background: 'rgba(168,85,247,0.15)', color: 'var(--color-accent-light)', padding: '2px 8px', borderRadius: 4 }}>{row.role}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-success)' }}>● {row.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'geography' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>تهيئة الفروع والنطاق الجغرافي</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>إضافة مناطق تغطية أو تعطيل أحياء معينة جغرافياً لمواسم السعودية، أو تفعيل مناطق بمصر.</p>
          </div>
        )}

        {activeTab === 'finance' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>التقارير المالية والتحصيلات الكبرى</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>مراجعة عمليات السحب المعلقة للشركاء (IBAN verification) والمحافظ الجارية للمندوبين والعملاء.</p>
          </div>
        )}

        {activeTab === 'ops' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>مراقبة أسطول العمليات الحية (Live Fleet View)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>متابعة فورية على الخريطة لكافة مناديب التوصيل ومقدمي الخدمات النشطين حالياً في الميدان.</p>
          </div>
        )}

        {activeTab === 'health' && (
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>صحة النظام والنسخ الاحتياطي (Database Sandbox)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>أداء نظام Supabase وقواعد البيانات والنسخ الاحتياطي الساعي للأمان.</p>
          </div>
        )}
      </div>
    </div>
  );
};

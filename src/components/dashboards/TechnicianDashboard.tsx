import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Hammer, Clock, Plus, BarChart2, DollarSign, Settings, ArrowRight, User, Phone, MapPin, Check
} from 'lucide-react';

export const TechnicianDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'dashboard');
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Services
  const [services, setServices] = useState([
    { id: 1, name: 'إصلاح تسريبات المياه والصنابير', price: 65, duration: '٤٥ دقيقة' },
    { id: 2, name: 'تسليك مجاري الصرف الصحي والانسدادات', price: 95, duration: '٦٠ دقيقة' },
    { id: 3, name: 'تركيب خلاطات مياه ومغاسل جديدة', price: 150, duration: '٩٠ دقيقة' }
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('٦٠ دقيقة');

  // Bookings
  const [bookings, setBookings] = useState([
    { id: 'booking-1', client: 'عبدالرحمن الشهري', phone: '+966551234567', service: 'إصلاح تسريبات المياه والصنابير', date: 'اليوم، ٠٥:٣٠ م', location: 'حي الصحافة، الرياض', status: 'pending' },
    { id: 'booking-2', client: 'سارة الدوسري', phone: '+966552345678', service: 'تركيب خلاطات مياه ومغاسل جديدة', date: 'غداً، ١٠:٠٠ ص', location: 'حي الملقا، الرياض', status: 'pending' }
  ]);

  const handleAddService = () => {
    if (!newServiceName || !newServicePrice) return;
    const newService = {
      id: Date.now(),
      name: newServiceName,
      price: parseFloat(newServicePrice),
      duration: newServiceDuration
    };
    setServices(prev => [...prev, newService]);
    setNewServiceName('');
    setNewServicePrice('');
    alert('تمت إضافة الخدمة بنجاح! 🛠️');
  };

  const handleAcceptBooking = (id: string) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'accepted' } : b));
    alert('تم قبول حجز العميل وتوثيق موعد الزيارة بنجاح! 📅');
  };

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar */}
      {!hideSidebar && (
        <aside style={{ width: '260px', background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 20, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Hammer size={20} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>لوحة الفني</span>
          </div>

          {[
            { id: 'dashboard', label: 'لوحة القيادة والحجوزات 📅' },
            { id: 'services', label: 'إدارة الخدمات والأسعار 🛠️' },
            { id: 'earnings', label: 'الأرباح والتقارير المالية 💳' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                background: activeTab === item.id ? 'var(--color-accent)' : 'transparent',
                color: 'white',
                textAlign: 'right',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              {item.label}
            </button>
          ))}

          {onBack && (
            <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', color: 'white' }} onClick={onBack}>
              <ArrowRight size={16} style={{ marginLeft: 8 }} /> العودة للرئيسية
            </button>
          )}
        </aside>
      )}

      {/* Main Workspace */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>أحمد محمد (فني سباكة معتمد)</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>حي الصحافة والملقا والياسمين • الرياض</p>
          </div>
          <button 
            onClick={() => setIsAvailable(!isAvailable)} 
            style={{
              padding: '8px 16px',
              background: isAvailable ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
              border: '1px solid ' + (isAvailable ? '#10b981' : 'rgba(255,255,255,0.1)'),
              color: isAvailable ? '#10b981' : 'white',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isAvailable ? '🟢 متاح لتلقي الحجوزات' : '🔴 مشغول حالياً'}
          </button>
        </header>

        {/* Tab Contents */}
        {activeTab === 'dashboard' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>حجوزات الصيانة المنزلية الواردة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {bookings.map(b => (
                <div key={b.id} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>{b.service}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>العميل: {b.client} • {b.phone} • {b.location}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: b.status === 'accepted' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: b.status === 'accepted' ? 'var(--color-success)' : '#f59e0b', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontWeight: 800 }}>
                      {b.status === 'accepted' ? 'تم القبول والجدولة 📅' : 'حجز معلق'}
                    </span>
                  </div>

                  {b.status !== 'accepted' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }} onClick={() => handleAcceptBooking(b.id)}>الموافقة والجدولة</button>
                      <button className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.8rem', color: '#ef4444' }} onClick={() => alert('تم رفض حجز العميل.')}>رفض الموعد</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>إدارة قائمة خدماتك وأسعارها</h3>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
              <input type="text" className="input-field" placeholder="اسم الخدمة..." value={newServiceName} onChange={e => setNewServiceName(e.target.value)} style={{ flex: 2 }} />
              <input type="number" className="input-field" placeholder="السعر (ر.س)..." value={newServicePrice} onChange={e => setNewServicePrice(e.target.value)} style={{ flex: 1 }} />
              <button className="btn btn-primary" onClick={handleAddService} style={{ padding: '12px 24px', fontSize: '0.85rem' }}>إضافة الخدمة</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {services.map(s => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                  <span>{s.name} • {s.duration}</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>{s.price} ر.س</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>الأرباح والتحصيلات الجارية</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>مراجعة إجمالي دخل الخدمات المنفذة هذا الشهر ومحفظتك الرقمية القابلة للسحب.</p>
          </div>
        )}

      </main>
    </div>
  );
};

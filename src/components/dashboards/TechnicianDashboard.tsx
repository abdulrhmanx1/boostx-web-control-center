import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Hammer, Clock, Plus, BarChart2, DollarSign, Settings, ArrowRight, User, Phone, MapPin, Check
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const TechnicianDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'dashboard');
  const [isAvailable, setIsAvailable] = useState(true);
  
  // Resolve current technician identity from sandbox session or default
  const [technicianId] = useState(() => {
    const saved = localStorage.getItem('BX_SANDBOX_SESSION');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.user.role === 'technician') {
          return parsed.user.id;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return 'tech_usr_1';
  });

  const [techName, setTechName] = useState('أحمد محمد (فني سباكة معتمد)');

  // Services
  const [services, setServices] = useState<any[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('٦٠ دقيقة');

  // Bookings
  const [bookings, setBookings] = useState<any[]>([]);

  // Fetch data dynamically and setup Realtime listeners
  useEffect(() => {
    const fetchTechnicianProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', technicianId)
          .single();
        if (!error && data) {
          setTechName(`${data.full_name} (فني صيانة معتمد)`);
        }
      } catch (err) {
        console.error('Error fetching technician profile:', err);
      }
    };

    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('technician_services')
          .select('*')
          .eq('technician_id', technicianId);
        if (!error && data) {
          setServices(data);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
      }
    };

    const fetchBookings = async () => {
      try {
        const { data, error } = await supabase
          .from('service_bookings')
          .select('*')
          .eq('technician_id', technicianId)
          .order('booking_date', { ascending: false });
        if (!error && data) {
          const mappedBookings = data.map((b: any) => ({
            id: b.id,
            client: b.customer_name || 'عميل مجهول',
            phone: b.customer_phone || '',
            service: b.service_name || '',
            date: b.booking_date || '',
            location: b.location || '',
            status: b.status || 'pending'
          }));
          setBookings(mappedBookings);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
      }
    };

    fetchTechnicianProfile();
    fetchServices();
    fetchBookings();

    // Subscribe to realtime database changes for services and bookings
    const servicesChannel = supabase
      .channel(`realtime:technician_services:${technicianId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'technician_services', filter: `technician_id=eq.${technicianId}` }, () => {
        fetchServices();
      })
      .subscribe();

    const bookingsChannel = supabase
      .channel(`realtime:service_bookings:${technicianId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_bookings', filter: `technician_id=eq.${technicianId}` }, () => {
        fetchBookings();
      })
      .subscribe();

    return () => {
      servicesChannel.unsubscribe();
      bookingsChannel.unsubscribe();
    };
  }, [technicianId]);

  const handleAddService = async () => {
    if (!newServiceName || !newServicePrice) return;
    const newService = {
      id: 'ts-' + Date.now(),
      technician_id: technicianId,
      name: newServiceName,
      price: parseFloat(newServicePrice),
      duration: newServiceDuration,
      is_active: true
    };

    try {
      const { error } = await supabase
        .from('technician_services')
        .insert(newService);
      if (error) {
        alert('خطأ أثناء إضافة الخدمة: ' + error.message);
      } else {
        setNewServiceName('');
        setNewServicePrice('');
        alert('تمت إضافة الخدمة بنجاح! 🛠️');
      }
    } catch (err: any) {
      console.error(err);
      alert('خطأ غير متوقع.');
    }
  };

  const handleAcceptBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'accepted' })
        .eq('id', id);
      if (error) {
        alert('حدث خطأ أثناء قبول الحجز: ' + error.message);
      } else {
        alert('تم قبول حجز العميل وتوثيق موعد الزيارة بنجاح! 📅');
      }
    } catch (err: any) {
      console.error(err);
      alert('خطأ غير متوقع.');
    }
  };

  const handleRejectBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_bookings')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) {
        alert('حدث خطأ أثناء رفض الحجز: ' + error.message);
      } else {
        alert('تم رفض حجز العميل بنجاح.');
      }
    } catch (err: any) {
      console.error(err);
      alert('خطأ غير متوقع.');
    }
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
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>{techName}</h1>
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
                    <span style={{ fontSize: '0.75rem', background: b.status === 'accepted' ? 'rgba(16,185,129,0.15)' : b.status === 'rejected' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245,158,11,0.15)', color: b.status === 'accepted' ? 'var(--color-success)' : b.status === 'rejected' ? '#ef4444' : '#f59e0b', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontWeight: 800 }}>
                      {b.status === 'accepted' ? 'تم القبول والجدولة 📅' : b.status === 'rejected' ? 'تم الرفض ❌' : 'حجز معلق'}
                    </span>
                  </div>

                  {b.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                      <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }} onClick={() => handleAcceptBooking(b.id)}>الموافقة والجدولة</button>
                      <button className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.8rem', color: '#ef4444' }} onClick={() => handleRejectBooking(b.id)}>رفض الموعد</button>
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

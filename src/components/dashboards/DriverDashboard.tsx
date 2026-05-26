import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, Clock, DollarSign, MapPin, CheckCircle, Navigation, ArrowRight, Star
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const DriverDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'tasks');
  const [isOnline, setIsOnline] = useState(true);

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const driverId = 'usr_driver_1'; // Static sandbox driver id for this dashboard simulator
  const driverName = 'خالد العتيبي';
  const driverPhone = '+966522222222';
  const driverVehicle = 'كيا سيراتو (أ ب ج ١٢٣٤)';

  const stats = [
    { label: 'طلبات مكتملة اليوم', val: '٨ طلبات' },
    { label: 'دخل اليوم الحالي', val: '٩٦.٠٠ ر.س' },
    { label: 'تقييم العملاء العام', val: '٤.٩ ★' }
  ];

  // Sync tasks dynamically from live DB
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*');
      
      if (!error && data) {
        // Query orders that are pending, preparing, out_for_delivery where driver is null OR this driver!
        const relevant = data.filter((o: any) => 
          (o.status !== 'delivered' && o.status !== 'تم التوصيل' && o.status !== 'cancelled' && o.status !== 'ملغي') &&
          (!o.driver_id || o.driver_id === driverId)
        );
        
        const mapped = relevant.map((o: any) => ({
          id: o.id,
          partner: o.pickup_location?.split(' - ')[0] || 'مطعم البيك الرواد',
          client: o.customer_name || 'عبدالعزيز الحربي',
          pickup: o.pickup_location || 'حي الملقا، الرياض',
          dropoff: o.dropoff_location || 'حي الياسمين، الرياض',
          price: `${o.delivery_fee || 12} ر.س`,
          status: o.driver_id === driverId ? 'delivering' : 'pending'
        }));
        setTasks(mapped);
      }
    } catch (e) {
      console.log('Error fetching driver tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();

    const channel = supabase.channel('realtime:driver_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchTasks();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleAcceptTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          driver_id: driverId,
          driver_name: driverName,
          driver_phone: driverPhone,
          driver_vehicle: driverVehicle,
          status: 'out_for_delivery'
        })
        .eq('id', taskId);

      if (!error) {
        // Upsert driver location start point
        await supabase
          .from('driver_locations')
          .upsert({
            driver_id: driverId,
            latitude: 24.7136,
            longitude: 46.6753,
            heading: 45.0,
            speed: 35.0,
            updated_at: new Date().toISOString()
          });

        alert('تم قبول مهمة التوصيل وتحديث إحداثيات المندوب بنجاح! 🛵');
        fetchTasks();
      }
    } catch (err) {
      console.error('Error accepting task:', err);
    }
  };

  const handleUpdateLocation = async () => {
    try {
      const nextLat = 24.7136 + (Math.random() - 0.5) * 0.05;
      const nextLng = 46.6753 + (Math.random() - 0.5) * 0.05;

      const { error } = await supabase
        .from('driver_locations')
        .upsert({
          driver_id: driverId,
          latitude: nextLat,
          longitude: nextLng,
          heading: Math.random() * 360,
          speed: Math.round(25 + Math.random() * 30),
          updated_at: new Date().toISOString()
        });

      if (!error) {
        alert('تم تحديث موقعك المندوب الجغرافي بنجاح! 📍');
      }
    } catch (err) {
      console.error('Error updating driver location:', err);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'delivered'
        })
        .eq('id', taskId);

      if (!error) {
        // Delete location record on completion to hide location
        await supabase.from('driver_locations').delete().eq('driver_id', driverId);
        alert('تم توصيل وتسليم الشحنة للعميل بنجاح! 🏁');
        fetchTasks();
      }
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar */}
      {!hideSidebar && (
        <aside style={{ width: '260px', background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 20, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>لوحة المندوب</span>
          </div>

          {[
            { id: 'tasks', label: 'الطلبات والمهام النشطة 📦' },
            { id: 'earnings', label: 'المحفظة والأرباح المحققة 💳' },
            { id: 'vehicle', label: 'توثيق المركبة والملف 🚗' }
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
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>خالد العتيبي (مندوب توصيل معتمد)</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>سيارة كيا سيراتو • أ ب ج ١٢٣٤ • الرياض</p>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)} 
            style={{
              padding: '8px 16px',
              background: isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
              border: '1px solid ' + (isOnline ? '#10b981' : 'rgba(255,255,255,0.1)'),
              color: isOnline ? '#10b981' : 'white',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isOnline ? '🟢 متصل حالياً (نشط)' : '🔴 غير متصل حالياً'}
          </button>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30 }}>
          {stats.map((s, idx) => (
            <div key={idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 16 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block' }}>{s.label}</span>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '6px 0 0 0', color: 'white' }}>{s.val}</h2>
            </div>
          ))}
        </div>

        {/* Tab Contents */}
        {activeTab === 'tasks' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>مهام التوصيل الحالية والمتاحة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tasks.map(t => (
                <div key={t.id} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', margin: 0 }}>شحنة من {t.partner}</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>العميل: {t.client} • الاستلام: {t.pickup} • التسليم: {t.dropoff}</p>
                    </div>
                    <span style={{ fontSize: '0.75rem', background: t.status === 'delivering' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: t.status === 'delivering' ? 'var(--color-success)' : '#f59e0b', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontWeight: 800 }}>
                      {t.status === 'delivering' ? 'جاري التوصيل 🛵' : 'طلب توصيل معلق'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>رسوم التوصيل: {t.price}</span>
                    {t.status !== 'delivering' ? (
                      <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }} onClick={() => handleAcceptTask(t.id)}>قبول الطلب والتوجه للمتجر</button>
                    ) : (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', background: '#c084fc', border: 'none' }} onClick={handleUpdateLocation}>تحديث الموقع الجغرافي 📍</button>
                        <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem', background: '#10b981', border: 'none' }} onClick={() => handleCompleteTask(t.id)}>تم تسليم الطلب 🏁</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'earnings' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>المحفظة والأرباح الجارية</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>مراجعة تقارير التحصيل اليومية ورسوم التوصيل والعمولة الخاصة بك والمحفظة القابلة للسحب الفوري.</p>
          </div>
        )}

        {activeTab === 'vehicle' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>توثيق رخصة المركبة والهوية</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>مراجعة بيانات مركبتك، أوراق التأمين، رخصة القيادة الموثقة والمسجلة في قاعدة البيانات.</p>
          </div>
        )}

      </main>
    </div>
  );
};
export default DriverDashboard;

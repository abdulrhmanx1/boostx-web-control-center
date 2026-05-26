import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, Clock, DollarSign, MapPin, CheckCircle, Navigation, ArrowRight, Star, 
  Home, Users, MessageSquare, AlertTriangle, UserCheck, ShieldCheck, ShoppingCart, 
  Percent, Tag, Zap, Play, Wallet, Activity, ClipboardList, ChevronDown, ChevronUp, 
  Search, Trash2, Edit3, Eye, Power, Check, X, Phone, PhoneCall, Image as ImageIcon,
  FileText
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
}

interface SidebarGroup {
  id: string;
  title: string;
  items: SidebarItem[];
}

export const DriverDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'driver_home');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    overview: false,
    tasks: false,
    tracking: false,
    communication: false,
    financials: false,
    settings: false
  });

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
          clientPhone: o.customer_phone || '+966500000000',
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
        await supabase.from('driver_locations').delete().eq('driver_id', driverId);
        alert('تم توصيل وتسليم الشحنة للعميل بنجاح! 🏁');
        fetchTasks();
      }
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const sidebarGroups: SidebarGroup[] = [
    {
      id: 'overview',
      title: 'A. نظرة عامة',
      items: [
        { id: 'driver_home', label: 'الرئيسية', icon: Home },
        { id: 'driver_status', label: 'حالة ونشاط المندوب', icon: Power },
        { id: 'driver_kpis', label: 'ملخص اليوم والأداء', icon: Activity }
      ]
    },
    {
      id: 'tasks',
      title: 'B. إدارة المهام والطلبات',
      items: [
        { id: 'driver_tasks_available', label: 'المهام المتاحة للالتقاط', icon: ShoppingCart },
        { id: 'driver_tasks_assigned', label: 'الطلبات المسندة إليّ', icon: ClipboardList },
        { id: 'driver_tasks_active', label: 'الطلبات الجارية التوصيل', icon: Truck },
        { id: 'driver_tasks_completed', label: 'الطلبات المكتملة والسابقة', icon: CheckCircle }
      ]
    },
    {
      id: 'tracking',
      title: 'C. نظام التتبع والخرائط',
      items: [
        { id: 'driver_map_location', label: 'الموقع الجغرافي الجاري', icon: MapPin },
        { id: 'driver_map_route', label: 'خريطة تتبع الشحنة النشطة', icon: Navigation },
        { id: 'driver_gps_history', label: 'سجل سجل العمليات الحركة والمسارات', icon: ClipboardList }
      ]
    },
    {
      id: 'communication',
      title: 'D. قنوات التواصل والدعم',
      items: [
        { id: 'driver_chats', label: 'محادثات العملاء والشركاء', icon: MessageSquare },
        { id: 'driver_call_client', label: 'الاتصال الهاتفي بالعميل', icon: Phone },
        { id: 'driver_support', label: 'الدعم الفني للمناديب', icon: AlertTriangle }
      ]
    },
    {
      id: 'financials',
      title: 'E. المحفظة والأرباح المندوب',
      items: [
        { id: 'driver_earnings_today', label: 'صافي أرباح اليوم الحالي', icon: DollarSign },
        { id: 'driver_earnings_weekly', label: 'ملخص الأرباح الأسبوعي', icon: Wallet },
        { id: 'driver_payouts', label: 'سجل سجل العمليات الدفعات والتحويلات', icon: ClipboardList }
      ]
    },
    {
      id: 'settings',
      title: 'F. الملف والإعدادات الشخصية',
      items: [
        { id: 'driver_profile', label: 'البيانات الشخصية للمندوب', icon: UserCheck },
        { id: 'driver_vehicle', label: 'تفاصيل ورخصة المركبة', icon: Truck },
        { id: 'driver_documents', label: 'المستندات الرسمية ورخصة القيادة', icon: FileText },
        { id: 'driver_availability', label: 'أوقات وجداول التوفر', icon: Clock }
      ]
    }
  ];

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar */}
      {!hideSidebar && (
        <aside style={{ width: '280px', flexShrink: 0, background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }} className="no-scrollbar">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Truck size={20} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 900, fontSize: '1rem', display: 'block', color: 'white' }}>بوابة المندوب المعتمد</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{driverName}</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {sidebarGroups.map(group => (
              <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <button 
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    padding: '6px 8px',
                    fontSize: '0.78rem',
                    fontWeight: 900,
                    color: 'var(--color-accent-light)',
                    background: 'rgba(255,255,255,0.01)',
                    borderRadius: 8,
                    textAlign: 'right'
                  }}
                >
                  <span>{group.title}</span>
                  {collapsedGroups[group.id] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                </button>

                {!collapsedGroups[group.id] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 6, borderRight: '1px solid rgba(255,255,255,0.03)', marginTop: 4 }}>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            width: '100%',
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: isActive ? 'var(--color-accent)' : 'transparent',
                            color: isActive ? 'white' : 'var(--color-text-main)',
                            textAlign: 'right',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <Icon size={15} style={{ opacity: isActive ? 1 : 0.6 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {onBack && (
            <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.1)' }} onClick={onBack}>
              <ArrowRight size={16} /> العودة للرئيسية
            </button>
          )}
        </aside>
      )}

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', background: 'rgba(18,11,31,0.5)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
              {sidebarGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'الرئيسية'}
            </h2>
          </div>
          <button 
            onClick={() => setIsOnline(!isOnline)} 
            style={{
              padding: '8px 16px',
              background: isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              border: '1px solid ' + (isOnline ? '#10b981' : '#ef4444'),
              color: isOnline ? '#10b981' : '#ef4444',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isOnline ? '🟢 متصل ومستعد للتوصيل' : '🔴 غير متصل حالياً'}
          </button>
        </header>

        {/* Workspace Body */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* Stats Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {stats.map((s, idx) => (
              <div key={idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block' }}>{s.label}</span>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '4px 0 0 0', color: 'white' }}>{s.val}</h2>
              </div>
            ))}
          </div>

          {/* TAB VIEW 1: مهام التوصيل */}
          {(activeTab === 'driver_home' || activeTab === 'driver_tasks_available') && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>مهام شحنات التوصيل المتاحة للالتقاط الجغرافي</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {tasks.map(t => (
                  <div key={t.id} style={{ padding: 18, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'white', margin: 0 }}>شحنة من {t.partner}</h4>
                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                          العميل: {t.client} • الاستلام: {t.pickup} • التسليم: {t.dropoff}
                        </p>
                        
                        {/* Privilege / Data Privacy Rule: Customer phone only visible during active delivery! */}
                        <div style={{ marginTop: 8, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', padding: '6px 12px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.75rem' }}>
                          <span>📞 هاتف العميل:</span>
                          {t.status === 'delivering' ? (
                            <strong style={{ color: 'var(--color-success)' }}>{t.clientPhone}</strong>
                          ) : (
                            <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>🔐 مخفي (يظهر فقط عند قبول الطلب وبدء التوصيل)</span>
                          )}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.72rem', background: t.status === 'delivering' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: t.status === 'delivering' ? 'var(--color-success)' : '#f59e0b', padding: '4px 12px', borderRadius: '30px', fontWeight: 800 }}>
                        {t.status === 'delivering' ? 'جاري التوصيل 🛵' : 'شحنة معلقة'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 12, justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>رسوم التوصيل: {t.price}</span>
                      {t.status !== 'delivering' ? (
                        <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.78rem' }} onClick={() => handleAcceptTask(t.id)}>قبول الطلب والتوجه للمتجر</button>
                      ) : (
                        <div style={{ display: 'flex', gap: 10 }}>
                          <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', background: '#c084fc', border: 'none' }} onClick={handleUpdateLocation}>تحديث موقع الـ GPS 📍</button>
                          <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', background: '#10b981', border: 'none' }} onClick={() => handleCompleteTask(t.id)}>تم تسليم الشحنة 🏁</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {tasks.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>لا توجد مهام توصيل جارية حالياً بانتظارك. 👌</div>
                )}
              </div>
            </div>
          )}

          {/* TAB VIEW 2: الموقع الحالي */}
          {activeTab === 'driver_map_location' && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>محاكي تحديد الموقع الجغرافي للمندوب GPS</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>تتيح لك هذه الشاشة إرسال إحداثيات موقعك الجغرافي الحية لحظة بلحظة للتطبيق لكي يتمكن العميل والمدير من تتبعك مباشرة.</p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-primary" onClick={handleUpdateLocation}>بث وتحديث إحداثياتي الحالية 📍</button>
              </div>
            </div>
          )}

          {/* FALLBACK VIEW FOR STATIC PAGES */}
          {!['driver_home', 'driver_tasks_available', 'driver_map_location'].includes(activeTab) && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8 }}>صفحة السائق قيد الإعداد الفني ⚙️</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>أنت تنظر حالياً إلى هيكل التبويبات الفاخر. سيتم تزويدها ببيانات إضافية تدريجياً.</p>
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
export default DriverDashboard;

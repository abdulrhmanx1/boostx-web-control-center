import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Grid, Clock, Plus, BarChart2, DollarSign, Settings, Heart, Star, MapPin, Upload, FileText, CheckCircle, Gift, ArrowRight
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const PartnerDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'catalog');
  const [busyMode, setBusyMode] = useState(false);
  const [bizStatus, setBizStatus] = useState('open');
  
  // Customisable store identity
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80');
  const [logoEmoji, setLogoEmoji] = useState('🍔');
  const [storeName, setStoreName] = useState('مطعم البيك - الشريك');
  const [category, setCategory] = useState('مطاعم');
  const [workHours, setWorkHours] = useState('09:00 ص - 11:30 م');
  
  // Delivery settings
  const [deliveryRadius, setDeliveryRadius] = useState(15);
  const [deliveryFee, setDeliveryFee] = useState(0);

  // Dynamic database states
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  const partnerId = 'p1'; // Static sandbox partner id for this dashboard simulator

  // Sync partner status and details from DB in realtime
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('id', partnerId)
          .single();
        if (!error && data) {
          setBusyMode(!data.is_active);
          setStoreName(data.name);
          setCategory(data.category || 'مطاعم');
          if (data.image) setCoverUrl(data.image);
        }
      } catch (err) {
        console.error('Error fetching partner details:', err);
      }
    };
    fetchPartner();

    const channel = supabase.channel(`realtime:partner_dash:${partnerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners', filter: `id=eq.${partnerId}` }, (payload: any) => {
        if (payload.new) {
          setBusyMode(!payload.new.is_active);
          setStoreName(payload.new.name);
        }
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Update busy mode in DB
  const handleToggleBusyMode = async () => {
    try {
      const nextActive = busyMode; // If currently busy (is_active is false), toggle to Reception mode (is_active true)
      const { error } = await supabase
        .from('partners')
        .update({ is_active: nextActive })
        .eq('id', partnerId);
      
      if (!error) {
        setBusyMode(!nextActive);
      }
    } catch (err) {
      console.error('Error updating partner busy mode:', err);
    }
  };

  // Sync products dynamically
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('partner_id', partnerId);
        if (!error && data) {
          const mapped = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            desc: p.desc || p.description || '',
            price: p.price,
            rawPrice: p.rawPrice || 20,
            active: p.is_active !== undefined ? p.is_active : true
          }));
          setProducts(mapped);
        }
      } catch (err) {
        console.error('Error fetching partner products:', err);
      }
    };
    fetchProducts();

    const channel = supabase.channel('realtime:partner_dash_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products', filter: `partner_id=eq.${partnerId}` }, () => {
        fetchProducts();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const toggleProductActive = async (prodId: number) => {
    const prod = products.find(p => p.id === prodId);
    if (!prod) return;
    try {
      const nextActive = !prod.active;
      const { error } = await supabase
        .from('products')
        .update({ is_active: nextActive })
        .eq('id', prodId);
      if (!error) {
        setProducts(prev => prev.map(p => p.id === prodId ? { ...p, active: nextActive } : p));
      }
    } catch (err) {
      console.error('Error updating product active status:', err);
    }
  };

  const handleAddProduct = async () => {
    const name = prompt('أدخل اسم المنتج الجديد:');
    const desc = prompt('أدخل وصف المنتج:');
    const priceStr = prompt('أدخل سعر المنتج (مثال: ٢٠ ر.س):');
    if (name && priceStr) {
      const rawPrice = parseInt(priceStr.replace(/[^0-9]/g, '')) || 20;
      try {
        const newProd = {
          id: Math.floor(1000 + Math.random() * 9000),
          partner_id: partnerId,
          name,
          desc: desc || '',
          price: priceStr.includes('ر.س') ? priceStr : `${priceStr} ر.س`,
          rawPrice,
          is_active: true,
          image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80'
        };
        const { error } = await supabase.from('products').insert(newProd);
        if (!error) {
          alert('تمت إضافة المنتج بنجاح! 🛍️');
        }
      } catch (err) {
        console.error('Error adding product to DB:', err);
      }
    }
  };

  // Sync orders dynamically
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*');
        if (!ordersError && ordersData) {
          const { data: itemsData } = await supabase
            .from('order_items')
            .select('*');
            
          const combined = ordersData.map((order: any) => ({
            ...order,
            items: itemsData ? itemsData.filter((i: any) => i.order_id === order.id) : []
          }));
          setOrders(combined);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      }
    };
    fetchOrders();

    const channel = supabase.channel('realtime:partner_dash_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'order_items' }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);
      if (!error) {
        // Also trigger an instant notification status update loop
        await supabase.from('notifications').insert({
          id: 'notif-' + Math.floor(100 + Math.random() * 900),
          user_id: 'usr_cust_1',
          type: 'order',
          title: `تحديث طلبك: ${nextStatus} 📦`,
          body: `قام الشريك ${storeName} بتحديث حالة طلبك رقم #${orderId} إلى: ${nextStatus}`,
          image_url: logoEmoji === '🍗' ? 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80' : 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
          target_route: 'order-tracking',
          is_sponsored: false,
          created_at: new Date().toISOString(),
          read: false
        });
        alert(`تم تحديث حالة الطلب #${orderId} بنجاح إلى: ${nextStatus}`);
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar */}
      {!hideSidebar && (
        <aside style={{ width: '260px', background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 20, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              🏪
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.1rem' }}>لوحة الشريك</span>
          </div>

          {[
            { id: 'catalog', label: 'إدارة الكتالوج والمنتجات 🛍️' },
            { id: 'identity', label: 'الملف التعريفي والغلاف 🏪' },
            { id: 'orders', label: 'إدارة الطلبات النشطة 📦' },
            { id: 'analytics', label: 'الإحصائيات والمبيعات 📊' },
            { id: 'ads', label: 'حملات الترويج والقصص 📣' }
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
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>{storeName}</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>فئة {category} • ساعات العمل: {workHours}</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={handleToggleBusyMode} 
              style={{
                padding: '8px 16px',
                background: busyMode ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                border: '1px solid ' + (busyMode ? '#ef4444' : 'rgba(255,255,255,0.1)'),
                color: busyMode ? '#ef4444' : 'white',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {busyMode ? '🔴 وضع المزدحم نشط' : '🟢 وضع الاستقبال العادي'}
            </button>
          </div>
        </header>

        {/* Tab Contents */}
        {activeTab === 'catalog' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>كتالوج المنتجات والأطباق المتاحة</h3>
              <button className="btn btn-primary" onClick={handleAddProduct} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 16px', fontSize: '0.8rem' }}>
                <Plus size={16} /> إضافة منتج جديد
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {products.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                  <div style={{ textAlign: 'right' }}>
                    <strong style={{ display: 'block', fontSize: '0.94rem' }}>{p.name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{p.desc}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>{p.price}</span>
                    <button 
                      onClick={() => toggleProductActive(p.id)}
                      style={{
                        padding: '6px 12px',
                        background: p.active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid ' + (p.active ? '#10b981' : 'rgba(255,255,255,0.1)'),
                        color: p.active ? '#10b981' : 'white',
                        borderRadius: 6,
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      {p.active ? 'نشط ومتوفر' : 'غير متوفر ❌'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'identity' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>تخصيص هوية المتجر والغلاف</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>اسم النشاط التجاري</label>
                <input type="text" className="input-field" value={storeName} onChange={e => setStoreName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>تصنيف النشاط</label>
                <input type="text" className="input-field" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>أوقات وساعات العمل</label>
                <input type="text" className="input-field" value={workHours} onChange={e => setWorkHours(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>غلاف المتجر المميز (رابط الصورة)</label>
                <input type="text" className="input-field" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>إدارة طلبات التوصيل النشطة لحظياً</h3>
            {orders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>لا توجد طلبات جارية نشطة بانتظار التحضير حالياً.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {orders.map(order => (
                  <div key={order.id} style={{ padding: 18, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white' }}>رقم الطلب: #{order.id}</span>
                        <span style={{ fontSize: '0.72rem', background: '#7c3aed', color: 'white', padding: '2px 8px', borderRadius: 8 }}>{order.status}</span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '8px 0 0 0' }}>
                        العميل: <strong>{order.customer_name}</strong> ({order.customer_phone})
                      </p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
                        موقع التوصيل: {order.dropoff_location}
                      </p>
                      {order.items && order.items.length > 0 && (
                        <div style={{ marginTop: 10, padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: '#c084fc' }}>محتويات الطلب:</span>
                          {order.items.map((item: any) => {
                            // Find product name if matched in default state products or search products
                            const prod = products.find(p => String(p.id) === String(item.menu_item_id));
                            const prodName = prod ? prod.name : `وجبة مميزة (#${item.menu_item_id})`;
                            return (
                              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'white' }}>
                                <span>• {prodName}</span>
                                <span style={{ color: '#10b981', fontWeight: 'bold' }}>x{item.quantity}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      {order.status === 'قيد التجهيز' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'تم التجهيز، بانتظار المندوب')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#f59e0b', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 900, color: 'white' }}>
                          جاهز للتسليم 📦
                        </button>
                      )}
                      {order.status === 'تم التجهيز، بانتظار المندوب' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'تم التسليم للمندوب')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#10b981', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 900, color: 'white' }}>
                          تسليم المندوب 🛵
                        </button>
                      )}
                      {order.status !== 'تم التوصيل للعميل' && (
                        <button onClick={() => handleUpdateOrderStatus(order.id, 'تم التوصيل للعميل')} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.72rem', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, cursor: 'pointer', background: 'transparent' }}>
                          إكمال وتوصيل الطلب 🏁
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>التقارير والمبيعات الجارية</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>مراجعة تقارير المبيعات وتحصيل الأرباح والعمولات المستقطعة للمنصة.</p>
          </div>
        )}

        {activeTab === 'ads' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>إعلانات المتجر الممولة وقصص العروض</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>إطلاق قصص العروض (Stories) لتظهر فورا لآلاف العملاء في النطاق الجغرافي النشط.</p>
          </div>
        )}

      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Grid, Clock, Plus, DollarSign, Settings, Heart, Star, MapPin, Upload, 
  FileText, CheckCircle, Gift, ArrowRight, Home, Users, MessageSquare, AlertTriangle, 
  HelpCircle, UserCheck, ShieldCheck, ShoppingCart, Percent, Tag, Zap, Play, Wallet, 
  Activity, ClipboardList, ChevronDown, ChevronUp, Search, Trash2, Edit3, Eye, Power, Check, X,
  XCircle
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

export const PartnerDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeTab, setActiveTab] = useState(defaultTab || 'partner_home');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    overview: false,
    store: false,
    products_services: false,
    marketing: false,
    orders: false,
    customers_comms: false,
    financials: false,
    support_settings: false
  });

  const partnerId = 'p1'; // Static sandbox partner id for this dashboard simulator
  
  // Customisable store identity
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80');
  const [logoEmoji, setLogoEmoji] = useState('🍔');
  const [storeName, setStoreName] = useState('مطعم البيك - الشريك');
  const [category, setCategory] = useState('مطاعم');
  const [workHours, setWorkHours] = useState('09:00 ص - 11:30 م');
  
  // Delivery settings
  const [deliveryRadius, setDeliveryRadius] = useState(15);
  const [deliveryFee, setDeliveryFee] = useState(12);

  // States
  const [busyMode, setBusyMode] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal controllers
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', desc: '', price: '', rawPrice: 20 });

  // Marketing creators
  const [flashTitle, setFlashTitle] = useState('');
  const [flashDiscount, setFlashDiscount] = useState(40);
  const [couponCode, setCouponCode] = useState('');
  const [couponVal, setCouponVal] = useState('٢٠٪');
  const [storyContent, setStoryContent] = useState('');
  const [storyImage, setStoryImage] = useState('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80');

  // Load Partner Info
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
        console.error('Using sandbox partner identity fallback.');
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

  const handleToggleBusyMode = async () => {
    try {
      const nextActive = busyMode; // If busy (is_active is false), toggle to true
      const { error } = await supabase
        .from('partners')
        .update({ is_active: nextActive })
        .eq('id', partnerId);
      
      if (!error) {
        setBusyMode(!nextActive);
        alert(nextActive ? 'تم فتح المتجر بنجاح لاستقبال الطلبات! 🟢' : 'تم تفعيل وضع المزدحم (مغلق مؤقتاً). 🔴');
      }
    } catch (err) {
      console.error('Error updating busy mode:', err);
    }
  };

  // Load Products
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
      console.error('Sandbox products fallback active.');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const toggleProductActive = async (prodId: any) => {
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
      console.error('Error toggling product status:', err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return alert('يرجى كتابة الاسم والسعر!');
    
    try {
      const rawPrice = parseInt(newProduct.price.replace(/[^0-9]/g, '')) || 20;
      const newProd = {
        partner_id: partnerId,
        name: newProduct.name,
        desc: newProduct.desc,
        price: newProduct.price.includes('ر.س') ? newProduct.price : `${newProduct.price} ر.س`,
        rawPrice,
        is_active: true,
        image_url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80'
      };
      
      const { error } = await supabase.from('products').insert(newProd);
      if (!error) {
        alert('تم إضافة المنتج بنجاح إلى الكتالوج! 🛍️');
        setShowAddProductModal(false);
        setNewProduct({ name: '', desc: '', price: '', rawPrice: 20 });
        fetchProducts();
      }
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  // Load Orders
  const fetchOrders = async () => {
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('partner_id', partnerId);
      if (!ordersError && ordersData) {
        const { data: itemsData } = await supabase.from('order_items').select('*');
        const combined = ordersData.map((order: any) => ({
          ...order,
          items: itemsData ? itemsData.filter((i: any) => i.order_id === order.id) : []
        }));
        setOrders(combined);
      }
    } catch (err) {
      console.error('Sandbox orders fallback.');
    }
  };

  useEffect(() => {
    fetchOrders();

    const channel = supabase.channel(`realtime:partner_dash_orders:${partnerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `partner_id=eq.${partnerId}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      const targetOrder = orders.find((o: any) => o.id === orderId);
      const customerId = targetOrder?.customer_id;
      
      const { error } = await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);
      if (!error) {
        if (customerId) {
          await supabase.from('notifications').insert({
            user_id: customerId,
            type: 'order',
            title: `تحديث طلبك: ${nextStatus} 📦`,
            description: `قام الشريك ${storeName} بتحديث حالة طلبك رقم #${orderId.substring(0, 8)} إلى: ${nextStatus}`,
            image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80',
            created_at: new Date().toISOString(),
            read: false,
            unread: true
          });
        }
        alert(`تم تحديث حالة الطلب بنجاح إلى: ${nextStatus}`);
        fetchOrders();
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  };

  // Marketing Submits
  const handleCreateFlash = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashTitle) return alert('يرجى كتابة عنوان العرض الفلاش!');
    try {
      const newOffer = {
        title: flashTitle,
        store_name: storeName,
        discount_percent: flashDiscount,
        rating: 4.9,
        is_active: true,
        expires_at: new Date(Date.now() + 3600000 * 6).toISOString(),
        is_sponsored: true,
        sponsored_by: storeName.substring(0, 10),
        image_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'
      };
      const { error } = await supabase.from('sponsored_products').insert(newOffer);
      if (!error) {
        alert('تم إرسال ونشر حملة عرض الفلاش للموافقة عليها فورياً من المدير! ⚡');
        setFlashTitle('');
      }
    } catch (e) {
      console.error('Sandbox insert offer active.');
    }
  };

  const handleUploadStory = () => {
    if (!storyContent) return alert('يرجى كتابة شرح الستوري!');
    const savedStories = localStorage.getItem('boostx_stories');
    const list = savedStories ? JSON.parse(savedStories) : [];
    list.push({
      id: 's-' + Date.now(),
      store: storeName,
      content: storyContent,
      image: storyImage,
      approved: false,
      active: true
    });
    localStorage.setItem('boostx_stories', JSON.stringify(list));
    alert('تم رفع الستوري الترويجي بنجاح وهو بانتظار موافقة الإدارة الآن! 🎬');
    setStoryContent('');
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const sidebarGroups: SidebarGroup[] = [
    {
      id: 'overview',
      title: 'A. نظرة عامة',
      items: [
        { id: 'partner_home', label: 'الرئيسية', icon: Home },
        { id: 'partner_status', label: 'حالة ونشاط المتجر', icon: Power },
        { id: 'partner_kpis', label: 'مؤشرات أداء اليوم', icon: Activity }
      ]
    },
    {
      id: 'store',
      title: 'B. المتجر والفروع',
      items: [
        { id: 'partner_profile', label: 'الملف التجاري والغلاف', icon: Briefcase },
        { id: 'partner_branches', label: 'إدارة الفروع التابعة', icon: MapPin },
        { id: 'partner_hours', label: 'ساعات العمل الرسمية', icon: Clock },
        { id: 'partner_zones', label: 'مناطق وسعر التوصيل', icon: MapPin }
      ]
    },
    {
      id: 'products_services',
      title: 'C. المنتجات والخدمات',
      items: [
        { id: 'partner_catalog', label: 'كتالوج المنتجات والأطباق', icon: Grid },
        { id: 'partner_custom_categories', label: 'التصنيفات الداخلية للمنيو', icon: ClipboardList },
        { id: 'partner_addons', label: 'الإضافات والخيارات الاختيارية', icon: Plus },
        { id: 'partner_inventory', label: 'المخزون والتوفر الجاري', icon: CheckCircle }
      ]
    },
    {
      id: 'marketing',
      title: 'D. التسويق والعروض',
      items: [
        { id: 'partner_flash', label: 'إنشاء عروض فلاش فوري', icon: Zap },
        { id: 'partner_coupons', label: 'كوبونات الخصم الحصرية', icon: Tag },
        { id: 'partner_stories', label: 'رفع الستوريهات والقصص', icon: Play },
        { id: 'partner_sponsored_campaigns', label: 'حملات ترويج ممولة', icon: Percent },
        { id: 'partner_sponsored_products', label: 'المنتجات الممولة', icon: Star }
      ]
    },
    {
      id: 'orders',
      title: 'E. إدارة طلبات التوصيل',
      items: [
        { id: 'partner_orders_new', label: 'طلبات جديدة واردة', icon: ShoppingCart },
        { id: 'partner_orders_preparing', label: 'طلبات قيد التجهيز', icon: Clock },
        { id: 'partner_orders_completed', label: 'طلبات مكتملة ومسلمة', icon: CheckCircle },
        { id: 'partner_orders_cancelled', label: 'طلبات ملغاة وسابقة', icon: XCircle }
      ]
    },
    {
      id: 'customers_comms',
      title: 'F. العملاء والتواصل',
      items: [
        { id: 'partner_chats', label: 'محادثات العملاء والمناديب', icon: MessageSquare },
        { id: 'partner_ratings', label: 'مراجعات وتقييمات العملاء', icon: Star },
        { id: 'partner_complaints', label: 'شكاوى واعتراضات المبيعات', icon: AlertTriangle }
      ]
    },
    {
      id: 'financials',
      title: 'G. الإدارة المالية والأرباح',
      items: [
        { id: 'partner_earnings', label: 'ملخص الأرباح والعمولات', icon: DollarSign },
        { id: 'partner_wallet', label: 'المحفظة وسحب الرصيد', icon: Wallet },
        { id: 'partner_invoices', label: 'الفواتير الضريبية المصدرة', icon: FileText },
        { id: 'partner_payments', label: 'سجل سجل العمليات الدفعات المستلمة', icon: ClipboardList }
      ]
    },
    {
      id: 'support_settings',
      title: 'H. الدعم والإعدادات',
      items: [
        { id: 'partner_support', label: 'الدعم الفني للمتاجر', icon: HelpCircle },
        { id: 'partner_account_settings', label: 'إعدادات حساب الشريك', icon: Settings }
      ]
    }
  ];

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar */}
      {!hideSidebar && (
        <aside style={{ width: '280px', flexShrink: 0, background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }} className="no-scrollbar">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
              🏪
            </div>
            <div>
              <span style={{ fontWeight: 900, fontSize: '1rem', display: 'block', color: 'white' }}>بوابة الشركاء المعتمدين</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{storeName?.substring(0, 16)}...</span>
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

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', background: 'rgba(18,11,31,0.5)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
              {sidebarGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'الرئيسية'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button 
              onClick={handleToggleBusyMode} 
              style={{
                padding: '8px 16px',
                background: busyMode ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                border: '1px solid ' + (busyMode ? '#ef4444' : '#10b981'),
                color: busyMode ? '#ef4444' : '#10b981',
                borderRadius: 8,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {busyMode ? '🔴 وضع الاستقبال: مزدحم مغلق مؤقتاً' : '🟢 وضع الاستقبال: مفتوح ويستقبل'}
            </button>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          {/* TAB VIEW 1: الرئيسية */}
          {activeTab === 'partner_home' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>أرباح مبيعات اليوم الحالي</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>٤٥٦.٠٠ ر.س</h3>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>📈 +٥.٤٪ عن أمس</span>
                </div>
                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>حجم الطلبات الجديدة النشطة</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--color-accent-light)', margin: '4px 0 0 0' }}>
                    {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length} طلب نشط
                  </h3>
                  <span style={{ fontSize: '0.65rem', color: 'white' }}>بانتظار التحضير والتجهيز</span>
                </div>
                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>عدد المنتجات بالكتالوج</span>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>{products.length} منتج</h3>
                  <span style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>🟢 متوفر ومفعل منها {products.filter(p => p.active).length}</span>
                </div>
              </div>

              {/* Order Monitoring Overview */}
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>الطلبات الجديدة النشطة الواردة لحظة بلحظة</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {orders.filter(o => o.status === 'pending' || o.status === 'preparing').map(order => (
                    <div key={order.id} style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>طلب رقم #{order.id?.substring(0, 8)}</strong>
                        <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>العميل: {order.customer_name} • الحالة: {order.status}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {order.status === 'pending' && (
                          <button onClick={() => handleUpdateOrderStatus(order.id, 'preparing')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>قبول وتحضير 👨‍🍳</button>
                        )}
                        {order.status === 'preparing' && (
                          <button onClick={() => handleUpdateOrderStatus(order.id, 'out_for_delivery')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#f59e0b' }}>تجهيز وتسليم 📦</button>
                        )}
                      </div>
                    </div>
                  ))}
                  {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>لا توجد طلبات جارية نشطة بانتظار التحضير حالياً.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB VIEW 2: الملف التعريفي والغلاف */}
          {activeTab === 'partner_profile' && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>تخصيص هوية المتجر والملف التعريفي</h3>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>اسم النشاط التجاري بالمنصة</label>
                <input type="text" className="input-field" value={storeName} onChange={e => setStoreName(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>تصنيف النشاط</label>
                <input type="text" className="input-field" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>أوقات العمل الرسمية</label>
                <input type="text" className="input-field" value={workHours} onChange={e => setWorkHours(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={() => alert('تم تحديث هوية المتجر بنجاح!')} style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.82rem' }}>حفظ التحديثات</button>
            </div>
          )}

          {/* TAB VIEW 3: كتالوج المنتجات */}
          {activeTab === 'partner_catalog' && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>كتالوج المنتجات والأطباق المتاحة</h3>
                <button className="btn btn-primary" onClick={() => setShowAddProductModal(true)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 16px', fontSize: '0.78rem' }}>
                  <Plus size={16} /> إضافة منتج جديد
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {products.map(p => (
                  <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                    <div>
                      <strong style={{ fontSize: '0.92rem' }}>{p.name}</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 2 }}>{p.desc}</span>
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
                        {p.active ? 'نشط متوفر' : 'معطل ❌'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB VIEW 4: العروض والتسويق */}
          {activeTab === 'partner_flash' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <form onSubmit={handleCreateFlash} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>إنشاء عرض فلاش فوري عاجل للعملاء</h3>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>عنوان العرض الفلاش</label>
                  <input type="text" className="input-field" placeholder="مثال: خصم ٤٠٪ على مسحب البيك العائلي" value={flashTitle} onChange={e => setFlashTitle(e.target.value)} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>نسبة الخصم (%)</label>
                  <input type="number" className="input-field" value={flashDiscount} onChange={e => setFlashDiscount(Number(e.target.value))} required />
                </div>
                <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: '0.82rem', fontWeight: 900 }}>نشر عرض الفلاش العاجل ⚡</button>
              </form>

              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>رفع ستوري إعلاني ترويجي مصور للعملاء</h3>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>شرح ومحتوى الستوري</label>
                  <input type="text" className="input-field" placeholder="مثال: وجبة جديدة متوفرة الآن! 😍" value={storyContent} onChange={e => setStoryContent(e.target.value)} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رابط صورة الستوري</label>
                  <input type="text" className="input-field" value={storyImage} onChange={e => setStoryImage(e.target.value)} />
                </div>
                <button type="button" className="btn btn-primary" onClick={handleUploadStory} style={{ padding: 12, fontSize: '0.82rem', fontWeight: 900 }}>تحميل ونشر الستوري لتدقيق المدير 🎬</button>
              </div>
            </div>
          )}

          {/* TAB VIEW 5: أرباح الشريك */}
          {activeTab === 'partner_earnings' && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>ملخص الأرباح والعمولات المالية المحققة</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 20 }}>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>صافي الأرباح القابلة للسحب</span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '4px 0 0 0' }}>٣,٤٢٠.٠٠ ر.س</h2>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>عمولات المنصة المستقطعة</span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>١٢٠.٠٠ ر.س</h2>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>إجمالي مبيعات الشهر</span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>١٢,٤٠٠.٠٠ ر.س</h2>
                </div>
              </div>
            </div>
          )}

          {/* FALLBACK VIEW FOR STATIC PAGES */}
          {!['partner_home', 'partner_profile', 'partner_catalog', 'partner_flash', 'partner_earnings'].includes(activeTab) && (
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, textAlign: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8 }}>صفحة الشريك قيد التجهيز الفني ⚙️</h3>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>أنت تنظر حالياً إلى هيكل التبويبات الفاخر. سيتم تزويدها ببيانات إضافية تدريجياً.</p>
            </div>
          )}

        </main>
      </div>

      {/* CREATE MODAL: ADD PRODUCT */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleAddProduct} style={{ background: '#1c0f33', border: '1px solid rgba(168,85,247,0.4)', padding: 24, borderRadius: 20, width: '400px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'white' }}>إضافة منتج جديد للكتالوج</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>اسم المنتج / الطبق</label>
              <input type="text" className="input-field" placeholder="مثال: برجر دجاج مقرمش" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>شرح ومكونات المنتج</label>
              <input type="text" className="input-field" placeholder="مثال: صدر دجاج مقرمش، خس، صوص خاص..." value={newProduct.desc} onChange={e => setNewProduct({ ...newProduct, desc: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>سعر المنتج (بالريال السعودي)</label>
              <input type="text" className="input-field" placeholder="مثال: ٢٥ ر.س" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>إضافة الكتالوج</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, color: 'white' }} onClick={() => setShowAddProductModal(false)}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
export default PartnerDashboard;

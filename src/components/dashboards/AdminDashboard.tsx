import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, FileText, CheckCircle, XCircle, Grid, Clock, Users, ArrowRight, Star
} from 'lucide-react';
import { supabase } from '../../supabaseClient';

export const AdminDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeNav, setActiveNav] = useState(defaultTab || 'dashboard');
  const [partnerApps, setPartnerApps] = useState<any[]>([]);
  const [driverApps, setDriverApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch pending partner/driver applications
  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data: partners } = await supabase.from('partner_applications').select('*').order('created_at', { ascending: false });
      const { data: drivers } = await supabase.from('driver_applications').select('*').order('created_at', { ascending: false });
      if (partners) setPartnerApps(partners);
      if (drivers) setDriverApps(drivers);
    } catch (e) {
      console.log('Sandbox simulation mode active.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const handleRealtime = (e: any) => {
      if (e.detail?.table === 'partner_applications' || e.detail?.table === 'driver_applications') {
        fetchApplications();
      }
    };
    window.addEventListener('BX_REALTIME_CHANGE', handleRealtime);
    return () => window.removeEventListener('BX_REALTIME_CHANGE', handleRealtime);
  }, []);

  const handleApprovePartner = async (appId: string) => {
    try {
      const { error } = await supabase.from('partner_applications').update({ status: 'verified' }).eq('id', appId);
      if (error) throw error;
      alert('تم توثيق واعتماد الشريك بنجاح! ✅');
      fetchApplications();
    } catch (e: any) {
      alert('فشل تحديث الحالة: ' + e.message);
    }
  };

  const handleRejectPartner = async (appId: string) => {
    try {
      const { error } = await supabase.from('partner_applications').update({ status: 'rejected' }).eq('id', appId);
      if (error) throw error;
      alert('تم رفض طلب انضمام الشريك ❌');
      fetchApplications();
    } catch (e: any) {
      alert('حدث خطأ: ' + e.message);
    }
  };

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar Navigation */}
      {!hideSidebar && (
        <aside style={{ width: '260px', background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 20, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: '1.15rem' }}>بوابة الإشراف</span>
          </div>

          {[
            { id: 'dashboard', label: 'لوحة القيادة 📊' },
            { id: 'verification', label: 'توثيق الشركاء والمناديب 🏷️' },
            { id: 'flash_offers', label: 'العروض الممولة والفلاش ⚡' },
            { id: 'catalogs', label: 'إدارة المنتجات والتصنيفات 🛍️' },
            { id: 'reports', label: 'الشكاوى والتقارير المرفوعة 📑' },
            { id: 'settings', label: 'إعدادات المنصة العامة ⚙️' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 12,
                border: 'none',
                background: activeNav === item.id ? 'var(--color-accent)' : 'transparent',
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

      {/* Main Workspace Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>لوحة الإشراف والمراقبة (Admin Dashboard)</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>مراجعة وتوثيق الشركاء، فحص المستندات الرسمية، وتتبع مؤشرات الصحة التشغيلية</p>
          </div>
        </header>

        {/* Dashboard Home View */}
        {activeNav === 'dashboard' && (
          <div>
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 30 }}>
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 16 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>طلبات انضمام معلقة</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 0 0', color: 'var(--color-accent-light)' }}>{partnerApps.filter(p => p.status === 'pending_verification' || p.status === 'pending').length} طلب شريك</h2>
              </div>
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 16 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>سائقين بانتظار التوثيق</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 0 0', color: 'var(--color-success)' }}>{driverApps.filter(d => d.status === 'pending').length} مناديب</h2>
              </div>
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 16 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>معدل النجاح التشغيلي</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, margin: '6px 0 0 0', color: '#10b981' }}>٩٩.٨٢٪</h2>
              </div>
            </div>

            {/* Applications List Mini Overview */}
            <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 16 }}>طلبات التوثيق الأخيرة الواردة</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {partnerApps.slice(0, 3).map(app => (
                  <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                    <div>
                      <strong style={{ display: 'block', fontSize: '0.94rem' }}>{app.business_name}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{app.commercial_name} • {app.city} • {app.biz_type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleApprovePartner(app.id)}>توثيق واعتماد</button>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }} onClick={() => handleRejectPartner(app.id)}>رفض الطلب</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Verification View */}
        {activeNav === 'verification' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: 20 }}>مراجعة وتوثيق الشركاء ومستندات الانضمام</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {partnerApps.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)' }}>لا توجد طلبات انضمام حالياً بانتظار المراجعة.</div>
              ) : (
                partnerApps.map(app => (
                  <div key={app.id} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'white', margin: 0 }}>{app.business_name}</h4>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>{app.commercial_name} • {app.phone_number} • {app.city} - {app.district}</p>
                      </div>
                      <span style={{ fontSize: '0.75rem', background: app.status === 'verified' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)', color: app.status === 'verified' ? 'var(--color-success)' : '#f59e0b', padding: '4px 12px', borderRadius: 'var(--radius-pill)', fontWeight: 800 }}>
                        {app.status === 'verified' ? 'موثق ومعتمد ✅' : 'قيد الانتظار'}
                      </span>
                    </div>

                    {/* Documents attachment links */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, margin: '14px 0' }}>
                      <a href={app.cr_document_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', color: 'white', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>📄 السجل التجاري</a>
                      <a href={app.owner_id_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', color: 'white', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>📄 هوية المالك</a>
                      <a href={app.vat_certificate_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.78rem', background: 'rgba(255,255,255,0.04)', color: 'white', padding: '6px 12px', borderRadius: 8, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.08)' }}>📄 رخصة البلدية</a>
                    </div>

                    {app.status !== 'verified' && (
                      <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                        <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.8rem' }} onClick={() => handleApprovePartner(app.id)}>الموافقة والتوثيق</button>
                        <button className="btn btn-secondary" style={{ padding: '8px 20px', fontSize: '0.8rem', color: '#ef4444' }} onClick={() => handleRejectPartner(app.id)}>رفض وانقاص المستندات</button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Flash Offers View */}
        {activeNav === 'flash_offers' && (
          <FlashOffersManager />
        )}

        {/* Catalogs View */}
        {activeNav === 'catalogs' && (
          <CatalogsManager />
        )}
      </main>
    </div>
  );
};

// --- Premium Categories & Catalogs Manager Component ---
const CatalogsManager = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('categories')
        .select('*');
      if (!error && data) {
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();

    const channel = supabase.channel('realtime:admin_categories')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        fetchCategories();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleToggleCategory = async (id: string, currentActive: boolean) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update({ is_active: !currentActive })
        .eq('id', id);
      if (!error) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentActive } : c));
        // Emit dynamic event for same-tab triggers
        window.dispatchEvent(new CustomEvent('BX_REALTIME_CHANGE', { detail: { table: 'categories' } }));
      }
    } catch (err) {
      console.error('Error toggling category:', err);
    }
  };

  return (
    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, textAlign: 'right' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8, color: 'white' }}>إدارة الفئات والتصنيفات 🛍️</h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 24 }}>تفعيل أو تعطيل الفئات الرئيسية المعروضة على واجهة العميل الرئيسية ومراقبة حالة المتاجر التابعة.</p>

      {loading && <div style={{ color: 'white', marginBottom: 12 }}>جاري تحميل البيانات...</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, direction: 'rtl' }}>
        {categories.map(cat => (
          <div 
            key={cat.id} 
            style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              padding: 16, 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid ' + (cat.is_active ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.05)'), 
              borderRadius: 16,
              boxShadow: cat.is_active ? '0 4px 15px rgba(168,85,247,0.05)' : 'none'
            }}
          >
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg || 'rgba(255,255,255,0.05)', color: cat.color || 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                {cat.id === 'food' ? '🍗' : cat.id === 'pharmacy' ? '💊' : cat.id === 'supermarket' ? '🛒' : cat.id === 'agency' ? '📢' : cat.id === 'print' ? '🖨️' : cat.id === 'flowers' ? '🎁' : cat.id === 'craftsman' ? '🛠️' : '🏠'}
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'white' }}>{cat.name}</strong>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>المسار: customer-home</span>
              </div>
            </div>
            
            <button 
              onClick={() => handleToggleCategory(cat.id, cat.is_active)}
              style={{
                background: cat.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                border: 'none',
                color: cat.is_active ? 'var(--color-success)' : '#ef4444',
                padding: '6px 12px',
                borderRadius: 8,
                fontSize: '0.75rem',
                fontWeight: 900,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {cat.is_active ? 'نشطة ومتوفرة 🟢' : 'معطلة ومخفية 🔴'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Premium Sponsored & Flash Offers Campaign Manager Dashboard Component ---
// --- Premium Sponsored & Flash Offers Campaign Manager Dashboard Component ---
const FlashOffersManager = () => {
  const [offers, setOffers] = useState<any[]>([]);

  const [title, setTitle] = useState('');
  const [partner, setPartner] = useState('مطعم البيك الرواد');
  const [discount, setDiscount] = useState(40);
  const [duration, setDuration] = useState(6);
  const [priority, setPriority] = useState(1);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80');

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('sponsored_products')
        .select('*');
      if (!error && data) {
        // Map table fields to local representation
        const mapped = data.map((o: any) => ({
          id: o.id,
          title: o.title,
          partner: o.store_name || o.sponsored_by,
          discount: o.discount_percent || 40,
          duration: 6,
          priority: 1,
          is_active: o.is_active
        }));
        setOffers(mapped);
      }
    } catch (err) {
      console.error('Error fetching sponsored products:', err);
    }
  };

  useEffect(() => {
    fetchOffers();

    const channel = supabase.channel('realtime:admin_sponsored_products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sponsored_products' }, () => {
        fetchOffers();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('الرجاء كتابة عنوان العرض الفلاش!');
    
    try {
      const storeLogo = partner.includes('النهدي') ? '💊' : (partner.includes('التميمي') ? '🍏' : '🍔');
      const storeName = partner;
      const oldPrice = 50.00;
      const newPrice = Number((50.00 * (1 - discount / 100)).toFixed(2));
      
      const newOffer = {
        id: 'sp-' + Date.now().toString().substring(8),
        title,
        store_name: storeName,
        store_logo: storeLogo,
        image_url: imageUrl,
        old_price: oldPrice,
        new_price: newPrice,
        discount_percent: discount,
        rating: 4.9,
        is_active: true,
        expires_at: new Date(Date.now() + 3600000 * duration).toISOString(),
        is_sponsored: true,
        sponsored_by: storeName.substring(0, 10),
        description: title + ' - عرض ممول فلاش مميز للغاية لفترة محدودة.',
        delivery_time: '١٥-٢٠ دقيقة',
        images: [imageUrl]
      };

      const { error } = await supabase.from('sponsored_products').insert(newOffer);
      if (!error) {
        setTitle('');
        alert('تم إنشاء ونشر حملة العرض الممول الفلاش بنجاح! ⚡');
        fetchOffers();
      } else {
        throw error;
      }
    } catch (err: any) {
      alert('حدث خطأ أثناء الإنشاء: ' + err.message);
    }
  };

  const handleToggleOffer = async (id: string) => {
    const offer = offers.find(o => o.id === id);
    if (!offer) return;
    try {
      const nextActive = !offer.is_active;
      const { error } = await supabase
        .from('sponsored_products')
        .update({ is_active: nextActive })
        .eq('id', id);
      if (!error) {
        setOffers(prev => prev.map(o => o.id === id ? { ...o, is_active: nextActive } : o));
      }
    } catch (err) {
      console.error('Error toggling offer:', err);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('sponsored_products')
        .delete()
        .eq('id', id);
      if (!error) {
        setOffers(prev => prev.filter(o => o.id !== id));
        alert('تم حذف حملة العرض الممول بنجاح.');
      }
    } catch (err) {
      console.error('Error deleting offer:', err);
    }
  };

  return (
    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, textAlign: 'right' }}>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: 8, color: 'white' }}>إدارة حملات العروض الممولة والفلاش ⚡</h3>
      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginBottom: 24 }}>قم بجدولة ونشر عروض الفلاش اليومية المحددة بالوقت والتحكم في إضافاتها ومتغيراتها الفورية</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, direction: 'rtl' }}>
        {/* Form Creator */}
        <form onSubmit={handleCreateOffer} style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: 18, borderRadius: 16 }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>إنشاء حملة عروض فلاش ممولة جديدة</h4>
          
          <div>
            <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>عنوان العرض الفوري</label>
            <input 
              type="text" 
              placeholder="مثال: خصم ٤٠٪ على وجبة مسحب البيك"
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: 'white', outline: 'none', fontSize: '0.85rem', fontFamily: 'Cairo, sans-serif' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>المتجر الشريك</label>
              <select 
                value={partner}
                onChange={e => setPartner(e.target.value)}
                style={{ width: '100%', background: '#1a112d', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: 'white', outline: 'none', fontSize: '0.82rem', fontFamily: 'Cairo, sans-serif' }}
              >
                <option value="مطعم البيك الرواد">مطعم البيك الرواد</option>
                <option value="صيدلية النهدي الياسمين">صيدلية النهدي الياسمين</option>
                <option value="أسواق التميمي الملقا">أسواق التميمي الملقا</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>رابط صورة المنتج الترويجي</label>
              <input 
                type="text" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: 'white', outline: 'none', fontSize: '0.82rem', fontFamily: 'Cairo, sans-serif' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>نسبة الخصم (%)</label>
              <input 
                type="number" 
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: 'white', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>المدة بالساعات</label>
              <input 
                type="number" 
                value={duration}
                onChange={e => setDuration(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: 'white', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 6 }}>أولوية العرض</label>
              <input 
                type="number" 
                value={priority}
                onChange={e => setPriority(Number(e.target.value))}
                style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 10, color: 'white', outline: 'none', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', borderRadius: 10, fontWeight: 900, marginTop: 10 }}>
            نشر وجدولة العرض الفوري 🚀
          </button>
        </form>

        {/* Active Campaigns List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h4 style={{ fontSize: '0.94rem', fontWeight: 800, margin: 0 }}>الحملات النشطة الحالية ({offers.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '380px', overflowY: 'auto' }} className="no-scrollbar">
            {offers.map(o => (
              <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.86rem', color: 'white' }}>{o.title}</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{o.partner} • خصم {o.discount}% • الأولوية: {o.priority}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button 
                    onClick={() => handleToggleOffer(o.id)}
                    style={{
                      background: o.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      color: o.is_active ? 'var(--color-success)' : '#9ca3af',
                      padding: '4px 8px',
                      borderRadius: 8,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    {o.is_active ? 'نشط 🟢' : 'معطل 🔴'}
                  </button>
                  <button 
                    onClick={() => handleDeleteOffer(o.id)}
                    style={{
                      background: 'rgba(239,68,68,0.1)',
                      border: 'none',
                      color: '#ef4444',
                      padding: '4px 8px',
                      borderRadius: 8,
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

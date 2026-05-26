import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, FileText, CheckCircle, XCircle, Grid, Clock, Users, ArrowRight, Star, 
  Sparkles, Save, Database, Trash2, Plus, Eye, Laptop, Smartphone
} from 'lucide-react';
import { 
  appExperienceService, 
  onboardingService, 
  splashService,
  DEFAULT_SPLASH,
  DEFAULT_ONBOARDING_SCREENS,
  DEFAULT_LOGIN
} from 'boostx-shared';
import type {
  SplashSettings,
  OnboardingScreen,
  LoginSettings
} from 'boostx-shared';

export const AppExperienceManager = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'splash' | 'onboarding' | 'login' | 'preview'>('splash');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Experience States
  const [splash, setSplash] = useState<SplashSettings>(DEFAULT_SPLASH);
  const [onboarding, setOnboarding] = useState<OnboardingScreen[]>(DEFAULT_ONBOARDING_SCREENS);
  const [login, setLogin] = useState<LoginSettings>(DEFAULT_LOGIN);

  const adminUserId = 'usr_admin_1'; // Simulated authenticated admin user

  // Load configs on startup
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true);
      try {
        const s = await splashService.getSettings();
        setSplash(s);

        const o = await onboardingService.getActiveScreens();
        setOnboarding(o);

        const l = await appExperienceService.getLoginSettings();
        setLogin(l);
      } catch (e) {
        console.error('Failed fetching app configurations:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfigs();
  }, []);

  const handleSaveSplash = async () => {
    setLoading(true);
    try {
      await splashService.updateSettings(splash, adminUserId);
      triggerSuccess('تمت الحفظ والمزامنة الفورية لإعدادات شاشة البدء (Splash Screen)! 🚀');
    } catch (e: any) {
      alert('فشل حفظ الإعدادات: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveOnboarding = async (screen: OnboardingScreen) => {
    setLoading(true);
    try {
      await onboardingService.updateScreen(screen, adminUserId);
      triggerSuccess('تم حفظ شاشة التعريف المحددة ومزامنتها بنجاح! 📱');
    } catch (e: any) {
      alert('فشل الحفظ: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLogin = async () => {
    setLoading(true);
    try {
      await appExperienceService.updateLoginSettings(login, adminUserId);
      triggerSuccess('تم حفظ إعدادات شاشة تسجيل الدخول الموحدة بنجاح! 🔒');
    } catch (e: any) {
      alert('فشل الحفظ: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar Navigation */}
      <aside style={{ width: '280px', background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 20, marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={20} color="white" />
          </div>
          <span style={{ fontWeight: 900, fontSize: '1.05rem' }}>تجربة التطبيق (App UX)</span>
        </div>

        {[
          { id: 'splash', label: 'شاشة البدء السينمائية (Splash) ⚡' },
          { id: 'onboarding', label: 'شاشات التعريف الثلاثة Onboarding 📱' },
          { id: 'login', label: 'إعدادات تسجيل الدخول والـ OTP 🔒' },
          { id: 'preview', label: 'المعاينة الحية والتدقيق 👁️' }
        ].map(item => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 12,
              border: 'none',
              background: activeTab === item.id ? 'var(--color-accent)' : 'transparent',
              color: 'white',
              textAlign: 'right',
              fontWeight: 800,
              fontSize: '0.82rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {item.label}
          </button>
        ))}

        <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', color: 'white' }} onClick={onBack}>
          <ArrowRight size={16} style={{ marginLeft: 8 }} /> العودة للإدارة
        </button>
      </aside>

      {/* Main Workspace Area */}
      <main style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>إدارة تجربة المستخدم وتفاعلات التطبيق (App Experience Control)</h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem', margin: '4px 0 0 0' }}>تحكم بنصوص شاشات التعريف، شعار البداية، نوع الحركات الكهربية، وأشكال تسجيل الدخول بشكل مباشر وحي.</p>
          </div>
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--color-success)', padding: '6px 16px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 800 }}>
            اتصال خلفي آمن بقاعدة البيانات ⚡
          </div>
        </header>

        {/* Success Alert */}
        <AnimatePresence>
          {successMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} style={{ background: 'var(--color-success)', color: 'white', padding: '12px 20px', borderRadius: 12, marginBottom: 24, fontWeight: 'bold', display: 'flex', gap: 10, alignItems: 'center' }}>
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Spinner overlay */}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--color-accent-light)', marginBottom: 16 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>جاري الحفظ والمزامنة المباشرة لقاعدة بيانات Supabase...</span>
          </div>
        )}

        {/* Tab 1: Splash settings */}
        {activeTab === 'splash' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>إعدادات شاشة البدء الافتتاحية (Splash Screen)</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>رابط شعار البدء (Logo URL)</label>
                <input type="text" className="input-field" placeholder="فارغ للشعار الافتراضي المضيء" value={splash.logo_url} onChange={e => setSplash({ ...splash, logo_url: e.target.value })} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>الحركة السينمائية للشعار (Animation Type)</label>
                <select value={splash.animation_type} onChange={e => setSplash({ ...splash, animation_type: e.target.value })} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', outline: 'none', width: '100%' }}>
                  <option value="electric">كهربائي مضيء (Electric sparks) ⚡</option>
                  <option value="pulse">نبض ثلاثي الأبعاد (3D pulse) 🔮</option>
                  <option value="fade">تلاشي ناعم (Smooth Fade) ✨</option>
                  <option value="none">بدون حركات (Static)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>مدة العرض بالملي ثانية (Duration ms)</label>
                <input type="number" className="input-field" value={splash.duration_ms} onChange={e => setSplash({ ...splash, duration_ms: Number(e.target.value) })} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>إضاءة التوهج الأخضر العائم (Glow Orb)</label>
                <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                  <button onClick={() => setSplash({ ...splash, show_green_glow: true })} className={`btn ${splash.show_green_glow ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 16px', fontSize: '0.78rem' }}>تفعيل</button>
                  <button onClick={() => setSplash({ ...splash, show_green_glow: false })} className={`btn ${!splash.show_green_glow ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 16px', fontSize: '0.78rem' }}>تعطيل</button>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSaveSplash} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 24px', fontSize: '0.85rem', fontWeight: 900, alignSelf: 'flex-start', marginTop: 10 }}>
              <Save size={16} /> حفظ ومزامنة شاشة البدء
            </button>
          </div>
        )}

        {/* Tab 2: Onboarding screen settings */}
        {activeTab === 'onboarding' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>تخصيص شاشات التعريف الثلاثة (App Onboarding)</h3>
            
            {onboarding.map((screen, idx) => (
              <div key={screen.id || idx} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 900, color: 'var(--color-accent-light)' }}>الشاشة رقم {screen.display_order} 📱</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => {
                      const updated = [...onboarding];
                      updated[idx].is_active = !screen.is_active;
                      setOnboarding(updated);
                    }} className={`btn ${screen.is_active ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '4px 12px', fontSize: '0.72rem' }}>
                      {screen.is_active ? 'نشطة ومتوفرة' : 'معطلة'}
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>العنوان الرئيسي باللغة العربية (RTL)</label>
                    <input type="text" className="input-field" value={screen.title_ar} onChange={e => {
                      const updated = [...onboarding];
                      updated[idx].title_ar = e.target.value;
                      setOnboarding(updated);
                    }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>الوصف التعريفي باللغة العربية</label>
                    <textarea className="textarea-field" style={{ minHeight: 60 }} value={screen.subtitle_ar} onChange={e => {
                      const updated = [...onboarding];
                      updated[idx].subtitle_ar = e.target.value;
                      setOnboarding(updated);
                    }} />
                  </div>
                </div>

                <button className="btn btn-primary" onClick={() => handleSaveOnboarding(screen)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '10px 20px', fontSize: '0.78rem', fontWeight: 900, alignSelf: 'flex-start' }}>
                  <Save size={14} /> حفظ الشاشة {screen.display_order}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Login screen settings */}
        {activeTab === 'login' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>إعدادات شاشة تسجيل الدخول والـ OTP</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>عنوان الترحيب الرئيسي</label>
                <input type="text" className="input-field" value={login.welcome_title_ar} onChange={e => setLogin({ ...login, welcome_title_ar: e.target.value })} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>نص الوصف الترحيبي والتحقق</label>
                <textarea className="textarea-field" style={{ minHeight: 70 }} value={login.welcome_desc_ar} onChange={e => setLogin({ ...login, welcome_desc_ar: e.target.value })} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>خيار تسجيل الدخول السريع بجوجل (Google SSO)</label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <button onClick={() => setLogin({ ...login, show_google_login: true })} className={`btn ${login.show_google_login ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 16px', fontSize: '0.78rem' }}>إظهار</button>
                    <button onClick={() => setLogin({ ...login, show_google_login: false })} className={`btn ${!login.show_google_login ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 16px', fontSize: '0.78rem' }}>إخفاء</button>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>إضاءة التوهج الخلفي (Glow Background)</label>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    <button onClick={() => setLogin({ ...login, show_green_glow: true })} className={`btn ${login.show_green_glow ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 16px', fontSize: '0.78rem' }}>تفعيل</button>
                    <button onClick={() => setLogin({ ...login, show_green_glow: false })} className={`btn ${!login.show_green_glow ? 'btn-primary' : 'btn-secondary'}`} style={{ padding: '6px 16px', fontSize: '0.78rem' }}>تعطيل</button>
                  </div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={handleSaveLogin} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 24px', fontSize: '0.85rem', fontWeight: 900, alignSelf: 'flex-start', marginTop: 10 }}>
              <Save size={16} /> حفظ ومزامنة شاشة تسجيل الدخول
            </button>
          </div>
        )}

        {/* Tab 4: Live preview */}
        {activeTab === 'preview' && (
          <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>المعاينة الحية المتزامنة على محاكي الجوال</h3>
            <p style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>تظهر هنا معاينة تجريبية لشاشات الجوال بمجرد حفظها لمطابقتها فورياً.</p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 10 }}>
              {/* Phone Mockup 1: Splash */}
              <div style={{ width: 200, height: 350, border: '6px solid rgba(255,255,255,0.1)', borderRadius: 24, background: '#120b1f', position: 'relative', overflow: 'hidden', padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <span style={{ fontSize: '0.62rem', background: 'rgba(168,85,247,0.15)', color: 'var(--color-accent-light)', padding: '2px 8px', borderRadius: 4, position: 'absolute', top: 12 }}>معاينة Splash</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', margin: '0 0 4px 0' }}>BoostX</h4>
                <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)', margin: 0 }}>السوق السعودي الشامل</p>
              </div>

              {/* Phone Mockup 2: Onboarding */}
              <div style={{ width: 200, height: 350, border: '6px solid rgba(255,255,255,0.1)', borderRadius: 24, background: '#090412', position: 'relative', overflow: 'hidden', padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'center' }}>
                <span style={{ fontSize: '0.62rem', background: 'rgba(168,85,247,0.15)', color: 'var(--color-accent-light)', padding: '2px 8px', borderRadius: 4, position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)' }}>معاينة Onboarding</span>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2rem' }}>📱</span>
                </div>
                <h5 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'white', margin: '0 0 6px 0', lineHeight: 1.3 }}>{onboarding[0]?.title_ar || 'الشاشة الأولى'}</h5>
                <p style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', margin: '0 0 16px 0', lineHeight: 1.4 }}>{onboarding[0]?.subtitle_ar?.substring(0, 50)}...</p>
                <div style={{ width: '100%', padding: 8, background: 'var(--color-accent)', borderRadius: 10, fontSize: '0.7rem', fontWeight: 'bold' }}>التالي</div>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
export default AppExperienceManager;

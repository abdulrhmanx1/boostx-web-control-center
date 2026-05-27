import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, FileText, CheckCircle, XCircle, Grid, Clock, Users, ArrowRight, Star,
  Home, Bell, Activity, Smartphone, Image as ImageIcon, Layout, ListCollapse, Play, Sparkles,
  Zap, Ticket, Send, Award, UsersRound, UserPlus, PackageOpen, Tag, Percent,
  ShoppingCart, Truck, MapPin, AlertTriangle, UserCheck, Heart, Wallet, MessageSquare,
  BarChart, ChevronDown, ChevronUp, Settings, Map, Lock, ClipboardList, Plus, Search,
  Filter, Trash2, Edit3, Eye, Power, Check, X, RefreshCw
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

export const AdminDashboard = ({ onBack, defaultTab, hideSidebar = false }: { onBack?: () => void, defaultTab?: string, hideSidebar?: boolean }) => {
  const [activeNav, setActiveNav] = useState(defaultTab || 'admin_home');
  
  // Real-time Support Tickets and Complaints States
  const [supportTickets, setSupportTickets] = useState<any[]>(() => {
    const saved = localStorage.getItem('BX_SANDBOX_SUPPORT_TICKETS');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'TKT-991', customer_name: 'مطعم البيك - الشريك', category: 'حساب وماليات', issue_type: 'حساب وماليات', description: 'يوجد فروقات بقيمة العمولات المستقطعة من طلبين بتاريخ ٢٤ مايو', priority: 'high', status: 'open', created_at: new Date().toISOString() },
      { id: 'TKT-202', customer_name: 'سليمان المطيري', category: 'تأخير التوصيل', issue_type: 'تأخير التوصيل', description: 'الطلب متأخر لأكثر من ٤٠ دقيقة والوجبة باردة بالكامل ولم تصلني بعد.', status: 'open', priority: 'high', created_at: new Date(Date.now() - 3600000).toISOString() }
    ];
  });
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [ticketMessages, setTicketMessages] = useState<Record<string, any[]>>(() => {
    return {
      'TKT-991': [
        { id: 'msg-1', sender_role: 'system', sender_name: 'النظام', message_text: 'تم فتح تذكرة دعم فني جديدة رقم #TKT-991 بنجاح. جاري المراجعة والدعم من الإدارة المالية.', created_at: new Date().toISOString() }
      ]
    };
  });

  const handleSendAdminReply = (ticketId: string) => {
    if (!adminReplyText.trim()) return;
    const newMsg = {
      id: 'msg-admin-' + Date.now(),
      sender_role: 'admin',
      sender_name: 'مراقب المنصة (الدعم الفني)',
      message_text: adminReplyText,
      created_at: new Date().toISOString()
    };
    
    // Save to local state
    setTicketMessages(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newMsg]
    }));
    
    // Save to localStorage so that the Partner Portal syncs instantly in the sandbox
    const currentMsgs = JSON.parse(localStorage.getItem(`bx_ticket_msgs_${ticketId}`) || '[]');
    currentMsgs.push(newMsg);
    localStorage.setItem(`bx_ticket_msgs_${ticketId}`, JSON.stringify(currentMsgs));
    
    setAdminReplyText('');
    alert('✓ تم إرسال رد الدعم المعتمد للطرف الآخر بنجاح!');
  };

  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    overview: false,
    app_management: false,
    partners_management: false,
    orders_operation: false,
    customers: false,
    reports: false,
    settings: false
  });

  // DB States
  const [partnerApps, setPartnerApps] = useState<any[]>([]);
  const [driverApps, setDriverApps] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [sponsoredProducts, setSponsoredProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Onboarding & Activity Types States
  const [activityTypes, setActivityTypes] = useState<any[]>(() => {
    const saved = localStorage.getItem('BX_SANDBOX_ACTIVITY_TYPES');
    return saved ? JSON.parse(saved) : [
      { id: '1', name_ar: 'مطعم أو مقهى', name_en: 'Restaurant / Cafe', icon: 'Utensils', description: 'المطاعم والكافيهات ومحلات الوجبات السريعة', is_registration_open: true, is_active: true, sort_order: 1 },
      { id: '2', name_ar: 'صيدلية أو مستحضرات طبية', name_en: 'Pharmacy', icon: 'Pills', description: 'الصيدليات والمستلزمات الطبية والجمالية', is_registration_open: true, is_active: true, sort_order: 2 },
      { id: '3', name_ar: 'تموينات أو سوبر ماركت', name_en: 'Grocery / Supermarket', icon: 'ShoppingBag', description: 'البقالات والتموينات الغذائية والسلع الإستهلاكية', is_registration_open: true, is_active: true, sort_order: 3 },
      { id: '4', name_ar: 'مطبوعات ودعاية وإعلان', name_en: 'Advertising / Printing', icon: 'Printer', description: 'المطابع وتصميم اللوحات والهدايا الدعائية', is_registration_open: true, is_active: true, sort_order: 4 }
    ];
  });
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [selectedAppDocs, setSelectedAppDocs] = useState<any[]>([]);
  const [selectedAppPayment, setSelectedAppPayment] = useState<any>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [initialUsername, setInitialUsername] = useState('');
  const [initialPasswordTemp, setInitialPasswordTemp] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [appFilterStatus, setAppFilterStatus] = useState('all');

  // Activity Type Editing States
  const [editingActivity, setEditingActivity] = useState<any>(null);
  const [activityForm, setActivityForm] = useState({ name_ar: '', name_en: '', icon: 'Utensils', description: '', sort_order: 1 });
  const [showActivityModal, setShowActivityModal] = useState(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Custom Local Storage States (Simulated database tables for app elements)
  const [banners, setBanners] = useState<any[]>(() => {
    const saved = localStorage.getItem('boostx_banners');
    return saved ? JSON.parse(saved) : [
      { id: 'b1', title: 'خصومات الصيف الكبرى ☀️', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&q=80', active: true, route: '/promos' },
      { id: 'b2', title: 'توصيل مجاني هذا الأسبوع 🛵', image: 'https://images.unsplash.com/photo-1526367790999-0150786486a9?w=800&q=80', active: true, route: '/free-delivery' }
    ];
  });

  const [sections, setSections] = useState<any[]>(() => {
    const saved = localStorage.getItem('boostx_sections');
    return saved ? JSON.parse(saved) : [
      { id: 'sec1', name: 'أبرز عروض اليوم 🔥', order: 1, active: true },
      { id: 'sec2', name: 'المتاجر الأكثر شعبية ⭐', order: 2, active: true },
      { id: 'sec3', name: 'صنايعية وخدمات منزلية 🛠️', order: 3, active: true }
    ];
  });

  const [stories, setStories] = useState<any[]>(() => {
    const saved = localStorage.getItem('boostx_stories');
    return saved ? JSON.parse(saved) : [
      { id: 's1', store: 'مطعم البيك', content: 'افتتاح فرع الياسمين الجديد! 🎉', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80', approved: true, active: true },
      { id: 's2', store: 'صيدلية النهدي', content: 'خصم ٢٠٪ على الفيتامينات 💊', image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80', approved: false, active: true }
    ];
  });

  const [coupons, setCoupons] = useState<any[]>(() => {
    const saved = localStorage.getItem('boostx_coupons');
    return saved ? JSON.parse(saved) : [
      { code: 'BOOSTX20', discount: '٢٠٪', minSpend: '١٠٠ ر.س', active: true },
      { code: 'FREEBY', discount: 'توصيل مجاني', minSpend: '٥٠ ر.س', active: false }
    ];
  });

  const [rewards, setRewards] = useState<any[]>(() => {
    const saved = localStorage.getItem('boostx_rewards');
    return saved ? JSON.parse(saved) : [
      { id: 'r1', title: 'كوب شاي مجاني ☕', cost: 100, active: true },
      { id: 'r2', title: 'خصم ١٥ ر.س للتوصيل', cost: 300, active: true }
    ];
  });

  const [pushLogs, setPushLogs] = useState<any[]>(() => {
    const saved = localStorage.getItem('boostx_push_logs');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'عرض فلاش فوري! ⚡', body: 'تخفيضات ٥٠٪ على الوجبات السريعة تبدأ الآن.', sentAt: new Date(Date.now() - 3600000).toLocaleString('ar-EG') }
    ];
  });

  // Modal Control States
  const [showAddBannerModal, setShowAddBannerModal] = useState(false);
  const [newBanner, setNewBanner] = useState({ title: '', image: '', route: '' });

  const [showAddCouponModal, setShowAddCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', minSpend: '' });

  const [showAddRewardModal, setShowAddRewardModal] = useState(false);
  const [newReward, setNewReward] = useState({ title: '', cost: 100 });

  const [pushTitle, setPushTitle] = useState('');
  const [pushBody, setPushBody] = useState('');

  // Persist Local States
  useEffect(() => {
    localStorage.setItem('boostx_banners', JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem('boostx_sections', JSON.stringify(sections));
  }, [sections]);

  useEffect(() => {
    localStorage.setItem('boostx_stories', JSON.stringify(stories));
  }, [stories]);

  useEffect(() => {
    localStorage.setItem('boostx_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('boostx_rewards', JSON.stringify(rewards));
  }, [rewards]);

  useEffect(() => {
    localStorage.setItem('boostx_push_logs', JSON.stringify(pushLogs));
  }, [pushLogs]);

  useEffect(() => {
    localStorage.setItem('BX_SANDBOX_ACTIVITY_TYPES', JSON.stringify(activityTypes));
  }, [activityTypes]);

  // Fetch documents & payments for selected partner application dynamically
  useEffect(() => {
    const fetchAppDetails = async () => {
      if (!selectedApp) {
        setSelectedAppDocs([]);
        setSelectedAppPayment(null);
        return;
      }
      try {
        const { data: docs } = await supabase
          .from('partner_application_documents')
          .select('*')
          .eq('application_id', selectedApp.id);
        if (docs) {
          setSelectedAppDocs(docs);
        } else {
          setSelectedAppDocs([]);
        }

        const { data: payments } = await supabase
          .from('partner_application_payments')
          .select('*')
          .eq('application_id', selectedApp.id)
          .limit(1);
        if (payments && payments.length > 0) {
          setSelectedAppPayment(payments[0]);
        } else {
          setSelectedAppPayment(null);
        }
      } catch (err) {
        console.error('Error fetching app details dynamically:', err);
      }
    };
    fetchAppDetails();
  }, [selectedApp]);

  // Fetch from Supabase
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: partners, error: partErr } = await supabase.from('partner_applications').select('*').order('created_at', { ascending: false });
      const { data: drivers } = await supabase.from('driver_applications').select('*').order('created_at', { ascending: false });
      const { data: cats } = await supabase.from('categories').select('*');
      const { data: sps } = await supabase.from('sponsored_products').select('*');
      const { data: ords } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      const { data: activities } = await supabase.from('business_activity_types').select('*').order('sort_order', { ascending: true });

      if (partErr) {
        setQueryError(partErr.message);
      } else {
        setQueryError(null);
      }

      if (partners) setPartnerApps(partners);
      if (drivers) setDriverApps(drivers);
      if (cats) setCategories(cats);
      if (sps) setSponsoredProducts(sps);
      if (ords) setOrders(ords);
      if (activities && activities.length > 0) setActivityTypes(activities);
    } catch (e: any) {
      console.log('Using sandbox simulation data fallback.');
      setQueryError(e.message || 'Supabase Connection Mismatch');
      
      const savedApps = localStorage.getItem('BX_SANDBOX_PARTNER_APPS');
      if (savedApps) {
        setPartnerApps(JSON.parse(savedApps));
      } else {
        const fallbackApps = [
          {
            id: 'tapp-shawarma-demo',
            store_name_ar: 'شاورما وتكا بوست إكس التجريبية',
            store_name_en: 'BoostX Shawarma & Tikka Test Store',
            legal_company_name: 'شركة الطهاة المتميزين المحدودة',
            responsible_person_name: 'المهندس عبدالرحمن محمد',
            business_email: 'test-partner@boostxadv.com',
            whatsapp_number: '+966500000123',
            phone_number: '+966500000123',
            city: 'الرياض',
            district: 'الياسمين',
            full_address: 'طريق الملك عبدالعزيز، حي الياسمين، الرياض 13322',
            google_maps_url: 'https://maps.google.com/?q=24.774265,46.738586',
            commercial_registration_number: '1010892743',
            tax_number: '310928374600003',
            notes: 'طلب انضمام شريك افتراضي لتجربة لوحة المراجعة التفاعلية والاعتماد وإصدار الحسابات.',
            selected_plan_id: 'plan_2000',
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
            status: 'submitted',
            payment_method: 'insta_pay',
            payment_reference: 'IP-TXN-9837248',
            payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'tapp-pharmacy-demo',
            store_name_ar: 'صيدلية النخبة الدوائية',
            store_name_en: 'Elite Pharmacy Group',
            legal_company_name: 'مجموعة النخبة الطبية للرعاية',
            responsible_person_name: 'د. خالد عبداللّه الأحمد',
            business_email: 'elite-pharmacy@boostxadv.com',
            whatsapp_number: '+966555123456',
            phone_number: '+966555123456',
            city: 'جدة',
            district: 'الحمراء',
            full_address: 'شارع فلسطين، حي الحمراء، جدة 23321',
            google_maps_url: 'https://maps.google.com/?q=21.520448,39.167232',
            commercial_registration_number: '4030983721',
            tax_number: '300982736100003',
            notes: 'يرجى مراجعة ترخيص صيدلية النخبة الدوائية وسرعة تفعيل باقة التميز 5000.',
            selected_plan_id: 'plan_5000',
            terms_accepted: true,
            terms_accepted_at: new Date().toISOString(),
            status: 'under_review',
            payment_method: 'insta_pay',
            payment_reference: 'IP-TXN-4512389',
            payment_proof_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80',
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ];
        setPartnerApps(fallbackApps);
        localStorage.setItem('BX_SANDBOX_PARTNER_APPS', JSON.stringify(fallbackApps));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Native Supabase Realtime channel subscription to auto-sync registrations
    const channel = supabase
      .channel('public:partner_applications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'partner_applications' },
        (payload: any) => {
          console.log('Realtime change for partner_applications table received:', payload);
          fetchData();
        }
      )
      .subscribe();

    const handleRealtime = (e: any) => {
      if (['partner_applications', 'driver_applications', 'categories', 'sponsored_products', 'orders'].includes(e.detail?.table)) {
        fetchData();
      }
    };
    window.addEventListener('BX_REALTIME_CHANGE', handleRealtime);
    
    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('BX_REALTIME_CHANGE', handleRealtime);
    };
  }, []);

  const handleApprovePartner = async (appId: string) => {
    try {
      const { error } = await supabase.from('partner_applications').update({ status: 'verified' }).eq('id', appId);
      if (error) throw error;
      alert('تم توثيق الشريك بنجاح ومزامنته مع التطبيق! ✅');
      fetchData();
    } catch (e: any) {
      alert('حدث خطأ: ' + e.message);
    }
  };

  const handleRejectPartner = async (appId: string) => {
    try {
      const { error } = await supabase.from('partner_applications').update({ status: 'rejected' }).eq('id', appId);
      if (error) throw error;
      alert('تم رفض طلب انضمام الشريك ❌');
      fetchData();
    } catch (e: any) {
      alert('حدث خطأ: ' + e.message);
    }
  };

  const handleApproveDriver = async (appId: string) => {
    try {
      const { error } = await supabase.from('driver_applications').update({ status: 'verified' }).eq('id', appId);
      if (error) throw error;
      alert('تم توثيق واعتماد كابتن التوصيل بنجاح! 🛵');
      fetchData();
    } catch (e: any) {
      alert('حدث خطأ: ' + e.message);
    }
  };

  const handleToggleCategory = async (id: string, currentVal: boolean) => {
    try {
      const { error } = await supabase.from('categories').update({ is_active: !currentVal }).eq('id', id);
      if (!error) {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !currentVal } : c));
      }
    } catch (e) {
      console.error('Error toggling category:', e);
    }
  };

  const handleToggleSponsored = async (id: string, currentVal: boolean) => {
    try {
      const { error } = await supabase.from('sponsored_products').update({ is_active: !currentVal }).eq('id', id);
      if (!error) {
        setSponsoredProducts(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentVal } : s));
      }
    } catch (e) {
      console.error('Error toggling sponsored status:', e);
    }
  };

  // CRUD handlers
  const handleAddBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.image) return alert('يرجى ملء الحقول المطلوبة!');
    setBanners([...banners, { ...newBanner, id: 'b-' + Date.now(), active: true }]);
    setNewBanner({ title: '', image: '', route: '' });
    setShowAddBannerModal(false);
    alert('تم إضافة البنر الترويجي بنجاح! 🖼️');
  };

  const handleDeleteBanner = (id: string) => {
    if (confirm('هل أنت متأكد من حذف البنر؟')) {
      setBanners(banners.filter(b => b.id !== id));
    }
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.discount) return alert('يرجى ملء الحقول المطلوبة!');
    setCoupons([...coupons, { ...newCoupon, active: true }]);
    setNewCoupon({ code: '', discount: '', minSpend: '' });
    setShowAddCouponModal(false);
    alert('تم إضافة الكوبون بنجاح! 🎫');
  };

  const handleAddReward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReward.title) return alert('يرجى كتابة عنوان الجائزة!');
    setRewards([...rewards, { ...newReward, id: 'r-' + Date.now(), active: true }]);
    setNewReward({ title: '', cost: 100 });
    setShowAddRewardModal(false);
    alert('تم إضافة مكافأة ولاء جديدة! 🏆');
  };

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pushTitle || !pushBody) return alert('يرجى ملء العنوان ونص الإشعار!');
    
    // Write to supabase notifications if available
    supabase.from('notifications').insert({
      title: pushTitle,
      description: pushBody,
      type: 'promo',
      created_at: new Date().toISOString(),
      read: false,
      unread: true
    }).then();

    setPushLogs([{ id: 'p-' + Date.now(), title: pushTitle, body: pushBody, sentAt: new Date().toLocaleString('ar-EG') }, ...pushLogs]);
    setPushTitle('');
    setPushBody('');
    alert('تم إرسال الإشعار الفوري لجميع الهواتف النشطة بنجاح! 🚀');
  };

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Groups and sub-items list
  const sidebarGroups: SidebarGroup[] = [
    {
      id: 'overview',
      title: 'A. نظرة عامة',
      items: [
        { id: 'admin_home', label: 'الرئيسية', icon: Home },
        { id: 'admin_notifications', label: 'التنبيهات والطلبات المعلقة', icon: Bell },
        { id: 'admin_kpis', label: 'مؤشرات الأداء التشغيلية', icon: Activity }
      ]
    },
    {
      id: 'app_management',
      title: 'B. إدارة التطبيق',
      items: [
        { id: 'admin_app_homepage', label: 'الصفحة الرئيسية للتطبيق', icon: Smartphone },
        { id: 'admin_banners', label: 'البنرات الإعلانية', icon: ImageIcon },
        { id: 'admin_sections', label: 'ترتيب وتفعيل الأقسام', icon: Layout },
        { id: 'admin_categories', label: 'الفئات والتصنيفات', icon: Grid },
        { id: 'admin_stories', label: 'ستوريهات الشركاء', icon: Play },
        { id: 'admin_sponsored_products', label: 'المنتجات الممولة والترويج', icon: Sparkles },
        { id: 'admin_flash_offers', label: 'عروض الفلاش اليومية', icon: Zap },
        { id: 'admin_coupons', label: 'كوبونات الخصم', icon: Ticket },
        { id: 'admin_push_notifications', label: 'إرسال إشعارات الدفع Push', icon: Send },
        { id: 'admin_rewards', label: 'نقاط ومكافآت الولاء', icon: Award }
      ]
    },
    {
      id: 'partners_management',
      title: 'C. إدارة الشركاء',
      items: [
        { id: 'admin_partners', label: 'دليل الشركاء المعتمدين', icon: UsersRound },
        { id: 'admin_partner_join_requests', label: 'طلبات الانضمام والتراخيص', icon: UserPlus },
        { id: 'admin_activity_types', label: 'إدارة أنواع الأنشطة', icon: ListCollapse },
        { id: 'admin_partner_products', label: 'المنتجات والخدمات التابعة', icon: PackageOpen },
        { id: 'admin_partner_offers', label: 'عروض وتخفيضات الشركاء', icon: Tag },
        { id: 'admin_partner_campaigns', label: 'حملات الشركاء التسويقية', icon: Percent },
        { id: 'admin_partner_ratings', label: 'تقييمات الشركاء ومراجعاتهم', icon: Star }
      ]
    },
    {
      id: 'orders_operation',
      title: 'D. الطلبات والتشغيل',
      items: [
        { id: 'admin_orders_all', label: 'كل طلبات المنصة', icon: ShoppingCart },
        { id: 'admin_orders_active', label: 'الطلبات الجارية والنشطة', icon: Clock },
        { id: 'admin_direct_delivery', label: 'التوصيل المباشر Dispatch', icon: Truck },
        { id: 'admin_drivers', label: 'دليل مناديب التوصيل', icon: UserCheck },
        { id: 'admin_order_tracking', label: 'خريطة التتبع المباشر GPS', icon: MapPin },
        { id: 'admin_issues_delays', label: 'مشاكل الشحن والتأخير', icon: AlertTriangle }
      ]
    },
    {
      id: 'customers',
      title: 'E. العملاء',
      items: [
        { id: 'admin_customers', label: 'دليل العملاء المسجلين', icon: Users },
        { id: 'admin_favorites', label: 'المنتجات الأكثر تفضيلاً', icon: Heart },
        { id: 'admin_wallets', label: 'إدارة المحافظ والرصيد', icon: Wallet },
        { id: 'admin_complaints', label: 'شكاوى واعتراضات العملاء', icon: MessageSquare }
      ]
    },
    {
      id: 'reports',
      title: 'F. التقارير والتحليلات',
      items: [
        { id: 'admin_reports_orders', label: 'تقارير المبيعات والطلبات', icon: FileText },
        { id: 'admin_reports_campaigns', label: 'تقارير نجاح الحملات الممولة', icon: BarChart },
        { id: 'admin_reports_partners', label: 'تقارير مبيعات الشركاء', icon: BarChart },
        { id: 'admin_reports_drivers', label: 'تقارير أداء ومستحقات المناديب', icon: BarChart },
        { id: 'admin_revenue', label: 'صافي الإيرادات والعمولات', icon: Wallet }
      ]
    },
    {
      id: 'settings',
      title: 'G. الإعدادات العامة',
      items: [
        { id: 'admin_settings_general', label: 'إعدادات النظام العامة', icon: Settings },
        { id: 'admin_settings_cities', label: 'المدن والمناطق المغطاة', icon: Map },
        { id: 'admin_settings_permissions', label: 'إدارة أدوار وصلاحيات المدراء', icon: Lock },
        { id: 'admin_settings_audit_logs', label: 'سجل سجل العمليات Audit Logs', icon: ClipboardList }
      ]
    }
  ];

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar Navigation */}
      {!hideSidebar && (
        <aside style={{ width: '280px', flexShrink: 0, background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }} className="no-scrollbar">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={20} color="white" />
            </div>
            <div>
              <span style={{ fontWeight: 900, fontSize: '1rem', display: 'block', color: 'white' }}>منصة الإشراف العليا</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>لوحة التحكم الكلية</span>
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
                      const isActive = activeNav === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveNav(item.id)}
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
              <ArrowRight size={16} /> العودة للبوابات العامة
            </button>
          )}
        </aside>
      )}

      {/* Main Workspace Area & Live Mobile Device Preview wrapper */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', background: 'rgba(18,11,31,0.5)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
              {sidebarGroups.flatMap(g => g.items).find(i => i.id === activeNav)?.label || 'الرئيسية'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', padding: '6px 12px', borderRadius: '30px' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)', boxShadow: '0 0 8px var(--color-success)' }}></div>
              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-accent-light)' }}>الوضع التجريبي الذكي (Sandbox Mode)</span>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          
          {/* Active view workspace */}
          <main style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
            
            {/* SEARCH & FILTER GENERAL COMPONENT (Appears on directories) */}
            {['admin_partners', 'admin_partner_products', 'admin_drivers', 'admin_orders_all', 'admin_customers'].includes(activeNav) && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 14, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: '240px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '6px 12px' }}>
                  <Search size={16} style={{ color: 'var(--color-text-muted)' }} />
                  <input 
                    type="text" 
                    placeholder="ابحث بالاسم، الرقم، أو المعرف الفريد..." 
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.85rem', width: '100%', fontFamily: 'Cairo, sans-serif' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)}
                    style={{ background: '#1c0f33', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 14px', borderRadius: 10, fontSize: '0.8rem', fontFamily: 'Cairo' }}
                  >
                    <option value="all">جميع الحالات</option>
                    <option value="active">نشط / موثق</option>
                    <option value="pending">معلق / قيد المراجعة</option>
                  </select>
                </div>
              </div>
            )}

            {/* TAB VIEW 1: الرئيسية */}
            {activeNav === 'admin_home' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>إجمالي مبيعات اليوم</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '6px 0 0 0', color: 'white' }}>٣,٤٥٦.٠٠ ر.س</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>📈 +١٢.٤٪ عن الأمس</span>
                  </div>
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>طلبات معلقة بانتظار المراجعة</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '6px 0 0 0', color: '#f59e0b' }}>
                      {partnerApps.filter(p => ['pending', 'submitted', 'under_review', 'needs_more_info'].includes(p.status)).length + driverApps.filter(d => d.status === 'pending').length} طلب انضمام
                    </h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>تحتاج توثيق ومراجعة التراخيص</span>
                  </div>
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>مناديب التوصيل المتصلين GPS</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '6px 0 0 0', color: 'var(--color-success)' }}>١٤ مندوب</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>🟢 متصل ونشط لحظياً</span>
                  </div>
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>معدل التقييم العام للمتاجر</span>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '6px 0 0 0', color: '#fbbf24' }}>٤.٨ ★</h3>
                    <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>بناءً على ٨,٤٢١ تقييم عملاء</span>
                  </div>
                </div>

                {/* Operations & Performance Timeline */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>نشاط المبيعات وحركة الطلبات الجارية</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {orders.slice(0, 4).map(o => (
                        <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: 12 }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem', display: 'block' }}>طلب رقم #{o.id?.substring(0, 8)}</strong>
                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>العميل: {o.customer_name} • {o.dropoff_location?.substring(0, 25)}...</span>
                          </div>
                          <span style={{ fontSize: '0.72rem', background: 'rgba(168,85,247,0.15)', color: 'var(--color-accent-light)', padding: '4px 10px', borderRadius: 8, fontWeight: 900 }}>
                            {o.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>المهام التشغيلية العاجلة</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ padding: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, fontSize: '0.75rem' }}>
                        ⚠️ هناك <strong>{partnerApps.filter(p => ['pending', 'submitted', 'under_review', 'needs_more_info'].includes(p.status)).length} طلب شريك جديد</strong> معلق بانتظار تدقيق السجل التجاري والتراخيص.
                      </div>
                      <div style={{ padding: 12, background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 12, fontSize: '0.75rem' }}>
                        ⚡ <strong>عرض فلاش مميز</strong> يوشك على الانتهاء بعد ساعتين. راجع أولوية ظهور المنتجات.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 2: التنبيهات والطلبات المعلقة */}
            {activeNav === 'admin_notifications' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>طلبات الانضمام والتراخيص الرسمية المعلقة</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {partnerApps.filter(p => ['pending', 'submitted', 'under_review', 'needs_more_info'].includes(p.status)).map(app => (
                    <div key={app.id} style={{ padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{app.store_name_ar || app.business_name}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>{app.legal_company_name || app.commercial_name} • {app.phone_number} • {app.city}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleApprovePartner(app.id)}>توثيق واعتماد</button>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }} onClick={() => handleRejectPartner(app.id)}>رفض الطلب</button>
                      </div>
                    </div>
                  ))}
                  {partnerApps.filter(p => ['pending', 'submitted', 'under_review', 'needs_more_info'].includes(p.status)).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>لا توجد طلبات انضمام شركاء معلقة حالياً. 👌</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB VIEW 3: مؤشرات الأداء التشغيلية */}
            {activeNav === 'admin_kpis' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>مؤشرات الأداء التشغيلية والخدمية (KPIs)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>سرعة استجابة الشركاء للتحضير</span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>٤.٢ دقيقة</h2>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>متوسط زمن رحلة التوصيل الكلي</span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>١٨.٥ دقيقة</h2>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: 16, borderRadius: 14 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>معدل التوصيل الناجح في أول محاولة</span>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '4px 0 0 0' }}>٩٩.٨٢٪</h2>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 4: الصفحة الرئيسية للتطبيق */}
            {activeNav === 'admin_app_homepage' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 12 }}>التحكم بالصفحة الرئيسية للتطبيق وحالة ظهورها</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>قم بتمكين أو تعطيل المكونات الرئيسية للتطبيق لحظياً للتعديل على تجربة المستخدم.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                    <div>
                      <strong>قسم البنرات الإعلانية الدوارة (Carousel Banners)</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>العروض المتحركة أعلى الصفحة الرئيسية.</span>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>نشط ومتوفر</button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                    <div>
                      <strong>قسم الستوريهات الترويجية (Stories Slider)</strong>
                      <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>قصص وعروض الشركاء المصورة بنمط الإنستغرام.</span>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>نشط ومتوفر</button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 5: البنرات الإعلانية */}
            {activeNav === 'admin_banners' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>إدارة البنرات الإعلانية الترويجية (Banners)</h3>
                  <button className="btn btn-primary" onClick={() => setShowAddBannerModal(true)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 16px', fontSize: '0.78rem' }}>
                    <Plus size={16} /> إضافة بنر ترويجي جديد
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                  {banners.map(b => (
                    <div key={b.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden' }}>
                      <img src={b.image} alt={b.title} style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                      <div style={{ padding: 14 }}>
                        <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>{b.title}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 12 }}>المسار التوجيهي: {b.route}</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <button 
                            onClick={() => {
                              setBanners(banners.map(x => x.id === b.id ? { ...x, active: !x.active } : x));
                              alert('تم تحديث حالة البنر بنجاح.');
                            }}
                            className={`btn ${b.active ? 'btn-primary' : 'btn-secondary'}`} 
                            style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                          >
                            {b.active ? 'نشط وظاهر 🟢' : 'معطل ومخفي 🔴'}
                          </button>
                          <button className="btn btn-secondary text-danger" style={{ padding: '6px', minWidth: 'auto', background: 'transparent' }} onClick={() => handleDeleteBanner(b.id)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 6: ترتيب وتفعيل الأقسام */}
            {activeNav === 'admin_sections' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>ترتيب وحالة تفعيل أقسام الصفحة الرئيسية</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {sections.sort((a,b) => a.order - b.order).map(sec => (
                    <div key={sec.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem' }}>{sec.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: 2 }}>الترتيب السلسلي: {sec.order}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button 
                          onClick={() => {
                            setSections(sections.map(x => x.id === sec.id ? { ...x, active: !x.active } : x));
                            alert('تم تعديل حالة تفعيل القسم.');
                          }}
                          className={`btn ${sec.active ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                        >
                          {sec.active ? 'نشط' : 'معطل'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 7: الفئات والتصنيفات */}
            {activeNav === 'admin_categories' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>إدارة الفئات والتصنيفات الرئيسية بالتطبيق</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
                  {categories.map(cat => (
                    <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                      <div>
                        <strong style={{ fontSize: '0.9rem' }}>{cat.name}</strong>
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>المعرف الفريد: {cat.id}</span>
                      </div>
                      <button 
                        onClick={() => handleToggleCategory(cat.id, cat.is_active)}
                        className={`btn ${cat.is_active ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                      >
                        {cat.is_active ? 'نشطة ومتوفرة' : 'معطلة'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 8: ستوريهات الشركاء */}
            {activeNav === 'admin_stories' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>طلبات نشر الستوريهات والقصص المصورة الشريكة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {stories.map(st => (
                    <div key={st.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 16, overflow: 'hidden' }}>
                      <img src={st.image} alt={st.store} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                      <div style={{ padding: 14 }}>
                        <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 4 }}>{st.store}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '0 0 12px 0' }}>{st.content}</p>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {!st.approved ? (
                            <>
                              <button 
                                onClick={() => {
                                  setStories(stories.map(x => x.id === st.id ? { ...x, approved: true } : x));
                                  alert('تم اعتماد ونشر الستوري للشريك بنجاح! 🎉');
                                }}
                                className="btn btn-primary" 
                                style={{ padding: '6px 12px', fontSize: '0.72rem', flex: 1 }}
                              >
                                اعتماد ونشر
                              </button>
                              <button 
                                onClick={() => {
                                  setStories(stories.filter(x => x.id !== st.id));
                                  alert('تم رفض وحذف طلب الستوري.');
                                }}
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.72rem', color: '#ef4444' }}
                              >
                                رفض
                              </button>
                            </>
                          ) : (
                            <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.72rem', pointerEvents: 'none' }}>
                              معتمد ومنشور حالياً ✅
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 9: المنتجات الممولة والترويج */}
            {activeNav === 'admin_sponsored_products' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>المنتجات الممولة وحملات الإعلان المعتمدة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {sponsoredProducts.map(sp => (
                    <div key={sp.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                      <div>
                        <strong style={{ fontSize: '0.85rem', display: 'block' }}>{sp.title}</strong>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>المعلن: {sp.store_name || sp.sponsored_by}</span>
                      </div>
                      <button 
                        onClick={() => handleToggleSponsored(sp.id, sp.is_active)}
                        className={`btn ${sp.is_active ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                      >
                        {sp.is_active ? 'نشط ومعروض' : 'معطل'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 10: عروض الفلاش اليومية */}
            {activeNav === 'admin_flash_offers' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>عروض الفلاش العاجلة والنشطة حالياً</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {sponsoredProducts.filter(x => x.discount_percent >= 30).map(offer => (
                    <div key={offer.id} style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14 }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block', marginBottom: 2 }}>{offer.title}</strong>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>المتجر: {offer.store_name} • خصم {offer.discount_percent}%</span>
                      <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.7rem', pointerEvents: 'none' }}>خصم فلاش نشط ⚡</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 11: كوبونات الخصم */}
            {activeNav === 'admin_coupons' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>كوبونات وأكواد الخصم النشطة</h3>
                  <button className="btn btn-primary" onClick={() => setShowAddCouponModal(true)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 16px', fontSize: '0.78rem' }}>
                    <Plus size={16} /> إضافة كوبون جديد
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                  {coupons.map((c, i) => (
                    <div key={i} style={{ padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14 }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--color-accent-light)', display: 'block' }}>{c.code}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'white', display: 'block', margin: '4px 0' }}>الخصم: {c.discount} • الحد الأدنى: {c.minSpend}</span>
                      <button 
                        onClick={() => {
                          setCoupons(coupons.map((x, idx) => idx === i ? { ...x, active: !x.active } : x));
                          alert('تم تغيير حالة الكوبون.');
                        }}
                        className={`btn ${c.active ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '0.7rem', marginTop: 8 }}
                      >
                        {c.active ? 'نشط وصالح' : 'معطل'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 12: إرسال إشعارات الدفع Push */}
            {activeNav === 'admin_push_notifications' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <form onSubmit={handleSendPush} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>إرسال إشعار ترويجي فوري (Push Campaign)</h3>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>عنوان الإشعار الترويجي</label>
                    <input type="text" className="input-field" placeholder="مثال: خصم ٥٠٪ على الوجبة المزدوجة اليوم!" value={pushTitle} onChange={e => setPushTitle(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>نص محتوى الرسالة التنبيهية</label>
                    <textarea className="textarea-field" style={{ minHeight: 80 }} placeholder="اكتب تفاصيل العرض والخصم الحصري لحث العملاء على الطلب الفوري..." value={pushBody} onChange={e => setPushBody(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center', padding: 12, fontSize: '0.85rem', fontWeight: 900 }}>
                    <Send size={16} /> بث وإرسال الإشعار الترويجي لجميع الهواتف
                  </button>
                </form>

                <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>سجل العمليات الإشعارات الترويجية المرسلة ({pushLogs.length})</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: '280px', overflowY: 'auto' }} className="no-scrollbar">
                    {pushLogs.map((log, idx) => (
                      <div key={idx} style={{ padding: 12, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 10 }}>
                        <strong style={{ fontSize: '0.82rem', display: 'block' }}>{log.title}</strong>
                        <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', margin: '2px 0' }}>{log.body}</p>
                        <span style={{ fontSize: '0.62rem', color: 'var(--color-accent-light)' }}>أرسل في: {log.sentAt}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 13: نقاط ومكافآت الولاء */}
            {activeNav === 'admin_rewards' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>مكافآت الولاء واستبدال النقاط التفاعلية</h3>
                  <button className="btn btn-primary" onClick={() => setShowAddRewardModal(true)} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 16px', fontSize: '0.78rem' }}>
                    <Plus size={16} /> إضافة جائزة ولاء جديدة
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                  {rewards.map((r, i) => (
                    <div key={r.id || i} style={{ padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14 }}>
                      <strong style={{ fontSize: '0.92rem', display: 'block' }}>{r.title}</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-accent-light)', display: 'block', margin: '4px 0' }}>تكلفة الاسترداد: {r.cost} نقطة</span>
                      <button 
                        onClick={() => {
                          setRewards(rewards.map(x => x.id === r.id ? { ...x, active: !x.active } : x));
                          alert('تم تغيير حالة المكافأة.');
                        }}
                        className={`btn ${r.active ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '4px 10px', fontSize: '0.7rem', marginTop: 8 }}
                      >
                        {r.active ? 'متوفرة للاستبدال' : 'معطلة'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 14: دليل الشركاء المعتمدين */}
            {activeNav === 'admin_partners' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>دليل المتاجر والشركاء المعتمدين بالمنصة</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '12px' }}>اسم المتجر الشريك</th>
                        <th style={{ padding: '12px' }}>الفئة والنشاط</th>
                        <th style={{ padding: '12px' }}>التقييم العام</th>
                        <th style={{ padding: '12px' }}>المنطقة والمدينة</th>
                        <th style={{ padding: '12px' }}>حالة الاستقبال</th>
                      </tr>
                    </thead>
                    <tbody>
                      {partnerApps.filter(p => p.status === 'verified').map((p, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>{p.business_name}</td>
                          <td style={{ padding: '12px' }}>{p.biz_type}</td>
                          <td style={{ padding: '12px', color: '#fbbf24' }}>٤.٩ ★</td>
                          <td style={{ padding: '12px' }}>{p.city} • {p.district}</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '4px 10px', borderRadius: 8 }}>مفتوح ويستقبل</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB VIEW 15: طلبات الانضمام والتراخيص */}
            {activeNav === 'admin_partner_join_requests' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Realtime Sync Debug Console */}
                <div style={{ background: 'rgba(138, 44, 255, 0.05)', border: '1px solid rgba(138, 44, 255, 0.15)', borderRadius: '16px', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1rem' }}>⚙️</span>
                    <div>
                      <strong style={{ fontSize: '0.8rem', color: 'white', display: 'block' }}>لوحة تتبع المزامنة الحية للشركاء (Partner Sync Debug Console)</strong>
                      <span style={{ fontSize: '0.68rem', color: '#c084fc', display: 'block', marginTop: '2px' }}>
                        الجدول المستعلم: <span style={{ fontFamily: 'monospace', color: 'white' }}>partner_applications</span> • حالة المراقبة والاشتراك: <span style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>نشط ومتصل بالـ Realtime 🟢</span>
                      </span>
                      {queryError && (
                        <span style={{ fontSize: '0.68rem', color: '#f87171', display: 'block', marginTop: '4px', fontWeight: 'bold' }}>
                          ⚠️ خطأ الاستعلام النشط: {queryError}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px', fontSize: '0.76rem', color: '#cac4dd', flexWrap: 'wrap' }}>
                    <div>عدد الطلبات: <strong style={{ color: 'white' }}>{partnerApps.length}</strong></div>
                    <div>أحدث معرّف ID: <strong style={{ color: '#c084fc', fontFamily: 'monospace' }}>{partnerApps.length > 0 ? partnerApps[0].id?.substring(0, 8) + '...' : 'لا يوجد'}</strong></div>
                    <div>آخر تحديث: <strong style={{ color: 'white', fontFamily: 'monospace' }}>{partnerApps.length > 0 ? new Date(partnerApps[0].created_at).toLocaleTimeString() : 'لا يوجد'}</strong></div>
                  </div>
                </div>
                
                {/* Stepper Status Tabs */}
                <div style={{ 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)', 
                  padding: '12px 20px', 
                  borderRadius: 20,
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto'
                }}>
                  {[
                    { key: 'all', label: 'الكل' },
                    { key: 'submitted', label: 'طلبات جديدة 📬' },
                    { key: 'under_review', label: 'تحت المراجعة ⏳' },
                    { key: 'needs_more_info', label: 'نواقص التراخيص ⚠️' },
                    { key: 'approved', label: 'معتمد وموثق ✅' },
                    { key: 'rejected', label: 'مرفوض ❌' }
                  ].map(tab => {
                    const count = tab.key === 'all' 
                      ? partnerApps.length 
                      : partnerApps.filter(p => p.status === tab.key).length;
                    const isActive = appFilterStatus === tab.key;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => { setAppFilterStatus(tab.key); setSelectedApp(null); }}
                        style={{
                          background: isActive ? 'rgba(168, 85, 247, 0.2)' : 'rgba(255,255,255,0.01)',
                          border: isActive ? '1px solid rgba(168,85,247,0.4)' : '1px solid rgba(255,255,255,0.05)',
                          color: isActive ? '#d8b4fe' : 'var(--color-text-muted)',
                          padding: '6px 14px',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>{tab.label}</span>
                        <span style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '8px' }}>{count}</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: selectedApp ? '1fr 1fr' : '1fr', gap: 20 }}>
                  
                  {/* Applications List */}
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, marginBottom: 16 }}>ملفات طلبات الانضمام</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {partnerApps
                        .filter(app => appFilterStatus === 'all' ? true : app.status === appFilterStatus)
                        .map(app => {
                          const planText = app.selected_plan_id === 'plan_0' ? 'المجانية' : app.selected_plan_id === 'plan_1000' ? 'الأساسية' : app.selected_plan_id === 'plan_2000' ? 'النمو' : app.selected_plan_id === 'plan_3000' ? 'الاحترافية' : 'التميز';
                          const isSelected = selectedApp?.id === app.id;
                          return (
                            <div 
                              key={app.id} 
                              onClick={() => { setSelectedApp(app); setAdminNotes(app.admin_notes || ''); }}
                              style={{ 
                                padding: 16, 
                                background: isSelected ? 'rgba(168, 85, 247, 0.05)' : 'rgba(255,255,255,0.01)', 
                                border: isSelected ? '1px solid rgba(168,85,247,0.3)' : '1px solid rgba(255,255,255,0.04)', 
                                borderRadius: 16,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                  <strong style={{ fontSize: '0.94rem', color: 'white' }}>{app.store_name_ar || app.business_name}</strong>
                                  <span style={{ display: 'block', fontSize: '0.74rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                                    {app.legal_company_name || app.commercial_name} • {app.whatsapp_number || app.phone_number}
                                  </span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                  <span style={{ 
                                    fontSize: '0.7rem', 
                                    background: app.status === 'approved' || app.status === 'verified' ? 'rgba(16,185,129,0.15)' : app.status === 'under_review' ? 'rgba(59,130,246,0.15)' : app.status === 'needs_more_info' ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', 
                                    color: app.status === 'approved' || app.status === 'verified' ? 'var(--color-success)' : app.status === 'under_review' ? '#60a5fa' : app.status === 'needs_more_info' ? '#fbbf24' : '#f87171', 
                                    padding: '3px 10px', 
                                    borderRadius: '20px',
                                    fontWeight: 800
                                  }}>
                                    {app.status === 'approved' || app.status === 'verified' ? 'معتمد ✅' : app.status === 'under_review' ? 'تحت المراجعة ⏳' : app.status === 'needs_more_info' ? 'نواقص تراخيص ⚠️' : app.status === 'rejected' ? 'مرفوض ❌' : 'طلب جديد 📬'}
                                  </span>
                                  <span style={{ fontSize: '0.68rem', color: '#c084fc', fontWeight: 700 }}>باقة {planText}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      {partnerApps.filter(app => appFilterStatus === 'all' ? true : app.status === appFilterStatus).length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-muted)' }}>لا توجد طلبات انضمام تندرج تحت هذا الفلتر.</div>
                      )}
                    </div>
                  </div>

                  {/* Application Detailed Review Panel */}
                  {selectedApp && (
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white', margin: 0 }}>مراجعة وتدقيق المستندات والتراخيص</h3>
                        <button onClick={() => setSelectedApp(null)} style={{ background: 'none', border: 'none', color: '#aaa3c2', fontSize: '0.8rem', cursor: 'pointer' }}>إغلاق ×</button>
                      </div>

                      {/* Business info table */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.8rem', color: '#cac4dd' }}>
                        <div>اسم الشريك: <strong style={{ color: 'white' }}>{selectedApp.store_name_ar || selectedApp.business_name}</strong></div>
                        <div>الاسم الإنجليزي: <span>{selectedApp.store_name_en || '-'}</span></div>
                        <div>اسم الشركة القانوني: <span>{selectedApp.legal_company_name || selectedApp.commercial_name}</span></div>
                        <div>السجل التجاري: <span style={{ fontFamily: 'monospace' }}>{selectedApp.commercial_registration_number || selectedApp.cr_document_url ? 'مرفق ومقروء' : '-'}</span></div>
                        <div>البريد التجاري: <span>{selectedApp.business_email || selectedApp.email}</span></div>
                        <div>جوال المدير المسؤول: <span>{selectedApp.phone_number || selectedApp.phone}</span></div>
                        <div>واتساب النشاط: <span>{selectedApp.whatsapp_number || selectedApp.phone}</span></div>
                        <div>المنطقة والحي: <span>{selectedApp.city} • {selectedApp.district}</span></div>
                        <div style={{ gridColumn: 'span 2' }}>العنوان التفصيلي للفرع: <span>{selectedApp.full_address || '-'}</span></div>
                        {selectedApp.google_maps_url && (
                          <div style={{ gridColumn: 'span 2' }}>خرائط جوجل: <a href={selectedApp.google_maps_url} target="_blank" rel="noreferrer" style={{ color: '#c084fc', textDecoration: 'underline' }}>فتح الموقع الجغرافي 📍</a></div>
                        )}
                      </div>

                      {/* Document uploads links */}
                      <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '0.78rem', color: '#aaa3c2', fontWeight: 900 }}>📄 المستندات والتراخيص المرفوعة:</span>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <a href={selectedApp.cr_document_url || selectedApp.payment_proof_url || '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📁 السجل التجاري (CR) ➔
                          </a>
                          <a href={selectedApp.owner_id_url || '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📁 هوية المالك الوطني ➔
                          </a>
                          <a href={selectedApp.municipal_license_url || '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📁 الترخيص البلدي للنشاط ➔
                          </a>
                          <a href={selectedApp.vat_certificate_url || '#'} target="_blank" rel="noreferrer" style={{ fontSize: '0.74rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '10px', textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            📁 شهادة القيمة المضافة ➔
                          </a>
                        </div>

                        {/* Dynamic Documents List */}
                        {selectedAppDocs.length > 0 && (
                          <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 800 }}>📂 المستندات الرسمية المرفوعة سحابياً:</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              {selectedAppDocs.map(doc => {
                                const docLabel = doc.document_type === 'cr_doc' ? 'السجل التجاري' : doc.document_type === 'license_doc' ? 'الرخصة البلدية' : doc.document_type === 'vat_doc' ? 'شهادة القيمة المضافة' : doc.document_type === 'national_id' ? 'الهوية الوطنية للمالك' : 'مستند إضافي';
                                return (
                                  <div key={doc.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <span style={{ fontSize: '0.74rem', color: 'white' }}>📜 {docLabel} ({doc.file_name})</span>
                                    <a href={doc.file_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#a855f7', textDecoration: 'none', fontWeight: 900 }}>معاينة المستند ➔</a>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Payment Proof details if paid plan */}
                      {(selectedApp.selected_plan_id !== 'plan_0' || selectedAppPayment) && (
                        <div style={{ background: 'rgba(138,44,255,0.02)', border: '1px solid rgba(138,44,255,0.15)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <span style={{ fontSize: '0.78rem', color: '#c084fc', fontWeight: 900 }}>💳 إثبات السداد المالي للتحويل:</span>
                          <div style={{ fontSize: '0.74rem', color: '#cac4dd', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                            <div>وسيلة التحويل: <strong>{selectedAppPayment?.payment_method === 'insta_pay' || selectedApp.payment_method === 'insta_pay' ? 'InstaPay' : 'Vodafone Cash'}</strong></div>
                            <div>صاحب الحساب: <span>{selectedAppPayment?.sender_name || selectedApp.sender_name || 'مرسل الشريك'}</span></div>
                            <div>رقم جوال المحول: <span>{selectedAppPayment?.sender_phone || selectedApp.sender_phone || selectedApp.phone_number}</span></div>
                            <div>المبلغ المحول: <strong style={{ color: 'white' }}>{selectedAppPayment?.amount || (selectedApp.selected_plan_id === 'plan_1000' ? 1000 : selectedApp.selected_plan_id === 'plan_2000' ? 2000 : selectedApp.selected_plan_id === 'plan_3000' ? 3000 : selectedApp.selected_plan_id === 'plan_5000' ? 5000 : 0)} ر.س</strong></div>
                            {(selectedAppPayment?.transfer_reference || selectedApp.payment_reference) && <div>كود العملية: <span style={{ fontFamily: 'monospace' }}>{selectedAppPayment?.transfer_reference || selectedApp.payment_reference}</span></div>}
                            {(selectedAppPayment?.proof_file_url || selectedApp.payment_proof_url) && (
                              <div style={{ gridColumn: 'span 2', marginTop: '6px' }}>
                                <a href={selectedAppPayment?.proof_file_url || selectedApp.payment_proof_url} target="_blank" rel="noreferrer" style={{ color: '#c084fc', textDecoration: 'underline' }}>📂 فتح لقطة شاشة إيصال السداد المرفوع ➔</a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Admin Notes */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <label style={{ fontSize: '0.78rem', color: '#aaa3c2', fontWeight: 800 }}>ملاحظات وتوجيهات الإدارة والمدققين</label>
                        <textarea 
                          rows={2}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          placeholder="اكتب أي ملاحظات أو أسباب الرفض أو النواقص المطلوبة من الشريك..."
                          style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'white', fontSize: '0.8rem' }}
                        />
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                        {selectedApp.status !== 'approved' && selectedApp.status !== 'verified' ? (
                          <>
                            <button 
                              onClick={() => {
                                // Pre-fill credentials helper
                                const randomPass = Math.random().toString(36).substring(2, 10).toUpperCase();
                                setInitialUsername(selectedApp.business_email || selectedApp.email || 'partner@boostx.sa');
                                setInitialPasswordTemp(randomPass);
                                setShowApproveModal(true);
                              }}
                              className="btn btn-primary" 
                              style={{ padding: '8px 18px', fontSize: '0.8rem' }}
                            >
                              الموافقة واعتماد التراخيص ✔️
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  const { error } = await supabase.from('partner_applications').update({ status: 'needs_more_info', admin_notes: adminNotes }).eq('id', selectedApp.id);
                                  if (error) throw error;
                                  alert('تم إخطار الشريك بنواقص التراخيص بنجاح ⚠️');
                                  setSelectedApp(null);
                                  fetchData();
                                } catch (e: any) {
                                  const updated = partnerApps.map(a => a.id === selectedApp.id ? { ...a, status: 'needs_more_info', admin_notes: adminNotes } : a);
                                  setPartnerApps(updated);
                                  localStorage.setItem('BX_SANDBOX_PARTNER_APPS', JSON.stringify(updated));
                                  alert('تنبيه: تعذر تحديث قاعدة البيانات (تم الحفظ محلياً في الـ Sandbox) ⚠️');
                                  setSelectedApp(null);
                                }
                              }}
                              className="btn btn-secondary" 
                              style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}
                            >
                              طلب استكمال النواقص ⚠️
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  const { error } = await supabase.from('partner_applications').update({ status: 'rejected', admin_notes: adminNotes }).eq('id', selectedApp.id);
                                  if (error) throw error;
                                  alert('تم رفض طلب الانضمام ❌');
                                  setSelectedApp(null);
                                  fetchData();
                                } catch (e: any) {
                                  const updated = partnerApps.map(a => a.id === selectedApp.id ? { ...a, status: 'rejected', admin_notes: adminNotes } : a);
                                  setPartnerApps(updated);
                                  localStorage.setItem('BX_SANDBOX_PARTNER_APPS', JSON.stringify(updated));
                                  alert('تنبيه: تعذر تحديث قاعدة البيانات (تم رفض الطلب محلياً في الـ Sandbox) ❌');
                                  setSelectedApp(null);
                                }
                              }}
                              className="btn btn-secondary" 
                              style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}
                            >
                              رفض الطلب ❌
                            </button>
                          </>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-success)', fontWeight: 800 }}>✓ تم اعتماد هذا الشريك سحابياً وتوثيق الفروع</span>
                            {selectedApp.initial_username && (
                              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <span style={{ fontSize: '0.74rem', color: '#aaa3c2' }}>بيانات الدخول الصادرة للشريك:</span>
                                <div style={{ fontSize: '0.76rem', color: 'white' }}>اسم المستخدم: <strong>{selectedApp.initial_username}</strong></div>
                                <div style={{ fontSize: '0.76rem', color: 'white' }}>كلمة المرور المؤقتة: <strong style={{ color: '#c084fc', fontFamily: 'monospace' }}>{selectedApp.initial_password_temp}</strong></div>
                                
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                                  <button 
                                    onClick={() => {
                                      const text = `🎉 أهلاً بك شريكنا العزيز بـ BoostX!\nتم قبول انضمام فرعك الموقر بنجاح.\nإليك بيانات الدخول بوابتك الرسمية:\n🔗 الرابط: https://boostxadv.com/partner\n👤 اسم المستخدم: ${selectedApp.initial_username}\n🔑 كلمة المرور المؤقتة: ${selectedApp.initial_password_temp}\n💡 يرجى تبديل كلمة المرور بعد أول تسجيل دخول.`;
                                      const phone = selectedApp.whatsapp_number || selectedApp.phone_number || '';
                                      const cleanPhone = phone.replace(/\D/g, '');
                                      window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
                                    }}
                                    style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 8px rgba(16,185,129,0.2)' }}
                                  >
                                    💬 تواصل واتساب
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const text = `🎉 أهلاً بك شريكنا العزيز بـ BoostX!\nتم قبول انضمام فرعك الموقر بنجاح.\nإليك بيانات الدخول بوابتك الرسمية:\n🔗 الرابط: https://boostxadv.com/partner\n👤 اسم المستخدم: ${selectedApp.initial_username}\n🔑 كلمة المرور المؤقتة: ${selectedApp.initial_password_temp}\n💡 يرجى تبديل كلمة المرور بعد أول تسجيل دخول.`;
                                      navigator.clipboard.writeText(text);
                                      alert('تم نسخ رسالة التفعيل والترحيب للـ WhatsApp بنجاح! 📱');
                                    }}
                                    style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 800 }}
                                  >
                                    📋 نسخ الرسالة الترحيبية
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const text = `Subject: تم قبول انضمام متجرك في منصة BoostX!\n\nأهلاً بك شريكنا العزيز.\nتم قبول وتوثيق تراخيصك بنجاح.\n👤 اسم المستخدم: ${selectedApp.initial_username}\n🔑 كلمة المرور المؤقتة: ${selectedApp.initial_password_temp}`;
                                      navigator.clipboard.writeText(text);
                                      alert('تم نسخ رسالة البريد الإلكتروني للمسؤول! ✉️');
                                    }}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 800 }}
                                  >
                                    ✉️ نسخ رسالة الإيميل
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Approval Modal (Credentials Input Modal) */}
            {showApproveModal && selectedApp && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '24px', fontFamily: 'Cairo, sans-serif' }}>
                <div style={{ background: '#181126', border: '1px solid rgba(138,44,255,0.2)', padding: '30px', borderRadius: '24px', maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0 }}>تأكيد اعتماد الشريك وإصدار بيانات الدخول 🔑</h3>
                  
                  <p style={{ fontSize: '0.82rem', color: '#cac4dd', margin: 0, lineHeight: 1.5 }}>
                    عند اعتماد الشريك، سيقوم النظام تلقائياً بإنشاء حساب شريك جديد، وإنشاء الملف التجاري بـ `partners` وتفعيل باقة الاشتراك المحددة.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#aaa3c2', fontWeight: 800 }}>اسم المستخدم الأول (البريد الإلكتروني للنشاط)</label>
                    <input 
                      type="text" 
                      value={initialUsername}
                      onChange={(e) => setInitialUsername(e.target.value)}
                      style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#120b1f', color: 'white', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#aaa3c2', fontWeight: 800 }}>كلمة المرور المؤقتة الموزعة</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        value={initialPasswordTemp}
                        onChange={(e) => setInitialPasswordTemp(e.target.value)}
                        style={{ flexGrow: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#120b1f', color: 'white', fontSize: '0.84rem', fontFamily: 'monospace' }}
                      />
                      <button 
                        onClick={() => setInitialPasswordTemp(Math.random().toString(36).substring(2, 10).toUpperCase())}
                        style={{ background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', color: '#d8b4fe', padding: '0 14px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        توليد 🔑
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                    <button 
                      onClick={() => setShowApproveModal(false)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 20px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={async () => {
                        if (!initialUsername || !initialPasswordTemp) {
                          alert('الرجاء كتابة اسم المستخدم وكلمة المرور لتفعيل الحساب.');
                          return;
                        }
                        setLoading(true);
                        try {
                          // 1. Update partner_applications table
                          const { error: appErr } = await supabase
                            .from('partner_applications')
                            .update({
                              status: 'approved',
                              admin_notes: adminNotes,
                              initial_username: initialUsername,
                              initial_password_temp: initialPasswordTemp,
                              approved_by: '00000000-0000-0000-0000-000000000000',
                              approved_at: new Date().toISOString()
                            })
                            .eq('id', selectedApp.id);
                          if (appErr) throw appErr;

                          // 2. Create profile inside public.partners table
                          const partnerId = 'p-' + Math.random().toString(36).substring(2, 10);
                          const { error: partErr } = await supabase
                            .from('partners')
                            .insert({
                              id: partnerId,
                              name: selectedApp.store_name_ar || selectedApp.business_name,
                              biz_type: selectedApp.selected_plan_id === 'plan_0' ? 'restaurant' : 'premium',
                              city: selectedApp.city,
                              district: selectedApp.district,
                              image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&q=80',
                              is_active: true,
                              whatsapp: selectedApp.whatsapp_number,
                              status: 'approved',
                              owner_id: '00000000-0000-0000-0000-000000000000'
                            });
                          if (partErr) console.error('Error creating partner profile:', partErr);

                          // 3. Create simulated auth user profile in user_profiles
                          await supabase.from('user_profiles').insert({
                            email: initialUsername,
                            role: 'partner',
                            full_name: selectedApp.responsible_person_name
                          });

                          // 4. Log prepared email/whatsapp notification logs
                          await supabase.from('partner_application_notifications').insert([
                            {
                              application_id: selectedApp.id,
                              channel: 'whatsapp',
                              recipient: selectedApp.whatsapp_number || selectedApp.phone_number,
                              message_body: `🎉 تم قبول انضمام فرعك بـ BoostX!\nاسم المستخدم: ${initialUsername}\nكلمة المرور المؤقتة: ${initialPasswordTemp}`,
                              status: 'prepared'
                            },
                            {
                              application_id: selectedApp.id,
                              channel: 'email',
                              recipient: selectedApp.business_email || selectedApp.email,
                              message_body: `تم قبولك كشريك بـ BoostX.\nاسم المستخدم: ${initialUsername}\nكلمة المرور: ${initialPasswordTemp}`,
                              status: 'prepared'
                            }
                          ]);

                          // 5. Create audit logs
                          await supabase.from('audit_logs').insert({
                            action: 'APPROVE_PARTNER_APPLICATION',
                            table_name: 'partner_applications',
                            details: `تم توثيق الشريك (${selectedApp.store_name_ar || selectedApp.business_name}) وصرف بيانات الدخول للبريد ${initialUsername}.`
                          });

                          alert('تم اعتماد وتوثيق الشريك وصرف التراخيص سحابياً بنجاح! 🚀');
                          setShowApproveModal(false);
                          setSelectedApp(null);
                          fetchData();
                        } catch (e: any) {
                          // Sandbox fallback update
                          const updated = partnerApps.map(a => a.id === selectedApp.id ? { 
                            ...a, 
                            status: 'approved', 
                            admin_notes: adminNotes,
                            initial_username: initialUsername,
                            initial_password_temp: initialPasswordTemp,
                            approved_at: new Date().toISOString()
                          } : a);
                          setPartnerApps(updated);
                          localStorage.setItem('BX_SANDBOX_PARTNER_APPS', JSON.stringify(updated));
                          
                          // Simulating table creations in sandbox
                          const savedPartners = JSON.parse(localStorage.getItem('BX_SANDBOX_PARTNERS') || '[]');
                          savedPartners.push({
                            id: 'p-' + Math.random().toString(36).substring(2, 10),
                            name: selectedApp.store_name_ar || selectedApp.business_name,
                            city: selectedApp.city,
                            district: selectedApp.district,
                            whatsapp: selectedApp.whatsapp_number,
                            is_active: true,
                            status: 'approved'
                          });
                          localStorage.setItem('BX_SANDBOX_PARTNERS', JSON.stringify(savedPartners));

                          alert('تنبيه: تم اعتماد الشريك وصرف الحساب محلياً في الـ Sandbox بنجاح! 🚀');
                          setShowApproveModal(false);
                          setSelectedApp(null);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      className="btn btn-primary"
                      style={{ padding: '8px 24px', fontSize: '0.8rem' }}
                    >
                      {loading ? 'جاري الاعتماد...' : 'تأكيد واعتماد الحساب 🚀'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW: إدارة أنواع الأنشطة (Admin-controlled classifications) */}
            {activeNav === 'admin_activity_types' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: 'white', margin: 0 }}>إدارة تصنيفات وأنواع الأنشطة التجارية (Admin Activity Types)</h3>
                    <span style={{ fontSize: '0.74rem', color: 'var(--color-text-muted)', display: 'block', marginTop: '4px' }}>
                      الأنشطة النشطة المحددة هنا تظهر للمتاجر والشركاء الجدد كخيارات عند التسجيل.
                    </span>
                  </div>
                  <button 
                    onClick={() => {
                      setEditingActivity(null);
                      setActivityForm({ name_ar: '', name_en: '', icon: 'Utensils', description: '', sort_order: activityTypes.length + 1 });
                      setShowActivityModal(true);
                    }}
                    className="btn btn-primary" 
                    style={{ padding: '8px 16px', fontSize: '0.76rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={14} /> إضافة نوع نشاط جديد
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.82rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#aaa3c2' }}>
                        <th style={{ padding: '12px' }}>أيقونة النشاط</th>
                        <th style={{ padding: '12px' }}>الاسم بالعربية</th>
                        <th style={{ padding: '12px' }}>الاسم بالإنجليزية</th>
                        <th style={{ padding: '12px' }}>الوصف والمهام</th>
                        <th style={{ padding: '12px' }}>الترتيب فرز</th>
                        <th style={{ padding: '12px' }}>الحالة العامة</th>
                        <th style={{ padding: '12px' }}>حالة التسجيل</th>
                        <th style={{ padding: '12px' }}>إجراءات تعديل</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityTypes.map((act, index) => (
                        <tr key={act.id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px', fontSize: '1.2rem' }}>🍔 {act.icon}</td>
                          <td style={{ padding: '12px', fontWeight: 'bold', color: 'white' }}>{act.name_ar}</td>
                          <td style={{ padding: '12px', color: '#c1bad6' }}>{act.name_en}</td>
                          <td style={{ padding: '12px', color: 'var(--color-text-muted)' }}>{act.description || '-'}</td>
                          <td style={{ padding: '12px' }}>{act.sort_order}</td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={async () => {
                                const newVal = !act.is_active;
                                try {
                                  const { error } = await supabase.from('business_activity_types').update({ is_active: newVal }).eq('id', act.id);
                                  if (!error) {
                                    setActivityTypes(prev => prev.map(a => a.id === act.id ? { ...a, is_active: newVal } : a));
                                  }
                                } catch (e) {
                                  setActivityTypes(prev => prev.map(a => a.id === act.id ? { ...a, is_active: newVal } : a));
                                }
                              }}
                              style={{
                                background: act.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                color: act.is_active ? 'var(--color-success)' : '#f87171',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              {act.is_active ? 'نشط مفعل' : 'معطل بحظر'}
                            </button>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <button
                              onClick={async () => {
                                const newVal = !act.is_registration_open;
                                try {
                                  const { error } = await supabase.from('business_activity_types').update({ is_registration_open: newVal }).eq('id', act.id);
                                  if (!error) {
                                    setActivityTypes(prev => prev.map(a => a.id === act.id ? { ...a, is_registration_open: newVal } : a));
                                  }
                                } catch (e) {
                                  setActivityTypes(prev => prev.map(a => a.id === act.id ? { ...a, is_registration_open: newVal } : a));
                                }
                              }}
                              style={{
                                background: act.is_registration_open ? 'rgba(59,130,246,0.15)' : 'rgba(245,158,11,0.15)',
                                color: act.is_registration_open ? '#60a5fa' : '#fbbf24',
                                border: 'none',
                                padding: '4px 10px',
                                borderRadius: '8px',
                                fontSize: '0.7rem',
                                fontWeight: 800,
                                cursor: 'pointer'
                              }}
                            >
                              {act.is_registration_open ? 'مفتوح للتسجيل' : 'مغلق مؤقتاً'}
                            </button>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button 
                                onClick={() => {
                                  setEditingActivity(act);
                                  setActivityForm({
                                    name_ar: act.name_ar,
                                    name_en: act.name_en,
                                    icon: act.icon,
                                    description: act.description || '',
                                    sort_order: act.sort_order
                                  });
                                  setShowActivityModal(true);
                                }}
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                تعديل
                              </button>
                              <button 
                                onClick={async () => {
                                  if (confirm('هل أنت متأكد من حذف هذا النشاط؟')) {
                                    try {
                                      await supabase.from('business_activity_types').delete().eq('id', act.id);
                                    } catch (e) {}
                                    setActivityTypes(prev => prev.filter(a => a.id !== act.id));
                                  }
                                }}
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                حذف
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Activity Type Edit/Add Modal */}
            {showActivityModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000, padding: '24px', fontFamily: 'Cairo, sans-serif' }}>
                <div style={{ background: '#181126', border: '1px solid rgba(138,44,255,0.2)', padding: '30px', borderRadius: '24px', maxWidth: '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'white', margin: 0 }}>
                    {editingActivity ? 'تعديل بيانات تصنيف النشاط ⚙️' : 'إضافة تصنيف نشاط جديد 🚀'}
                  </h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#aaa3c2', fontWeight: 800 }}>الاسم بالعربية *</label>
                      <input 
                        type="text" 
                        value={activityForm.name_ar}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, name_ar: e.target.value }))}
                        placeholder="مثال: مخبز وحلويات"
                        style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#120b1f', color: 'white', fontSize: '0.84rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#aaa3c2', fontWeight: 800 }}>الاسم بالإنجليزية *</label>
                      <input 
                        type="text" 
                        value={activityForm.name_en}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, name_en: e.target.value }))}
                        placeholder="Bakery"
                        style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#120b1f', color: 'white', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '14px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#aaa3c2', fontWeight: 800 }}>أيقونة التبويب (Lucide Name/Emoji)</label>
                      <input 
                        type="text" 
                        value={activityForm.icon}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, icon: e.target.value }))}
                        placeholder="Utensils / Bread"
                        style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#120b1f', color: 'white', fontSize: '0.84rem' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.8rem', color: '#aaa3c2', fontWeight: 800 }}>ترتيب الفرز</label>
                      <input 
                        type="number" 
                        value={activityForm.sort_order}
                        onChange={(e) => setActivityForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 1 }))}
                        style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#120b1f', color: 'white', fontSize: '0.84rem' }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', color: '#aaa3c2', fontWeight: 800 }}>وصف مبسط للمستخدمين</label>
                    <input 
                      type="text" 
                      value={activityForm.description}
                      onChange={(e) => setActivityForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="محلات بيع الخبز والحلويات الطازجة فروع..."
                      style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#120b1f', color: 'white', fontSize: '0.84rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '15px' }}>
                    <button 
                      onClick={() => setShowActivityModal(false)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '8px 20px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer' }}
                    >
                      إلغاء
                    </button>
                    <button 
                      onClick={async () => {
                        if (!activityForm.name_ar || !activityForm.name_en) {
                          alert('الرجاء ملء الحقول الإجبارية للنشاط.');
                          return;
                        }
                        try {
                          if (editingActivity) {
                            // Update
                            await supabase.from('business_activity_types').update({
                              name_ar: activityForm.name_ar,
                              name_en: activityForm.name_en,
                              icon: activityForm.icon,
                              description: activityForm.description,
                              sort_order: activityForm.sort_order
                            }).eq('id', editingActivity.id);

                            setActivityTypes(prev => prev.map(a => a.id === editingActivity.id ? { ...a, ...activityForm } : a));
                          } else {
                            // Create new
                            const newActId = Math.random().toString(36).substring(2, 12);
                            const payload = {
                              id: newActId,
                              ...activityForm,
                              is_active: true,
                              is_registration_open: true
                            };
                            await supabase.from('business_activity_types').insert(payload);
                            setActivityTypes(prev => [...prev, payload].sort((a,b) => a.sort_order - b.sort_order));
                          }
                          alert('تم حفظ تصنيف النشاط بنجاح! 🚀');
                          setShowActivityModal(false);
                          fetchData();
                        } catch (e) {
                          alert('حدث خطأ في الاتصال، تم الحفظ محلياً.');
                          setShowActivityModal(false);
                        }
                      }}
                      className="btn btn-primary"
                      style={{ padding: '8px 24px', fontSize: '0.8rem' }}
                    >
                      حفظ النشاط التجاري 🚀
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB VIEW 20: كل طلبات المنصة */}
            {activeNav === 'admin_orders_all' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>جميع طلبات الشحن والتوصيل المسجلة بالمنصة</h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        <th style={{ padding: '12px' }}>رقم الطلب</th>
                        <th style={{ padding: '12px' }}>العميل الهاتف</th>
                        <th style={{ padding: '12px' }}>موقع الاستلام</th>
                        <th style={{ padding: '12px' }}>موقع التسليم</th>
                        <th style={{ padding: '12px' }}>رسوم التوصيل</th>
                        <th style={{ padding: '12px' }}>الحالة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '12px', fontWeight: 'bold' }}>#{o.id?.substring(0, 8)}</td>
                          <td style={{ padding: '12px' }}>{o.customer_name} ({o.customer_phone})</td>
                          <td style={{ padding: '12px' }}>{o.pickup_location?.substring(0, 20)}...</td>
                          <td style={{ padding: '12px' }}>{o.dropoff_location?.substring(0, 20)}...</td>
                          <td style={{ padding: '12px', color: 'var(--color-accent-light)', fontWeight: 900 }}>{o.delivery_fee || 12} ر.س</td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: '0.72rem', background: 'rgba(168,85,247,0.15)', color: 'var(--color-accent-light)', padding: '4px 10px', borderRadius: 8 }}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB VIEW 21: الطلبات الجارية والنشطة */}
            {activeNav === 'admin_orders_active' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>مراقبة الطلبات النشطة والجارية لحظة بلحظة</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                  {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').map(o => (
                    <div key={o.id} style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 14 }}>
                      <strong style={{ fontSize: '0.85rem', display: 'block' }}>طلب رقم #{o.id?.substring(0, 8)}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', margin: '4px 0' }}>العميل: {o.customer_name}</span>
                      <span style={{ fontSize: '0.72rem', color: 'white', display: 'block' }}>الحالة الحالية: <strong>{o.status}</strong></span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--color-accent-light)', display: 'block', marginTop: 4 }}>السائق: {o.driver_name || 'بانتظار قبول السائق 🛵'}</span>
                    </div>
                  ))}
                  {orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-text-muted)', width: '100%', gridColumn: '1/-1' }}>لا توجد طلبات جارية نشطة حالياً في المنصة.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB VIEW 23: دليل مناديب التوصيل */}
            {activeNav === 'admin_drivers' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 16 }}>دليل وطلبات توثيق مناديب التوصيل المعتمدين بالمنصة</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {driverApps.map(drv => (
                    <div key={drv.id} style={{ padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '0.92rem' }}>{drv.full_name}</strong>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>الهاتف: {drv.phone_number} • المركبة: {drv.vehicle_type} ({drv.license_plate})</p>
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {drv.status !== 'verified' ? (
                          <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleApproveDriver(drv.id)}>توثيق واعتماد</button>
                        ) : (
                          <span style={{ fontSize: '0.72rem', background: 'rgba(16,185,129,0.15)', color: 'var(--color-success)', padding: '4px 12px', borderRadius: 8 }}>موثق ومعتمد ✅</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB VIEW 24: خريطة التتبع GPS */}
            {activeNav === 'admin_order_tracking' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: 8 }}>تتبع مواقع المناديب والطلبات الجارية لحظياً عبر الخريطة</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 20 }}>محاكاة إحداثيات GPS المحدثة لحظياً بواسطة السائقين على الخريطة الجغرافية بمدينة الرياض.</p>
                
                <div style={{ height: '350px', background: '#170d2b', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, position: 'relative', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(18,11,31,0.9)', padding: 12, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', zIndex: 10 }}>
                    <strong>مفتاح المحاكي:</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-success)' }}></div>
                      <span>سائق متصل (أحمد محمد)</span>
                    </div>
                  </div>
                  
                  {/* Grid Lines simulation */}
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.1, backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  
                  <span style={{ fontSize: '1.2rem', color: 'var(--color-accent-light)', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold' }}>📍 خريطة الرياض الذكية النشطة</span>
                  
                  {/* Driver Node Simulation */}
                  <motion.div 
                    animate={{ y: [0, -10, 0], x: [0, 20, 0] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(16,185,129,0.2)', border: '2px solid var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'absolute', top: '40%', left: '35%', cursor: 'pointer' }}
                  >
                    🛵
                  </motion.div>
                </div>
              </div>
            )}

            {/* TAB VIEW 31: إعدادات عامة */}
            {activeNav === 'admin_settings_general' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>تكوين وإعدادات المنصة والتحكم العليا بقيم النظام</h3>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رابط خادم الاتصال بـ Supabase API URL</label>
                  <input type="text" className="input-field" value={supabase.supabaseUrl || 'https://mock.supabase.co'} readOnly />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>نصف قطر التغطية والتوصيل الافتراضي (كم)</label>
                  <input type="number" className="input-field" defaultValue={25} />
                </div>
                <button className="btn btn-primary" onClick={() => alert('تم حفظ التكوينات العامة للمنصة بنجاح!')} style={{ alignSelf: 'flex-start', padding: '10px 20px', fontSize: '0.82rem' }}>حفظ التعديلات</button>
              </div>
            )}

            {/* TAB VIEW: تذاكر الدعم الفني والشكاوى (admin_complaints) */}
            {activeNav === 'admin_complaints' && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>🎫 تذاكر الدعم الفني والشكاوى الواردة</h3>
                    <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>إدارة شكاوى العملاء واستفسارات المتاجر والشركاء مع إمكانية الرد المباشر</span>
                  </div>
                  <button 
                    onClick={() => {
                      const saved = localStorage.getItem('BX_SANDBOX_SUPPORT_TICKETS');
                      if (saved) {
                        setSupportTickets(JSON.parse(saved));
                      }
                      alert('✓ تم تحديث ومزامنة قائمة التذاكر!');
                    }} 
                    className="btn btn-secondary" 
                    style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <RefreshCw size={13} style={{ marginRight: 4 }} /> تحديث القائمة
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {supportTickets.map(t => {
                    const isChatActive = activeTicketId === t.id;
                    const messages = ticketMessages[t.id] || [
                      { id: 'smsg-1', sender_role: 'system', sender_name: 'النظام', message_text: t.description || 'تم استلام تذكرتك وجاري تحويلها للقسم المختص.', created_at: t.created_at }
                    ];
                    
                    return (
                      <div key={t.id} style={{ padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <span style={{ fontSize: '0.62rem', background: 'rgba(168,85,247,0.15)', color: '#a855f7', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              {t.issue_type || t.category || 'عام'}
                            </span>
                            <strong style={{ fontSize: '0.85rem', display: 'block', marginTop: 4 }}>تذكرة #{t.id} • {t.customer_name || 'شريك'}</strong>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <span style={{
                              fontSize: '0.68rem',
                              color: t.status === 'open' ? '#f59e0b' : '#10b981',
                              fontWeight: 'bold'
                            }}>
                              {t.status === 'open' ? '⏳ مفتوحة' : '✓ مغلقة ومحلولة'}
                            </span>
                            
                            <button
                              onClick={() => {
                                const next = t.status === 'open' ? 'closed' : 'open';
                                const updated = supportTickets.map(item => item.id === t.id ? { ...item, status: next } : item);
                                setSupportTickets(updated);
                                localStorage.setItem('BX_SANDBOX_SUPPORT_TICKETS', JSON.stringify(updated));
                                alert(next === 'closed' ? 'تم حل وتصفية التذكرة بنجاح!' : 'تم إعادة فتح التذكرة.');
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.68rem' }}
                            >
                              {t.status === 'open' ? 'إغلاق وحل التذكرة' : 'إعادة فتح التذكرة'}
                            </button>
                            
                            <button
                              onClick={() => {
                                setActiveTicketId(isChatActive ? null : t.id);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '4px 10px', fontSize: '0.68rem' }}
                            >
                              {isChatActive ? 'إغلاق المحادثة' : '💬 الرد والتحدث'}
                            </button>
                          </div>
                        </div>

                        <p style={{ fontSize: '0.78rem', color: 'var(--color-text-main)', margin: '4px 0' }}>
                          📝 <strong>شرح المشكلة:</strong> {t.description || t.title}
                        </p>
                        
                        {isChatActive && (
                          <div style={{ marginTop: 14, padding: 14, background: 'rgba(0,0,0,0.2)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                            <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 'bold' }}>محادثة التدقيق والدعم لتذكرة #{t.id}</span>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: '200px', overflowY: 'auto' }} className="no-scrollbar">
                              {messages.map(msg => (
                                <div key={msg.id} style={{
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  background: msg.sender_role === 'admin' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                                  alignSelf: msg.sender_role === 'admin' ? 'flex-end' : 'flex-start',
                                  fontSize: '0.72rem',
                                  maxWidth: '90%'
                                }}>
                                  <strong>{msg.sender_name || 'مرسل'}:</strong> {msg.message_text}
                                </div>
                              ))}
                            </div>

                            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                              <input
                                type="text"
                                className="input-field"
                                placeholder="اكتب رد الدعم الرسمي هنا..."
                                style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                                value={adminReplyText}
                                onChange={e => setAdminReplyText(e.target.value)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSendAdminReply(t.id);
                                }}
                              />
                              <button
                                onClick={() => handleSendAdminReply(t.id)}
                                className="btn btn-primary"
                                style={{ padding: '0 16px', fontSize: '0.72rem' }}
                              >
                                إرسال الرد
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {supportTickets.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text-muted)' }}>لا توجد تذاكر دعم فني مفتوحة حالياً.</div>
                  )}
                </div>
              </div>
            )}

            {/* FALLBACK VIEW FOR STATIC PAGES */}
            {!['admin_home', 'admin_notifications', 'admin_kpis', 'admin_app_homepage', 'admin_banners', 'admin_sections', 'admin_categories', 'admin_stories', 'admin_sponsored_products', 'admin_flash_offers', 'admin_coupons', 'admin_push_notifications', 'admin_rewards', 'admin_partners', 'admin_partner_join_requests', 'admin_activity_types', 'admin_orders_all', 'admin_orders_active', 'admin_drivers', 'admin_order_tracking', 'admin_settings_general', 'admin_complaints'].includes(activeNav) && (
              <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 24, borderRadius: 20, textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: 8 }}>هذه الصفحة قيد التحضير المباشر ⚙️</h3>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.84rem' }}>أنت تنظر حالياً إلى واجهة مستعرض المجموعات. سيتم تزويدها ببيانات إضافية تدريجياً.</p>
              </div>
            )}

          </main>

          {/* PERSISTENT PHONE DEVICE LIVE MOCKUP (Wow Factor!) */}
          <div style={{ width: '310px', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.05)', background: 'rgba(18,11,31,0.3)', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', position: 'sticky', top: 0 }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--color-accent-light)', marginBottom: 12, fontWeight: 900 }}>📱 معاينة حية كتطبيق العميل الجوال</span>
            
            {/* Phone shell container */}
            <div style={{ width: '270px', height: '520px', border: '8px solid rgba(255,255,255,0.1)', borderRadius: '36px', background: '#090412', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
              
              {/* Phone Speaker & Notch */}
              <div style={{ width: '100px', height: '18px', background: '#120b1f', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '40px', height: '3px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }}></div>
              </div>

              {/* Status bar */}
              <div style={{ height: '30px', padding: '0 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.62rem', color: 'white', marginTop: '4px', zIndex: 99 }}>
                <span>9:41 AM</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <span>📶</span>
                  <span>🔋</span>
                </div>
              </div>

              {/* App screen space */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 14 }} className="no-scrollbar">
                
                {/* Logo & Header in mobile app mockup */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '0.9rem', color: 'white' }}>بوست إكس BoostX</strong>
                  <span style={{ fontSize: '0.8rem' }}>🛒</span>
                </div>

                {/* Banner Carousel Preview */}
                {banners.filter(x => x.active).length > 0 && (
                  <div style={{ height: '90px', borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <img 
                      src={banners.filter(x => x.active)[0]?.image} 
                      alt="Banner Preview" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                    <div style={{ position: 'absolute', bottom: 0, insetInline: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.8))', padding: '6px', fontSize: '0.65rem', color: 'white', fontWeight: 'bold' }}>
                      {banners.filter(x => x.active)[0]?.title}
                    </div>
                  </div>
                )}

                {/* Stories Preview */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="no-scrollbar">
                  {stories.filter(x => x.approved).map((st, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '50%', border: '2px solid #a855f7', padding: '1px', overflow: 'hidden' }}>
                        <img src={st.image} alt={st.store} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <span style={{ fontSize: '0.52rem', color: 'rgba(255,255,255,0.8)' }}>{st.store}</span>
                    </div>
                  ))}
                </div>

                {/* Category Grid Preview */}
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: 6 }}>التصنيفات الرئيسية</span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                    {categories.filter(c => c.is_active).slice(0, 4).map((cat, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                        <span style={{ fontSize: '0.8rem' }}>
                          {cat.id === 'food' ? '🍗' : cat.id === 'pharmacy' ? '💊' : cat.id === 'supermarket' ? '🛒' : '🏠'}
                        </span>
                        <span style={{ fontSize: '0.5rem', color: 'white', textAlign: 'center' }}>{cat.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sponsored Products Preview */}
                <div>
                  <span style={{ fontSize: '0.68rem', fontWeight: 'bold', color: 'white', display: 'block', marginBottom: 6 }}>منتجات ممولة مميزة</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {sponsoredProducts.filter(x => x.is_active).slice(0, 2).map((sp, idx) => (
                      <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, overflow: 'hidden' }}>
                        <img src={sp.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80'} alt={sp.title} style={{ width: '100%', height: '55px', objectFit: 'cover' }} />
                        <div style={{ padding: 6 }}>
                          <span style={{ fontSize: '0.52rem', fontWeight: 'bold', color: 'white', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sp.title}</span>
                          <span style={{ fontSize: '0.5rem', color: 'var(--color-success)', fontWeight: 'bold' }}>{sp.new_price || 15} ر.س</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>

      {/* CREATE MODAL: BANNERS */}
      {showAddBannerModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleAddBanner} style={{ background: '#1c0f33', border: '1px solid rgba(168,85,247,0.4)', padding: 24, borderRadius: 20, width: '420px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'white' }}>إضافة بنر إعلاني ترويجي جديد</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>عنوان البنر الرئيسي</label>
              <input type="text" className="input-field" placeholder="مثال: خصم ٥٠٪ على أول طلب" value={newBanner.title} onChange={e => setNewBanner({ ...newBanner, title: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رابط صورة البنر (Image URL)</label>
              <input type="text" className="input-field" placeholder="أدخل رابط صورة جذابة ومحسنة..." value={newBanner.image} onChange={e => setNewBanner({ ...newBanner, image: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>مسار توجيه النقرة (Route Path)</label>
              <input type="text" className="input-field" placeholder="مثال: /promos" value={newBanner.route} onChange={e => setNewBanner({ ...newBanner, route: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>إضافة ونشر</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, color: 'white' }} onClick={() => setShowAddBannerModal(false)}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE MODAL: COUPONS */}
      {showAddCouponModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleAddCoupon} style={{ background: '#1c0f33', border: '1px solid rgba(168,85,247,0.4)', padding: 24, borderRadius: 20, width: '400px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'white' }}>إضافة كود خصم كوبون جديد</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رمز الكوبون (Coupon Code)</label>
              <input type="text" className="input-field" placeholder="مثال: BOOSTX50" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>قيمة ونوع الخصم</label>
              <input type="text" className="input-field" placeholder="مثال: ٥٠٪ أو ٢٥ ر.س" value={newCoupon.discount} onChange={e => setNewCoupon({ ...newCoupon, discount: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>الحد الأدنى للإنفاق</label>
              <input type="text" className="input-field" placeholder="مثال: ٨٠ ر.س" value={newCoupon.minSpend} onChange={e => setNewCoupon({ ...newCoupon, minSpend: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>إنشاء الكوبون</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, color: 'white' }} onClick={() => setShowAddCouponModal(false)}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE MODAL: REWARDS */}
      {showAddRewardModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleAddReward} style={{ background: '#1c0f33', border: '1px solid rgba(168,85,247,0.4)', padding: 24, borderRadius: 20, width: '400px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'white' }}>إضافة مكافأة ولاء جديدة</h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>عنوان الجائزة أو الخدمة المستردة</label>
              <input type="text" className="input-field" placeholder="مثال: وجبة بطاطس مجانية" value={newReward.title} onChange={e => setNewReward({ ...newReward, title: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>تكلفة الاسترداد بالنقاط</label>
              <input type="number" className="input-field" value={newReward.cost} onChange={e => setNewReward({ ...newReward, cost: Number(e.target.value) })} required />
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>إضافة الجائزة</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, color: 'white' }} onClick={() => setShowAddRewardModal(false)}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Grid, Clock, Plus, DollarSign, Settings, Heart, Star, MapPin, Upload, 
  FileText, CheckCircle, Gift, ArrowRight, Home, Users, MessageSquare, AlertTriangle, 
  HelpCircle, UserCheck, ShieldCheck, ShoppingCart, Percent, Tag, Zap, Play, Wallet, 
  Activity, ClipboardList, ChevronDown, ChevronUp, Search, Trash2, Edit3, Eye, Power, Check, X,
  XCircle, Award, Lock, Printer, Smartphone, Sliders, Send, TrendingUp, UserPlus, Store, Bell, EyeOff, Info, RefreshCw
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
  // Resolve active partner session from LocalStorage
  const getPartnerSession = () => {
    const saved = localStorage.getItem('BX_SANDBOX_SESSION');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user && parsed.user.role === 'partner') {
          return parsed.user;
        }
      } catch (e) {}
    }
    return { id: 'p1', name: 'مطعم البيك - الشريك المعتمد', email: 'partner@boostx.sa' };
  };

  const currentSessionUser = getPartnerSession();
  const partnerId = currentSessionUser.id || 'p1';

  // State definitions
  const [activeTab, setActiveTab] = useState(defaultTab || 'partner_home');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    overview: false,
    storefront: false,
    catalog: false,
    marketing: false,
    comms_financials: false
  });

  // Simulator Settings (Subscription Plans)
  const [partnerPlan, setPartnerPlan] = useState<number>(() => {
    const saved = localStorage.getItem(`bx_partner_plan_${partnerId}`);
    return saved ? parseInt(saved) : 3000; // Default to Pro Plan 3000
  });

  // 1. Store Status & Settings
  const [storeStatus, setStoreStatus] = useState<'open' | 'closed' | 'busy'>('open');
  const [workHoursStart, setWorkHoursStart] = useState('09:00 ص');
  const [workHoursEnd, setWorkHoursEnd] = useState('11:30 م');
  const [restDays, setRestDays] = useState<string[]>(['الجمعة']);
  const [prepTimeMin, setPrepTimeMin] = useState(15);
  const [prepTimeMax, setPrepTimeMax] = useState(30);
  const [delTimeMin, setDelTimeMin] = useState(25);
  const [delTimeMax, setDelTimeMax] = useState(45);
  const [deliveryZones, setDeliveryZones] = useState('الرياض، حي الياسمين، حي الصحافة، حي الملقا');
  const [minOrder, setMinOrder] = useState(20);
  const [deliveryFee, setDeliveryFee] = useState(12);
  const [isAppVisible, setIsAppVisible] = useState(true);

  // 2. Commercial Details & Store Identity
  const [storeName, setStoreName] = useState('مطعم البيك - الشريك');
  const [category, setCategory] = useState('مطاعم');
  const [storeBio, setStoreBio] = useState('أشهى المأكولات والوجبات السريعة والمسحب المقرمش مع خلطة البيك السرية.');
  const [logoEmoji, setLogoEmoji] = useState('🍔');
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80');
  const [phone, setPhone] = useState('0512345678');
  const [whatsapp, setWhatsapp] = useState('966512345678');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('https://maps.google.com/?q=24.7136,46.6753');
  const [address, setAddress] = useState('طريق الملك عبدالعزيز، حي الصحافة');
  const [city, setCity] = useState('الرياض');
  const [district, setDistrict] = useState('الصحافة');
  const [crNumber, setCrNumber] = useState('1010895421');
  const [vatNumber, setVatNumber] = useState('310245678900003');
  const [managerName, setManagerName] = useState('خالد عبدالرحمن السديري');
  const [email, setEmail] = useState('contact@albaik-partner.sa');
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected'>('approved');
  const [uploadedDocs, setUploadedDocs] = useState<string[]>(['السجل التجاري.pdf', 'الشهادة الضريبية.pdf']);

  // 3. Products, Menu & Addons
  const [menuCategories, setMenuCategories] = useState<any[]>([
    { id: 'cat-1', name: 'الوجبات العائلية', order: 1 },
    { id: 'cat-2', name: 'ساندوتشات', order: 2 },
    { id: 'cat-3', name: 'المقبلات والصلصات', order: 3 },
    { id: 'cat-4', name: 'المشروبات', order: 4 }
  ]);
  const [products, setProducts] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([
    { id: 'add-1', name: 'إضافة جبنة شيدر سائحة', price: 3, category: 'الإضافات الاختيارية', max_choices: 2, required: false },
    { id: 'add-2', name: 'حجم عائلي كبير', price: 8, category: 'الحجم', max_choices: 1, required: true },
    { id: 'add-3', name: 'صوص الثوم الحار المميز', price: 1.5, category: 'الصلصات', max_choices: 3, required: false },
    { id: 'add-4', name: 'درجة الحرارة: حار جدًا 🔥', price: 0, category: 'مستوى الفلفل', max_choices: 1, required: true }
  ]);

  // 4. Orders & Realtime Sync
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null); // For receipt print modal
  const [activeChatOrder, setActiveChatOrder] = useState<any>(null); // To switch context

  // 5. Abandoned Carts
  const [abandonedCarts, setAbandonedCarts] = useState<any[]>([
    { id: 'cart-1', customer_name: 'سارة الهذلول', phone: '0567789452', items: 'مسحب دجاج (١٠ قطع)، صوص كوكتيل', date: 'منذ ساعتين', value: 38 },
    { id: 'cart-2', customer_name: 'ماجد الحربي', phone: '0554412356', items: 'برجر زنجر سوبريم، بطاطا حجم عائلي، بيبسي كبير', date: 'منذ ٤ ساعات', value: 49 },
    { id: 'cart-3', customer_name: 'نورة العتيبي', phone: '0544889977', items: 'ساندوتش دجاج مسحب، عصير برتقال طبيعي', date: 'أمس الساعة ٧ م', value: 24 }
  ]);

  // 6. Marketing, Coupons, Flash, Stories
  const [flashOffers, setFlashOffers] = useState<any[]>([
    { id: 'flash-1', title: 'خصم نصف السعر على وجبة المسحب', product: 'مسحب دجاج كبير', discount: 50, qty_limit: 100, active: true, status: 'approved', expires_at: new Date(Date.now() + 3600000 * 4).toISOString() }
  ]);
  const [coupons, setCoupons] = useState<any[]>([
    { id: 'coup-1', code: 'BAIK20', value: '20%', type: 'percentage', min_order: 50, usage_count: 142, expiry: '2026-08-30' },
    { id: 'coup-2', code: 'FREEFEED', value: '15 ر.س', type: 'fixed', min_order: 100, usage_count: 67, expiry: '2026-06-15' }
  ]);
  const [stories, setStories] = useState<any[]>([
    { id: 'story-1', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80', product_id: 'prod-1', clicks: 421, status: 'approved' }
  ]);
  const [campaigns, setCampaigns] = useState<any[]>([
    { id: 'camp-1', name: 'حملة العيد الكبرى للمأكولات العائلية', target: 'بنر رئيسي بالتطبيق', budget: 1500, duration: 7, status: 'active', city: 'الرياض' },
    { id: 'camp-2', name: 'ترويج وجبة البرجر الجديدة', target: 'توب ليست في التطبيق', budget: 800, duration: 5, status: 'pending_review', city: 'الرياض' }
  ]);

  // 7. Chats and Support Tickets
  const [chats, setChats] = useState<any[]>([
    { id: 'chat-1', user_name: 'سليمان المطيري', last_msg: 'يا أخي الطلب متأخر والمندوب ما يتحرك بالخريطة!', time: 'منذ ١٠ د', unread: true, role: 'customer' },
    { id: 'chat-2', user_name: 'أحمد اليوسف (مندوب التوصيل)', last_msg: 'أنا واقف عند باب المتجر لاستلام الطلب رقم #202', time: 'منذ دقيقة', unread: false, role: 'driver' }
  ]);
  const [supportTickets, setSupportTickets] = useState<any[]>([
    { id: 'TKT-991', category: 'حساب وماليات', description: 'يوجد فروقات بقيمة العمولات المستقطعة من طلبين بتاريخ ٢٤ مايو', priority: 'high', status: 'open', created_at: new Date().toISOString() },
    { id: 'TKT-985', category: 'الكتالوج والمنيو', description: 'الرجاء إضافة تصنيف صيدلية الأدوية لفرعنا الثاني', priority: 'medium', status: 'closed', created_at: new Date(Date.now() - 3600000 * 48).toISOString() }
  ]);
  const [activeTicketChat, setActiveTicketChat] = useState<string | null>(null);
  const [newTicketMessage, setNewTicketMessage] = useState('');
  const [ticketMessages, setTicketMessages] = useState<Record<string, any[]>>({
    'TKT-991': [
      { id: 'msg-1', sender_role: 'system', sender_name: 'النظام', message_text: 'تم فتح التذكرة بنجاح وجاري تحويلها لقسم التدقيق المالي.', created_at: new Date().toISOString() }
    ]
  });

  // Modal / Form Controllers
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '', price: '', discountPrice: '', descShort: '', descLong: '', stock: '50', categoryId: 'cat-1', prepTime: '20', isFeatured: false, isSponsored: false, images: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80'
  });

  // Form states for creators
  const [couponForm, setCouponForm] = useState({ code: '', type: 'percentage', value: '15', minOrder: '40', expiry: '2026-12-31' });
  const [flashForm, setFlashForm] = useState({ title: '', product: 'مسحب دجاج كبير', discount: '30', qty: '50', hours: '6' });
  const [campaignForm, setCampaignForm] = useState({ name: '', target: 'توب ليست في التطبيق', budget: '1000', duration: '5', city: 'الرياض' });
  const [supportForm, setSupportForm] = useState({ category: 'كتالوج ومبيعات', priority: 'medium', description: '' });

  // Load Initial Info
  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const { data, error } = await supabase
          .from('partners')
          .select('*')
          .eq('id', partnerId)
          .single();
        if (!error && data) {
          setStoreStatus(data.is_active ? 'open' : 'closed');
          setStoreName(data.name);
          setCategory(data.category || 'مطاعم');
          if (data.image) setCoverUrl(data.image);
        }
      } catch (err) {
        console.error('Using sandbox partner details.');
      }
    };
    fetchPartner();

    // Subscribe to partners realtime updates
    const partnerChannel = supabase.channel(`realtime_partner_portal:${partnerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'partners', filter: `id=eq.${partnerId}` }, (payload: any) => {
        if (payload.new) {
          setStoreStatus(payload.new.is_active ? 'open' : 'closed');
          setStoreName(payload.new.name);
        }
      })
      .subscribe();

    return () => {
      partnerChannel.unsubscribe();
    };
  }, [partnerId]);

  // Load Products & Orders
  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('partner_id', partnerId);
      if (!error && data) {
        setProducts(data);
      } else {
        // Fallback mock products
        setProducts([
          { id: 'prod-1', name: 'مسحب دجاج كبير (١٠ قطع)', price: '٢٦ ر.س', discount_price: '٢٢ ر.س', description: 'قطع مسحب الدجاج الذهبي المقرمش يقدم مع البطاطس وصلصة الثوم.', prep_time: 15, is_active: true, is_featured: true, category_id: 'cat-1', stock: 45, is_sponsored: false },
          { id: 'prod-2', name: 'برجر دجاج البيك العملاق', price: '١٨ ر.س', discount_price: null, description: 'صدر دجاج مقلي ومتبل بخلطة البيك مع جبن وخس وطماطم وصوص خاص.', prep_time: 12, is_active: true, is_featured: true, category_id: 'cat-2', stock: 80, is_sponsored: false },
          { id: 'prod-3', name: 'ساندوتش فليت سمك حار', price: '١٥ ر.س', discount_price: null, description: 'سمك فليت ذهبي حار يقدم بخبز الصاج الطازج مع مخلل وصوص تارتار.', prep_time: 10, is_active: false, is_featured: false, category_id: 'cat-2', stock: 0, is_sponsored: false },
          { id: 'prod-4', name: 'بطاطس البيك الشهيرة بالبهارات', price: '٧ ر.س', discount_price: null, description: 'أصابع بطاطس مقلية ذهبية مبهرة ببهارات البيك الخاصة.', prep_time: 5, is_active: true, is_featured: false, category_id: 'cat-3', stock: 150, is_sponsored: false }
        ]);
      }
    } catch (err) {
      console.error('Products load fallback active.');
    }
  };

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('partner_id', partnerId);
      if (!error && data) {
        setOrders(data);
      } else {
        // Mock orders
        setOrders([
          { id: 'order-101', customer_name: 'سليمان المطيري', customer_phone: '0555678129', customer_address: 'حي الياسمين، شارع العليا، فيلا ٢', items: 'مسحب دجاج كبير (١) • بطاطس مبهرة (٢)', price_total: 40, commission: 4, net_earnings: 36, payment_method: 'مدى إلكتروني', status: 'pending', created_at: new Date(Date.now() - 300000).toISOString(), notes: 'الرجاء زيادة الثوم وتوصيل مسحب حار جداً.' },
          { id: 'order-102', customer_name: 'عبدالله السديري', customer_phone: '0533324567', customer_address: 'حي الملقا، شارع الأمير تركي، شقة ٥', items: 'برجر دجاج البيك العملاق (٢) • بيبسي وسط (٢)', price_total: 46, commission: 4.6, net_earnings: 41.4, payment_method: 'الدفع عند الاستلام', status: 'preparing', created_at: new Date(Date.now() - 1200000).toISOString(), notes: 'بدون بصل وبدون كاتشب.' },
          { id: 'order-103', customer_name: 'أمل العتيبي', customer_phone: '0544127890', customer_address: 'حي الصحافة، خلف مبنى البلدية', items: 'ساندوتش فليت سمك حار (١) • عصير تفاح (١)', price_total: 22, commission: 2.2, net_earnings: 19.8, payment_method: 'فيزا عبر الإنترنت', status: 'completed', created_at: new Date(Date.now() - 3600000 * 3).toISOString(), notes: '' }
        ]);
      }
    } catch (err) {
      console.error('Orders load fallback active.');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();

    const ordersChannel = supabase.channel(`realtime_orders_dash:${partnerId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `partner_id=eq.${partnerId}` }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      ordersChannel.unsubscribe();
    };
  }, [partnerId]);

  // Subscription Plan Locker checker
  const isFeatureUnlocked = (tabId: string) => {
    if (['partner_flash', 'partner_coupons', 'partner_stories'].includes(tabId)) {
      return partnerPlan >= 2000;
    }
    if (['partner_abandoned_carts', 'partner_campaigns', 'partner_sponsored_products'].includes(tabId)) {
      return partnerPlan >= 3000;
    }
    return true;
  };

  const handleSavePlanUpgrade = (newPlan: number) => {
    setPartnerPlan(newPlan);
    localStorage.setItem(`bx_partner_plan_${partnerId}`, newPlan.toString());
    alert(`💡 تم تغيير الخطة تجريبياً إلى: ${
      newPlan === 1000 ? 'الأساسية (1000)' :
      newPlan === 2000 ? 'النمو (2000)' :
      newPlan === 3000 ? 'الاحترافية (3000)' : 'التميز (5000)'
    } - تم تحديث قيود لوحة التحكم فوراً!`);
  };

  // State update handlers
  const handleUpdateStoreStatus = async (status: 'open' | 'closed' | 'busy') => {
    setStoreStatus(status);
    try {
      const active = status === 'open';
      await supabase
        .from('partners')
        .update({ is_active: active })
        .eq('id', partnerId);
    } catch (e) {}
    alert(`🟢 تم تعديل حالة المتجر فورياً بداخل تطبيق العميل إلى: ${
      status === 'open' ? 'يستقبل طلبات (مفتوح)' :
      status === 'busy' ? 'مزدحم مؤقتاً' : 'مغلق حالياً'
    }`);
  };

  const handleUpdateOrderStatus = async (orderId: string, nextStatus: string) => {
    try {
      await supabase
        .from('orders')
        .update({ status: nextStatus })
        .eq('id', orderId);
    } catch (e) {}
    
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));
    alert(`📦 تم تحديث حالة الطلب #${orderId.substring(0,8)} بنجاح إلى: ${
      nextStatus === 'preparing' ? 'قيد التحضير 🍳' :
      nextStatus === 'ready_for_pickup' ? 'جاهز للتوصيل 🚴' :
      nextStatus === 'out_for_delivery' ? 'خرج مع المندوب 🚚' :
      nextStatus === 'completed' ? 'تم اكتماله ومسلم ✅' : 'ملغى ❌'
    }`);
  };

  const toggleProductActive = async (prodId: string, current: boolean) => {
    setProducts(prev => prev.map(p => p.id === prodId ? { ...p, is_active: !current } : p));
    try {
      await supabase
        .from('products')
        .update({ is_active: !current })
        .eq('id', prodId);
    } catch (e) {}
  };

  // CRUD Actions
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) return alert('يرجى ملء الاسم والسعر!');
    
    if (editingProduct) {
      // Update
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: productForm.name,
        price: productForm.price.includes('ر.س') ? productForm.price : `${productForm.price} ر.س`,
        discount_price: productForm.discountPrice ? (productForm.discountPrice.includes('ر.س') ? productForm.discountPrice : `${productForm.discountPrice} ر.س`) : null,
        description: productForm.descShort,
        stock: parseInt(productForm.stock) || 0,
        prep_time: parseInt(productForm.prepTime) || 20,
        is_featured: productForm.isFeatured,
        is_sponsored: productForm.isSponsored,
        category_id: productForm.categoryId
      } : p));
      alert('تم تحديث المنتج بالمنيو بنجاح! 🛍️');
    } else {
      // Insert
      const newP = {
        id: 'prod-' + Date.now(),
        name: productForm.name,
        price: productForm.price.includes('ر.س') ? productForm.price : `${productForm.price} ر.س`,
        discount_price: productForm.discountPrice ? (productForm.discountPrice.includes('ر.س') ? productForm.discountPrice : `${productForm.discountPrice} ر.س`) : null,
        description: productForm.descShort,
        stock: parseInt(productForm.stock) || 0,
        prep_time: parseInt(productForm.prepTime) || 20,
        is_active: true,
        is_featured: productForm.isFeatured,
        is_sponsored: productForm.isSponsored,
        category_id: productForm.categoryId,
        image_url: productForm.images
      };
      setProducts(prev => [newP, ...prev]);
      alert('تم إضافة المنتج الجديد بنجاح! 🟢');
    }
    setShowAddProductModal(false);
    setEditingProduct(null);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code) return;
    const newC = {
      id: 'coup-' + Date.now(),
      code: couponForm.code.toUpperCase(),
      type: couponForm.type,
      value: couponForm.type === 'percentage' ? `${couponForm.value}%` : `${couponForm.value} ر.س`,
      min_order: parseInt(couponForm.minOrder) || 0,
      usage_count: 0,
      expiry: couponForm.expiry
    };
    setCoupons(prev => [newC, ...prev]);
    setCouponForm({ code: '', type: 'percentage', value: '15', minOrder: '40', expiry: '2026-12-31' });
    alert('🎉 تم إنشاء الكود الترويجي وبدأ تفعيله للعملاء!');
  };

  const handleCreateFlash = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flashForm.title) return;
    const newF = {
      id: 'flash-' + Date.now(),
      title: flashForm.title,
      product: flashForm.product,
      discount: parseInt(flashForm.discount) || 10,
      qty_limit: parseInt(flashForm.qty) || 50,
      active: true,
      status: 'pending_review',
      expires_at: new Date(Date.now() + 3600000 * parseInt(flashForm.hours)).toISOString()
    };
    setFlashOffers(prev => [newF, ...prev]);
    setFlashForm({ title: '', product: 'مسحب دجاج كبير', discount: '30', qty: '50', hours: '6' });
    alert('⚡ تم رفع طلب عرض الفلاش المؤقت وهو قيد مراجعة الأدمن الآن!');
  };

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignForm.name) return;
    const newC = {
      id: 'camp-' + Date.now(),
      name: campaignForm.name,
      target: campaignForm.target,
      budget: parseInt(campaignForm.budget) || 500,
      duration: parseInt(campaignForm.duration) || 5,
      status: 'pending_review',
      city: campaignForm.city
    };
    setCampaigns(prev => [newC, ...prev]);
    setCampaignForm({ name: '', target: 'توب ليست في التطبيق', budget: '1000', duration: '5', city: 'الرياض' });
    alert('📣 تم تقديم طلب الحملة الممولة بانتظار موافقة الإدارة والفوترة!');
  };

  const handleCreateSupportTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportForm.description) return;
    const newId = 'TKT-' + Math.floor(100 + Math.random() * 900);
    const newT = {
      id: newId,
      category: supportForm.category,
      description: supportForm.description,
      priority: supportForm.priority,
      status: 'open',
      created_at: new Date().toISOString()
    };
    setSupportTickets(prev => [newT, ...prev]);
    setTicketMessages(prev => ({
      ...prev,
      [newId]: [
        { id: 'smsg-1', sender_role: 'system', sender_name: 'النظام', message_text: `تم استلام تذكرتك بنجاح برقم #${newId}. جاري المراجعة والدعم.`, created_at: new Date().toISOString() }
      ]
    }));
    setSupportForm({ category: 'كتالوج ومبيعات', priority: 'medium', description: '' });
    alert('🎫 تم فتح تذكرة دعم فني جديدة بنجاح وسيتواصل معك الفني قريباً!');
  };

  const handleSendTicketMessage = (ticketId: string) => {
    if (!newTicketMessage.trim()) return;
    const newMessage = {
      id: 'msg-' + Date.now(),
      sender_role: 'partner',
      sender_name: managerName,
      message_text: newTicketMessage,
      created_at: new Date().toISOString()
    };
    setTicketMessages(prev => ({
      ...prev,
      [ticketId]: [...(prev[ticketId] || []), newMessage]
    }));
    setNewTicketMessage('');

    // Simulate Admin reply in 3 seconds
    setTimeout(() => {
      const adminReply = {
        id: 'msg-admin-' + Date.now(),
        sender_role: 'admin',
        sender_name: 'مراقب المنصة المعتمد',
        message_text: `أهلاً يا ${managerName}، تم استلام تعليقك وجاري معالجة طلبك حالياً للتأكد من رضاكم التام. يرجى الانتظار لحين التحديث المالي.`,
        created_at: new Date().toISOString()
      };
      setTicketMessages(prev => ({
        ...prev,
        [ticketId]: [...(prev[ticketId] || []), adminReply]
      }));
    }, 2000);
  };

  // Grouped Navigation configuration for the 21 tabs
  const sidebarGroups: SidebarGroup[] = [
    {
      id: 'overview',
      title: 'A. نظرة عامة وتشغيل',
      items: [
        { id: 'partner_home', label: 'الرئيسية والملخص', icon: Home },
        { id: 'partner_status', label: 'حالة ونشاط المتجر', icon: Power },
        { id: 'partner_kpis', label: 'مؤشرات أداء اليوم', icon: Activity }
      ]
    },
    {
      id: 'storefront',
      title: 'B. إدارة واجهة المتجر',
      items: [
        { id: 'partner_storefront', label: 'الصفحات الرئيسية للمتجر', icon: Smartphone },
        { id: 'partner_commercial', label: 'الملف التجاري والتوثيق', icon: Briefcase }
      ]
    },
    {
      id: 'catalog',
      title: 'C. الكتالوج والمنتجات والطلبات',
      items: [
        { id: 'partner_menu', label: 'الكتالوج / المنيو', icon: ClipboardList },
        { id: 'partner_products', label: 'المنتجات والخدمات', icon: Grid },
        { id: 'partner_addons', label: 'الخيارات والإضافات', icon: Plus },
        { id: 'partner_orders', label: 'إدارة الطلبات الجارية', icon: ShoppingCart },
        { id: 'partner_abandoned_carts', label: 'السلات المتروكة (Pro)', icon: EyeOff },
        { id: 'partner_inventory', label: 'المخزون والتوفر الجاري', icon: CheckCircle }
      ]
    },
    {
      id: 'marketing',
      title: 'D. العروض والتسويق الممول',
      items: [
        { id: 'partner_flash', label: 'عروض فلاش (Growth)', icon: Zap },
        { id: 'partner_coupons', label: 'كوبونات الخصم (Growth)', icon: Tag },
        { id: 'partner_stories', label: 'الستوريهات والقصص (Growth)', icon: Play },
        { id: 'partner_campaigns', label: 'الحملات الممولة (Pro)', icon: Percent },
        { id: 'partner_sponsored_products', label: 'المنتجات الممولة (Pro)', icon: Star }
      ]
    },
    {
      id: 'comms_financials',
      title: 'E. التواصل، الأرباح، والدعم',
      items: [
        { id: 'partner_chats', label: 'المحادثات المباشرة', icon: MessageSquare },
        { id: 'partner_earnings', label: 'الأرباح والعمولات والمالية', icon: DollarSign },
        { id: 'partner_plans', label: 'الاشتراك والخطط والترقية', icon: Award },
        { id: 'partner_support', label: 'تذاكر الدعم الفني', icon: HelpCircle },
        { id: 'partner_settings', label: 'إعدادات الحساب والصلاحيات', icon: Settings }
      ]
    }
  ];

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  // Features Unlock Blocker Component
  const renderLocker = (tabId: string) => {
    const isFlashOrCouponOrStory = ['partner_flash', 'partner_coupons', 'partner_stories'].includes(tabId);
    const requiredPlan = isFlashOrCouponOrStory ? 'النمو (2000 ر.س)' : 'الاحترافية (3000 ر.س)';
    return (
      <div style={{ padding: '40px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto', boxShadow: '0 8px 32px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)' }}>
        <div style={{ width: '80px', height: '80px', background: 'rgba(168, 85, 247, 0.1)', border: '2px solid rgba(168, 85, 247, 0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', color: '#a855f7' }}>
          <Lock size={36} className="animate-pulse" />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: 'white', marginBottom: 12 }}>الميزة مقفلة - تتطلب ترقية خطة الاشتراك</h2>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', lineHeight: '1.7', marginBottom: 24 }}>
          أنت مسجل حالياً في الخطة **{partnerPlan === 1000 ? 'الأساسية' : 'النمو'}**. للوصول إلى هذه الأدوات التسويقية والتحليلية المتقدمة، يرجى الترقية إلى خطة **{requiredPlan}** أو أعلى لتحقيق أقصى نمو لمبيعاتك.
        </p>

        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 24, textAlign: 'right' }}>
          <span style={{ fontSize: '0.78rem', color: '#a855f7', fontWeight: 900, display: 'block', marginBottom: 6 }}>💡 ميزات الترقية الفورية:</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', display: 'block', margin: '3px 0' }}>• تفعيل الحملات الإعلانية ومضاعفة حجم الطلبات.</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', display: 'block', margin: '3px 0' }}>• استهداف السلات المتروكة للعملاء واسترجاع المبيعات الضائعة.</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-main)', display: 'block', margin: '3px 0' }}>• كوبونات الخصم والستوريهات الترويجية المباشرة بالتطبيق.</span>
        </div>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button 
            onClick={() => setActiveTab('partner_plans')} 
            className="btn btn-primary" 
            style={{ padding: '12px 24px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Award size={16} /> تصفح وترقية الخطط
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: '#120b1f', minHeight: '100vh', color: 'white', display: 'flex', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>
      
      {/* Sidebar Navigation */}
      {!hideSidebar && (
        <aside style={{ width: '280px', flexShrink: 0, background: 'rgba(26,11,46,0.95)', borderLeft: '1px solid var(--glass-border-highlight)', padding: '20px 14px', display: 'flex', flexDirection: 'column', gap: 10, height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }} className="no-scrollbar">
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingBottom: 16, marginBottom: 8, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
              🏪
            </div>
            <div>
              <span style={{ fontWeight: 900, fontSize: '0.92rem', display: 'block', color: 'white' }}>بوابة الشركاء المحترفة</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{storeName}</span>
                <span style={{ fontSize: '0.58rem', background: '#a855f7', color: 'white', padding: '1px 5px', borderRadius: '4px', fontWeight: 900 }}>
                  {partnerPlan === 1000 ? 'الأساسية' : partnerPlan === 2000 ? 'النمو' : partnerPlan === 3000 ? 'الاحترافية' : 'التميز 👑'}
                </span>
              </div>
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
                    textAlign: 'right',
                    cursor: 'pointer',
                    border: 'none'
                  }}
                >
                  <span>{group.title}</span>
                  {collapsedGroups[group.id] ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
                </button>

                {!collapsedGroups[group.id] && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingRight: 6, borderRight: '1px solid rgba(255,255,255,0.03)', marginTop: 4 }}>
                    {group.items.map(item => {
                      const Icon = item.icon;
                      const isActive = activeTab === item.id;
                      const unlocked = isFeatureUnlocked(item.id);
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '9px 12px',
                            borderRadius: 10,
                            background: isActive ? 'var(--color-accent)' : 'transparent',
                            color: isActive ? 'white' : 'var(--color-text-main)',
                            textAlign: 'right',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            border: 'none'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                            <Icon size={14} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                          </div>
                          {!unlocked && <Lock size={11} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Dynamic Developer Plan Simulator Quick Access */}
          <div style={{ marginTop: '20px', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed rgba(168, 85, 247, 0.3)' }}>
            <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 900, display: 'block', marginBottom: 6 }}>⚙️ محاكي صلاحيات المطور:</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {[1000, 2000, 3000, 5000].map(p => (
                <button
                  key={p}
                  onClick={() => handleSavePlanUpgrade(p)}
                  style={{
                    padding: '4px 0',
                    fontSize: '0.62rem',
                    borderRadius: '4px',
                    background: partnerPlan === p ? '#a855f7' : 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {onBack && (
            <button className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '10px 0', fontSize: '0.82rem', border: '1px solid rgba(255,255,255,0.1)' }} onClick={onBack}>
              <ArrowRight size={16} /> العودة للبوابات
            </button>
          )}
        </aside>
      )}

      {/* Main Content View Switcher */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
        
        {/* Top Header */}
        <header style={{ height: '70px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 30px', background: 'rgba(18,11,31,0.5)', backdropFilter: 'blur(10px)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
              {sidebarGroups.flatMap(g => g.items).find(i => i.id === activeTab)?.label || 'الرئيسية'}
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <button 
                onClick={() => handleUpdateStoreStatus('open')}
                style={{
                  padding: '6px 12px',
                  background: storeStatus === 'open' ? 'rgba(16,185,129,0.2)' : 'transparent',
                  border: '1px solid ' + (storeStatus === 'open' ? '#10b981' : 'rgba(255,255,255,0.1)'),
                  color: storeStatus === 'open' ? '#10b981' : 'var(--color-text-muted)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                مفتوح
              </button>
              <button 
                onClick={() => handleUpdateStoreStatus('busy')}
                style={{
                  padding: '6px 12px',
                  background: storeStatus === 'busy' ? 'rgba(245,158,11,0.2)' : 'transparent',
                  border: '1px solid ' + (storeStatus === 'busy' ? '#f59e0b' : 'rgba(255,255,255,0.1)'),
                  color: storeStatus === 'busy' ? '#f59e0b' : 'var(--color-text-muted)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                مزدحم
              </button>
              <button 
                onClick={() => handleUpdateStoreStatus('closed')}
                style={{
                  padding: '6px 12px',
                  background: storeStatus === 'closed' ? 'rgba(239,68,68,0.2)' : 'transparent',
                  border: '1px solid ' + (storeStatus === 'closed' ? '#ef4444' : 'rgba(255,255,255,0.1)'),
                  color: storeStatus === 'closed' ? '#ef4444' : 'var(--color-text-muted)',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                مغلق
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Main View Area */}
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          
          <AnimatePresence mode="wait">
            {!isFeatureUnlocked(activeTab) ? (
              renderLocker(activeTab)
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
              >
                
                {/* 1. الرئيسية والملخص */}
                {activeTab === 'partner_home' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {/* Glowing stats banner */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>مبيعات اليوم الجارية</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>١,٤٨٢.٠٠ ر.س</h3>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>📈 +١٢.٤٪ عن أمس</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>حجم الطلبات النشطة</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-accent-light)', margin: '4px 0 0 0' }}>
                          {orders.filter(o => o.status === 'pending' || o.status === 'preparing').length} طلب
                        </h3>
                        <span style={{ fontSize: '0.65rem', color: 'white' }}>بانتظار التحضير والتجهيز</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>إضافات السلة (آخر ٢٤ ساعة)</span>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '4px 0 0 0' }}>٤٨ إضافة سلة</h3>
                        <span style={{ fontSize: '0.65rem', color: '#a855f7' }}>معدل استرجاع ممتاز</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>تقييم اليوم الحالي</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '4px 0 0 0' }}>
                          <h3 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: 0 }}>٤.٩</h3>
                          <div style={{ display: 'flex', color: '#f59e0b' }}><Star size={14} fill="#f59e0b" /><Star size={14} fill="#f59e0b" /><Star size={14} fill="#f59e0b" /><Star size={14} fill="#f59e0b" /><Star size={14} fill="#f59e0b" /></div>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-success)' }}>🟢 ٢٤ عميل قيموا اليوم</span>
                      </div>
                    </div>

                    {/* Quick Live Order Ticker */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: 8 }}><ShoppingCart size={16} style={{ color: '#a855f7' }} /> مراقبة الطلبات النشطة الواردة لحظياً</h3>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '3px 8px', borderRadius: '20px', fontWeight: 'bold' }}>تحديث تلقائي مفعل 🟢</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {orders.filter(o => o.status === 'pending' || o.status === 'preparing').map(order => (
                          <div key={order.id} style={{ padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <strong style={{ fontSize: '0.85rem' }}>طلب رقم #{order.id}</strong>
                                <span style={{ fontSize: '0.65rem', background: order.status === 'pending' ? 'rgba(168,85,247,0.2)' : 'rgba(245,158,11,0.2)', color: order.status === 'pending' ? '#a855f7' : '#f59e0b', padding: '2px 8px', borderRadius: '10px' }}>
                                  {order.status === 'pending' ? 'معلق جديد' : 'جاري التحضير'}
                                </span>
                              </div>
                              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                                العميل: {order.customer_name} • المنتجات: {order.items}
                              </span>
                              {order.notes && <span style={{ display: 'block', fontSize: '0.68rem', color: '#f59e0b', marginTop: 2 }}>📝 ملاحظة: {order.notes}</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 10 }}>
                              <button onClick={() => { setSelectedOrder(order) }} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Printer size={13} /> فاتورة
                              </button>
                              {order.status === 'pending' ? (
                                <>
                                  <button onClick={() => handleUpdateOrderStatus(order.id, 'preparing')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>قبول وتحضير 🍳</button>
                                  <button onClick={() => handleUpdateOrderStatus(order.id, 'cancelled')} style={{ padding: '6px 12px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', cursor: 'pointer' }}>رفض</button>
                                </>
                              ) : (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'ready_for_pickup')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#f59e0b', border: '1px solid #f59e0b' }}>جاهز للتسليم 🚴</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. حالة ونشاط المتجر */}
                {activeTab === 'partner_status' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>⏱️ ساعات العمل وفترات التجهيز</h3>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>أوقات العمل الرسمية للمتجر بالتطبيق</label>
                        <div style={{ display: 'flex', gap: 10 }}>
                          <input type="text" className="input-field" value={workHoursStart} onChange={e => setWorkHoursStart(e.target.value)} placeholder="من" />
                          <input type="text" className="input-field" value={workHoursEnd} onChange={e => setWorkHoursEnd(e.target.value)} placeholder="إلى" />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>أيام الإجازة الرسمية للفرع</label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          {['الجمعة', 'السبت', 'الأحد'].map(day => (
                            <button
                              key={day}
                              onClick={() => {
                                setRestDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
                              }}
                              style={{
                                padding: '6px 12px',
                                background: restDays.includes(day) ? '#a855f7' : 'rgba(255,255,255,0.05)',
                                color: 'white',
                                borderRadius: '8px',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '0.75rem'
                              }}
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>مدة التحضير الأدنى (دقائق)</label>
                          <input type="number" className="input-field" value={prepTimeMin} onChange={e => setPrepTimeMin(parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>مدة التحضير الأقصى (دقائق)</label>
                          <input type="number" className="input-field" value={prepTimeMax} onChange={e => setPrepTimeMax(parseInt(e.target.value))} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>التوصيل المتوقع الأدنى (دقائق)</label>
                          <input type="number" className="input-field" value={delTimeMin} onChange={e => setDelTimeMin(parseInt(e.target.value))} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>التوصيل المتوقع الأقصى (دقائق)</label>
                          <input type="number" className="input-field" value={delTimeMax} onChange={e => setDelTimeMax(parseInt(e.target.value))} />
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>📍 مناطق وشروط التوصيل الجاري</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>مناطق التوصيل المغطاة</label>
                        <textarea className="input-field" rows={2} value={deliveryZones} onChange={e => setDeliveryZones(e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>الحد الأدنى للطلب (ر.س)</label>
                          <input type="number" className="input-field" value={minOrder} onChange={e => setMinOrder(parseFloat(e.target.value))} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رسوم التوصيل الافتراضية (ر.س)</label>
                          <input type="number" className="input-field" value={deliveryFee} onChange={e => setDeliveryFee(parseFloat(e.target.value))} />
                        </div>
                      </div>

                      <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block' }}>حالة ظهور المتجر في خريطة التطبيق للعملاء</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>إيقاف الظهور يخفي المتجر نهائياً من قائمة البحث</span>
                          </div>
                          <button
                            onClick={() => setIsAppVisible(!isAppVisible)}
                            style={{
                              padding: '6px 14px',
                              background: isAppVisible ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                              border: '1px solid ' + (isAppVisible ? '#10b981' : '#ef4444'),
                              color: isAppVisible ? '#10b981' : '#ef4444',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: 'bold',
                              fontSize: '0.75rem'
                            }}
                          >
                            {isAppVisible ? 'نشط بالتطبيق' : 'مخفي بالتطبيق'}
                          </button>
                        </div>
                      </div>

                      <button onClick={() => alert('تم حفظ ومزامنة إعدادات وحالة المتجر مع تطبيق العميل المباشر بنجاح! 🟢')} className="btn btn-primary" style={{ padding: 12, marginTop: 'auto', fontSize: '0.82rem' }}>
                        مزامنة وحفظ التعديلات فوراً
                      </button>
                    </div>
                  </div>
                )}

                {/* 3. مؤشرات أداء اليوم */}
                {activeTab === 'partner_kpis' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 16, borderRadius: 14 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>إجمالي طلبات اليوم</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0' }}>٣٢ طلب</h2>
                        <span style={{ fontSize: '0.65rem', color: '#10b981' }}>✓ ٢٨ مقبول • ✗ ٤ ملغى</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 16, borderRadius: 14 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>متوسط قيمة الطلب</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0' }}>٤٦.٣٠ ر.س</h2>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>مستقر مقارنة بالأسبوع الماضي</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 16, borderRadius: 14 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>زيارات صفحة المتجر</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0' }}>٦٤٠ زيارة</h2>
                        <span style={{ fontSize: '0.65rem', color: '#10b981' }}>📈 +١٨٪ زيادات جديدة</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 16, borderRadius: 14 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>معدل التحويل المتوقع</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#a855f7', margin: '4px 0' }}>٥.٠٪</h2>
                        <span style={{ fontSize: '0.65rem', color: '#a855f7' }}>أعلى من المتوسط بـ ١.٥٪</span>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 20 }}>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 900, marginBottom: 16 }}>📊 تحليل قمع المبيعات اليومي (Funnel Analysis)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                              <span>👁️ مشاهدة المنتجات بالمنيو</span>
                              <span style={{ fontWeight: 'bold' }}>١,٢٤٠ مشاهدة</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '100%', height: '100%', background: '#9d4ede' }}></div>
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                              <span>🛒 إضافات السلة الفعلية</span>
                              <span style={{ fontWeight: 'bold' }}>١٤٢ إضافة</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '45%', height: '100%', background: '#a855f7' }}></div>
                            </div>
                          </div>
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4 }}>
                              <span>💳 إكمال الدفع والطلب</span>
                              <span style={{ fontWeight: 'bold' }}>٣٢ طلب مكتمل</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{ width: '15%', height: '100%', background: '#10b981' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                        <h3 style={{ fontSize: '0.92rem', fontWeight: 900 }}>🏆 أبطال أداء اليوم</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.78rem' }}>🔥 المنتج الأكثر مبيعاً:</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#a855f7' }}>مسحب دجاج كبير</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.78rem' }}>⚡ أفضل عرض فلاش أداءً:</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#10b981' }}>خصم ٥٠٪ عائلي</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                            <span style={{ fontSize: '0.78rem' }}>📣 تفاعل حملات الترويج:</span>
                            <span style={{ fontSize: '0.78rem', fontWeight: 'bold', color: 'white' }}>٣,٤١٢ ظهور</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. الصفحات الرئيسية للمتجر (Storefront customizer & Mobile Live Preview Mockup) */}
                {activeTab === 'partner_storefront' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
                    {/* Forms to customize layout */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>🎨 تخصيص الصفحة الرئيسية وتصميم المتجر</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>شعار المتجر (Emoji أو رابط)</label>
                          <input type="text" className="input-field" value={logoEmoji} onChange={e => setLogoEmoji(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>تصنيف المتجر بالتطبيق</label>
                          <input type="text" className="input-field" value={category} onChange={e => setCategory(e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رابط صورة الغلاف الفاخرة</label>
                        <input type="text" className="input-field" value={coverUrl} onChange={e => setCoverUrl(e.target.value)} />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>وصف قصير للمتجر (Bio)</label>
                        <textarea className="input-field" rows={2} value={storeBio} onChange={e => setStoreBio(e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رقم الاتصال المباشر</label>
                          <input type="text" className="input-field" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رقم الواتساب (مثال: 966xxx)</label>
                          <input type="text" className="input-field" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رابط خرائط جوجل للفروع</label>
                        <input type="text" className="input-field" value={googleMapsUrl} onChange={e => setGoogleMapsUrl(e.target.value)} />
                      </div>

                      <button onClick={() => alert('🎉 تم تحديث واجهة المتجر بالتطبيق بنجاح! يمكن للعملاء الآن مشاهدة التصميم الجديد.')} className="btn btn-primary" style={{ padding: 12, marginTop: 10, fontSize: '0.82rem' }}>
                        حفظ ونشر التعديلات فوراً بالتطبيق
                      </button>
                    </div>

                    {/* LIVE SMARTPHONE PREVIEW */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: 8 }}>📱 معاينة حية لشكل متجرك كما يظهر للعميل بالتطبيق</span>
                      
                      {/* Mobile Frame Container */}
                      <div style={{
                        width: '300px',
                        height: '560px',
                        borderRadius: '36px',
                        border: '8px solid #2d1854',
                        background: '#120b1f',
                        position: 'relative',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.6), 0 0 20px rgba(168,85,247,0.3)',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column'
                      }}>
                        {/* Status bar */}
                        <div style={{ height: '24px', background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px', fontSize: '0.62rem', zIndex: 10 }}>
                          <span>02:04 م</span>
                          <span>🔋 100%</span>
                        </div>

                        {/* Banner cover */}
                        <div style={{ height: '110px', background: `url(${coverUrl}) center/cover no-repeat`, position: 'relative' }}>
                          {/* Shadow overlay */}
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(18,11,31,0.9))' }}></div>
                          
                          {/* Float back icon */}
                          <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                            →
                          </div>
                        </div>

                        {/* Store Info Block */}
                        <div style={{ padding: '0 12px', marginTop: '-30px', zIndex: 5, position: 'relative', display: 'flex', flexDirection: 'column', gap: 4 }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: '#1c0f33', border: '2px solid #a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                              {logoEmoji}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'white' }}>{storeName?.substring(0,22)}</span>
                              <span style={{ fontSize: '0.58rem', color: '#a855f7', fontWeight: 'bold' }}>★ ٤.٩ (٢٠٤ تقييم) • {category}</span>
                            </div>
                          </div>

                          <p style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)', lineHeight: '1.4', margin: '6px 0 0 0' }}>{storeBio?.substring(0, 75)}...</p>

                          {/* Delivery info pills */}
                          <div style={{ display: 'flex', gap: 6, margin: '8px 0' }}>
                            <span style={{ fontSize: '0.5rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>⏰ {prepTimeMin}-{prepTimeMax} دقيقة</span>
                            <span style={{ fontSize: '0.5rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>🚴 توصيل: {deliveryFee} ر.س</span>
                          </div>

                          {/* Quick Actions buttons inside mobile */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" style={{ background: '#25D366', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: '6px', fontSize: '0.55rem', padding: '5px 0', textDecoration: 'none', fontWeight: 'bold' }}>
                              واتساب الشريك
                            </a>
                            <a href={googleMapsUrl} target="_blank" rel="noreferrer" style={{ background: 'rgba(255,255,255,0.08)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, borderRadius: '6px', fontSize: '0.55rem', padding: '5px 0', textDecoration: 'none', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.1)' }}>
                              موقع الفرع
                            </a>
                          </div>
                        </div>

                        {/* Menu list simulated in Mobile */}
                        <div style={{ flex: 1, padding: '0 12px 10px 12px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }} className="no-scrollbar">
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 900, color: 'white', display: 'block', marginBottom: 6 }}>أطباق مميزة مختارة ⭐</span>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              {products.filter(p => p.is_active).slice(0, 3).map(p => (
                                <div key={p.id} style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.02)', padding: 6, borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                  <div style={{ width: '42px', height: '42px', borderRadius: '6px', background: `url(${p.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=100&q=80'}) center/cover no-repeat` }}></div>
                                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 'bold', color: 'white' }}>{p.name?.substring(0, 22)}</span>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                      <span style={{ fontSize: '0.58rem', color: '#a855f7', fontWeight: 900 }}>{p.discount_price || p.price}</span>
                                      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.5rem', color: 'white', fontWeight: 'bold' }}>+</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* 5. الملف التجاري والتوثيق */}
                {activeTab === 'partner_commercial' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>📋 بيانات التوثيق والتسجيل التجاري</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>اسم الشركة أو الكيان التجاري</label>
                          <input type="text" className="input-field" value={storeName} onChange={e => setStoreName(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>اسم المسؤول القانوني</label>
                          <input type="text" className="input-field" value={managerName} onChange={e => setManagerName(e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رقم السجل التجاري (CR)</label>
                          <input type="text" className="input-field" value={crNumber} onChange={e => setCrNumber(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>الرقم الضريبي الموحد (VAT)</label>
                          <input type="text" className="input-field" value={vatNumber} onChange={e => setVatNumber(e.target.value)} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>البريد الإلكتروني للفوترة والمالية</label>
                          <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>المدينة والفرع</label>
                          <input type="text" className="input-field" value={`${city} - حي ${district}`} disabled />
                        </div>
                      </div>

                      <button onClick={() => alert('✓ تم تقديم مستندات تحديث الملف التجاري للإدارة للتوثيق والاعتماد.')} className="btn btn-primary" style={{ padding: 12, marginTop: 10, fontSize: '0.82rem' }}>
                        تقديم مستندات التحديث للمراجعة
                      </button>
                    </div>

                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>🛡️ حالة التوثيق والمستندات الرسمية</h3>
                      
                      <div style={{ padding: 16, borderRadius: 14, background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                          <ShieldCheck size={22} />
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', display: 'block', color: 'white' }}>النشاط التجاري موثق ومكتمل ✓</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>جميع التراخيص معتمدة وفعالة في المنصة تلقائياً</span>
                        </div>
                      </div>

                      <div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: 8 }}>المستندات المرفوعة للفرع:</span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {uploadedDocs.map((doc, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                              <span style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={14} style={{ color: '#a855f7' }} /> {doc}</span>
                              <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 'bold' }}>✓ معتمد ومفعل</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div style={{ padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.1)', textAlign: 'center', cursor: 'pointer' }}>
                        <Upload size={20} style={{ color: '#a855f7', marginBottom: 6 }} />
                        <span style={{ fontSize: '0.75rem', display: 'block', fontWeight: 'bold' }}>تحميل ترخيص أو مستند تحديث إضافي</span>
                        <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>صيغ PDF, PNG بحد أقصى 10MB</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 6. الكتالوج / المنيو */}
                {activeTab === 'partner_menu' && (
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>📋 الكتالوج وأقسام المنيو الداخلية</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>رتب وصنف مأكولاتك وخدماتك لتسهيل تصفح العميل بالهاتف</span>
                      </div>
                      <button
                        onClick={() => {
                          const name = prompt('اكتب اسم قسم المنيو الجديد (مثال: الحلويات والأطباق الجانبية):');
                          if (name) {
                            setMenuCategories(prev => [...prev, { id: 'cat-' + Date.now(), name, order: prev.length + 1 }]);
                          }
                        }}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', gap: 6, alignItems: 'center' }}
                      >
                        <Plus size={14} /> إضافة قسم منيو جديد
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {menuCategories.sort((a,b) => a.order - b.order).map((cat, idx) => (
                        <div key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontSize: '0.75rem', background: '#a855f7', color: 'white', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{idx + 1}</span>
                            <strong style={{ fontSize: '0.85rem' }}>{cat.name}</strong>
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>({products.filter(p => p.category_id === cat.id).length} منتج نشط في هذا القسم)</span>
                          </div>

                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              onClick={() => {
                                if (idx === 0) return;
                                setMenuCategories(prev => {
                                  const list = [...prev];
                                  const temp = list[idx].order;
                                  list[idx].order = list[idx-1].order;
                                  list[idx-1].order = temp;
                                  return list;
                                });
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.68rem' }}
                            >
                              ↑ رفع الترتيب
                            </button>
                            <button
                              onClick={() => {
                                const name = prompt('تعديل اسم القسم:', cat.name);
                                if (name) setMenuCategories(prev => prev.map(c => c.id === cat.id ? { ...c, name } : c));
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '0.68rem' }}
                            >
                              تعديل الاسم
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا القسم؟ سيتم نقل المنتجات الجارية للقسم الافتراضي.')) {
                                  setMenuCategories(prev => prev.filter(c => c.id !== cat.id));
                                }
                              }}
                              style={{ padding: '4px 8px', fontSize: '0.68rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. المنتجات والخدمات (Full Product CRUD) */}
                {activeTab === 'partner_products' && (
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>🛍️ إدارة المنتجات والخدمات والأسعار</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>أضف أطباق جديدة، أو قم بتحديث أسعار السندوتشات والوجبات</span>
                      </div>
                      <button
                        onClick={() => {
                          setEditingProduct(null);
                          setProductForm({ name: '', price: '', discountPrice: '', descShort: '', descLong: '', stock: '50', categoryId: 'cat-1', prepTime: '20', isFeatured: false, isSponsored: false, images: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=600&q=80' });
                          setShowAddProductModal(true);
                        }}
                        className="btn btn-primary"
                        style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 16px', fontSize: '0.78rem' }}
                      >
                        <Plus size={16} /> إضافة منتج جديد للكتالوج
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {products.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 8, background: `url(${p.image_url || 'https://images.unsplash.com/photo-1562967914-608f82629710?w=100&q=80'}) center/cover` }}></div>
                            <div>
                              <strong style={{ fontSize: '0.88rem', display: 'block' }}>{p.name}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{p.description}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--color-accent-light)', display: 'block' }}>
                                {p.discount_price ? p.discount_price : p.price}
                              </span>
                              {p.discount_price && <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{p.price}</span>}
                            </div>

                            <button 
                              onClick={() => toggleProductActive(p.id, p.is_active)}
                              style={{
                                padding: '6px 12px',
                                background: p.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                                border: '1px solid ' + (p.is_active ? '#10b981' : 'rgba(255,255,255,0.1)'),
                                color: p.is_active ? '#10b981' : 'white',
                                borderRadius: 6,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                cursor: 'pointer'
                              }}
                            >
                              {p.is_active ? 'نشط متوفر' : 'غير متوفر ❌'}
                            </button>

                            <button
                              onClick={() => {
                                setEditingProduct(p);
                                setProductForm({
                                  name: p.name,
                                  price: p.price.replace(' ر.س', ''),
                                  discountPrice: p.discount_price ? p.discount_price.replace(' ر.س', '') : '',
                                  descShort: p.description || '',
                                  descLong: p.description || '',
                                  stock: (p.stock || 50).toString(),
                                  categoryId: p.category_id || 'cat-1',
                                  prepTime: (p.prep_time || 20).toString(),
                                  isFeatured: p.is_featured || false,
                                  isSponsored: p.is_sponsored || false,
                                  images: p.image_url || ''
                                });
                                setShowAddProductModal(true);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                            >
                              تعديل
                            </button>

                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا المنتج نهائياً من المنيو؟')) {
                                  setProducts(prev => prev.filter(item => item.id !== p.id));
                                }
                              }}
                              style={{ padding: '6px 12px', fontSize: '0.72rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. الخيارات والإضافات */}
                {activeTab === 'partner_addons' && (
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>➕ الخيارات والإضافات للمنتجات</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>أضف خيارات اختيارية (مثل جبنة أو صوص) أو إلزامية (مثل الحجم الكبير) تظهر لعميل التطبيق</span>
                      </div>
                      <button
                        onClick={() => {
                          const name = prompt('اكتب اسم الخيار الجديد (مثال: زيادة صوص ثوم):');
                          const priceStr = prompt('السعر الإضافي بالريال (اكتب 0 إذا مجاني):', '2');
                          const cat = prompt('المجموعة (مثال: الصلصات، الحجم، الإضافات):', 'الإضافات');
                          if (name && priceStr) {
                            setAddons(prev => [...prev, { id: 'add-' + Date.now(), name, price: parseFloat(priceStr), category: cat, max_choices: 1, required: false }]);
                          }
                        }}
                        className="btn btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', gap: 6, alignItems: 'center' }}
                      >
                        <Plus size={14} /> إضافة خيار جديد للعميل
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {addons.map(addon => (
                        <div key={addon.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                          <div>
                            <span style={{ fontSize: '0.62rem', background: 'rgba(168,85,247,0.1)', color: '#a855f7', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>{addon.category}</span>
                            <strong style={{ fontSize: '0.85rem', display: 'block', marginTop: 4 }}>{addon.name}</strong>
                          </div>
                          
                          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--color-accent-light)' }}>
                              {addon.price > 0 ? `+ ${addon.price} ر.س` : 'مجاني'}
                            </span>
                            
                            <span style={{ fontSize: '0.72rem', color: addon.required ? '#ef4444' : 'var(--color-text-muted)' }}>
                              {addon.required ? 'إلزامي ✓' : 'اختياري'}
                            </span>

                            <button
                              onClick={() => {
                                if (confirm('هل أنت متأكد من حذف هذا الخيار؟')) {
                                  setAddons(prev => prev.filter(a => a.id !== addon.id));
                                }
                              }}
                              style={{ padding: '4px 8px', fontSize: '0.68rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. الطلبات */}
                {activeTab === 'partner_orders' && (
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>📦 إدارة طلبات التوصيل الجارية والسجل</h3>
                      <span style={{ fontSize: '0.72rem', color: '#10b981' }}>تحديث فوري نشط مع المناديب والزبائن 🟢</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {orders.map(order => (
                        <div key={order.id} style={{ padding: 16, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 14 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <strong style={{ fontSize: '0.88rem' }}>طلب رقم #{order.id}</strong>
                                <span style={{
                                  fontSize: '0.65rem',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontWeight: 'bold',
                                  background: 
                                    order.status === 'pending' ? 'rgba(168,85,247,0.15)' :
                                    order.status === 'preparing' ? 'rgba(245,158,11,0.15)' :
                                    order.status === 'ready_for_pickup' ? 'rgba(59,130,246,0.15)' :
                                    order.status === 'completed' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                                  color:
                                    order.status === 'pending' ? '#a855f7' :
                                    order.status === 'preparing' ? '#f59e0b' :
                                    order.status === 'ready_for_pickup' ? '#3b82f6' :
                                    order.status === 'completed' ? '#10b981' : '#ef4444'
                                }}>
                                  {order.status === 'pending' ? 'بانتظار الموافقة' :
                                   order.status === 'preparing' ? 'جاري التجهيز' :
                                   order.status === 'ready_for_pickup' ? 'بانتظار المندوب' :
                                   order.status === 'completed' ? 'تم التوصيل واكتمل' : 'ملغى'}
                                </span>
                              </div>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>
                                العميل: {order.customer_name} ({order.customer_phone}) • العنوان: {order.customer_address}
                              </span>
                            </div>
                            <div style={{ textAlign: 'left' }}>
                              <span style={{ fontSize: '0.92rem', fontWeight: 900, color: 'white', display: 'block' }}>{order.price_total} ر.س</span>
                              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>صافي ربحك: {order.net_earnings} ر.س (العمولة: {order.commission} ر.س)</span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.03)', padding: '10px 0', margin: '10px 0', fontSize: '0.78rem', color: 'var(--color-text-main)' }}>
                            🍳 <strong>تفاصيل المنيو المطلوب:</strong> {order.items}
                            {order.notes && <div style={{ fontSize: '0.72rem', color: '#f59e0b', marginTop: 4 }}>⚠️ ملاحظة الزبون: {order.notes}</div>}
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>طريقة الدفع: {order.payment_method} • الوقت: {order.created_at?.substring(11,16)}</span>
                            
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => setSelectedOrder(order)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Printer size={13} /> طباعة الفاتورة الضريبية
                              </button>
                              
                              <button 
                                onClick={() => {
                                  setActiveChatOrder(order);
                                  setActiveTab('partner_chats');
                                }} 
                                className="btn btn-secondary" 
                                style={{ padding: '6px 12px', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 4 }}
                              >
                                <MessageSquare size={13} /> محادثة العميل
                              </button>

                              {order.status === 'pending' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'preparing')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem' }}>
                                  قبول الطلب
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'ready_for_pickup')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#f59e0b', border: '1px solid #f59e0b' }}>
                                  جاهز للاستلام 🚴
                                </button>
                              )}
                              {order.status === 'ready_for_pickup' && (
                                <button onClick={() => handleUpdateOrderStatus(order.id, 'completed')} className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.72rem', background: '#10b981', border: '1px solid #10b981' }}>
                                  اكتمال يدوي ✅
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. السلات المتروكة (Plan locked but unlocked under 3000+) */}
                {activeTab === 'partner_abandoned_carts' && (
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>🛒 استهداف واسترجاع السلات المتروكة</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>أرسل كوبونات استرجاع مخصصة أو إشعارات دفع للعملاء لزيادة مبيعاتك بنسبة ٢٥٪</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {abandonedCarts.map(cart => (
                        <div key={cart.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '12px' }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{cart.customer_name}</strong>
                            <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--color-text-muted)', marginTop: 4 }}>المنتجات: {cart.items} • التاريخ: {cart.date}</span>
                          </div>

                          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'white' }}>{cart.value} ر.س</span>
                            
                            <button
                              onClick={() => {
                                alert(`🎫 تم إرسال كوبون خصم مخصص بنجاح إلى هاتف العميل ${cart.customer_name}! ستصله رسالة قصيرة وإشعار بالتطبيق حالياً.`);
                              }}
                              className="btn btn-primary"
                              style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                            >
                              إرسال كوبون استرجاع
                            </button>
                            
                            <button
                              onClick={() => {
                                alert(`🔔 تم إرسال إشعار فوري عاجل إلى جوال العميل: "أكمل طلبك الآن واحصل على توصيل مجاني!"`);
                              }}
                              className="btn btn-secondary"
                              style={{ padding: '6px 12px', fontSize: '0.72rem' }}
                            >
                              إشعار تذكير
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 11. المخزون */}
                {activeTab === 'partner_inventory' && (
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>📦 مستويات المخزون والتوفر التلقائي</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>يتم إخفاء المنتج تلقائياً من التطبيق عند وصول مخزونه للصفر</span>
                      </div>
                      <button onClick={() => alert('✓ تم حفظ مستويات المخزون ومزامنتها بنجاح!')} className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                        حفظ ومزامنة مستويات المخزون
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {products.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{p.name}</strong>
                          
                          <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>الكمية المتاحة:</span>
                              <input
                                type="number"
                                className="input-field"
                                style={{ width: '80px', padding: '4px 8px', textAlign: 'center' }}
                                value={p.stock}
                                onChange={e => {
                                  const val = parseInt(e.target.value) || 0;
                                  setProducts(prev => prev.map(item => item.id === p.id ? { ...item, stock: val } : item));
                                }}
                              />
                            </div>

                            <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: p.stock > 10 ? '#10b981' : '#ef4444' }}>
                              {p.stock > 10 ? '✓ مخزون كافي' : p.stock > 0 ? '⚠️ مخزون منخفض' : '❌ نفذ المخزون'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 12. عروض فلاش */}
                {activeTab === 'partner_flash' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, marginBottom: 16 }}>⚡ عروض الفلاش العاجلة النشطة</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {flashOffers.map(f => (
                          <div key={f.id} style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem', display: 'block' }}>{f.title}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>
                                المنتج: {f.product} • نسبة الخصم: {f.discount}% • حالة التدقيق الإداري: 
                                <span style={{ color: f.status === 'approved' ? '#10b981' : '#f59e0b', fontWeight: 'bold', marginRight: 4 }}>
                                  {f.status === 'approved' ? 'نشط بالتطبيق ✓' : 'بانتظار المراجعة'}
                                </span>
                              </span>
                            </div>
                            
                            <button
                              onClick={() => {
                                setFlashOffers(prev => prev.filter(item => item.id !== f.id));
                              }}
                              style={{ padding: '4px 8px', fontSize: '0.68rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              إيقاف
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleCreateFlash} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>⚡ إنشاء حملة عرض فلاش عاجل</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>عنوان العرض الجذاب</label>
                        <input type="text" className="input-field" placeholder="مثال: خصم ٥٠٪ على الوجبة العائلية الليلة!" value={flashForm.title} onChange={e => setFlashForm({ ...flashForm, title: e.target.value })} required />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>المنتج المستهدف</label>
                          <select className="input-field" value={flashForm.product} onChange={e => setFlashForm({ ...flashForm, product: e.target.value })}>
                            {products.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>نسبة الخصم (%)</label>
                          <input type="number" className="input-field" value={flashForm.discount} onChange={e => setFlashForm({ ...flashForm, discount: e.target.value })} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>كمية العرض المحدودة</label>
                          <input type="number" className="input-field" value={flashForm.qty} onChange={e => setFlashForm({ ...flashForm, qty: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>مدة العرض (بالساعات)</label>
                          <input type="number" className="input-field" value={flashForm.hours} onChange={e => setFlashForm({ ...flashForm, hours: e.target.value })} />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: '0.82rem', fontWeight: 900 }}>
                        نشر عرض الفلاش العاجل فوراً
                      </button>
                    </form>
                  </div>
                )}

                {/* 13. كوبونات الخصم */}
                {activeTab === 'partner_coupons' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, marginBottom: 16 }}>🎫 كوبونات الخصم النشطة للعملاء</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {coupons.map(c => (
                          <div key={c.id} style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.88rem', color: '#a855f7' }}>{c.code}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>
                                قيمة الخصم: {c.value} • حد أدنى: {c.min_order} ر.س • عدد مرات الاستخدام: {c.usage_count} • ينتهي: {c.expiry}
                              </span>
                            </div>
                            
                            <button
                              onClick={() => {
                                setCoupons(prev => prev.filter(item => item.id !== c.id));
                              }}
                              style={{ padding: '4px 8px', fontSize: '0.68rem', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              إبطال
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleCreateCoupon} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>🎫 إنشاء كوبون ترويجي جديد</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>كود الخصم (بالحروف الإنجليزية)</label>
                        <input type="text" className="input-field" placeholder="مثال: BAIK30" value={couponForm.code} onChange={e => setCouponForm({ ...couponForm, code: e.target.value })} required />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>نوع الكوبون</label>
                          <select className="input-field" value={couponForm.type} onChange={e => setCouponForm({ ...couponForm, type: e.target.value })}>
                            <option value="percentage">نسبة مئوية (%)</option>
                            <option value="fixed">مبلغ ثابت (ر.س)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>القيمة</label>
                          <input type="number" className="input-field" value={couponForm.value} onChange={e => setCouponForm({ ...couponForm, value: e.target.value })} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>الحد الأدنى للطلب (ر.س)</label>
                          <input type="number" className="input-field" value={couponForm.minOrder} onChange={e => setCouponForm({ ...couponForm, minOrder: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>تاريخ الانتهاء</label>
                          <input type="date" className="input-field" value={couponForm.expiry} onChange={e => setCouponForm({ ...couponForm, expiry: e.target.value })} />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: '0.82rem', fontWeight: 900 }}>
                        تفعيل ونشر الكوبون للعملاء
                      </button>
                    </form>
                  </div>
                )}

                {/* 14. الستوريهات والقصص */}
                {activeTab === 'partner_stories' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, marginBottom: 16 }}>🎬 قصص (Stories) المتجر بالتطبيق</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                        {stories.map(s => (
                          <div key={s.id} style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}>
                            <img src={s.url} alt="story" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                            <div style={{ padding: 8 }}>
                              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)', display: 'block' }}>👁️ {s.clicks} مشاهدة وتفاعل</span>
                              <span style={{ fontSize: '0.62rem', color: '#10b981', fontWeight: 'bold', display: 'block', marginTop: 4 }}>✓ نشط بالتطبيق</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>🎬 رفع قصة إعلانية مصورة</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رابط صورة الستوري (مقاس 9:16 طولي)</label>
                        <input type="text" className="input-field" defaultValue="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80" />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>المنتج المرتبط بالقصة (يظهر للزبون للشراء المباشر)</label>
                        <select className="input-field">
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          alert('✓ تم رفع الستوري الإعلاني وهو بانتظار اعتماد الأدمن للسلامة التحريرية.');
                          setStories(prev => [...prev, { id: 'story-' + Date.now(), url: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=500&q=80', product_id: 'prod-2', clicks: 0, status: 'pending' }]);
                        }}
                        className="btn btn-primary"
                        style={{ padding: 12, fontSize: '0.82rem' }}
                      >
                        تحميل ونشر الستوري لتدقيق المدير
                      </button>
                    </div>
                  </div>
                )}

                {/* 15. الحملات الممولة */}
                {activeTab === 'partner_campaigns' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, marginBottom: 16 }}>📣 حملاتك التسويقية الممولة</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {campaigns.map(c => (
                          <div key={c.id} style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ fontSize: '0.85rem', display: 'block' }}>{c.name}</strong>
                              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>
                                النوع: {c.target} • الميزانية: {c.budget} ر.س • المدة: {c.duration} أيام • الحالة: 
                                <span style={{
                                  color: 
                                    c.status === 'active' ? '#10b981' :
                                    c.status === 'pending_review' ? '#f59e0b' : '#ef4444',
                                  fontWeight: 'bold',
                                  marginRight: 4
                                }}>
                                  {c.status === 'active' ? 'نشطة حالياً ✓' :
                                   c.status === 'pending_review' ? 'قيد التدقيق والفوترة' : 'مرفوضة'}
                                </span>
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleCreateCampaign} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>📣 طلب إطلاق حملة ممولة جديدة</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>اسم الحملة الإعلانية</label>
                        <input type="text" className="input-field" placeholder="مثال: حملة الصيف الكبرى" value={campaignForm.name} onChange={e => setCampaignForm({ ...campaignForm, name: e.target.value })} required />
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>نوع الترويج المطلوب</label>
                        <select className="input-field" value={campaignForm.target} onChange={e => setCampaignForm({ ...campaignForm, target: e.target.value })}>
                          <option value="توب ليست في التطبيق">توب ليست في التطبيق (ظهور متصدر)</option>
                          <option value="بنر رئيسي بالتطبيق">بنر إعلاني في الواجهة الرئيسية</option>
                          <option value="إشعار ممول عاجل للزبائن">إشعار دفع ممول للعملاء في الرياض</option>
                        </select>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>ميزانية الحملة بالريال</label>
                          <input type="number" className="input-field" value={campaignForm.budget} onChange={e => setCampaignForm({ ...campaignForm, budget: e.target.value })} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>المدة بالخطة (أيام)</label>
                          <input type="number" className="input-field" value={campaignForm.duration} onChange={e => setCampaignForm({ ...campaignForm, duration: e.target.value })} />
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: '0.82rem' }}>
                        تقديم الحملة للموافقة والفوترة
                      </button>
                    </form>
                  </div>
                )}

                {/* 16. المنتجات الممولة */}
                {activeTab === 'partner_sponsored_products' && (
                  <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 900, margin: 0 }}>⭐ المنتجات والوجبات الممولة المروج لها</h3>
                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>اختر منتجات ليتم وضع علامة "مميزة وممولة" عليها في واجهة تطبيق الزبون</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {products.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px' }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem', display: 'block' }}>{p.name}</strong>
                            <span style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)' }}>الحالة الإعلانية الجارية: 
                              <span style={{ color: p.is_sponsored ? '#10b981' : 'var(--color-text-muted)', fontWeight: 'bold', marginRight: 4 }}>
                                {p.is_sponsored ? 'ممولة نشطة بالتطبيق' : 'عادي غير ممول'}
                              </span>
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              const next = !p.is_sponsored;
                              setProducts(prev => prev.map(item => item.id === p.id ? { ...item, is_sponsored: next } : item));
                              alert(next ? '✓ تم تمويل هذا المنتج! سيظهر في قسم "الوجبات بخصومات عالية" بالتطبيق.' : 'تم إلغاء التمويل الإعلاني.');
                            }}
                            className="btn btn-secondary"
                            style={{
                              padding: '6px 12px',
                              fontSize: '0.72rem',
                              background: p.is_sponsored ? 'rgba(16,185,129,0.1)' : 'transparent',
                              border: '1px solid ' + (p.is_sponsored ? '#10b981' : 'rgba(255,255,255,0.1)'),
                              color: p.is_sponsored ? '#10b981' : 'white'
                            }}
                          >
                            {p.is_sponsored ? 'إيقاف الترويج' : 'تمويل المنتج الآن ⭐'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 17. المحادثات */}
                {activeTab === 'partner_chats' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, height: '480px' }}>
                    {/* Chat Users Sidebar */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', display: 'block', padding: '0 6px 6px 6px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>محادثات العملاء والمناديب النشطة</span>
                      {chats.map(chat => (
                        <div
                          key={chat.id}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '12px',
                            background: 'rgba(255,255,255,0.02)',
                            cursor: 'pointer',
                            border: '1px solid rgba(255,255,255,0.03)'
                          }}
                          onClick={() => alert(`💬 فتح المحادثة الخاصة بـ: ${chat.user_name}`)}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '0.78rem', color: 'white' }}>{chat.user_name}</strong>
                            <span style={{ fontSize: '0.58rem', color: 'var(--color-text-muted)' }}>{chat.time}</span>
                          </div>
                          <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', margin: '4px 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{chat.last_msg}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chat Area Mock */}
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 20, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>{activeChatOrder ? activeChatOrder.customer_name : 'سليمان المطيري'}</strong>
                          <span style={{ fontSize: '0.68rem', color: '#10b981' }}>أونلاين حالياً</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '10px' }}>محادثة الطلب #101</span>
                      </div>

                      {/* Messages Stream */}
                      <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
                        <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '10px 14px', borderRadius: '14px 14px 14px 0', fontSize: '0.78rem', maxWidth: '80%' }}>
                          يا شريك، الطلب مسجل إنه طالع من نص ساعة ولسه ما وصلني!
                        </div>
                        <div style={{ alignSelf: 'flex-end', background: '#a855f7', padding: '10px 14px', borderRadius: '14px 14px 0 14px', fontSize: '0.78rem', maxWidth: '80%' }}>
                          مرحباً بك يا أخي العزيز. طلبك تم الانتهاء من طبخه وهو حالياً مع المندوب أحمد وهو في الطريق إليك الآن.
                        </div>
                      </div>

                      {/* Input Box */}
                      <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10 }}>
                        <input type="text" className="input-field" placeholder="اكتب ردك للعميل هنا..." style={{ flex: 1 }} />
                        <button onClick={() => alert('💬 تم إرسال الرد بنجاح للعميل!')} className="btn btn-primary" style={{ padding: '0 20px', fontSize: '0.78rem' }}>إرسال</button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 18. الأرباح والعمولات والمالية */}
                {activeTab === 'partner_earnings' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>صافي أرباح الشريك القابلة للسحب</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#10b981', margin: '4px 0' }}>٣,٤٢٠.٠٠ ر.س</h2>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>سيتم الإيداع تلقائياً في حسابك بعد غد</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>عمولات المنصة المستقطعة (١٠٪)</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0' }}>٣٨٠.٠٠ ر.س</h2>
                        <span style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)' }}>بناء على ٣٨ طلب مبيعات</span>
                      </div>
                      <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 18, borderRadius: 16 }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>إجمالي إيرادات المبيعات الكلية</span>
                        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', margin: '4px 0' }}>٣,٨٠٠.٠٠ ر.س</h2>
                        <span style={{ fontSize: '0.65rem', color: '#10b981' }}>تشمل ضريبة القيمة المضافة</span>
                      </div>
                    </div>

                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, marginBottom: 16 }}>💵 سجل التحويلات والعمليات المالية المستلمة</h3>
                      
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.8rem' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--color-text-muted)' }}>
                            <th style={{ padding: '10px 0' }}>رقم عملية الإيداع</th>
                            <th>التاريخ والوقت</th>
                            <th>الحساب البنكي المحول له</th>
                            <th>المبلغ المودع</th>
                            <th>الحالة الإدارية</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '12px 0' }}>TRN-4891024</td>
                            <td>٢٥ مايو ٢٠٢٦ - ٠٣:٠٠ م</td>
                            <td>SA84 2000 0010 2456 7890 0123</td>
                            <td style={{ fontWeight: 'bold', color: '#10b981' }}>١,٨٤٠.٠٠ ر.س</td>
                            <td><span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ تم التحويل والإيداع</span></td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <td style={{ padding: '12px 0' }}>TRN-4876521</td>
                            <td>١٨ مايو ٢٠٢٦ - ١١:١٥ ص</td>
                            <td>SA84 2000 0010 2456 7890 0123</td>
                            <td style={{ fontWeight: 'bold', color: '#10b981' }}>١,٥٨٠.٠٠ ر.س</td>
                            <td><span style={{ color: '#10b981', fontWeight: 'bold' }}>✓ تم التحويل والإيداع</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 19. الاشتراك والخطط والترقية */}
                {activeTab === 'partner_plans' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: 8 }}>💼 باقات واشتراكات بوابات الشركاء والمتاجر</h2>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem' }}>اختر الخطة الأمثل للفرع الخاص بك وافتح الميزات الترويجية لزيادة حجم تجارتك</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                      {/* Plan 1 */}
                      <div style={{
                        background: partnerPlan === 1000 ? 'rgba(168,85,247,0.1)' : 'var(--glass-bg)',
                        border: partnerPlan === 1000 ? '2px solid #a855f7' : '1px solid var(--glass-border)',
                        padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12
                      }}>
                        <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 900 }}>الخطة الأساسية</span>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>١,٠٠٠ <span style={{ fontSize: '0.72rem' }}>ر.س/شهر</span></h2>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>مناسبة للمطاعم والمتاجر الجديدة</span>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                        <span style={{ fontSize: '0.72rem' }}>• إدارة وتحديث الكتالوج والمنيو</span>
                        <span style={{ fontSize: '0.72rem' }}>• استقبال طلبات التوصيل الجارية</span>
                        <span style={{ fontSize: '0.72rem' }}>• مؤشرات الأداء الأساسية للبيع</span>
                        <span style={{ fontSize: '0.72rem' }}>• دعم فني تقليدي</span>
                        <button
                          onClick={() => handleSavePlanUpgrade(1000)}
                          className="btn btn-secondary"
                          style={{ marginTop: 'auto', width: '100%', fontSize: '0.75rem', color: 'white' }}
                        >
                          {partnerPlan === 1000 ? '✓ خطتك الحالية' : 'تفعيل الباقة'}
                        </button>
                      </div>

                      {/* Plan 2 */}
                      <div style={{
                        background: partnerPlan === 2000 ? 'rgba(168,85,247,0.1)' : 'var(--glass-bg)',
                        border: partnerPlan === 2000 ? '2px solid #a855f7' : '1px solid var(--glass-border)',
                        padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12
                      }}>
                        <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 900 }}>خطة النمو</span>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>٢,٠٠٠ <span style={{ fontSize: '0.72rem' }}>ر.س/شهر</span></h2>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>كل شيء بالأساسية إضافة إلى:</span>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                        <span style={{ fontSize: '0.72rem' }}>• كوبونات الخصم الترويجية الخاصة</span>
                        <span style={{ fontSize: '0.72rem' }}>• عروض فلاش محدودة وعاجلة</span>
                        <span style={{ fontSize: '0.72rem' }}>• قصص وستوريهات للفرع بالتطبيق</span>
                        <span style={{ fontSize: '0.72rem' }}>• تقارير تشغيل أفضل</span>
                        <button
                          onClick={() => handleSavePlanUpgrade(2000)}
                          className="btn btn-secondary"
                          style={{ marginTop: 'auto', width: '100%', fontSize: '0.75rem', color: 'white' }}
                        >
                          {partnerPlan === 2000 ? '✓ خطتك الحالية' : 'تفعيل الباقة'}
                        </button>
                      </div>

                      {/* Plan 3 */}
                      <div style={{
                        background: partnerPlan === 3000 ? 'rgba(168,85,247,0.1)' : 'var(--glass-bg)',
                        border: partnerPlan === 3000 ? '2px solid #a855f7' : '1px solid var(--glass-border)',
                        padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12
                      }}>
                        <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 900 }}>الخطة الاحترافية (موصى بها)</span>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>٣,٠٠٠ <span style={{ fontSize: '0.72rem' }}>ر.س/شهر</span></h2>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>كل شيء بالنمو إضافة إلى:</span>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                        <span style={{ fontSize: '0.72rem' }}>• المنتجات الممولة الترويجية بالتطبيق</span>
                        <span style={{ fontSize: '0.72rem' }}>• إدارة واسترجاع السلات المتروكة</span>
                        <span style={{ fontSize: '0.72rem' }}>• طلب حملات ممولة شهرية</span>
                        <span style={{ fontSize: '0.72rem' }}>• ظهور ذكي وتصنيف أفضل بالبحث</span>
                        <button
                          onClick={() => handleSavePlanUpgrade(3000)}
                          className="btn btn-secondary"
                          style={{ marginTop: 'auto', width: '100%', fontSize: '0.75rem', color: 'white' }}
                        >
                          {partnerPlan === 3000 ? '✓ خطتك الحالية' : 'تفعيل الباقة'}
                        </button>
                      </div>

                      {/* Plan 4 */}
                      <div style={{
                        background: partnerPlan === 5000 ? 'rgba(168,85,247,0.1)' : 'var(--glass-bg)',
                        border: partnerPlan === 5000 ? '2px solid #a855f7' : '1px solid var(--glass-border)',
                        padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 12
                      }}>
                        <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 900 }}>خطة التميز الكبرى 👑</span>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>٥,٠٠٠ <span style={{ fontSize: '0.72rem' }}>ر.س/شهر</span></h2>
                        <span style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)' }}>كل شيء بالاحترافية إضافة إلى:</span>
                        <hr style={{ borderColor: 'rgba(255,255,255,0.05)' }} />
                        <span style={{ fontSize: '0.72rem' }}>• توب ليست وبنرات إعلانية بالرئيسية</span>
                        <span style={{ fontSize: '0.72rem' }}>• إشعارات ترويجية دفع غير محدودة</span>
                        <span style={{ fontSize: '0.72rem' }}>• مدير حساب مالي وتشغيلي مخصص</span>
                        <span style={{ fontSize: '0.72rem' }}>• تقارير ذكاء أعمال مخصصة</span>
                        <button
                          onClick={() => handleSavePlanUpgrade(5000)}
                          className="btn btn-secondary"
                          style={{ marginTop: 'auto', width: '100%', fontSize: '0.75rem', color: 'white' }}
                        >
                          {partnerPlan === 5000 ? '✓ خطتك الحالية' : 'تفعيل الباقة'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 20. تذاكر الدعم الفني */}
                {activeTab === 'partner_support' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900, marginBottom: 16 }}>🎫 تذاكر الدعم الفني السابقة والجارية</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {supportTickets.map(t => (
                          <div key={t.id} style={{ padding: 14, background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <span style={{ fontSize: '0.62rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px' }}>{t.category}</span>
                                <strong style={{ fontSize: '0.85rem', display: 'block', marginTop: 4 }}>تذكرة رقم #{t.id}</strong>
                              </div>
                              <span style={{
                                fontSize: '0.68rem',
                                color: t.status === 'open' ? '#f59e0b' : '#10b981',
                                fontWeight: 'bold'
                              }}>
                                {t.status === 'open' ? 'قيد المعالجة الإدارية ⏳' : 'محلولة ومغلقة ✓'}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: '8px 0 0 0' }}>{t.description}</p>
                            
                            <div style={{ borderTop: '1px solid rgba(255,255,255,0.02)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>المستند المرفق: لا يوجد</span>
                              <button
                                onClick={() => setActiveTicketChat(activeTicketChat === t.id ? null : t.id)}
                                className="btn btn-secondary"
                                style={{ padding: '4px 10px', fontSize: '0.68rem' }}
                              >
                                {activeTicketChat === t.id ? 'إغلاق المحادثة' : '💬 فتح محادثة الدعم'}
                              </button>
                            </div>

                            {/* TICKET MESSAGES STREAM */}
                            {activeTicketChat === t.id && (
                              <div style={{ marginTop: 12, padding: 12, background: 'rgba(0,0,0,0.2)', borderRadius: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 'bold' }}>محادثة الدعم المباشرة لتذكرة #{t.id}</span>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: '200px', overflowY: 'auto' }} className="no-scrollbar">
                                  {(ticketMessages[t.id] || []).map(msg => (
                                    <div key={msg.id} style={{
                                      padding: '8px 10px',
                                      borderRadius: '8px',
                                      background: msg.sender_role === 'partner' ? 'rgba(168,85,247,0.15)' : 'rgba(255,255,255,0.05)',
                                      alignSelf: msg.sender_role === 'partner' ? 'flex-end' : 'flex-start',
                                      fontSize: '0.72rem',
                                      maxWidth: '90%'
                                    }}>
                                      <strong>{msg.sender_name}: </strong> {msg.message_text}
                                    </div>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                                  <input
                                    type="text"
                                    className="input-field"
                                    placeholder="اكتب ردك..."
                                    style={{ padding: '6px 10px', fontSize: '0.72rem' }}
                                    value={newTicketMessage}
                                    onChange={e => setNewTicketMessage(e.target.value)}
                                    onKeyDown={e => {
                                      if (e.key === 'Enter') handleSendTicketMessage(t.id);
                                    }}
                                  />
                                  <button
                                    onClick={() => handleSendTicketMessage(t.id)}
                                    className="btn btn-primary"
                                    style={{ padding: '0 12px', fontSize: '0.72rem' }}
                                  >
                                    إرسال
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={handleCreateSupportTicket} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>🎫 فتح تذكرة دعم فني جديدة</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>فئة المشكلة الفنية</label>
                        <select
                          className="input-field"
                          value={supportForm.category}
                          onChange={e => setSupportForm({ ...supportForm, category: e.target.value })}
                        >
                          <option value="كتالوج ومبيعات">كتالوج المنتجات والمنيو</option>
                          <option value="مشاكل بالتطبيق">مشكلة فنية بالتطبيق أو الخريطة</option>
                          <option value="حساب وماليات">أرباح وتحويلات وعمولات مالية</option>
                          <option value="دعم عام">استفسارات عامة واقتراحات</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>الأهمية والأولوية</label>
                        <select
                          className="input-field"
                          value={supportForm.priority}
                          onChange={e => setSupportForm({ ...supportForm, priority: e.target.value })}
                        >
                          <option value="low">منخفضة (سؤال عام)</option>
                          <option value="medium">متوسطة (تعديل بالمنيو)</option>
                          <option value="high">عاجلة جداً (عطل بالاستقبال أو الطلبات)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>اشرح المشكلة بالتفصيل</label>
                        <textarea
                          className="input-field"
                          rows={4}
                          placeholder="يرجى كتابة رقم الطلب وتوضيح المشكلة لمساعدتك سريعاً..."
                          value={supportForm.description}
                          onChange={e => setSupportForm({ ...supportForm, description: e.target.value })}
                          required
                        />
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: 12, fontSize: '0.82rem' }}>
                        إرسال وفتح التذكرة الآن
                      </button>
                    </form>
                  </div>
                )}

                {/* 21. إعدادات الحساب والصلاحيات */}
                {activeTab === 'partner_settings' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20 }}>
                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>⚙️ إعدادات الأمان وبيانات الدخول للفرع</h3>
                      
                      <div>
                        <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>البريد الإلكتروني الأساسي للمسؤول</label>
                        <input type="email" className="input-field" value={email} onChange={e => setEmail(e.target.value)} />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>كلمة المرور الحالية</label>
                          <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>كلمة المرور الجديدة</label>
                          <input type="password" className="input-field" placeholder="••••••••" />
                        </div>
                      </div>

                      <h3 style={{ fontSize: '0.85rem', fontWeight: 900, marginTop: 10, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 14 }}>🏦 معلومات الحساب المصرفي (IBAN) للمستحقات المباشرة</h3>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 10 }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>اسم البنك المعتمد</label>
                          <input type="text" className="input-field" defaultValue="مصرف الراجحي" />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 6 }}>رقم الآيبان (IBAN)</label>
                          <input type="text" className="input-field" defaultValue="SA84 2000 0010 2456 7890 0123" />
                        </div>
                      </div>

                      <button onClick={() => alert('✓ تم حفظ إعدادات الأمان والتحويل البنكي بنجاح!')} className="btn btn-primary" style={{ padding: 12, marginTop: 10, fontSize: '0.82rem' }}>
                        حفظ إعدادات الحساب البنكي
                      </button>
                    </div>

                    <div style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', padding: 20, borderRadius: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 900 }}>👥 طاقم عمل الفرع وصلاحيات الكاشير والطهي</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '0.78rem', display: 'block' }}>عبدالرحمن خالد (أنت)</strong>
                            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>مدير الفرع الأساسي (المالك)</span>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#a855f7', fontWeight: 'bold' }}>صلاحية كاملة</span>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '0.78rem', display: 'block' }}>وليد العجمي</strong>
                            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>كاشير الفرع ومسؤول الطلبات</span>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'white' }}>صلاحية الطلبات</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'rgba(255,255,255,0.01)', borderRadius: '8px' }}>
                          <div>
                            <strong style={{ fontSize: '0.78rem', display: 'block' }}>ماريو سيلفا</strong>
                            <span style={{ fontSize: '0.62rem', color: 'var(--color-text-muted)' }}>رئيس الطهاة ومجهز الوجبات بالفرن</span>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'white' }}>تعديل المنيو والتوفر</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const name = prompt('اكتب اسم الموظف الجديد:');
                          const role = prompt('الدور (مثال: كاشير، طباخ):', 'كاشير');
                          if (name) alert(`✓ تم إرسال رابط دعوة عمل بنجاح للموظف: ${name} لدخول الفرع.`);
                        }}
                        className="btn btn-secondary"
                        style={{ padding: '8px 16px', fontSize: '0.75rem', width: '100%', color: 'white' }}
                      >
                        + دعوة موظف جديد لطاقم العمل بالفرع
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            )}
          </AnimatePresence>

        </main>
      </div>

      {/* CREATE MODAL: ADD / EDIT PRODUCT */}
      {showAddProductModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
          <form onSubmit={handleProductSubmit} style={{ background: '#1c0f33', border: '1px solid rgba(168,85,247,0.4)', padding: 24, borderRadius: 20, width: '450px', display: 'flex', flexDirection: 'column', gap: 12, direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'white' }}>
              {editingProduct ? 'تعديل بيانات المنتج بالمنيو' : 'إضافة منتج/طبق جديد للكتالوج'}
            </h3>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>اسم المنتج / الطبق</label>
              <input type="text" className="input-field" placeholder="مثال: برجر دجاج مقرمش" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>السعر العادي (بالريال)</label>
                <input type="text" className="input-field" placeholder="مثال: ٢٥" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} required />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>السعر بعد الخصم (اختياري)</label>
                <input type="text" className="input-field" placeholder="مثال: ٢٠" value={productForm.discountPrice} onChange={e => setProductForm({ ...productForm, discountPrice: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>مجموعة المنيو (التصنيف)</label>
              <select className="input-field" value={productForm.categoryId} onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}>
                {menuCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>وصف قصير للمكونات</label>
              <input type="text" className="input-field" placeholder="مثال: صدر دجاج مقرمش، خس، صوص خاص..." value={productForm.descShort} onChange={e => setProductForm({ ...productForm, descShort: e.target.value })} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>المخزون المتوفر</label>
                <input type="number" className="input-field" value={productForm.stock} onChange={e => setProductForm({ ...productForm, stock: e.target.value })} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>مدة التحضير (دقائق)</label>
                <input type="number" className="input-field" value={productForm.prepTime} onChange={e => setProductForm({ ...productForm, prepTime: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--color-text-muted)', marginBottom: 4 }}>رابط صورة الوجبة الترويجية</label>
              <input type="text" className="input-field" value={productForm.images} onChange={e => setProductForm({ ...productForm, images: e.target.value })} />
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={productForm.isFeatured} onChange={e => setProductForm({ ...productForm, isFeatured: e.target.checked })} />
                <span>وجبة مميزة بالصفحة الأولى ⭐</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.75rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={productForm.isSponsored} onChange={e => setProductForm({ ...productForm, isSponsored: e.target.checked })} disabled={partnerPlan < 3000} />
                <span style={{ color: partnerPlan < 3000 ? 'rgba(255,255,255,0.3)' : 'white' }}>ترويج ممول بالخطة (Pro) 📣</span>
              </label>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>حفظ الكتالوج</button>
              <button type="button" className="btn btn-secondary" style={{ flex: 1, color: 'white' }} onClick={() => { setShowAddProductModal(false); setEditingProduct(null); }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* PRINT RECEIPT MODAL */}
      {selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(8px)' }}>
          <div style={{ background: '#fff', color: '#000', padding: '30px', borderRadius: '16px', width: '380px', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: 'monospace', direction: 'rtl', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            
            {/* Header receipt */}
            <div style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '14px', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '0 0 4px 0', fontFamily: 'Cairo, sans-serif' }}>مطعم البيك الوجبات</h2>
              <span style={{ fontSize: '0.72rem', display: 'block' }}>طريق الملك عبدالعزيز، الصحافة، الرياض</span>
              <span style={{ fontSize: '0.72rem', display: 'block' }}>السجل الضريبي الموحد: {vatNumber}</span>
              <span style={{ fontSize: '0.72rem', display: 'block' }}>رقم الفاتورة: #INV-{selectedOrder.id}</span>
              <span style={{ fontSize: '0.72rem', display: 'block' }}>التاريخ: {new Date(selectedOrder.created_at).toLocaleString('ar-SA')}</span>
            </div>

            {/* Customer specs */}
            <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 10, borderBottom: '1px dashed #000' }}>
              <span>👤 الزبون: {selectedOrder.customer_name}</span>
              <span>📞 جوال: {selectedOrder.customer_phone}</span>
              <span>📍 العنوان: {selectedOrder.customer_address}</span>
              <span>💳 طريقة الدفع: {selectedOrder.payment_method}</span>
            </div>

            {/* Menu specifications table */}
            <div style={{ fontSize: '0.78rem', borderBottom: '2px dashed #000', padding: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '8px' }}>
                <span>الصنف والكمية</span>
                <span>المبلغ</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span>{selectedOrder.items}</span>
                <span>{selectedOrder.price_total} ر.س</span>
              </div>
              {selectedOrder.notes && (
                <div style={{ fontSize: '0.68rem', color: '#555', marginTop: 4, fontStyle: 'italic' }}>
                  * ملاحظة: {selectedOrder.notes}
                </div>
              )}
            </div>

            {/* Accounting details */}
            <div style={{ fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: 4, borderBottom: '1px solid #000', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>المجموع الفرعي (غير شامل الضريبة)</span>
                <span>{(selectedOrder.price_total / 1.15).toFixed(2)} ر.س</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>ضريبة القيمة المضافة (١٥٪)</span>
                <span>{(selectedOrder.price_total - (selectedOrder.price_total / 1.15)).toFixed(2)} ر.س</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', fontWeight: 'bold', marginTop: '6px' }}>
                <span>إجمالي الفاتورة الصافية</span>
                <span>{selectedOrder.price_total} ر.س</span>
              </div>
            </div>

            {/* Platform commission info (visible on print preview) */}
            <div style={{ fontSize: '0.65rem', background: '#f5f5f5', padding: '8px', borderRadius: '6px', color: '#444', textAlign: 'center' }}>
              <span>عمولة منصة BoostX المستقطعة (١٠٪): {selectedOrder.commission} ر.س</span>
              <span style={{ display: 'block', fontWeight: 'bold', color: '#10b981', marginTop: 2 }}>صافي ربح الفرع: {selectedOrder.net_earnings} ر.س</span>
            </div>

            {/* Buttons for printing actions */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                onClick={() => {
                  window.print();
                }}
                className="btn btn-primary"
                style={{ flex: 1, padding: '10px 0', fontSize: '0.8rem', background: '#000', border: '1px solid #000', fontFamily: 'Cairo, sans-serif' }}
              >
                🖨️ طباعة الفاتورة الآن
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ flex: 1, padding: '10px 0', fontSize: '0.8rem', background: '#fff', border: '1px solid #aaa', color: '#000', cursor: 'pointer', borderRadius: '8px', fontFamily: 'Cairo, sans-serif' }}
              >
                إغلاق
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
};

export default PartnerDashboard;

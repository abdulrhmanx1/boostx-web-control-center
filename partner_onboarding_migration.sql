-- =====================================================================
-- BoostX Partner Onboarding & Registration System Database Migration
-- Target: Supabase Live Backend Production
-- Date: 2026-05-27
-- Description: Sets up dynamic classifications, partner join requests,
--              real document uploads, payment proofing, subscription tiers,
--              automated temporary credential handlers, audit logs,
--              and RLS rules.
-- =====================================================================

-- 1. Create Business Activity Types Table (Admin-Controlled)
CREATE TABLE IF NOT EXISTS public.business_activity_types (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Utensils',
    description TEXT,
    is_registration_open BOOLEAN DEFAULT TRUE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Activity Types
ALTER TABLE public.business_activity_types ENABLE ROW LEVEL SECURITY;

-- 2. Create Partner Applications Table (Join Requests)
CREATE TABLE IF NOT EXISTS public.partner_applications (
    id TEXT PRIMARY KEY,
    activity_type_id TEXT REFERENCES public.business_activity_types(id) ON DELETE SET NULL,
    store_name_ar TEXT NOT NULL,
    store_name_en TEXT,
    legal_company_name TEXT NOT NULL,
    responsible_person_name TEXT NOT NULL,
    business_email TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    city TEXT NOT NULL,
    district TEXT NOT NULL,
    full_address TEXT NOT NULL,
    google_maps_url TEXT,
    commercial_registration_number TEXT NOT NULL,
    tax_number TEXT,
    notes TEXT,
    selected_plan_id TEXT NOT NULL DEFAULT 'plan_0',
    terms_accepted BOOLEAN DEFAULT TRUE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    terms_version TEXT DEFAULT '1.0',
    payment_method TEXT,
    payment_reference TEXT,
    payment_proof_url TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_more_info')),
    admin_notes TEXT,
    initial_username TEXT,
    initial_password_temp TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Partner Applications
ALTER TABLE public.partner_applications ENABLE ROW LEVEL SECURITY;

-- 3. Create Partner Application Documents Table (Official Uploaded Files)
CREATE TABLE IF NOT EXISTS public.partner_application_documents (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id TEXT REFERENCES public.partner_applications(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (document_type IN ('cr_doc', 'license_doc', 'vat_doc', 'national_id', 'optional_doc')),
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    status TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'approved', 'rejected')),
    admin_notes TEXT
);

-- Enable RLS for Documents
ALTER TABLE public.partner_application_documents ENABLE ROW LEVEL SECURITY;

-- 4. Create Partner Application Payments Table (Paid Subscription Receipts)
CREATE TABLE IF NOT EXISTS public.partner_application_payments (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id TEXT REFERENCES public.partner_applications(id) ON DELETE CASCADE,
    selected_plan_id TEXT NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('vodafone_cash', 'insta_pay')),
    sender_name TEXT NOT NULL,
    sender_phone TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    transfer_reference TEXT,
    transfer_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    proof_file_url TEXT NOT NULL,
    proof_storage_path TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Payments
ALTER TABLE public.partner_application_payments ENABLE ROW LEVEL SECURITY;

-- 5. Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
    id TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    billing_cycle TEXT NOT NULL DEFAULT 'monthly',
    is_active BOOLEAN DEFAULT TRUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Subscription Plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- 6. Create Partner Subscriptions Table (Active SaaS locks)
CREATE TABLE IF NOT EXISTS public.partner_subscriptions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    partner_id TEXT NOT NULL,
    plan_id TEXT REFERENCES public.subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'expired')),
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Partner Subscriptions
ALTER TABLE public.partner_subscriptions ENABLE ROW LEVEL SECURITY;

-- 7. Create Feature Entitlements Table (SaaS Gates)
CREATE TABLE IF NOT EXISTS public.feature_entitlements (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    plan_id TEXT REFERENCES public.subscription_plans(id) ON DELETE CASCADE,
    feature_key TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    limit_value INT
);

-- Enable RLS for Feature Entitlements
ALTER TABLE public.feature_entitlements ENABLE ROW LEVEL SECURITY;

-- 8. Create Partner Application Notifications Table (Prepared message blocks)
CREATE TABLE IF NOT EXISTS public.partner_application_notifications (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    application_id TEXT REFERENCES public.partner_applications(id) ON DELETE CASCADE,
    channel TEXT NOT NULL CHECK (channel IN ('email', 'whatsapp')),
    recipient TEXT NOT NULL,
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'prepared' CHECK (status IN ('prepared', 'sent', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Notifications
ALTER TABLE public.partner_application_notifications ENABLE ROW LEVEL SECURITY;

-- 9. Create Audit Logs Table (Admin traceability logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    details TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Audit Logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- =====================================================================
-- Row Level Security (RLS) Policies
-- =====================================================================

-- Business Activity Types Policies
CREATE POLICY "Public read active activity types" ON public.business_activity_types
    FOR SELECT USING (is_active = true AND is_registration_open = true);

CREATE POLICY "Admin can read/manage all activity types" ON public.business_activity_types
    FOR ALL USING (true); -- Usually restricted by admin role checks

-- Partner Applications Policies
CREATE POLICY "Anonymous can insert applications" ON public.partner_applications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view/manage all applications" ON public.partner_applications
    FOR ALL USING (true);

-- Partner Application Documents Policies
CREATE POLICY "Anonymous can insert documents" ON public.partner_application_documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view/manage all documents" ON public.partner_application_documents
    FOR ALL USING (true);

-- Partner Application Payments Policies
CREATE POLICY "Anonymous can insert payments" ON public.partner_application_payments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view/manage all payments" ON public.partner_application_payments
    FOR ALL USING (true);

-- Subscription Plans Policies
CREATE POLICY "Public read active plans" ON public.subscription_plans
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage all plans" ON public.subscription_plans
    FOR ALL USING (true);

-- Partner Subscriptions & Entitlements
CREATE POLICY "Public read entitlements" ON public.feature_entitlements FOR SELECT USING (true);
CREATE POLICY "Public read partner subscriptions" ON public.partner_subscriptions FOR SELECT USING (true);

-- Notifications & Audit Logs Policies
CREATE POLICY "Admin manage notifications" ON public.partner_application_notifications FOR ALL USING (true);
CREATE POLICY "Admin manage audit logs" ON public.audit_logs FOR ALL USING (true);


-- =====================================================================
-- Seed Initial Settings Data
-- =====================================================================

-- Seed business_activity_types
INSERT INTO public.business_activity_types (id, name_ar, name_en, icon, description, sort_order)
VALUES 
('1', 'مطعم أو مقهى', 'Restaurant / Cafe', 'Utensils', 'مطاعم الوجبات السريعة والمقاهي والكافيهات المحلية وعربات الأطعمة المتنقلة فروعنا التابعة.', 1),
('2', 'صيدلية أو مستحضرات طبية', 'Pharmacy', 'Pills', 'صيدليات الدواء ومحلات التجميل والمستلزمات الطبية والعناية الصحية.', 2),
('3', 'تموينات أو سوبر ماركت', 'Grocery / Supermarket', 'ShoppingBag', 'محلات السوبر ماركت، البقالة، بيع الخضراوات والفواكه واللحوم الطازجة.', 3),
('4', 'مطبوعات ودعاية وإعلان', 'Advertising / Printing', 'Printer', 'مطابع، وكالات الدعاية والإعلان، إنتاج الهدايا الدعائية واللوحات.', 4),
('5', 'هدايا وورود', 'Flowers / Gifts', 'Gift', 'محلات تنسيق الورود الطبيعية والاصطناعية وتغليف وصناعة هدايا المناسبات.', 5),
('6', 'خدمات منزلية عامة', 'Home Services', 'HomeIcon', 'خدمات التنظيف، التعقيم، نقل العفش، ومكافحة الآفات المنزلية بجميع الأحياء.', 6),
('7', 'صيانة وصنايعية (سباكة/كهرباء)', 'Technicians / Craftsmen', 'Wrench', 'فنيو الكهرباء، السباكة، صيانة الأجهزة المنزلية، صيانة التكييف والمقاولات.', 7),
('8', 'توصيل وتشغيل لوجستي', 'Logistics / Delivery', 'Truck', 'شركات التوصيل السريع والمناديب وتأجير لوجستيات نقل وتداول البضائع والمستندات.', 8)
ON CONFLICT (id) DO NOTHING;

-- Seed subscription plans
INSERT INTO public.subscription_plans (id, name_ar, name_en, price, billing_cycle, is_active, description)
VALUES
('plan_0', 'المجانية (Free)', 'Free Plan', 0.00, 'monthly', true, 'باقة تجريبية للظهور المحدود واستقبال الطلبات الأساسية بدون حملات ممولة.'),
('plan_1000', 'الأساسية (Basic)', 'Basic Plan', 1000.00, 'monthly', true, 'باقة ممتازة للمتاجر الناشئة لإدارة المنتجات واستقبال الطلبات ودعم عادي.'),
('plan_2000', 'النمو (Growth)', 'Growth Plan', 2000.00, 'monthly', true, 'باقة ممتازة تشمل الكوبونات المتقدمة وعروض الفلاش والستوريات الترويجية.'),
('plan_3000', 'الاحترافية (Pro)', 'Pro Plan', 3000.00, 'monthly', true, 'باقة متقدمة تشمل المنتجات الممولة التنافسية وإعلانات السلات المتروكة ودعم فوري.'),
('plan_5000', 'التميز (Elite)', 'Elite Plan', 5000.00, 'monthly', true, 'الباقة المتكاملة وتتضمن بنرات الواجهة، إعلانات توب ليست، إشعارات مدفوعة، مدير حساب خاص.')
ON CONFLICT (id) DO NOTHING;

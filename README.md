# BoostX Web Control Center Workspace

This directory contains the back-office administrative portals, dashboards, landing websites, and business control panels for the **BoostX** platform.

## Architecture & Safe Separation Plan (Phase 2 Completed)

All web-specific dashboards, landing websites, registration/login portals, and operations control centers have been cleanly separated from customer-facing mobile interfaces and placed into a modular folder structure.

### Web Control Center Components (Separated)

The following components are now separated into clean, modular files inside `/src/components/`:

1.  **Super Admin Control Center** (`src/components/dashboards/SuperAdminDashboard.tsx`):
    *   Controls for geographic ops (Saudi Arabia 🇸🇦 & Egypt 🇪🇬).
    *   Financial analytics, operations, systems health check, and database schema sandbox.
    *   Privilege and role escalation settings for staff.
2.  **Administrative Dashboard** (`src/components/dashboards/AdminDashboard.tsx`):
    *   Identity and document verification for partners (Sells/CR check) and drivers.
    *   Product catalog auditing and fraud reports dashboard.
3.  **Partner Portal** (`src/components/dashboards/PartnerDashboard.tsx`):
    *   Complete management console for store owners.
    *   Catalog customizers, working hours scheduling, live order preparations, and dynamic promotional stories creation.
4.  **Technician Portal** (`src/components/dashboards/TechnicianDashboard.tsx`):
    *   Booking and appointment managers for maintenance, plumbing, electrical, and home services.
    *   Service pricing, availability states, and custom labor billing.
5.  **Driver Portal** (`src/components/dashboards/DriverDashboard.tsx`):
    *   Active delivery task managers and routing status check.
    *   Earnings panels, fleet vehicle registration, and driver documents log.
6.  **Official Website & Landing Portals** (`src/components/OfficialWebsite.tsx`):
    *   Re-exported public web templates containing landing pages, portals hub page, legal policies, and multi-role login portals (`RoleLoginPage`).

---

## Workspace Separation Summary

### 💻 Included Web Control Center Portals & Routes
*   `/`: Public Landing Homepage
*   `/services`: Public Services Guide Page
*   `/portals`: Multi-Role Portal Entry Hub
*   `/partners/register` & `/partners/login`: Partner enrollment and login portal
*   `/technicians/register` & `/technicians/login`: Technician registration and login portal
*   `/drivers/register` & `/drivers/login`: Driver registration and login portal
*   `/admin/login`: Platform admin panel login
*   `/super-admin/login`: Root executive panel login
*   `/super-admin`: Super Admin operations portal
*   `/admin`: Platform Admin verification panel
*   `/partner`: Store catalog & campaign manager
*   `/technician`: Service schedule & booking board
*   `/driver`: Delivery task lists & vehicle verification

### 📱 Excluded Customer Mobile App Screens (Left Untouched)
*   `CustomerHomeView` (Mobile client home page)
*   `CartView` (Mobile Apple Pay checkout slider)
*   `OrdersMobileView` (Customer orders checklist)
*   `OffersMobileView` (Seasons events tickets / Combo packages)
*   `OrderTrackingView` (Bezier-based live map order tracking screen)
*   `NotificationsCenterView` (Customer notification logs)

---

## Supabase Backend & Database Integration Plan
Currently, all workspaces reference a mock dataset fallback for offline sandboxing. In the next phase, the control center dashboards will be connected to the shared Supabase backend located in the `shared/` workspace:

1.  **Shared Database Schema:** The tables (`partner_applications`, `driver_applications`, `orders`, `driver_locations`, `ad_campaigns`) are defined globally inside the shared monorepo context (`supabase_schema.sql` at root).
2.  **Consolidated Database Client:** Both workspaces import `@supabase/supabase-js` instances directly from `boostx-shared` workspace, ensuring database pools, session state, and real-time subscription pools (`BX_REALTIME_CHANGE`) are synchronized seamlessly.
3.  **Security and Row-Level Security (RLS):** All web dashboards will execute database updates with verified session tokens to securely authenticate administrative operations on the shared backend.

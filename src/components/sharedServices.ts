/**
 * BoostX Web Control Center - Shared Backend Services Reference & Placeholders
 * 
 * This file serves as the centralized import configuration and documentation
 * for the transition to the shared Supabase/API monorepo layer in the next phase.
 * 
 * Do NOT fully refactor live dashboards yet. Use these definitions as import placeholders.
 */

// Import path placeholder referencing the 'boostx-shared' workspace package
// both in local development and production bundles.
import { 
  partnerService, 
  settingsService, 
  orderService, 
  notificationService, 
  homeService,
  productService,
  trackingService,
  authService
} from 'boostx-shared';

export {
  partnerService,
  settingsService,
  orderService,
  notificationService,
  homeService,
  productService,
  trackingService,
  authService
};

// =====================================================================
// 💻 ADMINISTRATIVE DASHBOARDS & CORRESPONDING SHARED SERVICES MAPPING
// =====================================================================
//
// 1. SuperAdminDashboard.tsx
//    - Services: 'partnerService', 'orderService', 'homeService'
//    - Usage: Audits aggregate performance analytics, configures coverage zones, 
//             and reviews staff operational permissions.
//
// 2. AdminDashboard.tsx
//    - Services: 'partnerService', 'notificationService'
//    - Usage: Reviews business/driver applications document details, verifies IBANs,
//             and tracks active platform complaints.
//
// 3. PartnerDashboard.tsx
//    - Services: 'partnerService', 'productService', 'orderService', 'homeService'
//    - Usage: Customizes store cover identity, structures product catalogs,
//             fulfills orders, and publishes advertising campaigns stories.
//
// 4. TechnicianDashboard.tsx
//    - Services: 'partnerService', 'settingsService'
//    - Usage: Sets service pricing items, schedules active labor hours,
//             and receives client home repair bookings.
//
// 5. DriverDashboard.tsx
//    - Services: 'orderService', 'trackingService'
//    - Usage: Lists available dispatch orders, updates linear map coordinates,
//             and tracks digital payout wallets.
//
// 6. OfficialWebsite.tsx & Portals
//    - Services: 'authService', 'settingsService'
//    - Usage: Manages new store enrollments and routes user login redirects securely.
//
// =====================================================================

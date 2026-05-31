export const VENDOR_AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  unauthorized: "/unauthorized",
  rejected: "/account/rejected",
  suspended: "/account/suspended",
} as const;

export const VENDOR_PROTECTED_PATHS = [
  "/",
  "/dashboard",
  "/profile",
  "/services",
  "/portfolio",
  "/bookings",
  "/payments",
] as const;

export const USER_AUTH_ROUTES = {
  home: "/",
  vendors: "/vendors",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  bookings: "/bookings",
  bookingCreate: "/bookings/create",
  payments: "/payments",
  reviews: "/reviews",
  profile: "/profile",
  unauthorized: "/unauthorized",
  suspended: "/account/suspended",
} as const;

export const USER_PUBLIC_ROUTES = [
  USER_AUTH_ROUTES.home,
  USER_AUTH_ROUTES.login,
  USER_AUTH_ROUTES.register,
  USER_AUTH_ROUTES.forgotPassword,
] as const;

export const USER_PROTECTED_ROUTE_PREFIXES = [
  USER_AUTH_ROUTES.dashboard,
  USER_AUTH_ROUTES.bookings,
  USER_AUTH_ROUTES.payments,
  USER_AUTH_ROUTES.reviews,
  USER_AUTH_ROUTES.profile,
] as const;

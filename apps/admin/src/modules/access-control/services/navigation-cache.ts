import "server-only";

import { revalidateTag } from "next/cache";

export const ADMIN_NAVIGATION_CACHE_TAG = "admin-navigation";

export const revalidateAdminNavigationCache = () => {
  revalidateTag(ADMIN_NAVIGATION_CACHE_TAG, "max");
};

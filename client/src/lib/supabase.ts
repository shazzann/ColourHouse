// DEPRECATED: This file has been replaced with @/lib/api
// This is kept for backward compatibility. All Supabase functionality has been migrated to local API endpoints.
// Please use @/lib/api instead for all new code.

import { 
  getProducts as apiGetProducts,
  getProduct as apiGetProduct,
  getCategories as apiGetCategories,
  getSettings as apiGetSettings,
  checkUserRole as apiCheckUserRole,
  getProductCategories as apiGetProductCategories,
  getProductCategoryNames as apiGetProductCategoryNames,
  updateProductCategories as apiUpdateProductCategories,
} from "@/lib/api";

// Re-export for backward compatibility
export const getSettings = apiGetSettings;
export const getProducts = apiGetProducts;
export const getProduct = apiGetProduct;
export const getCategories = apiGetCategories;
export const checkUserRole = apiCheckUserRole;
export const updateProductCategories = apiUpdateProductCategories;
export const getProductCategories = apiGetProductCategories;
export const getProductCategoryNames = apiGetProductCategoryNames;


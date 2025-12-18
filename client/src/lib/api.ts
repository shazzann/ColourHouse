const ORIGIN = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
const API_BASE = `${ORIGIN}/api`;

let authToken: string | null = null;

// Load token from localStorage on initialization
if (typeof window !== 'undefined') {
  authToken = localStorage.getItem('auth_token');
}

const getAuthHeader = () => {
  if (!authToken) return {};
  return { Authorization: `Bearer ${authToken}` };
};

// Auth functions
export async function signUp(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Sign up failed");
  }
  const data = await res.json();
  authToken = data.session.access_token;
  localStorage.setItem('auth_token', authToken);
  return data;
}

export async function signIn(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Sign in failed");
  }
  const data = await res.json();
  authToken = data.session.access_token;
  localStorage.setItem('auth_token', authToken);
  return data;
}

export async function getSession() {
  const res = await fetch(`${API_BASE}/auth/session`, {
    method: "GET",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    authToken = null;
    localStorage.removeItem('auth_token');
    throw new Error("Session invalid");
  }
  return res.json();
}

export async function signOut() {
  authToken = null;
  localStorage.removeItem('auth_token');
}

export function setAuthToken(token: string) {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken() {
  return authToken;
}

// Helper function to convert image paths to full URLs
const getBaseUrl = () => API_BASE.replace('/api', '');

const convertImageUrls = (product: any) => {
  if (!product || !product.images) return product;
  
  try {
    let images = product.images;
    // Parse if it's a JSON string
    if (typeof images === 'string') {
      try {
        images = JSON.parse(images);
      } catch (e) {
        // If parsing fails, assume it's already an array or invalid, return product as-is
        return product;
      }
    }
    
    if (!Array.isArray(images)) {
      return product;
    }
    
    const baseUrl = getBaseUrl();
    const convertedImages = images.map((img: string) => {
      if (!img) return '';
      return img.startsWith('http') ? img : `${baseUrl}${img}`;
    });
    
    return {
      ...product,
      images: JSON.stringify(convertedImages),
    };
  } catch (error) {
    console.error('Error converting image URLs:', error);
    return product;
  }
};

// Products functions
export async function getProducts(
  categoryIds?: string | string[],
  searchQuery?: string,
  page = 1,
  itemsPerPage = 12
) {
  let url = `${API_BASE}/products?page=${page}&limit=${itemsPerPage}`;

  if (searchQuery) {
    url += `&search=${encodeURIComponent(searchQuery)}`;
  }

  if (categoryIds && (typeof categoryIds === 'string' || categoryIds.length > 0)) {
    const ids = typeof categoryIds === 'string' ? [categoryIds] : categoryIds;
    url += `&categories=${encodeURIComponent(JSON.stringify(ids))}`;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Failed to load products: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    
    // Convert image URLs for each product
    if (data.data && Array.isArray(data.data)) {
      data.data = data.data.map(convertImageUrls);
    }
    return data;
  } catch (error) {
    console.error('Error in getProducts:', error);
    throw error;
  }
}

export async function getProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  if (!res.ok) {
    throw new Error("Failed to load product");
  }
  const product = await res.json();
  return convertImageUrls(product);
}

export async function createProduct(product: any) {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create product");
  }
  return res.json();
}

export async function updateProduct(id: string, product: any) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(product),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update product");
  }
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete product");
  }
  return res.json();
}

// Categories functions
export async function getCategories() {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) {
    throw new Error("Failed to load categories");
  }
  return res.json();
}

export async function createCategory(name: string) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create category");
  }
  return res.json();
}

export async function updateCategory(id: string, name: string) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update category");
  }
  return res.json();
}

export async function deleteCategory(id: string) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to delete category");
  }
  return res.json();
}

// Settings functions
export async function getSettings() {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) {
    throw new Error("Failed to load settings");
  }
  return res.json();
}

export async function updateSettings(settings: any) {
  const res = await fetch(`${API_BASE}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to update settings");
  }
  return res.json();
}

// Messages functions
export async function createContactMessage(data: any) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to save message");
  }
  return res.json();
}

export async function getContactMessages(limit = 50, offset = 0) {
  const res = await fetch(`${API_BASE}/messages?limit=${limit}&offset=${offset}`, {
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error("Failed to load messages");
  }
  return res.json();
}

export async function markMessageAsRead(id: string) {
  const res = await fetch(`${API_BASE}/messages/${id}/read`, {
    method: "PUT",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error("Failed to mark message as read");
  }
  return res.json();
}

export async function deleteContactMessage(id: string) {
  const res = await fetch(`${API_BASE}/messages/${id}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  if (!res.ok) {
    throw new Error("Failed to delete message");
  }
  return res.json();
}

// Image upload functions
export async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/uploads/upload`, {
      method: "POST",
      headers: getAuthHeader(),
      body: formData,
    });

    if (!res.ok) {
  const text = await res.text();
  console.error('Upload failed:', res.status, text);
  throw new Error(`Upload failed with status ${res.status}`);
}

    const data = await res.json();
    // Convert relative path to full URL
    const baseUrl = API_BASE.replace('/api', '');
    const fullUrl = data.path.startsWith('http') ? data.path : `${baseUrl}${data.path}`;
    return fullUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file));
  const results = await Promise.all(uploadPromises);
  return results.filter((path): path is string => path !== null);
}

export async function deleteImage(imagePath: string): Promise<boolean> {
  try {
    let filename = imagePath;
    if (imagePath.includes('/')) {
      filename = imagePath.split('/').pop() || imagePath;
    }

    const res = await fetch(`${API_BASE}/uploads/${filename}`, {
      method: "DELETE",
      headers: getAuthHeader(),
    });

    if (!res.ok) {
      throw new Error("Failed to delete image");
    }

    return true;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
}

// Product categories functions
export async function updateProductCategories(productId: string, categoryIds: string[]) {
  try {
    const res = await fetch(`${API_BASE}/product-categories/${productId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeader() },
      body: JSON.stringify({ categoryIds }),
    });
    if (!res.ok) {
      throw new Error("Failed to update product categories");
    }
    return true;
  } catch (error) {
    console.error("Error updating product categories:", error);
    return false;
  }
}

export async function getProductCategories(productId: string): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/product-categories/${productId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch product categories");
    }
    const data = await res.json();
    return data.map((cat: any) => cat.id);
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}

export async function getProductCategoryNames(productId: string) {
  try {
    const res = await fetch(`${API_BASE}/product-categories/${productId}`);
    if (!res.ok) {
      throw new Error("Failed to fetch product categories");
    }
    return await res.json();
  } catch (error) {
    console.error("Error fetching product categories:", error);
    return [];
  }
}

export async function checkUserRole(userId: string): Promise<boolean> {
  try {
    const session = await getSession();
    return session.user?.role === 'admin';
  } catch {
    return false;
  }
}

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../constants/AppUrls";
import { postMethod } from "./APIServices";

// =========================================================
// BASE URL CONFIGURATION
// =========================================================

export const APP_URL = `${BASE_URL}/api/customer/`;

export const TOKEN_KEY = "bakasuran_token";

const normalizeVariantId = (value) => {
  const variantId =
    typeof value === "number"
      ? value
      : typeof value === "string" && /^\d+$/.test(value.trim())
        ? Number(value.trim())
        : NaN;

  return Number.isSafeInteger(variantId) && variantId > 0 ? variantId : null;
};

// =========================================================
// LOGIN / SEND OTP API
// POST: /api/customer/login
// =========================================================
export async function login(phone) {
  try {
    const mobile = String(phone || "").replace(/\D/g, "");

    if (mobile.length !== 10) {
      return {
        success: 0,
        message: "Please enter a valid 10-digit mobile number.",
      };
    }

    const url = `${APP_URL}login`;

    console.log("========== BAKASURAN LOGIN API ==========");
    console.log("METHOD:", "POST");
    console.log("URL:", url);
    console.log("MOBILE:", mobile);

    const response = await postMethod(url, null, {
      mobile,
    });

    console.log("LOGIN API RESPONSE:", JSON.stringify(response, null, 2));

    if (!response) {
      return {
        success: 0,
        message: "No response received from server.",
      };
    }

    if (response.success === 0 || response.success === false) {
      return {
        success: 0,
        message: response.message || response.error || "Unable to send OTP.",
        statusCode: response.statusCode,
      };
    }

    return response;
  } catch (error) {
    console.log("LOGIN API ERROR:", error?.response?.data || error?.message);

    return {
      success: 0,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unable to send OTP. Please try again.",
    };
  }
}

// =========================================================
// VERIFY MOBILE / OTP API
// POST: /api/customer/verifyMobile
// =========================================================
export async function verifyMobile(mobile, otp) {
  const url = `${APP_URL}verifyMobile`;

  const payload = {
    mobile: String(mobile || "").trim(),
    otp: String(otp || "").trim(),
  };

  console.log("========== VERIFY MOBILE API ==========");
  console.log("METHOD:", "POST");
  console.log("URL:", url);
  console.log("REQUEST BODY:", payload);

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: 20000,
    });

    console.log("HTTP STATUS:", response.status);

    console.log(
      "VERIFY MOBILE RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    // =====================================================
    // SAVE AUTH TOKEN
    // =====================================================
    const token = response.data?.data?.token;

    if (response.data?.success === 1 && token) {
      await AsyncStorage.setItem(TOKEN_KEY, String(token));

      console.log("AUTH TOKEN SAVED SUCCESSFULLY");
    } else {
      console.log("No authentication token found in verification response.");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      console.log("HTTP STATUS:", error.response.status);

      console.log(
        "API ERROR RESPONSE:",
        JSON.stringify(error.response.data, null, 2),
      );

      throw new Error(
        error.response.data?.message ||
          JSON.stringify(error.response.data) ||
          `API request failed: ${error.response.status}`,
      );
    }

    if (error.request) {
      console.log("NO API RESPONSE RECEIVED:", error.message);

      throw new Error(
        "No response from server. Check the API server and network connection.",
      );
    }

    console.log("API REQUEST ERROR:", error.message);

    throw error;
  }
}

// =========================================================
// HOME API
// GET: /api/customer/home
// =========================================================
export async function getHome() {
  try {
    const url = `${APP_URL}home`;

    // =====================================================
    // GET SAVED AUTH TOKEN
    // =====================================================
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== BAKASURAN HOME API ==========");
    console.log("METHOD:", "GET");
    console.log("URL:", url);

    console.log("TOKEN:", token ? "Token available" : "Token not found");

    // =====================================================
    // GET HOME API
    // =====================================================
    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      timeout: 20000,
    });

    console.log("HTTP STATUS:", response.status);

    console.log("HOME API RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log("========== HOME API ERROR ==========");

    // =====================================================
    // SERVER RESPONSE ERROR
    // =====================================================
    if (error.response) {
      console.log("HTTP STATUS:", error.response.status);

      console.log(
        "HOME API ERROR RESPONSE:",
        JSON.stringify(error.response.data, null, 2),
      );

      throw new Error(
        error.response.data?.message || "Unable to load home data.",
      );
    }

    // =====================================================
    // NO SERVER RESPONSE
    // =====================================================
    if (error.request) {
      console.log("NO HOME API RESPONSE:", error.message);

      throw new Error(
        "No response from server. Check the API server and network connection.",
      );
    }

    // =====================================================
    // REQUEST ERROR
    // =====================================================
    console.log("HOME API REQUEST ERROR:", error.message);

    throw new Error(error.message || "Unable to load home data.");
  }
}

// GET CATEGORIES API
export const getCategories = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    const response = await axios.get(`${APP_URL}categories`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    console.log(
      "CATEGORIES API RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("CATEGORIES API ERROR:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to fetch categories.",
    );
  }
};

// =====================================================
// GET FEATURED CATEGORIES API
// GET: /api/customer/featured_categories
// =====================================================
export const getFeaturedCategories = async () => {
  const url = `${APP_URL}featured_categories`;

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== FEATURED CATEGORIES API ==========");
    console.log("METHOD: GET");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "Available" : "Not found");

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 20000,
    });

    console.log("HTTP STATUS:", response.status);
    console.log(
      "FEATURED CATEGORIES RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("========== FEATURED CATEGORIES API ERROR ==========");
    console.log("URL:", url);
    console.log("HTTP STATUS:", error.response?.status ?? "No response");
    console.log(
      "SERVER ERROR:",
      JSON.stringify(error.response?.data ?? error.message, null, 2),
    );

    if (error.response) {
      throw new Error(
        error.response.data?.message ||
          error.response.data?.error ||
          `Failed to load featured categories (HTTP ${error.response.status}).`,
      );
    }

    if (error.request) {
      throw new Error(
        "No response from server. Check your API URL and network connection.",
      );
    }

    throw new Error(error.message || "Unable to load featured categories.");
  }
};

// =====================================================
// GET BANNERS API
// GET: /api/customer/banners
// =====================================================
export const getBanners = async () => {
  const url = `${APP_URL}banners`;

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== BANNERS API ==========");
    console.log("METHOD: GET");
    console.log("URL:", url);

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 20000,
    });

    console.log("BANNERS STATUS:", response.status);
    console.log("BANNERS RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log("========== BANNERS API ERROR ==========");
    console.log("STATUS:", error.response?.status);
    console.log("ERROR:", error.response?.data || error.message);

    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Unable to load banners.",
    );
  }
};

// =========================================================
// GET NOTIFICATIONS API
// GET: /api/customer/notifications
// =========================================================

export async function getNotifications() {
  const url = `${APP_URL}notifications`;

  try {
    // =====================================================
    // GET SAVED AUTH TOKEN
    // =====================================================

    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== NOTIFICATIONS API ==========");
    console.log("METHOD:", "GET");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "Token available" : "Token not found");

    // =====================================================
    // API REQUEST
    // =====================================================

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      timeout: 20000,
    });

    // =====================================================
    // RESPONSE LOG
    // =====================================================

    console.log("NOTIFICATIONS HTTP STATUS:", response.status);

    console.log(
      "NOTIFICATIONS API RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    // =====================================================
    // RETURN API RESPONSE
    // =====================================================

    return response.data;
  } catch (error) {
    console.log("========== NOTIFICATIONS API ERROR ==========");

    console.log("URL:", url);

    console.log("HTTP STATUS:", error?.response?.status ?? "No response");

    console.log(
      "SERVER ERROR:",
      JSON.stringify(error?.response?.data ?? error?.message, null, 2),
    );

    if (error?.response) {
      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          `Failed to load notifications (HTTP ${error.response.status}).`,
      );
    }

    if (error?.request) {
      throw new Error(
        "No response from server. Check the API URL and network connection.",
      );
    }
    throw new Error(error?.message || "Unable to load notifications.");
  }
}

export const postNotifications = getNotifications;

// =========================================================
// GET PROFILE API
// GET: /api/customer/profile
// =========================================================

export async function getProfile() {
  const url = `${APP_URL}profile`;

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== PROFILE API ==========");
    console.log("METHOD:", "GET");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "Token available" : "Token not found");

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },

      timeout: 20000,
    });

    console.log("PROFILE HTTP STATUS:", response.status);

    console.log(
      "PROFILE API RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("========== PROFILE API ERROR ==========");

    console.log("URL:", url);

    console.log("HTTP STATUS:", error?.response?.status ?? "No response");

    console.log(
      "SERVER ERROR:",
      JSON.stringify(error?.response?.data ?? error?.message, null, 2),
    );

    if (error?.response) {
      throw new Error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          `Failed to load profile (HTTP ${error.response.status}).`,
      );
    }

    if (error?.request) {
      throw new Error(
        "No response from server. Check the API URL and network connection.",
      );
    }

    throw new Error(error?.message || "Unable to load profile.");
  }
}

// UPDATE PROFILE API
// POST: /api/customer/profile/update
// =========================================================

export async function updateProfile(profileData) {
  const url = `${APP_URL}profile/update`;

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== UPDATE PROFILE API ==========");
    console.log("METHOD:", "POST");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "Token available" : "Token not found");

    if (!token) {
      return {
        success: 9,
        message: "Please login to update your profile.",
      };
    }

    const payload = {
      name: String(profileData?.name || "").trim(),
      email: String(profileData?.email || "").trim() || null,
    };

    if (!payload.name) {
      return {
        success: 0,
        message: "Please enter your full name.",
      };
    }

    console.log("UPDATE PROFILE REQUEST:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    });

    console.log("UPDATE PROFILE HTTP STATUS:", response.status);

    console.log(
      "UPDATE PROFILE RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("========== UPDATE PROFILE API ERROR ==========");

    console.log("HTTP STATUS:", error?.response?.status ?? "No response");

    console.log(
      "ERROR RESPONSE:",
      JSON.stringify(error?.response?.data ?? error?.message, null, 2),
    );

    if (error?.response) {
      return {
        success: error.response.status === 401 ? 9 : 0,
        message:
          error.response.data?.message ||
          error.response.data?.error ||
          "Unable to update your profile.",
        errors: error.response.data?.errors || null,
        statusCode: error.response.status,
      };
    }

    return {
      success: 0,
      message: error?.request
        ? "No response from server. Check your API URL and network connection."
        : error?.message || "Unable to update your profile.",
    };
  }
}

// ============================================================
// GET CART API
// GET: /api/customer/cart
// ============================================================
export const getCart = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      throw new Error("Please login to view your cart.");
    }

    const response = await axios.get(`${APP_URL}cart`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("GET CART SUCCESS:", response.data);

    return response.data;
  } catch (error) {
    console.error("GET CART ERROR:", error.response?.data ?? error.message);

    throw new Error(
      error.response?.data?.message ??
        error.message ??
        "Unable to load your cart.",
    );
  }
};

// ============================================================
// GET LOCATIONS API
// GET: /api/customer/locations
// ============================================================
export const getLocations = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await axios.get(`${APP_URL}locations`, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: "Bearer ".concat(token) } : {}),
      },
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "GET LOCATIONS API ERROR:",
      error?.response?.data ?? error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to load locations.",
    );
  }
};

// ============================================================
// DELETE LOCATION API
// GET: /api/customer/location/{id}/delete
// ============================================================
export const deleteLocation = async (locationId) => {
  if (
    locationId === undefined ||
    locationId === null ||
    String(locationId).trim() === ""
  ) {
    throw new Error("A location ID is required to delete a location.");
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await axios.get(
      `${APP_URL}location/${encodeURIComponent(String(locationId))}/delete`,
      {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: "Bearer ".concat(token) } : {}),
        },
        timeout: 20000,
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "DELETE LOCATION API ERROR:",
      error?.response?.data ?? error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to delete the location.",
    );
  }
};

// ============================================================
// STORE LOCATION API
// POST: /api/customer/location/store
// ============================================================
export const storeLocation = async (payload) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await axios.post(`${APP_URL}location/store`, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer ".concat(token) } : {}),
      },
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "STORE LOCATION API ERROR:",
      error?.response?.data ?? error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to save your address.",
    );
  }
};

// ============================================================
// CHECKOUT API
// POST: /api/customer/checkout
// ============================================================
export const checkoutOrder = async (payload) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await axios.post(`${APP_URL}checkout`, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer ".concat(token) } : {}),
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "CHECKOUT API ERROR:",
      error?.response?.data ?? error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to place your order.",
    );
  }
};

// ============================================================
// CHECKOUT PREVIEW API
// POST: /api/customer/checkout/preview
// ============================================================
export const checkoutPreview = async (payload) => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    const response = await axios.post(`${APP_URL}checkout/preview`, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(token ? { Authorization: "Bearer ".concat(token) } : {}),
      },
      timeout: 30000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "CHECKOUT PREVIEW API ERROR:",
      error?.response?.data ?? error?.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to preview your checkout.",
    );
  }
};

// =========================================================
// WISHLIST HELPER
// Turns an axios error into the same { success, message }
// shape used by updateProfile.
// success 9 = not logged in / token expired.
// =========================================================
const wishlistError = (error, fallback) => {
  if (error?.response) {
    return {
      success: error.response.status === 401 ? 9 : 0,
      message:
        error.response.data?.message || error.response.data?.error || fallback,
      errors: error.response.data?.errors || null,
      statusCode: error.response.status,
    };
  }

  return {
    success: 0,
    message: error?.request
      ? "No response from server. Check your API URL and network connection."
      : error?.message || fallback,
  };
};

// =========================================================
// GET WISHLIST API
// GET: /api/customer/wishlist
// =========================================================
export const getWishlist = async () => {
  const url = `${APP_URL}wishlist`;

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("========== WISHLIST API ==========");
    console.log("METHOD: GET");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "Token available" : "Token not found");

    if (!token) {
      return {
        success: 9,
        message: "Please login to view your wishlist.",
      };
    }

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    });

    console.log("WISHLIST HTTP STATUS:", response.status);
    console.log(
      "WISHLIST API RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("========== WISHLIST API ERROR ==========");
    console.log("URL:", url);
    console.log("HTTP STATUS:", error?.response?.status ?? "No response");
    console.log(
      "SERVER ERROR:",
      JSON.stringify(error?.response?.data ?? error?.message, null, 2),
    );

    return wishlistError(error, "Unable to load wishlist.");
  }
};

// =========================================================
// ADD TO WISHLIST API
// POST: /api/customer/wishlist/add
// Body: { variant_id }
// =========================================================
export const addToWishlist = async (variantId) => {
  const url = `${APP_URL}wishlist/add`;
  const normalizedVariantId = normalizeVariantId(variantId);

  if (normalizedVariantId === null) {
    return { success: 0, message: "A valid integer variant ID is required." };
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      return { success: 9, message: "Please login to save items." };
    }

    const payload = { variant_id: normalizedVariantId };

    console.log("========== WISHLIST ADD API ==========");
    console.log("METHOD: POST");
    console.log("URL:", url);
    console.log("REQUEST BODY:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    });

    console.log(
      "WISHLIST ADD RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("WISHLIST ADD ERROR:", error?.response?.data || error?.message);
    return wishlistError(error, "Unable to add to wishlist.");
  }
};

// =========================================================
// REMOVE FROM WISHLIST API
// DELETE: /api/customer/wishlist/{item}
// {item} = the id the backend expects (variant id by default)
// =========================================================
export const removeFromWishlist = async (itemId) => {
  const url = `${APP_URL}wishlist/${itemId}`;

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      return { success: 9, message: "Please login to manage your wishlist." };
    }

    console.log("========== WISHLIST REMOVE API ==========");
    console.log("METHOD: DELETE");
    console.log("URL:", url);

    const response = await axios.delete(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    });

    console.log(
      "WISHLIST REMOVE RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log(
      "WISHLIST REMOVE ERROR:",
      error?.response?.data || error?.message,
    );
    return wishlistError(error, "Unable to remove from wishlist.");
  }
};

// =========================================================
// TOGGLE WISHLIST API
// POST: /api/customer/wishlist/toggle
// Body: { variant_id }
// Adds the item if it is not saved, removes it if it is.
// Use this for the heart icon on dish cards.
// =========================================================
export const toggleWishlist = async (variantId) => {
  const url = `${APP_URL}wishlist/toggle`;
  const normalizedVariantId = normalizeVariantId(variantId);

  if (normalizedVariantId === null) {
    return { success: 0, message: "A valid integer variant ID is required." };
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      return { success: 9, message: "Please login to save items." };
    }

    const payload = { variant_id: normalizedVariantId };

    console.log("========== WISHLIST TOGGLE API ==========");
    console.log("METHOD: POST");
    console.log("URL:", url);
    console.log("REQUEST BODY:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000,
    });

    console.log(
      "WISHLIST TOGGLE RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log(
      "WISHLIST TOGGLE ERROR:",
      error?.response?.data || error?.message,
    );
    return wishlistError(error, "Unable to update wishlist.");
  }
};

// =========================================================
// GET PRODUCT API
// GET: /api/customer/products
// =========================================================
export const getProduct = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    const response = await axios.get(`${APP_URL}product`, {
      headers: {
        Accept: "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
    });

    console.log("GET PRODUCT API RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "GET PRODUCT API ERROR:",
      error.response?.data || error.message,
    );

    throw error;
  }
};

const orderApiError = (error, fallback) => ({
  success: error?.response?.status === 401 ? 9 : 0,
  message:
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    (error?.request
      ? "No response from server. Check your API URL and network connection."
      : error?.message || fallback),
  errors: error?.response?.data?.errors || null,
  statusCode: error?.response?.status,
});

const getOrderAuthHeaders = (token) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// =========================================================
// GET ORDERS API
// GET: /api/customer/orders
// =========================================================
export const getOrders = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { success: 9, message: "Please login to view your orders." };
    }

    const response = await axios.get(`${APP_URL}orders`, {
      headers: getOrderAuthHeaders(token),
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "GET ORDERS API ERROR:",
      error?.response?.data ?? error?.message,
    );
    return orderApiError(error, "Unable to load your orders.");
  }
};

// =========================================================
// GET ORDER DETAILS API
// GET: /api/customer/order/{order}
// =========================================================
export const getOrderDetails = async (orderId) => {
  if (
    orderId === undefined ||
    orderId === null ||
    String(orderId).trim() === ""
  ) {
    return { success: 0, message: "An order ID is required." };
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { success: 9, message: "Please login to view order details." };
    }

    const response = await axios.get(
      `${APP_URL}order/${encodeURIComponent(String(orderId))}`,
      {
        headers: getOrderAuthHeaders(token),
        timeout: 20000,
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "GET ORDER DETAILS API ERROR:",
      error?.response?.data ?? error?.message,
    );
    return orderApiError(error, "Unable to load order details.");
  }
};

// =========================================================
// CANCEL ORDER API
// PATCH: /api/customer/orders/{order}/cancel
// =========================================================
export const cancelOrder = async (orderId) => {
  if (
    orderId === undefined ||
    orderId === null ||
    String(orderId).trim() === ""
  ) {
    return { success: 0, message: "An order ID is required." };
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { success: 9, message: "Please login to cancel this order." };
    }

    const response = await axios.patch(
      `${APP_URL}orders/${encodeURIComponent(String(orderId))}/cancel`,
      {},
      {
        headers: getOrderAuthHeaders(token),
        timeout: 20000,
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "CANCEL ORDER API ERROR:",
      error?.response?.data ?? error?.message,
    );
    return orderApiError(error, "Unable to cancel this order.");
  }
};

// =========================================================
// LOGOUT API
// POST: /api/customer/logout
// =========================================================
export const logout = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    const response = await axios.post(
      `${APP_URL}logout`,
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      },
    );

    console.log("LOGOUT API RESPONSE:", response.data);

    // Clear the saved login token after successful API response.
    await AsyncStorage.removeItem(TOKEN_KEY);

    return {
      localLogout: true,
      message: response.data?.message || "Logout successful.",
      data: response.data,
    };
  } catch (error) {
    console.log("LOGOUT API ERROR:", error.response?.data || error.message);

    throw error;
  }
};

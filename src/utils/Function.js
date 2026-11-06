import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../constants/AppUrls";

import { deleteMethod, getMethod } from "./APIServices";

// =========================================================a
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
// COMMON API CONFIGURATION
// =========================================================

const REQUEST_TIMEOUT = 30000;

// =========================================================
// GET AUTH TOKEN
// =========================================================

export const getAuthToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    console.log("AUTH TOKEN:", token ? "AVAILABLE" : "NOT AVAILABLE");

    return token;
  } catch (error) {
    console.log("GET AUTH TOKEN ERROR:", error?.message);

    return null;
  }
};

// =========================================================
// COMMON AUTH HEADERS
// =========================================================

export const getAuthHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "AUTH HEADER:",
      token ? "Authorization header added" : "No token available",
    );

    return headers;
  } catch (error) {
    console.log("GET AUTH HEADERS ERROR:", error?.message);

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }
};

// =========================================================
// COMMON API ERROR HANDLER
// =========================================================

const getApiErrorMessage = (
  error,
  defaultMessage = "Something went wrong. Please try again.",
) => {
  if (error?.response?.data) {
    return (
      error.response.data.message ||
      error.response.data.error ||
      error.response.data.errors?.message ||
      defaultMessage
    );
  }

  if (error?.request) {
    return "No response from server. Please check your API server and network connection.";
  }

  return error?.message || defaultMessage;
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

    const payload = {
      mobile,
    };

    console.log("====================================");
    console.log("BAKASURAN LOGIN API");
    console.log("METHOD: POST");
    console.log("URL:", url);
    console.log("REQUEST:", JSON.stringify(payload, null, 2));
    console.log("====================================");

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log("LOGIN HTTP STATUS:", response.status);

    console.log("LOGIN API RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log("====================================");
    console.log("LOGIN API ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );
    console.log("====================================");

    return {
      success: 0,
      message: getApiErrorMessage(
        error,
        "Unable to send OTP. Please try again.",
      ),
      statusCode: error?.response?.status,
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
    mobile: String(mobile || "")
      .replace(/\D/g, "")
      .trim(),

    otp: String(otp || "").trim(),
  };

  console.log("====================================");
  console.log("VERIFY MOBILE API");
  console.log("METHOD: POST");
  console.log("URL:", url);
  console.log("REQUEST:", JSON.stringify(payload, null, 2));
  console.log("====================================");

  try {
    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log("VERIFY HTTP STATUS:", response.status);

    console.log(
      "VERIFY MOBILE RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    // =====================================================
    // GET TOKEN FROM RESPONSE
    // =====================================================

    const responseData = response.data;

    const token =
      responseData?.data?.token ||
      responseData?.token ||
      responseData?.data?.access_token ||
      responseData?.access_token;

    // =====================================================
    // SAVE AUTH TOKEN
    // =====================================================

    if (
      responseData?.success === 1 ||
      responseData?.success === true ||
      responseData?.success === "1"
    ) {
      if (token) {
        await AsyncStorage.setItem(TOKEN_KEY, String(token));

        console.log("====================================");
        console.log("AUTH TOKEN SAVED SUCCESSFULLY");
        console.log("TOKEN KEY:", TOKEN_KEY);
        console.log("====================================");
      } else {
        console.log("VERIFY SUCCESS BUT NO TOKEN FOUND");
      }
    }

    return responseData;
  } catch (error) {
    console.log("====================================");
    console.log("VERIFY MOBILE API ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );
    console.log("====================================");

    throw new Error(
      getApiErrorMessage(error, "Unable to verify mobile number."),
    );
  }
}

// =========================================================
// HOME API
// GET: /api/customer/home
// =========================================================

export async function getHome() {
  try {
    const url = `${APP_URL}home`;
    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("HOME API RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log(
      "HOME API ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    throw new Error(getApiErrorMessage(error, "Unable to load home data."));
  }
}

// =========================================================
// GET CATEGORIES API
// GET: /api/customer/categories
// =========================================================

export const getCategories = async () => {
  try {
    const url = `${APP_URL}categories`;
    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "CATEGORIES API RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log(
      "CATEGORIES API ERROR:",
      error?.response?.data || error?.message,
    );

    throw new Error(getApiErrorMessage(error, "Unable to fetch categories."));
  }
};

// =========================================================
// GET FEATURED CATEGORIES API
// GET: /api/customer/featured_categories
// =========================================================

export const getFeaturedCategories = async () => {
  const url = `${APP_URL}featured_categories`;

  try {
    const headers = await getAuthHeaders();

    console.log("FEATURED CATEGORIES URL:", url);

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "FEATURED CATEGORIES RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log(
      "FEATURED CATEGORIES ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    throw new Error(
      getApiErrorMessage(error, "Unable to load featured categories."),
    );
  }
};

// =========================================================
// GET BANNERS API
// GET: /api/customer/banners
// =========================================================

export const getBanners = async () => {
  const url = `${APP_URL}banners`;

  try {
    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("BANNERS RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log(
      "BANNERS API ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    throw new Error(getApiErrorMessage(error, "Unable to load banners."));
  }
};

// =========================================================
// GET NOTIFICATIONS API
// GET: /api/customer/notifications
// =========================================================

export async function getNotifications() {
  const url = `${APP_URL}notifications`;

  try {
    const token = await getAuthToken();

    console.log("====================================");
    console.log("NOTIFICATIONS API");
    console.log("METHOD: GET");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "AVAILABLE" : "NOT AVAILABLE");
    console.log("====================================");

    // =====================================================
    // TOKEN REQUIRED
    // =====================================================

    if (!token) {
      return {
        success: 9,
        message: "Please login to view notifications.",
        data: [],
      };
    }

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },

      timeout: REQUEST_TIMEOUT,
    });

    console.log("NOTIFICATIONS HTTP STATUS:", response.status);

    console.log(
      "NOTIFICATIONS RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("====================================");

    console.log("NOTIFICATIONS API ERROR");

    console.log("MESSAGE:", error?.message);

    console.log("STATUS:", error?.response?.status);

    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );

    console.log("====================================");

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
        data: [],
      };
    }

    if (error?.response) {
      return (
        error.response.data || {
          success: 0,
          message: "Unable to load notifications.",
          data: [],
        }
      );
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load notifications."),
      data: [],
    };
  }
}

// =========================================================
// GET PROFILE API
// GET: /api/customer/profile
// =========================================================

export async function getProfile() {
  const url = `${APP_URL}profile`;

  try {
    const token = await getAuthToken();

    if (!token) {
      return {
        success: 9,
        message: "Please login to view your profile.",
      };
    }

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log("PROFILE RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log(
      "PROFILE API ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load profile."),
    };
  }
}

// =========================================================
// UPDATE PROFILE API
// POST: /api/customer/profile/update
// =========================================================

export async function updateProfile(profileData) {
  const url = `${APP_URL}profile/update`;

  try {
    const token = await getAuthToken();

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

    console.log("UPDATE PROFILE PAYLOAD:", JSON.stringify(payload, null, 2));

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    return response.data;
  } catch (error) {
    console.log(
      "UPDATE PROFILE ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to update your profile."),
      errors: error?.response?.data?.errors || null,
      statusCode: error?.response?.status,
    };
  }
}

// =========================================================
// GET CART API
// GET: /api/customer/cart
// =========================================================

export const getCart = async () => {
  const url = `${APP_URL}cart`;

  try {
    const token = await getAuthToken();

    console.log("====================================");
    console.log("GET CART API");
    console.log("METHOD: GET");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "AVAILABLE" : "NOT AVAILABLE");
    console.log("====================================");

    if (!token) {
      return {
        success: 9,
        message: "Please login to view your cart.",
        data: [],
      };
    }

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log("CART HTTP STATUS:", response.status);

    console.log("CART RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log("====================================");
    console.log("GET CART API ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );
    console.log("====================================");

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
        data: [],
      };
    }

    if (error?.response) {
      return (
        error.response.data || {
          success: 0,
          message: "Unable to load your cart.",
          data: [],
        }
      );
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load your cart."),
      data: [],
    };
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
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 30000,
    });

    console.log("CHECKOUT PREVIEW RESPONSE:", response.data);

    return response.data;
  } catch (error) {
    console.log(
      "CHECKOUT PREVIEW ERROR:",
      error?.response?.data || error.message,
    );

    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to preview checkout.",
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

// ============================================================
// GET WISHLIST
// GET /api/customer/wishlist
// ============================================================

export const getWishlist = async () => {
  try {
    const token = await getAuthToken();

    console.log("====================================");
    console.log("GET WISHLIST API");
    console.log("METHOD: GET");
    console.log("URL:", `${APP_URL}wishlist`);
    console.log("TOKEN:", token ? "AVAILABLE" : "NOT AVAILABLE");
    console.log("====================================");

    if (!token) {
      return {
        success: 9,
        message: "Please login to view your wishlist.",
      };
    }

    const response = await axios.get(`${APP_URL}wishlist`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log("====================================");
    console.log("GET WISHLIST RESPONSE");
    console.log("STATUS:", response.status);
    console.log(JSON.stringify(response.data, null, 2));
    console.log("====================================");

    return (
      response.data || {
        success: 0,
        message: "Empty wishlist response.",
      }
    );
  } catch (error) {
    console.log("====================================");
    console.log("GET WISHLIST ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data || {}, null, 2),
    );
    console.log("====================================");

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load wishlist."),
    };
  }
};

export const addToWishlist = async (data) => {
  try {
    // Support both:
    // addToWishlist(26)
    // addToWishlist({ product_id: 14, variant_id: 26, restaurant_id: 1 })

    const variantId = typeof data === "object" ? data?.variant_id : data;

    const normalizedVariantId = normalizeVariantId(variantId);

    console.log("=================================");
    console.log("ADD TO WISHLIST API");
    console.log("ORIGINAL DATA:", JSON.stringify(data, null, 2));
    console.log("VARIANT ID:", variantId);
    console.log("NORMALIZED VARIANT ID:", normalizedVariantId);
    console.log("=================================");

    if (normalizedVariantId === null) {
      return {
        success: 0,
        message: "A valid variant ID is required.",
      };
    }

    const token = await getAuthToken();

    if (!token) {
      return {
        success: 9,
        message: "Please login to add items to your wishlist.",
      };
    }

    // IMPORTANT:
    // Backend only expects variant_id
    const payload = {
      variant_id: normalizedVariantId,
    };

    const url = `${APP_URL}wishlist/add`;

    console.log("=================================");
    console.log("ADD TO WISHLIST REQUEST");
    console.log("METHOD: POST");
    console.log("URL:", url);
    console.log("PAYLOAD:", JSON.stringify(payload, null, 2));
    console.log("=================================");

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log("=================================");
    console.log("ADD TO WISHLIST RESPONSE");
    console.log(JSON.stringify(response.data, null, 2));
    console.log("STATUS:", response.status);
    console.log("=================================");

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
      }
    );
  } catch (error) {
    console.log("=================================");
    console.log("ADD TO WISHLIST ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data || {}, null, 2),
    );
    console.log("=================================");

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to add item to wishlist."),
    };
  }
};

// =========================================================
// REMOVE ITEM FROM WISHLIST
// DELETE: /api/customer/wishlist/{wishlistId}
// =========================================================

export const removeFromWishlist = async (wishlistId) => {
  try {
    const id = String(wishlistId ?? "").trim();

    if (!id) {
      return {
        success: 0,
        message: "Wishlist ID is required.",
      };
    }

    const endpoint = `api/customer/wishlist/${encodeURIComponent(id)}`;

    console.log("WISHLIST DELETE ENDPOINT:", endpoint);

    const response = await deleteMethod(endpoint);

    console.log("WISHLIST DELETE RESULT:", JSON.stringify(response, null, 2));

    return response;
  } catch (error) {
    console.log("WISHLIST DELETE ERROR:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data ?? {}, null, 2),
    );

    return {
      success: 0,
      message:
        error?.response?.data?.message ||
        error?.message ||
        "Unable to remove wishlist item.",
      status: error?.response?.status,
    };
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
// GET: /api/customer/product
// =========================================================

export const getProduct = async () => {
  try {
    const url = `${APP_URL}product`;
    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "GET PRODUCT RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log("GET PRODUCT ERROR:", error?.response?.data || error?.message);

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load products."),
      data: [],
    };
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
    console.error("GET ORDER DETAILS API ERROR:", {
      orderId: String(orderId).trim(),
      url: `${APP_URL}order/${encodeURIComponent(String(orderId).trim())}`,
      response: error?.response?.data ?? error?.message,
    });
    return orderApiError(error, "Unable to load order details.");
  }
};

// =========================================================
// UPDATE ORDER ITEMS
// PUT: /api/customer/orders/{order}/items
// Body: { products: [{ product_variant_id, quantity }] }
// =========================================================
export const updateOrderItems = async (orderId, products) => {
  if (
    orderId === undefined ||
    orderId === null ||
    String(orderId).trim() === ""
  ) {
    return { success: 0, message: "An order ID is required." };
  }

  if (!Array.isArray(products) || products.length === 0) {
    return { success: 0, message: "Add at least one product to your order." };
  }

  const normalizedProducts = products.map((product) => {
    const productVariantId = normalizeVariantId(product?.product_variant_id);
    const quantity = Number(product?.quantity);

    if (!productVariantId || !Number.isSafeInteger(quantity) || quantity <= 0) {
      return null;
    }

    return {
      product_variant_id: productVariantId,
      quantity,
    };
  });

  if (normalizedProducts.some((product) => product === null)) {
    return {
      success: 0,
      message:
        "Each order item must have a valid product variant and quantity.",
    };
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { success: 9, message: "Please login to update your order." };
    }

    const response = await axios.put(
      `${APP_URL}orders/${encodeURIComponent(String(orderId).trim())}/items`,
      { products: normalizedProducts },
      {
        headers: getOrderAuthHeaders(token),
        timeout: 20000,
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "UPDATE ORDER ITEMS API ERROR:",
      error?.response?.data ?? error?.message,
    );
    return orderApiError(error, "Unable to update order items.");
  }
};

// =========================================================
// CREATE DINE-IN ORDER
// POST: /api/customer/order
// =========================================================
export const createDineInOrder = async ({
  restaurant_table_id,
  special_instructions = "",
  products,
} = {}) => {
  const tableId = Number(restaurant_table_id);
  if (!Number.isSafeInteger(tableId) || tableId <= 0) {
    return { success: 0, message: "A valid restaurant table ID is required." };
  }

  if (!Array.isArray(products) || products.length === 0) {
    return { success: 0, message: "Add at least one product to your order." };
  }

  const normalizedProducts = products.map((product) => {
    const productVariantId = normalizeVariantId(product?.product_variant_id);
    const quantity = Number(product?.quantity);

    if (!productVariantId || !Number.isSafeInteger(quantity) || quantity <= 0) {
      return null;
    }

    return {
      product_variant_id: productVariantId,
      quantity,
    };
  });

  if (normalizedProducts.some((product) => product === null)) {
    return {
      success: 0,
      message:
        "Each order item must have a valid product variant and quantity.",
    };
  }

  const payload = {
    restaurant_table_id: tableId,
    special_instructions:
      typeof special_instructions === "string" ? special_instructions : "",
    products: normalizedProducts,
  };

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      return { success: 9, message: "Please login to place this order." };
    }

    const response = await axios.post(`${APP_URL}order`, payload, {
      headers: getOrderAuthHeaders(token),
      timeout: 20000,
    });

    return response.data;
  } catch (error) {
    console.error(
      "CREATE DINE-IN ORDER API ERROR:",
      error?.response?.data ?? error?.message,
    );
    return orderApiError(error, "Unable to place your dine-in order.");
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
// GET RESTAURANTS
// GET: /api/customer/restaurants
// =========================================================

export const getRestaurants = async () => {
  try {
    const url = `${APP_URL}restaurants`;

    const headers = await getAuthHeaders();

    console.log("GET RESTAURANTS:", url);

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "RESTAURANTS RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log(
      "RESTAURANTS ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load restaurants."),
      data: [],
    };
  }
};

// =========================================================
// GET RESTAURANT DETAILS
// GET: /api/customer/restaurants/{id}
// =========================================================

export const getRestaurantById = async (restaurantId) => {
  try {
    if (
      restaurantId === null ||
      restaurantId === undefined ||
      String(restaurantId).trim() === ""
    ) {
      return {
        success: 0,
        message: "Restaurant ID is required.",
      };
    }

    const url = `${APP_URL}restaurants/${encodeURIComponent(
      String(restaurantId),
    )}`;

    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "RESTAURANT DETAILS RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log(
      "RESTAURANT DETAILS ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load restaurant details."),
    };
  }
};

// =========================================================
// GET RESTAURANT MENU
// GET: /api/customer/menu/{restaurantId}
// =========================================================
export const getRestaurantMenu = async (restaurantId) => {
  if (
    restaurantId === null ||
    restaurantId === undefined ||
    String(restaurantId).trim() === ""
  ) {
    return {
      success: 0,
      message: "Restaurant ID is required.",
    };
  }

  try {
    const response = await axios.get(
      `${APP_URL}menu/${encodeURIComponent(String(restaurantId))}`,
      {
        headers: await getAuthHeaders(),
        timeout: REQUEST_TIMEOUT,
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "GET RESTAURANT MENU API ERROR:",
      error?.response?.data ?? error?.message,
    );

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load restaurant menu."),
    };
  }
};

// =========================================================
// GET AVAILABLE TABLES
// GET: /api/customer/restaurant-available-tables
// Query: restaurant_id, booking_date (YYYY-MM-DD),
//        booking_time (HH:mm), end_time (HH:mm), guest_count
// =========================================================

export const getAvailableTables = async ({
  restaurantId,
  bookingDate,
  bookingTime,
  endTime,
  guestCount,
}) => {
  const url = `${APP_URL}restaurant-available-tables`;

  try {
    if (
      restaurantId === undefined ||
      restaurantId === null ||
      String(restaurantId).trim() === ""
    ) {
      return { success: 0, message: "Restaurant ID is required.", data: [] };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(bookingDate || ""))) {
      return {
        success: 0,
        message: "Booking date must be in YYYY-MM-DD format.",
        data: [],
      };
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (
      !timePattern.test(String(bookingTime || "")) ||
      !timePattern.test(String(endTime || ""))
    ) {
      return {
        success: 0,
        message: "Booking and end time must be in HH:mm format.",
        data: [],
      };
    }

    if (String(endTime) <= String(bookingTime)) {
      return {
        success: 0,
        message: "End time must be after the booking time.",
        data: [],
      };
    }

    const guests = Number(guestCount);
    if (!Number.isInteger(guests) || guests < 1) {
      return {
        success: 0,
        message: "Guest count must be at least 1.",
        data: [],
      };
    }

    const headers = await getAuthHeaders();

    const params = {
      restaurant_id: Number(restaurantId),
      booking_date: bookingDate,
      booking_time: bookingTime,
      end_time: endTime,
      guest_count: guests,
    };

    console.log("AVAILABLE TABLES REQUEST:", url, JSON.stringify(params));

    const response = await axios.get(url, {
      headers,
      params,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "AVAILABLE TABLES RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
        data: [],
      }
    );
  } catch (error) {
    console.log(
      "AVAILABLE TABLES ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
        data: [],
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load available tables."),
      data: [],
    };
  }
};

// =========================================================
// GET RESTAURANT TABLE BOOKINGS
// GET: /api/customer/restaurant-table-bookings
// =========================================================

export const getRestaurantTableBookings = async () => {
  const url = `${APP_URL}restaurant-table-bookings`;

  try {
    const headers = await getAuthHeaders();
    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "RESTAURANT TABLE BOOKINGS RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
        data: [],
      }
    );
  } catch (error) {
    console.log(
      "RESTAURANT TABLE BOOKINGS ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
        data: [],
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(
        error,
        "Unable to load restaurant table bookings.",
      ),
      data: [],
    };
  }
};

// =========================================================
// CREATE RESTAURANT TABLE BOOKING
// POST: /api/customer/restaurant-table-bookings
// Body: {
//   restaurant_id, restaurant_table_id, customer_name,
//   customer_mobile, customer_email, booking_date (YYYY-MM-DD),
//   booking_time (HH:mm), end_time (HH:mm), guest_count,
//   special_requests
// }
// =========================================================

export const createRestaurantTableBooking = async (bookingData) => {
  const url = `${APP_URL}restaurant-table-bookings`;

  try {
    if (!bookingData) {
      return { success: 0, message: "Booking data is required." };
    }

    const token = await getAuthToken();

    if (!token) {
      return {
        success: 9,
        message: "Please login to book a table.",
      };
    }

    const isBlank = (value) =>
      value === undefined || value === null || String(value).trim() === "";

    if (isBlank(bookingData.restaurant_id)) {
      return { success: 0, message: "Restaurant ID is required." };
    }

    if (isBlank(bookingData.restaurant_table_id)) {
      return { success: 0, message: "Please select a table." };
    }

    const customerName = String(bookingData.customer_name || "").trim();
    if (!customerName) {
      return { success: 0, message: "Please enter your name." };
    }

    let mobile = String(bookingData.customer_mobile || "").replace(/\D/g, "");
    if (mobile.length === 12 && mobile.startsWith("91")) {
      mobile = mobile.slice(2);
    }
    if (mobile.length !== 10) {
      return {
        success: 0,
        message: "Please enter a valid 10-digit mobile number.",
      };
    }

    const email = String(bookingData.customer_email || "").trim();
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return { success: 0, message: "Please enter a valid email address." };
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(bookingData.booking_date || ""))) {
      return {
        success: 0,
        message: "Booking date must be in YYYY-MM-DD format.",
      };
    }

    const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (
      !timePattern.test(String(bookingData.booking_time || "")) ||
      !timePattern.test(String(bookingData.end_time || ""))
    ) {
      return {
        success: 0,
        message: "Booking and end time must be in HH:mm format.",
      };
    }

    if (String(bookingData.end_time) <= String(bookingData.booking_time)) {
      return {
        success: 0,
        message: "End time must be after the booking time.",
      };
    }

    const guests = Number(bookingData.guest_count);
    if (!Number.isInteger(guests) || guests < 1) {
      return { success: 0, message: "Guest count must be at least 1." };
    }

    const payload = {
      restaurant_id: Number(bookingData.restaurant_id),
      restaurant_table_id: Number(bookingData.restaurant_table_id),
      customer_name: customerName,
      customer_mobile: mobile,
      booking_date: bookingData.booking_date,
      booking_time: bookingData.booking_time,
      end_time: bookingData.end_time,
      guest_count: guests,
    };

    if (email) {
      payload.customer_email = email;
    }

    const specialRequests = String(bookingData.special_requests || "").trim();
    if (specialRequests) {
      payload.special_requests = specialRequests;
    }

    console.log("====================================");
    console.log("CREATE TABLE BOOKING API");
    console.log("METHOD: POST");
    console.log("URL:", url);
    console.log("REQUEST:", JSON.stringify(payload, null, 2));
    console.log("====================================");

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "CREATE TABLE BOOKING RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
      }
    );
  } catch (error) {
    console.log(
      "CREATE TABLE BOOKING ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to book your table."),
    };
  }
};

// =========================================================
// CANCEL RESTAURANT TABLE BOOKING
// POST: /api/customer/restaurant-table-bookings/{id}/cancel
// =========================================================

export const cancelRestaurantTableBooking = async (bookingId) => {
  try {
    if (
      bookingId === undefined ||
      bookingId === null ||
      String(bookingId).trim() === ""
    ) {
      return { success: 0, message: "Booking ID is required." };
    }

    const token = await getAuthToken();

    if (!token) {
      return {
        success: 9,
        message: "Please login to cancel your booking.",
      };
    }

    const url = `${APP_URL}restaurant-table-bookings/${encodeURIComponent(
      String(bookingId).trim(),
    )}/cancel`;

    console.log("====================================");
    console.log("CANCEL TABLE BOOKING API");
    console.log("METHOD: POST");
    console.log("URL:", url);
    console.log("====================================");

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT,
      },
    );

    console.log(
      "CANCEL TABLE BOOKING RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
      }
    );
  } catch (error) {
    console.log(
      "CANCEL TABLE BOOKING ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to cancel your booking."),
    };
  }
};

// =========================================================
// GET PRODUCT BY ID
// GET: /api/customer/product/{id}
// =========================================================

export const getProductById = async (productId) => {
  try {
    if (
      productId === undefined ||
      productId === null ||
      String(productId).trim() === ""
    ) {
      return {
        success: 0,
        message: "Product ID is required.",
      };
    }

    const cleanId = String(productId).trim();

    const url = `${APP_URL}product/${encodeURIComponent(cleanId)}`;

    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "PRODUCT BY ID RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.log(
      "PRODUCT BY ID ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load product details."),
    };
  }
};

// =========================================================
// ADD TO CART
// POST: /api/customer/cart/add
// =========================================================

export const addToCart = async (cartData) => {
  try {
    if (!cartData) {
      return {
        success: 0,
        message: "Cart data is required.",
      };
    }

    const token = await getAuthToken();

    if (!token) {
      return {
        success: 9,
        message: "Please login to add items to cart.",
      };
    }

    const productId = cartData?.product_id;

    const variantId = cartData?.variant_id;

    const restaurantId = cartData?.restaurant_id;

    const quantity = Number(cartData?.quantity);

    if (
      productId === undefined ||
      productId === null ||
      String(productId).trim() === ""
    ) {
      return {
        success: 0,
        message: "Product ID is required.",
      };
    }

    if (
      variantId === undefined ||
      variantId === null ||
      String(variantId).trim() === ""
    ) {
      return {
        success: 0,
        message: "Variant ID is required.",
      };
    }

    if (
      restaurantId === undefined ||
      restaurantId === null ||
      String(restaurantId).trim() === ""
    ) {
      return {
        success: 0,
        message: "Restaurant ID is required.",
      };
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      return {
        success: 0,
        message: "Quantity must be greater than zero.",
      };
    }

    const payload = {
      product_id: Number(productId),

      variant_id: Number(variantId),

      restaurant_id: Number(restaurantId),

      quantity: Number(quantity),
    };

    if (cartData?.spice_level) {
      payload.spice_level = cartData.spice_level;
    }

    const url = `${APP_URL}cart/add`;

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "ADD TO CART RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
      }
    );
  } catch (error) {
    console.log(
      "ADD TO CART ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to add product to cart."),
    };
  }
};

// =========================================================
// UPDATE CART ITEM QUANTITY
// POST: /api/customer/cart/{cartItemId}/quantity
// =========================================================

export const updateCartQuantity = async (cartItemId, quantity) => {
  try {
    if (
      cartItemId === null ||
      cartItemId === undefined ||
      String(cartItemId).trim() === ""
    ) {
      return {
        success: 0,
        message: "Cart item ID is required.",
      };
    }

    const cleanId = String(cartItemId).trim();

    const cleanQuantity = Number(quantity);

    if (!Number.isFinite(cleanQuantity) || cleanQuantity < 1) {
      return {
        success: 0,
        message: "Quantity must be at least 1.",
      };
    }

    const token = await getAuthToken();

    if (!token) {
      return {
        success: 9,
        message: "Please login to update your cart.",
      };
    }

    const url = `${APP_URL}cart/${encodeURIComponent(cleanId)}/quantity`;

    const payload = {
      quantity: cleanQuantity,
    };

    const response = await axios.post(url, payload, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "UPDATE CART QUANTITY RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
      }
    );
  } catch (error) {
    console.log(
      "UPDATE CART QUANTITY ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to update cart quantity."),
    };
  }
};

// =========================================================
// DELETE CART ITEM
// DELETE: /api/customer/cart/{cartItemId}
// =========================================================

export const deleteCartItem = async (cartItemId) => {
  try {
    if (
      cartItemId === undefined ||
      cartItemId === null ||
      String(cartItemId).trim() === ""
    ) {
      return {
        success: 0,
        message: "Cart item ID is required.",
      };
    }

    const token = await getAuthToken();

    if (!token) {
      return {
        success: 9,
        message: "Please login to delete cart item.",
      };
    }

    const cleanId = String(cartItemId).trim();

    const url = `${APP_URL}cart/${encodeURIComponent(cleanId)}`;

    const response = await axios.delete(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "DELETE CART RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
      }
    );
  } catch (error) {
    console.log(
      "DELETE CART ITEM ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.status === 401) {
      return {
        success: 9,
        message: "Your session has expired. Please login again.",
      };
    }

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to delete cart item."),
    };
  }
};

// =========================================================
// GET BLOGS API
// GET: /api/customer/blogs
// =========================================================

export const getBlogs = async () => {
  try {
    const url = `${APP_URL}blogs`;

    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
        data: [],
      }
    );
  } catch (error) {
    console.log(
      "BLOGS API ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load blogs."),
      data: [],
    };
  }
};

// =========================================================
// BLOG CATEGORIES API
// GET: /api/customer/blogCategories
// =========================================================

export const getBlogCategories = async () => {
  try {
    const url = `${APP_URL}blogCategories`;

    const headers = await getAuthHeaders();

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log(
      "BLOG CATEGORIES RESPONSE:",
      JSON.stringify(response.data, null, 2),
    );

    return (
      response.data || {
        success: 0,
        message: "Empty response from server.",
      }
    );
  } catch (error) {
    console.log(
      "BLOG CATEGORIES ERROR:",
      JSON.stringify(error?.response?.data || error?.message, null, 2),
    );

    if (error?.response?.data) {
      return error.response.data;
    }

    return {
      success: 0,
      message: getApiErrorMessage(error, "Unable to load blog categories."),
    };
  }
};

// =========================================================
// LOGOUT API
// POST: /api/customer/logout
// =========================================================

export const logout = async () => {
  const url = `${APP_URL}logout`;

  try {
    const token = await getAuthToken();

    console.log("====================================");
    console.log("LOGOUT API");
    console.log("METHOD: POST");
    console.log("URL:", url);
    console.log("TOKEN:", token ? "AVAILABLE" : "NOT AVAILABLE");
    console.log("====================================");

    // =====================================================
    // IF TOKEN DOES NOT EXIST
    // =====================================================

    if (!token) {
      await AsyncStorage.removeItem(TOKEN_KEY);

      return {
        success: 1,
        localLogout: true,
        message: "Logged out successfully.",
      };
    }

    // =====================================================
    // LOGOUT REQUEST
    // =====================================================

    const response = await axios.post(
      url,
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        timeout: REQUEST_TIMEOUT,
      },
    );

    console.log("LOGOUT HTTP STATUS:", response.status);

    console.log("LOGOUT RESPONSE:", JSON.stringify(response.data, null, 2));

    // =====================================================
    // ALWAYS CLEAR LOCAL TOKEN AFTER SUCCESS
    // =====================================================

    await AsyncStorage.removeItem(TOKEN_KEY);

    console.log("LOCAL AUTH TOKEN REMOVED");

    return {
      success: response.data?.success ?? 1,

      localLogout: true,

      message: response.data?.message || "Logout successful.",

      data: response.data,
    };
  } catch (error) {
    console.log("====================================");
    console.log("LOGOUT API ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );
    console.log("====================================");

    // =====================================================
    // IMPORTANT:
    // Even if backend logout fails, clear local token.
    // User should still be able to logout locally.
    // =====================================================

    try {
      await AsyncStorage.removeItem(TOKEN_KEY);

      console.log("LOCAL TOKEN CLEARED AFTER LOGOUT ERROR");
    } catch (storageError) {
      console.log("TOKEN CLEAR ERROR:", storageError?.message);
    }

    if (error?.response?.status === 401) {
      return {
        success: 1,
        localLogout: true,
        message: "Session expired. Logged out locally.",
      };
    }

    if (error?.response) {
      return {
        success: 1,
        localLogout: true,
        message: "Logged out locally.",
        serverError: error.response.data,
      };
    }

    return {
      success: 1,
      localLogout: true,
      message: "Logged out locally.",
    };
  }
};

// =========================================================
// GET FAQS API
// GET: /api/customer/faqs
// =========================================================

export const getFAQs = async () => {
  const url = `${APP_URL}faqs`;

  try {
    const headers = await getAuthHeaders();

    console.log("====================================");
    console.log("FAQ GET API");
    console.log("METHOD: GET");
    console.log("URL:", url);
    console.log(
      "TOKEN:",
      headers.Authorization ? "AVAILABLE" : "NOT AVAILABLE",
    );
    console.log("====================================");

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("FAQ HTTP STATUS:", response.status);

    console.log("FAQ API RESPONSE:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    console.log("====================================");
    console.log("FAQ API ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error?.response?.data, null, 2),
    );
    console.log("====================================");

    throw new Error(getApiErrorMessage(error, "Unable to load FAQs."));
  }
};

export const getRestaurantCategories = async () => {
  try {
    const response = await getMethod(`${APP_URL}restaurant-categories`);

    console.log(
      "GET RESTAURANT CATEGORIES:",
      JSON.stringify(response, null, 2),
    );

    return response;
  } catch (error) {
    console.log("GET RESTAURANT CATEGORIES ERROR:", error?.message);

    throw error;
  }
};

// =========================================================
// GET RESTAURANTS BY CATEGORY
// GET: /api/customer/categories/{categoryId}/restaurants
// =========================================================
export const getCategoryRestaurants = async (categoryId) => {
  try {
    if (
      categoryId === undefined ||
      categoryId === null ||
      String(categoryId).trim() === "" ||
      String(categoryId).toLowerCase() === "all"
    ) {
      throw new Error("Valid category ID is required.");
    }

    const cleanCategoryId = String(categoryId).trim();

    const endpoint = `${APP_URL}categories/${encodeURIComponent(
      cleanCategoryId,
    )}/restaurants`;

    console.log("====================================");
    console.log("CATEGORY RESTAURANTS API");
    console.log("METHOD: GET");
    console.log("ENDPOINT:", endpoint);
    console.log("CATEGORY ID:", cleanCategoryId);
    console.log("====================================");

    const response = await getMethod(endpoint);

    console.log(
      "CATEGORY RESTAURANTS RESPONSE:",
      JSON.stringify(response, null, 2),
    );

    return response;
  } catch (error) {
    console.log("CATEGORY RESTAURANTS API ERROR:", error?.message);
    throw error;
  }
};

// ============================================================
// GET RESTAURANT CATEGORY PRODUCTS
// GET:
// /api/customer/restaurant-category-products
//
// QUERY:
// ?category_id=1&restaurant_id=1
// ============================================================

export const getRestaurantCategoryProducts = async (
  categoryId,
  restaurantId,
) => {
  try {
    if (
      categoryId === undefined ||
      categoryId === null ||
      String(categoryId).trim() === "" ||
      String(categoryId).toLowerCase() === "all"
    ) {
      throw new Error("Valid category ID is required.");
    }

    if (
      restaurantId === undefined ||
      restaurantId === null ||
      String(restaurantId).trim() === ""
    ) {
      throw new Error("Valid restaurant ID is required.");
    }

    const cleanCategoryId = String(categoryId).trim();
    const cleanRestaurantId = String(restaurantId).trim();

    const endpoint =
      `${APP_URL}restaurant-category-products` +
      `?category_id=${encodeURIComponent(cleanCategoryId)}` +
      `&restaurant_id=${encodeURIComponent(cleanRestaurantId)}`;

    console.log("====================================");
    console.log("RESTAURANT CATEGORY PRODUCTS API");
    console.log("METHOD: GET");
    console.log("ENDPOINT:", endpoint);
    console.log("CATEGORY ID:", cleanCategoryId);
    console.log("RESTAURANT ID:", cleanRestaurantId);
    console.log("====================================");

    const response = await getMethod(endpoint);

    console.log(
      "RESTAURANT CATEGORY PRODUCTS RESPONSE:",
      JSON.stringify(response, null, 2),
    );

    return response;
  } catch (error) {
    console.log("====================================");
    console.log("RESTAURANT CATEGORY PRODUCTS API ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("STATUS:", error?.response?.status);
    console.log(
      "RESPONSE:",
      JSON.stringify(error?.response?.data || {}, null, 2),
    );
    console.log("====================================");

    throw error;
  }
};

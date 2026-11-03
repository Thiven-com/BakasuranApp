// utils/APIServices.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../constants/AppUrls";

// =========================================================
// CONFIG
// =========================================================

export const TOKEN_KEY = "bakasuran_token";

const REQUEST_TIMEOUT = 30000;

const API_BASE_URL = String(BASE_URL || "").replace(/\/+$/, "");

// =========================================================
// BUILD URL
// =========================================================

const buildUrl = (endpoint = "") => {
  if (!endpoint) {
    throw new Error("API endpoint is required.");
  }

  const value = String(endpoint).trim();

  // Full URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  // Remove starting slashes
  const cleanEndpoint = value.replace(/^\/+/, "");

  return `${API_BASE_URL}/${cleanEndpoint}`;
};

// =========================================================
// BUILD HEADERS
// =========================================================

const buildHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    console.log("🔐 AUTH TOKEN:", token ? "TOKEN FOUND" : "NO TOKEN");

    return headers;
  } catch (error) {
    console.log("❌ BUILD HEADERS ERROR:", error?.message);

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }
};

// =========================================================
// ERROR HANDLER
// =========================================================

const handleApiError = (error, method) => {
  console.log("");
  console.log("====================================");
  console.log(`${method} API ERROR`);
  console.log("====================================");

  console.log("MESSAGE:", error?.message);

  // Server responded
  if (error?.response) {
    console.log("HTTP STATUS:", error.response.status);

    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error.response.data, null, 2),
    );

    return (
      error.response.data || {
        success: 0,
        message: `Request failed with status ${error.response.status}.`,
        status: error.response.status,
      }
    );
  }

  // Request sent but no response
  if (error?.request) {
    console.log("❌ NO RESPONSE FROM SERVER");

    return {
      success: 0,
      message:
        "No response from server. Check the API server and network connection.",
      status: 0,
    };
  }

  // Other error
  return {
    success: 0,
    message: error?.message || "Unable to complete the request.",
    status: 0,
  };
};

// =========================================================
// POST METHOD
//
// Supports:
//
// postMethod(url, data)
//
// postMethod(url, null, data)
//
// =========================================================

export const postMethod = async (
  endpoint,
  userOrData = null,
  optionalData = undefined,
) => {
  try {
    const url = buildUrl(endpoint);

    let data = {};

    // Old format:
    // postMethod(url, null, data)
    if (optionalData !== undefined) {
      data = optionalData || {};
    } else {
      // New format:
      // postMethod(url, data)
      data = userOrData || {};
    }

    const headers = await buildHeaders();

    console.log("");
    console.log("====================================");
    console.log("📤 POST API REQUEST");
    console.log("====================================");
    console.log("METHOD:", "POST");
    console.log("URL:", url);
    console.log("REQUEST BODY:", JSON.stringify(data, null, 2));
    console.log("====================================");

    const response = await axios.post(url, data, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("");
    console.log("====================================");
    console.log("📥 POST API RESPONSE");
    console.log("====================================");
    console.log("STATUS:", response.status);
    console.log("DATA:", JSON.stringify(response.data, null, 2));
    console.log("====================================");

    return response.data;
  } catch (error) {
    return handleApiError(error, "POST");
  }
};

// =========================================================
// GET METHOD
// =========================================================

export const getMethod = async (endpoint) => {
  try {
    const url = buildUrl(endpoint);

    const headers = await buildHeaders();

    console.log("");
    console.log("====================================");
    console.log("📥 GET API REQUEST");
    console.log("====================================");
    console.log("METHOD:", "GET");
    console.log("ENDPOINT:", endpoint);
    console.log("FINAL URL:", url);
    console.log("====================================");

    const response = await axios.get(url, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("");
    console.log("====================================");
    console.log("📥 GET API RESPONSE");
    console.log("====================================");
    console.log("STATUS:", response.status);
    console.log("DATA:", JSON.stringify(response.data, null, 2));
    console.log("====================================");

    return response.data;
  } catch (error) {
    return handleApiError(error, "GET");
  }
};

// =========================================================
// PUT METHOD
// =========================================================

export const putMethod = async (endpoint, data = {}) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders();

    console.log("");
    console.log("====================================");
    console.log("📤 PUT API REQUEST");
    console.log("====================================");
    console.log("URL:", url);
    console.log("REQUEST BODY:", JSON.stringify(data, null, 2));

    const response = await axios.put(url, data, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("STATUS:", response.status);
    console.log("DATA:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    return handleApiError(error, "PUT");
  }
};

// =========================================================
// PATCH METHOD
// =========================================================

export const patchMethod = async (endpoint, data = {}) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders();

    console.log("");
    console.log("====================================");
    console.log("📤 PATCH API REQUEST");
    console.log("====================================");
    console.log("URL:", url);
    console.log("REQUEST BODY:", JSON.stringify(data, null, 2));

    const response = await axios.patch(url, data, {
      headers,
      timeout: REQUEST_TIMEOUT,
    });

    console.log("STATUS:", response.status);
    console.log("DATA:", JSON.stringify(response.data, null, 2));

    return response.data;
  } catch (error) {
    return handleApiError(error, "PATCH");
  }
};

// =========================================================
// DELETE METHOD
// =========================================================

export const deleteMethod = async (endpoint) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders();

    console.log("====================================");
    console.log("DELETE API REQUEST");
    console.log("ENDPOINT:", endpoint);
    console.log("FINAL URL:", url);
    console.log("HEADERS:", headers);
    console.log("====================================");

    const response = await axios.delete(url, {
      headers,
      timeout: 30000,
      validateStatus: () => true,
    });

    console.log("====================================");
    console.log("DELETE API RESPONSE");
    console.log("STATUS:", response.status);
    console.log("DATA:", JSON.stringify(response.data, null, 2));
    console.log("====================================");

    if (response.status >= 200 && response.status < 300) {
      return {
        success: 1,
        message:
          response.data?.message || "Wishlist item deleted successfully.",
        data: response.data?.data ?? response.data,
        status: response.status,
      };
    }

    return {
      success: 0,
      message:
        response.data?.message ||
        response.data?.error ||
        `Request failed with status ${response.status}`,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.log("====================================");
    console.log("DELETE API ERROR");
    console.log("MESSAGE:", error?.message);
    console.log("URL:", error?.config?.url);
    console.log("METHOD:", error?.config?.method);
    console.log("BASE URL:", error?.config?.baseURL);
    console.log("RESPONSE:", error?.response?.data);
    console.log("STATUS:", error?.response?.status);
    console.log("CODE:", error?.code);
    console.log("====================================");

    return {
      success: 0,
      message:
        error?.response?.data?.message || error?.message || "Network error",
      data: error?.response?.data || null,
      status: error?.response?.status || 0,
    };
  }
};

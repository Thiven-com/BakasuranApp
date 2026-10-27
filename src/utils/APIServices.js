// utils/APIServices.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../constants/AppUrls";

// =========================================================
// TOKEN KEY
// =========================================================

const TOKEN_KEY = "bakasuran_token";

// =========================================================
// BASE URL
// =========================================================

const API_BASE_URL = String(BASE_URL || "").replace(/\/+$/, "");

// =========================================================
// BUILD URL
// =========================================================

const buildUrl = (endpoint) => {
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

    console.log("AUTH TOKEN:", token ? "TOKEN FOUND" : "NO TOKEN");

    return headers;
  } catch (error) {
    console.log("BUILD HEADERS ERROR:", error?.message);

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
  console.log(`========== ${method} API ERROR ==========`);

  console.log("MESSAGE:", error?.message);

  // Server responded with error
  if (error?.response) {
    console.log("HTTP STATUS:", error.response.status);

    console.log(
      "SERVER RESPONSE:",
      JSON.stringify(error.response.data, null, 2)
    );

    return (
      error.response.data || {
        success: 0,
        message: `Request failed with status ${error.response.status}.`,
      }
    );
  }

  // Request was sent but server did not respond
  if (error?.request) {
    console.log("NO RESPONSE FROM SERVER");

    return {
      success: 0,
      message:
        "No response from server. Check the API server and network connection.",
    };
  }

  // Something else happened
  return {
    success: 0,
    message: error?.message || "Unable to complete the request.",
  };
};



// =========================================================
// POST METHOD
//
// Supports:
// postMethod(url, null, data)
// postMethod(url, data)
//
// =========================================================

export const postMethod = async (
  endpoint,
  userOrData = null,
  optionalData = undefined
) => {
  try {
    const url = buildUrl(endpoint);

    let data = {};

    // Old Function.js format:
    // postMethod(url, null, data)
    if (optionalData !== undefined) {
      data = optionalData || {};
    } else {
      // New format:
      // postMethod(url, data)
      data = userOrData || {};
    }

    const headers = await buildHeaders();

    console.log("========== POST API ==========");
    console.log("METHOD:", "POST");
    console.log("URL:", url);

    console.log(
      "REQUEST BODY:",
      JSON.stringify(data, null, 2)
    );

    const response = await axios.post(url, data, {
      headers,
      timeout: 30000,
    });

    console.log("POST API STATUS:", response.status);

    console.log(
      "POST API RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    // IMPORTANT:
    // Return response.data
    return response.data;
  } catch (error) {
    return handleApiError(error, "POST");
  }
};

// =========================================================
// PUT METHOD
// =========================================================

export const putMethod = async (endpoint, data = {}) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders();

    console.log("========== PUT API ==========");
    console.log("METHOD:", "PUT");
    console.log("URL:", url);

    console.log(
      "REQUEST BODY:",
      JSON.stringify(data, null, 2)
    );

    const response = await axios.put(url, data, {
      headers,
      timeout: 30000,
    });

    console.log("PUT API STATUS:", response.status);

    console.log(
      "PUT API RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

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

    console.log("========== PATCH API ==========");
    console.log("METHOD:", "PATCH");
    console.log("URL:", url);

    console.log(
      "REQUEST BODY:",
      JSON.stringify(data, null, 2)
    );

    const response = await axios.patch(url, data, {
      headers,
      timeout: 30000,
    });

    console.log("PATCH API STATUS:", response.status);

    console.log(
      "PATCH API RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

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
    if (!endpoint) {
      return {
        success: 0,
        message: "Delete API endpoint is required.",
      };
    }

    const url = buildUrl(endpoint);
    const headers = await buildHeaders();

    console.log("====================================");
    console.log("DELETE API REQUEST");
    console.log("====================================");
    console.log("METHOD: DELETE");
    console.log("URL:", url);
    console.log("HEADERS:", JSON.stringify(headers, null, 2));

    const response = await axios.delete(url, {
      headers,
      timeout: 30000,
      validateStatus: () => true,
    });

    console.log("====================================");
    console.log("DELETE API RESPONSE");
    console.log("====================================");
    console.log("STATUS:", response.status);
    console.log(
      "DATA:",
      JSON.stringify(response.data, null, 2)
    );

    // -----------------------------------------
    // SUCCESS RESPONSE
    // -----------------------------------------

    if (response.status >= 200 && response.status < 300) {
      return {
        success: 1,
        message:
          response.data?.message ||
          "Item deleted successfully.",
        data: response.data?.data ?? response.data ?? null,
        status: response.status,
      };
    }

    // -----------------------------------------
    // SERVER ERROR RESPONSE
    // -----------------------------------------

    return {
      success: 0,
      message:
        response.data?.message ||
        response.data?.error ||
        `Delete failed with status ${response.status}.`,
      data: response.data?.data ?? response.data ?? null,
      status: response.status,
    };
  } catch (error) {
    console.log("====================================");
    console.log("DELETE API ERROR");
    console.log("====================================");
    console.log("MESSAGE:", error?.message);

    // -----------------------------------------
    // SERVER RESPONSE ERROR
    // -----------------------------------------

    if (error?.response) {
      console.log("STATUS:", error.response.status);

      console.log(
        "SERVER RESPONSE:",
        JSON.stringify(
          error.response.data,
          null,
          2
        )
      );

      return {
        success: 0,
        message:
          error.response.data?.message ||
          `Delete failed with status ${error.response.status}.`,
        data: error.response.data?.data ?? null,
        status: error.response.status,
      };
    }

    // -----------------------------------------
    // NO SERVER RESPONSE
    // -----------------------------------------

    if (error?.request) {
      console.log("NO RESPONSE FROM SERVER");

      return {
        success: 0,
        message:
          "No response from server. Check the API server and network connection.",
        data: null,
        status: 0,
      };
    }

    // -----------------------------------------
    // OTHER ERROR
    // -----------------------------------------

    return {
      success: 0,
      message:
        error?.message ||
        "Unable to delete the item.",
      data: null,
      status: 0,
    };
  }
};


export const getMethod = async (url) => {
  try {
    const token = await AsyncStorage.getItem("bakasuran_token");

    console.log("GET REQUEST URL:", url);
    console.log("AUTH TOKEN EXISTS:", !!token);

    const response = await axios.get(url, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      timeout: 15000,
    });

    console.log("GET STATUS:", response.status);
    console.log("GET RESPONSE DATA:", response.data);

    return response.data;
  } catch (error) {
    console.log("GET ERROR MESSAGE:", error.message);
    console.log("GET ERROR STATUS:", error.response?.status);
    console.log("GET ERROR DATA:", error.response?.data);

    throw error;
  }
};
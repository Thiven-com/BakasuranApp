
// utils/APIServices.js

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import BASE_URL from "../constants/AppUrls";

// =========================================================
// TOKEN KEY
// =========================================================

const TOKEN_KEY = "bakasuran_token";

// =========================================================
// BUILD URL
// =========================================================

const buildUrl = (endpoint) => {
  if (!endpoint) {
    throw new Error("API endpoint is required.");
  }

  if (String(endpoint).startsWith("http")) {
    return endpoint;
  }

  const cleanBaseUrl = String(BASE_URL).replace(/\/+$/, "");
  const cleanEndpoint = String(endpoint).replace(/^\/+/, "");

  return `${cleanBaseUrl}/${cleanEndpoint}`;
};

// =========================================================
// BUILD HEADERS
// =========================================================

const buildHeaders = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    return {
      Accept: "application/json",
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    };
  } catch (error) {
    console.log("BUILD HEADERS ERROR:", error?.message);

    return {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  }
};

// =========================================================
// GET METHOD
// =========================================================

export const getMethod = async (endpoint) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders();

    console.log("========== GET API ==========");
    console.log("METHOD:", "GET");
    console.log("URL:", url);

    const response = await axios.get(url, {
      headers,
      timeout: 30000,
    });

    console.log("GET API STATUS:", response.status);
    console.log(
      "GET API RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    return response;
  } catch (error) {
    console.log("========== GET API ERROR ==========");

    console.log("MESSAGE:", error?.message);

    if (error?.response) {
      console.log("STATUS:", error.response.status);

      console.log(
        "SERVER RESPONSE:",
        JSON.stringify(error.response.data, null, 2)
      );

      return error.response;
    }

    throw error;
  }
};

// =========================================================
// POST METHOD
//
// IMPORTANT:
// Your Function.js calls:
// postMethod(url, null, data)
//
// Example:
// postMethod(url, null, { mobile })
// =========================================================

export async function postMethod(url, user = null, data = {}) {
  try {
    const finalUrl = buildUrl(url);
    const headers = await buildHeaders();

    console.log("========== POST API ==========");
    console.log("METHOD:", "POST");
    console.log("URL:", finalUrl);
    console.log("USER:", user);
    console.log(
      "REQUEST BODY:",
      JSON.stringify(data, null, 2)
    );

    const response = await axios.post(finalUrl, data, {
      headers,
      timeout: 30000,
    });

    console.log("HTTP STATUS:", response.status);

    console.log(
      "POST API RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    // Return response.data because your Function.js
    // expects response.success / response.message.
    return response.data;
  } catch (error) {
    console.log("========== POST API ERROR ==========");

    console.log("MESSAGE:", error?.message);

    if (error?.response) {
      console.log("HTTP STATUS:", error.response.status);

      console.log(
        "SERVER RESPONSE:",
        JSON.stringify(error.response.data, null, 2)
      );

      // Return server response so Function.js can process
      // success/message normally.
      return (
        error.response.data || {
          success: 0,
          message: `Request failed with status ${error.response.status}.`,
        }
      );
    }

    if (error?.request) {
      console.log("NO RESPONSE FROM SERVER");

      return {
        success: 0,
        message:
          "No response from server. Check the API server and network connection.",
      };
    }

    return {
      success: 0,
      message:
        error?.message ||
        "Unable to complete the request.",
    };
  }
}

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

    const response = await axios.put(url, data, {
      headers,
      timeout: 30000,
    });

    console.log("PUT API STATUS:", response.status);

    console.log(
      "PUT API RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    return response;
  } catch (error) {
    console.log("PUT API ERROR:", error?.message);

    if (error?.response) {
      console.log(
        "SERVER RESPONSE:",
        JSON.stringify(error.response.data, null, 2)
      );

      return error.response;
    }

    throw error;
  }
};

// =========================================================
// DELETE METHOD
// =========================================================

export const deleteMethod = async (endpoint) => {
  try {
    const url = buildUrl(endpoint);
    const headers = await buildHeaders();

    console.log("========== DELETE API ==========");
    console.log("METHOD:", "DELETE");
    console.log("URL:", url);

    const response = await axios.delete(url, {
      headers,
      timeout: 30000,
    });

    console.log("DELETE API STATUS:", response.status);

    console.log(
      "DELETE API RESPONSE:",
      JSON.stringify(response.data, null, 2)
    );

    return response;
  } catch (error) {
    console.log("DELETE API ERROR:", error?.message);

    if (error?.response) {
      return error.response;
    }

    throw error;
  }
};

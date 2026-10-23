// ---------------------------------------------------------
// Requestmake — thin axios wrapper used by every API call in
// the app. On success it returns the raw response data as-is.
// On failure it does NOT throw — it returns
//   { success: 0, message: "..." }
// so callers check `response?.success === 0` instead of try/catch.
// ---------------------------------------------------------
import axios from "axios";
 
export default async (url, options = {}) => {
  try {
    let response = null;
    if (options.method === "GET") {
      const result = await axios.get(url, options);
      response = result?.data;
    } else {
      const result = await axios.post(url, options.body, options);
      response = result?.data;
    }
    return response;
  } catch (error) {
    let message = "Request failed";
    const responseData = error.response?.data;
    if (error.response) {
      message =
        responseData?.message ||
        responseData?.error ||
        (responseData?.errors
          ? JSON.stringify(responseData.errors)
          : undefined) ||
        "Validation failed";
    } else if (error.request) {
      message = "No response from server";
    } else {
      message = "Request error: " + error.message;
    }
    return {
      success: 0,
      message: message,
      statusCode: error.response?.status,
    };
  }
};
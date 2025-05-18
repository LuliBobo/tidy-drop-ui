"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// netlify/functions/feedback_handler.js
var feedback_handler_exports = {};
__export(feedback_handler_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(feedback_handler_exports);
function validateFeedbackData(data) {
  if (!data) {
    return "No feedback data provided";
  }
  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
    return "Name is required and must be at least 2 characters";
  }
  if (!data.email || typeof data.email !== "string") {
    return "Email is required";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return "Invalid email address format";
  }
  if (!data.message || typeof data.message !== "string" || data.message.trim().length < 10) {
    return "Feedback message is required and must be at least 10 characters";
  }
  return null;
}
var handler = async (event, context) => {
  const headers = {
    "Content-Type": "application/json",
    // TODO: Configure CORS headers for production
    "Access-Control-Allow-Origin": "*",
    // Replace with specific domain in production
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      // No content for OPTIONS
      headers
    };
  }
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        error: "Method not allowed. Please use POST."
      })
    };
  }
  try {
    let data;
    try {
      data = JSON.parse(event.body);
    } catch (e) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Invalid JSON in request body"
        })
      };
    }
    const validationError = validateFeedbackData(data);
    if (validationError) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: validationError
        })
      };
    }
    console.log("Feedback received:", {
      name: data.name,
      email: data.email,
      message: data.message,
      category: data.category || "general",
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Thank you for your feedback! We appreciate your input."
      })
    };
  } catch (error) {
    console.error("Error processing feedback:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: "An unexpected error occurred while processing your feedback."
      })
    };
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
//# sourceMappingURL=feedback_handler.js.map

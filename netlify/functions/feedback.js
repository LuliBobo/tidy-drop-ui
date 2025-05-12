/**
 * DropTidy Feedback Submission Handler
 * 
 * This serverless function processes feedback form submissions for the DropTidy web application.
 * It validates input data, logs the feedback, and returns appropriate responses.
 * 
 * @typedef {Object} FeedbackRequest
 * @property {string} name - The user's name
 * @property {string} email - The user's email address
 * @property {string} message - The feedback content
 * @property {string} [category] - Optional category of the feedback (bug, feature, question, etc.)
 * 
 * @typedef {Object} SuccessResponse
 * @property {boolean} success - Always true for success responses
 * @property {string} message - A success message
 * 
 * @typedef {Object} ErrorResponse
 * @property {boolean} success - Always false for error responses
 * @property {string} error - An error message
 */

/**
 * Validates the feedback request data
 * 
 * @param {FeedbackRequest} data - The feedback data to validate
 * @returns {string|null} - Returns an error message if validation fails, null otherwise
 */
function validateFeedbackData(data) {
  if (!data) {
    return "No feedback data provided";
  }

  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 2) {
    return "Name is required and must be at least 2 characters";
  }

  if (!data.email || typeof data.email !== 'string') {
    return "Email is required";
  }

  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    return "Invalid email address format";
  }

  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 10) {
    return "Feedback message is required and must be at least 10 characters";
  }

  return null;
}

/**
 * The main handler function for the feedback serverless endpoint
 * 
 * @param {Object} event - The Netlify Functions event object
 * @param {Object} context - The Netlify Functions context object
 * @returns {Object} - HTTP response object
 */
export const handler = async (event, context) => {
  // Set CORS headers if needed
  const headers = {
    "Content-Type": "application/json",
    // TODO: Configure CORS headers for production
    "Access-Control-Allow-Origin": "*", // Replace with specific domain in production
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS"
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204, // No content for OPTIONS
      headers
    };
  }

  // Ensure this is a POST request
  if (event.httpMethod !== 'POST') {
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
    // Parse the request body
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

    // Validate the feedback data
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

    // Log the feedback (for now)
    console.log("Feedback received:", {
      name: data.name,
      email: data.email,
      message: data.message,
      category: data.category || "general",
      timestamp: new Date().toISOString()
    });

    // TODO: Implement email sending
    /*
    // Example SendGrid integration (would require sendgrid package)
    const sendgrid = require('@sendgrid/mail');
    sendgrid.setApiKey(process.env.SENDGRID_API_KEY);
    await sendgrid.send({
      to: 'your-email@example.com',
      from: 'noreply@droptidy.com',
      subject: `DropTidy Feedback: ${data.category || 'General'}`,
      text: `
        Name: ${data.name}
        Email: ${data.email}
        Category: ${data.category || 'General'}
        Message: ${data.message}
      `
    });
    */

    // TODO: Implement database storage
    /*
    // Example Firestore integration (would require firebase-admin package)
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
    }
    
    const db = admin.firestore();
    await db.collection('feedback').add({
      name: data.name,
      email: data.email,
      message: data.message,
      category: data.category || 'general',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    */

    // TODO: Implement rate limiting
    /*
    // This would typically be implemented using Redis or similar service
    // Example pseudocode:
    const ipAddress = event.headers['client-ip'];
    const currentCount = await getSubmissionCount(ipAddress);
    if (currentCount > RATE_LIMIT) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({
          success: false,
          error: "Too many requests. Please try again later."
        })
      };
    }
    await incrementSubmissionCount(ipAddress);
    */

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: "Thank you for your feedback! We appreciate your input."
      })
    };
  } catch (error) {
    // Log the error for debugging
    console.error("Error processing feedback:", error);

    // Return error response
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

/**
 * Type definitions for the DropTidy feedback serverless function
 */

/**
 * Represents a feedback submission request
 */
export interface FeedbackRequest {
  /** The user's name (minimum 2 characters) */
  name: string;
  /** The user's email address */
  email: string;
  /** The feedback content (minimum 10 characters) */
  message: string;
  /** Optional category of the feedback */
  category?: 'bug' | 'feature' | 'question' | 'other';
}

/**
 * Represents a successful feedback submission response
 */
export interface FeedbackSuccessResponse {
  /** Indicates the request was successful */
  success: true;
  /** A success message to display to the user */
  message: string;
}

/**
 * Represents an error feedback submission response
 */
export interface FeedbackErrorResponse {
  /** Indicates the request failed */
  success: false;
  /** An error message explaining what went wrong */
  error: string;
}

/**
 * Union type for all possible feedback API responses
 */
export type FeedbackResponse = FeedbackSuccessResponse | FeedbackErrorResponse;

/**
 * Function to validate a feedback request
 */
export function validateFeedbackRequest(data: unknown): data is FeedbackRequest {
  if (!data || typeof data !== 'object') return false;
  
  const request = data as FeedbackRequest;
  
  return (
    typeof request.name === 'string' && request.name.trim().length >= 2 &&
    typeof request.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(request.email) &&
    typeof request.message === 'string' && request.message.trim().length >= 10 &&
    (request.category === undefined || 
     ['bug', 'feature', 'question', 'other'].includes(request.category))
  );
}

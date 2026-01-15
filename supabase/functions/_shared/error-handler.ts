// Centralized error handling for edge functions

interface ErrorResponse {
  error: string;
  requestId?: string;
}

export function handleError(
  error: any,
  requestId?: string
): { response: ErrorResponse; status: number } {
  
  // Log full error details server-side only
  console.error("Error details:", {
    requestId,
    message: error.message || "Unknown error",
    error: error.toString(),
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  // Map known error types to safe user-facing messages
  const safeErrors: Record<string, string> = {
    "Rate limit exceeded": "Too many requests. Please try again later.",
    "Validation failed": "Invalid input provided. Please check your data.",
    "CAPTCHA validation failed": "Please complete the verification.",
  };
  
  // Return generic message for security (never expose internals)
  const clientMessage = safeErrors[error.message] || 
    "An error occurred. Please try again or contact support.";
  
  return {
    response: {
      error: clientMessage,
      requestId // Include for support reference
    },
    status: error.status || 500
  };
}

/**
 * Secure error handling utilities
 */

// Security: Generic error messages to prevent information leakage
export const ErrorMessages = {
  AUTHENTICATION_FAILED: 'Invalid email or password. Please try again.',
  ACCOUNT_CREATION_FAILED: 'Unable to create account. Please try again later.',
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  GENERAL_ERROR: 'Something went wrong. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.'
};

// Security: Sanitize error messages to prevent sensitive data exposure
export const sanitizeError = (error: unknown): string => {
  if (!error) return ErrorMessages.GENERAL_ERROR;
  
  const errorString = error instanceof Error ? error.message : String(error);
  
  // Security: Map specific Appwrite errors to generic user-friendly messages
  const errorMappings: Record<string, string> = {
    'Invalid credentials': ErrorMessages.AUTHENTICATION_FAILED,
    'User already exists': 'An account with this email already exists.',
    'Invalid email': 'Please enter a valid email address.',
    'Password must be': 'Password does not meet requirements.',
    'Network request failed': ErrorMessages.NETWORK_ERROR,
    'Document not found': 'The requested item could not be found.',
    'Unauthorized': ErrorMessages.UNAUTHORIZED,
    'Session expired': ErrorMessages.SESSION_EXPIRED
  };
  
  // Check for known error patterns
  for (const [pattern, message] of Object.entries(errorMappings)) {
    if (errorString.toLowerCase().includes(pattern.toLowerCase())) {
      return message;
    }
  }
  
  // Security: Don't expose internal error details in production
  if (__DEV__) {
    console.warn('Unmapped error:', errorString);
  }
  
  return ErrorMessages.GENERAL_ERROR;
};

// Security: Rate limiting helper (client-side tracking)
export class ClientRateLimit {
  private attempts: Map<string, number[]> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;
  
  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) { // 15 minutes
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }
  
  getRemainingTime(key: string): number {
    const attempts = this.attempts.get(key) || [];
    if (attempts.length < this.maxAttempts) return 0;
    
    const oldestAttempt = Math.min(...attempts);
    const timeLeft = this.windowMs - (Date.now() - oldestAttempt);
    return Math.max(0, timeLeft);
  }
}

// Security: Global rate limiter for authentication attempts
export const authRateLimit = new ClientRateLimit(5, 15 * 60 * 1000); // 5 attempts per 15 minutes

/**
 * Input validation utilities for security and user experience
 */

export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/,
    message: 'Name must be 2-50 characters and contain only letters, spaces, hyphens, and apostrophes'
  }
};

export const validateEmail = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!ValidationRules.email.pattern.test(email)) {
    return { isValid: false, message: ValidationRules.email.message };
  }
  
  return { isValid: true };
};

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < ValidationRules.password.minLength) {
    return { isValid: false, message: `Password must be at least ${ValidationRules.password.minLength} characters` };
  }
  
  if (!ValidationRules.password.pattern.test(password)) {
    return { isValid: false, message: ValidationRules.password.message };
  }
  
  return { isValid: true };
};

export const validateName = (name: string): { isValid: boolean; message?: string } => {
  if (!name) {
    return { isValid: false, message: 'Name is required' };
  }
  
  if (name.length < ValidationRules.name.minLength || name.length > ValidationRules.name.maxLength) {
    return { isValid: false, message: `Name must be ${ValidationRules.name.minLength}-${ValidationRules.name.maxLength} characters` };
  }
  
  if (!ValidationRules.name.pattern.test(name)) {
    return { isValid: false, message: ValidationRules.name.message };
  }
  
  return { isValid: true };
};

// Security: Sanitize search queries to prevent potential injection attacks
export const sanitizeSearchQuery = (query: string): string => {
  if (!query) return '';
  
  // Remove potentially dangerous characters and limit length
  return query
    .replace(/[<>'"]/g, '') // Remove HTML/script injection characters
    .replace(/[;]/g, '') // Remove SQL injection characters
    .trim()
    .substring(0, 100); // Limit query length
};

// Security: Validate and sanitize user input for menu search
export const validateSearchInput = (input: string): { isValid: boolean; sanitized: string; message?: string } => {
  if (!input) {
    return { isValid: true, sanitized: '' };
  }
  
  const sanitized = sanitizeSearchQuery(input);
  
  if (sanitized.length !== input.replace(/[<>'"]/g, '').replace(/[;]/g, '').trim().length) {
    return { 
      isValid: false, 
      sanitized, 
      message: 'Search contains invalid characters' 
    };
  }
  
  return { isValid: true, sanitized };
};

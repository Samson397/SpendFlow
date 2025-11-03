/**
 * Professional input validation utilities for SpendFlow
 * Provides comprehensive validation with detailed error messages
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: any;
}

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
  sanitize?: ((value: any) => any) | undefined;
}

export class Validator {
  private rules: ValidationRule[] = [];

  /**
   * Add a validation rule
   */
  addRule(rule: ValidationRule): Validator {
    this.rules.push(rule);
    return this;
  }

  /**
   * Add a required field validation
   */
  required(message = 'This field is required'): Validator {
    return this.addRule({
      validate: (value) => value !== null && value !== undefined && value !== '',
      message,
    });
  }

  /**
   * Add email validation
   */
  email(message = 'Please enter a valid email address'): Validator {
    return this.addRule({
      validate: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(value));
      },
      message,
      sanitize: (value) => String(value).toLowerCase().trim(),
    });
  }

  /**
   * Add minimum length validation
   */
  minLength(length: number, message?: string): Validator {
    return this.addRule({
      validate: (value) => String(value).length >= length,
      message: message || `Must be at least ${length} characters long`,
    });
  }

  /**
   * Add maximum length validation
   */
  maxLength(length: number, message?: string): Validator {
    return this.addRule({
      validate: (value) => String(value).length <= length,
      message: message || `Must be no more than ${length} characters long`,
    });
  }

  /**
   * Add numeric validation
   */
  numeric(message = 'Please enter a valid number'): Validator {
    return this.addRule({
      validate: (value) => !isNaN(Number(value)) && !isNaN(parseFloat(String(value))),
      message,
      sanitize: (value) => Number(value),
    });
  }

  /**
   * Add positive number validation
   */
  positive(message = 'Please enter a positive number'): Validator {
    return this.addRule({
      validate: (value) => {
        const num = Number(value);
        return !isNaN(num) && num > 0;
      },
      message,
      sanitize: (value) => Number(value),
    });
  }

  /**
   * Add currency amount validation
   */
  currency(message = 'Please enter a valid amount'): Validator {
    return this.addRule({
      validate: (value) => {
        const num = parseFloat(String(value));
        return !isNaN(num) && num >= 0 && num <= 999999.99;
      },
      message,
      sanitize: (value) => Math.round(parseFloat(String(value)) * 100) / 100, // Round to 2 decimal places
    });
  }

  /**
   * Add date validation
   */
  date(message = 'Please enter a valid date'): Validator {
    return this.addRule({
      validate: (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) && date.getTime() > 0;
      },
      message,
      sanitize: (value) => new Date(value),
    });
  }

  /**
   * Add custom validation
   */
  custom(validateFn: (value: any) => boolean, message: string, sanitizeFn?: (value: any) => any): Validator {
    return this.addRule({
      validate: validateFn,
      message,
      sanitize: sanitizeFn,
    });
  }

  /**
   * Validate a value against all rules
   */
  validate(value: any): ValidationResult {
    for (const rule of this.rules) {
      if (!rule.validate(value)) {
        return {
          isValid: false,
          error: rule.message,
        };
      }
    }

    // If all validations pass, apply sanitization
    let sanitizedValue = value;
    for (const rule of this.rules) {
      if (rule.sanitize) {
        sanitizedValue = rule.sanitize(sanitizedValue);
      }
    }

    return {
      isValid: true,
      sanitizedValue,
    };
  }

  /**
   * Clear all rules (for reuse)
   */
  clear(): Validator {
    this.rules = [];
    return this;
  }
}

// Pre-built validators for common use cases
export const validators = {
  email: () => new Validator().required().email(),
  password: () => new Validator().required().minLength(8, 'Password must be at least 8 characters'),
  amount: () => new Validator().required().currency(),
  description: () => new Validator().required().maxLength(500, 'Description must be less than 500 characters'),
  cardName: () => new Validator().required().minLength(2).maxLength(50),
  categoryName: () => new Validator().required().minLength(2).maxLength(30),
  userName: () => new Validator().required().minLength(2).maxLength(50),
};

/**
 * Validate form data with multiple fields
 */
export function validateForm(fields: Record<string, { value: any; validator: Validator }>): {
  isValid: boolean;
  errors: Record<string, string>;
  sanitizedData: Record<string, any>;
} {
  const errors: Record<string, string> = {};
  const sanitizedData: Record<string, any> = {};
  let isValid = true;

  for (const [fieldName, { value, validator }] of Object.entries(fields)) {
    const result = validator.validate(value);
    if (!result.isValid) {
      errors[fieldName] = result.error || 'Invalid value';
      isValid = false;
    } else {
      sanitizedData[fieldName] = result.sanitizedValue;
    }
  }

  return { isValid, errors, sanitizedData };
}

/**
 * Sanitize input to prevent XSS attacks
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Rate limiting utility for form submissions
 */
export class RateLimiter {
  private attempts: number[] = [];
  private maxAttempts: number;
  private windowMs: number;

  constructor(maxAttempts = 5, windowMs = 60000) { // 5 attempts per minute by default
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  canAttempt(): boolean {
    const now = Date.now();
    // Remove old attempts outside the window
    this.attempts = this.attempts.filter(time => now - time < this.windowMs);

    return this.attempts.length < this.maxAttempts;
  }

  recordAttempt(): void {
    this.attempts.push(Date.now());
  }

  getRemainingTime(): number {
    if (this.attempts.length === 0) return 0;

    const oldestAttempt = Math.min(...this.attempts);
    const timePassed = Date.now() - oldestAttempt;
    return Math.max(0, this.windowMs - timePassed);
  }
}

// Global rate limiter instance
export const formRateLimiter = new RateLimiter();

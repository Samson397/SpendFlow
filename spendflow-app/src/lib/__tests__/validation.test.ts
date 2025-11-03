/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Validator, validators } from '@/lib/validation';

describe('Validator', () => {
  describe('basic validation', () => {
    it('should validate required fields', () => {
      const validator = new Validator().required('Name is required');

      expect(validator.validate('John Doe')).toEqual({
        isValid: true,
        sanitizedValue: 'John Doe',
      });

      expect(validator.validate('')).toEqual({
        isValid: false,
        error: 'Name is required',
      });

      expect(validator.validate(null)).toEqual({
        isValid: false,
        error: 'Name is required',
      });
    });

    it('should validate email addresses', () => {
      const validator = new Validator().email();

      expect(validator.validate('john@example.com')).toEqual({
        isValid: true,
        sanitizedValue: 'john@example.com',
      });

      expect(validator.validate('invalid-email')).toEqual({
        isValid: false,
        error: 'Please enter a valid email address',
      });
    });

    it('should validate minimum length', () => {
      const validator = new Validator().minLength(3);

      expect(validator.validate('abc')).toEqual({
        isValid: true,
        sanitizedValue: 'abc',
      });

      expect(validator.validate('ab')).toEqual({
        isValid: false,
        error: 'Must be at least 3 characters long',
      });
    });

    it('should validate currency amounts', () => {
      const validator = new Validator().currency();

      expect(validator.validate('99.99')).toEqual({
        isValid: true,
        sanitizedValue: 99.99,
      });

      expect(validator.validate('-10')).toEqual({
        isValid: false,
        error: 'Please enter a valid amount',
      });

      expect(validator.validate('999999.99')).toEqual({
        isValid: true,
        sanitizedValue: 999999.99,
      });

      expect(validator.validate('1000000')).toEqual({
        isValid: false,
        error: 'Please enter a valid amount',
      });
    });
  });

  describe('pre-built validators', () => {
    it('should validate email with pre-built validator', () => {
      const result = validators.email().validate('user@example.com');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe('user@example.com');
    });

    it('should validate password requirements', () => {
      const passwordValidator = validators.password();

      expect(passwordValidator.validate('')).toEqual({
        isValid: false,
        error: 'This field is required',
      });

      expect(passwordValidator.validate('short')).toEqual({
        isValid: false,
        error: 'Password must be at least 8 characters',
      });

      expect(passwordValidator.validate('validpassword123')).toEqual({
        isValid: true,
        sanitizedValue: 'validpassword123',
      });
    });

    it('should validate amounts', () => {
      const result = validators.amount().validate('50.75');
      expect(result.isValid).toBe(true);
      expect(result.sanitizedValue).toBe(50.75);
    });
  });

  describe('form validation', () => {
    it('should validate entire forms', () => {
      const formData = {
        email: { value: 'user@example.com', validator: validators.email() },
        password: { value: 'validpass123', validator: validators.password() },
        amount: { value: '99.99', validator: validators.amount() },
      };

      const result = validateForm(formData);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
      expect(result.sanitizedData).toEqual({
        email: 'user@example.com',
        password: 'validpass123',
        amount: 99.99,
      });
    });

    it('should collect form validation errors', () => {
      const formData = {
        email: { value: 'invalid-email', validator: validators.email() },
        password: { value: 'short', validator: validators.password() },
        amount: { value: '-50', validator: validators.amount() },
      };

      const result = validateForm(formData);

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
      expect(result.errors.password).toBe('Password must be at least 8 characters');
      expect(result.errors.amount).toBe('Please enter a valid amount');
      expect(result.sanitizedData).toEqual({});
    });
  });
});

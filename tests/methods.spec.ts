/*
Public Methods Testing
- Check if each of the methods exposed by the library can be correctly used and each one works as expected
*/

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index'

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
  }
}

test.describe('Form Validation Methods Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
    await page.waitForFunction(() => window.Validation);
  });

  test.describe('isValid() Method', () => {
    test('should return true when all fields are valid', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
          },
        });
        
        // Fill in valid data
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        const emailInput = document.querySelector('section[data-value="basic"] input[name="email"]') as HTMLInputElement;
        
        nameInput.value = 'John Doe';
        emailInput.value = 'john@example.com';
        
        validation.validateForm(true);
        return validation.isValid();
      });
      
      expect(result).toBe(true);
    });

    test('should return false when fields are invalid', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
          },
        });
        
        // Leave fields empty
        validation.validateForm(true);
        return validation.isValid();
      });
      
      expect(result).toBe(false);
    });
  });

  test.describe('validateForm() Method', () => {
    test('should validate all fields and return true when valid', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
          },
        });
        
        // Fill in valid data
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        const emailInput = document.querySelector('section[data-value="basic"] input[name="email"]') as HTMLInputElement;
        
        nameInput.value = 'John Doe';
        emailInput.value = 'john@example.com';
        
        return validation.validateForm(true);
      });
      
      expect(result).toBe(true);
    });

    test('should validate all fields and return false when invalid', async ({ page }) => {
      const result = await page.evaluate(() => {
      const validation = new window.Validation('section[data-value="basic"] form', {
        fields: {
          name: { rules: ['required'] },
          email: { rules: ['required', 'validEmail'] },
        },
      });
      
      // Leave fields empty
      return validation.validateForm(true);
      });
      
      expect(result).toBe(false);
    });

    test('should show errors when silently is false', async ({ page }) => {
      await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
          },
        });
        
        // Validate without silently flag (should show errors)
        validation.validateForm(false);
      });
      
      // Check that error elements are visible
      expect(await page.isVisible('.name-error-element')).toBe(true);
      expect(await page.isVisible('.email-error-element')).toBe(true);
    });
  });

  test.describe('isFieldValid() Method', () => {
    test('should return true when field is valid using field name', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
        
        // Fill in valid data
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        nameInput.value = 'John Doe';
        
        return validation.isFieldValid('name', true);
      });
      
      expect(result).toBe(true);
    });

    test('should return false when field is invalid using field name', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
        
        // Leave field empty
        return validation.isFieldValid('name', true);
      });
      
      expect(result).toBe(false);
    });

    test('should return true when field is valid using field element', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
        
        // Fill in valid data
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        nameInput.value = 'John Doe';
        
                 return validation.isFieldValid(nameInput as any, true);
      });
      
      expect(result).toBe(true);
    });

    test('should throw error when field does not exist', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
        
        try {
          validation.isFieldValid('nonexistent', true);
          return false;
        } catch (error) {
          return error.message.includes('does not exist');
        }
      });
      
      expect(result).toBe(true);
    });

    test('should throw error when field is not being validated', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
        
        try {
          validation.isFieldValid('email', true);
          return false;
        } catch (error) {
          return error.message.includes('is not being validated');
        }
      });
      
      expect(result).toBe(true);
    });
  });

  test.describe('addMethod() Method', () => {
    test('should add a new custom rule', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="custom-rules"] form', {
          fields: {
            accept: { rules: ['required'] },
          },
        });
        
        // Add custom rule
        validation.addMethod(
          'mustBeAccept',
          function (element) {
            return element.value.trim().toLowerCase() === 'accept';
          },
          'Please enter the word "Accept".'
        );
        
        validation.addFieldRule('accept', 'mustBeAccept');
        
        // Test the custom rule
        const acceptInput = document.querySelector('section[data-value="custom-rules"] input[name="accept"]') as HTMLInputElement;
        acceptInput.value = 'accept';
        
        return validation.isFieldValid('accept', true);
      });
      
      expect(result).toBe(true);
    });

    test('should modify an existing rule', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="custom-rules"] form', {
          fields: {
            accept: { rules: ['required'] },
          },
        });
        
        // Modify existing required rule
        validation.addMethod(
          'required',
          function (element) {
            return element.value.trim() !== '';
          },
          'This field is absolutely required!'
        );
        
        // Test the modified rule
        const acceptInput = document.querySelector('section[data-value="custom-rules"] input[name="accept"]') as HTMLInputElement;
        acceptInput.value = '';
        
        return validation.isFieldValid('accept', true);
      });
      
      expect(result).toBe(false);
    });

    test('should throw error when name is not a string', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="custom-rules"] form');
        
        try {
          validation.addMethod(null as any, () => true, 'message');
          return false;
        } catch (error) {
          return error.message.includes('Name must be a string');
        }
      });
      
      expect(result).toBe(true);
    });

    test('should throw error when validator is not a function for new rule', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="custom-rules"] form');
        
        try {
          validation.addMethod('newRule', 'not a function' as any, 'message');
          return false;
        } catch (error) {
          return error.message.includes('Validator must be a function');
        }
      });
      
      expect(result).toBe(true);
    });
  });

  test.describe('setFieldRules() Method', () => {
    test('should set rules for a field', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        validation.setFieldRules('name', ['required'], {
          required: 'Name is required!'
        });
        
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        nameInput.value = '';
        
        return validation.isFieldValid('name', true);
      });
      
      expect(result).toBe(false);
    });

    test('should throw error when field does not exist', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        try {
          validation.setFieldRules('nonexistent', ['required']);
          return false;
        } catch (error) {
          return error.message.includes('was not found in the form');
        }
      });
      
      expect(result).toBe(true);
    });
  });

  test.describe('addFieldRule() Method', () => {
    test('should add a rule to a field', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        validation.addFieldRule('name', 'required', 'Name is required!');
        
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        nameInput.value = '';
        
        return validation.isFieldValid('name', true);
      });
      
      expect(result).toBe(false);
    });

    test('should add multiple rules to a field', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        validation.addFieldRule('email', 'required', 'Email is required!');
        validation.addFieldRule('email', 'validEmail', 'Email must be valid!');
        
        const emailInput = document.querySelector('section[data-value="basic"] input[name="email"]') as HTMLInputElement;
        emailInput.value = 'invalid-email';
        
        return validation.isFieldValid('email', true);
      });
      
      expect(result).toBe(false);
    });

    test('should throw error when field does not exist', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        try {
          validation.addFieldRule('nonexistent', 'required');
          return false;
        } catch (error) {
          return error.message.includes('does not exist');
        }
      });
      
      expect(result).toBe(true);
    });

    test('should throw error when rule does not exist', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        try {
          validation.addFieldRule('name', 'nonexistentRule');
          return false;
        } catch (error) {
          return error.message.includes('does not exist');
        }
      });
      
      expect(result).toBe(true);
    });
  });

  test.describe('removeFieldRule() Method', () => {
    test('should remove a rule from a field', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
        
        // Remove the required rule
        validation.removeFieldRule('name', 'required');
        
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        nameInput.value = '';
        
        // Should be valid now since required rule is removed
        return validation.isFieldValid('name', true);
      });
      
      expect(result).toBe(true);
    });

    test('should throw error when field does not exist', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        try {
          validation.removeFieldRule('nonexistent', 'required');
          return false;
        } catch (error) {
          return error.message.includes('does not exist');
        }
      });
      
      expect(result).toBe(true);
    });
  });

  test.describe('addFieldConfig() Method', () => {
    test('should add configuration to a field', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
                 validation.addFieldConfig('name', {
           rules: ['required'],
           messages: {
             required: 'Name is absolutely required!'
           },
           optional: false,
         } as any);
        
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        nameInput.value = '';
        
        return validation.isFieldValid('name', true);
      });
      
      expect(result).toBe(false);
    });

    test('should throw error when field does not exist', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        try {
                     validation.addFieldConfig('nonexistent', {
             rules: ['required'],
             messages: {},
             optional: false,
           } as any);
          return false;
        } catch (error) {
          return error.message.includes('does not exist');
        }
      });
      
      expect(result).toBe(true);
    });

    test('should throw error when config is empty', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        try {
          validation.addFieldConfig('name', null as any);
          return false;
        } catch (error) {
          return error.message.includes('Config cannot be empty');
        }
      });
      
      expect(result).toBe(true);
    });

    test('should throw error when config is not an object', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        try {
          validation.addFieldConfig('name', 'not an object' as any);
          return false;
        } catch (error) {
          return error.message.includes('Config must be an object');
        }
      });
      
      expect(result).toBe(true);
    });
  });

  test.describe('Integration Tests', () => {
    test('should work with complex form validation scenario', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="custom"] form', {
          fields: {
            firstName: { rules: ['required'] },
            lastName: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
            phone: { rules: ['required'] },
            shippingAddress1: { rules: ['required'] },
            shippingCity: { rules: ['required'] },
            shippingState: { rules: ['required'] },
            shippingZipcode: { rules: ['required'] },
            creditCard: { rules: ['required'] },
            expiration: { rules: ['required'] },
            cvv: { rules: ['required'] },
          },
        });
        
        // Add custom rule
        validation.addMethod(
          'phoneFormat',
          function (element) {
            return /^\d{3}-\d{3}-\d{4}$/.test(element.value);
          },
          'Phone must be in format XXX-XXX-XXXX'
        );
        
        // Add phone format rule
        validation.addFieldRule('phone', 'phoneFormat');
        
        // Fill in form data
        const firstNameInput = document.querySelector('section[data-value="custom"] input[name="firstName"]') as HTMLInputElement;
        const lastNameInput = document.querySelector('section[data-value="custom"] input[name="lastName"]') as HTMLInputElement;
        const emailInput = document.querySelector('section[data-value="custom"] input[name="email"]') as HTMLInputElement;
        const phoneInput = document.querySelector('section[data-value="custom"] input[name="phone"]') as HTMLInputElement;
        const shippingAddress1Input = document.querySelector('section[data-value="custom"] input[name="shippingAddress1"]') as HTMLInputElement;
        const shippingCityInput = document.querySelector('section[data-value="custom"] input[name="shippingCity"]') as HTMLInputElement;
        const shippingStateInput = document.querySelector('section[data-value="custom"] input[name="shippingState"]') as HTMLInputElement;
        const shippingZipcodeInput = document.querySelector('section[data-value="custom"] input[name="shippingZipcode"]') as HTMLInputElement;
        const creditCardInput = document.querySelector('section[data-value="custom"] input[name="creditCard"]') as HTMLInputElement;
        const expirationInput = document.querySelector('section[data-value="custom"] input[name="expiration"]') as HTMLInputElement;
        const cvvInput = document.querySelector('section[data-value="custom"] input[name="cvv"]') as HTMLInputElement;
        
        firstNameInput.value = 'John';
        lastNameInput.value = 'Doe';
        emailInput.value = 'john@example.com';
        phoneInput.value = '555-123-4567';
        shippingAddress1Input.value = '123 Main St';
        shippingCityInput.value = 'Anytown';
        shippingStateInput.value = 'CA';
        shippingZipcodeInput.value = '12345';
        creditCardInput.value = '1234567890123456';
        expirationInput.value = '12/25';
        cvvInput.value = '123';
        
        return validation.validateForm(true);
      });
      
      expect(result).toBe(true);
    });

    test('should handle field rule modifications correctly', async ({ page }) => {
      const result = await page.evaluate(() => {
        const validation = new window.Validation('section[data-value="basic"] form');
        
        // Add required rule
        validation.addFieldRule('name', 'required', 'Name is required!');
        
        // Check field is invalid when empty
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        nameInput.value = '';
        
        const isInvalidWhenEmpty = !validation.isFieldValid('name', true);
        
        // Remove required rule
        validation.removeFieldRule('name', 'required');
        
        // Check field is valid when empty after removing rule
        const isValidAfterRemoval = validation.isFieldValid('name', true);
        
        return isInvalidWhenEmpty && isValidAfterRemoval;
      });
      
      expect(result).toBe(true);
    });
  });
});

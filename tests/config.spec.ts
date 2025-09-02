/*
Configuration options testing
- Check if each of the configuration options can be correctly applied and each one works as expected
- No in-depth testing of Field options here
*/

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index'

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
  }
}

test.describe('Form Validation Config Options Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
    await page.waitForFunction(() => window.Validation);
  });

  test.describe('validationFlags Option', () => {
    test.describe('onSubmit Flag', () => {
      test('should validate all fields on form submission when onSubmit flag is present', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onSubmit'],
            fields: {
              name: { rules: ['required'] },
              email: { rules: ['required', 'validEmail'] },
            },
          });
        });

        const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
        await submitButton.click();

        // Should show errors for both fields
        await expect(page.locator('.name-error-element')).toBeVisible();
        await expect(page.locator('.email-error-element')).toBeVisible();
      });

      test('should not validate fields on form submission when onSubmit flag is not present', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onChange'],
            fields: {
              name: { rules: ['required'] },
              email: { rules: ['required', 'validEmail'] },
            },
          });
        });

        const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
        await submitButton.click();

        // Should not show errors because onSubmit flag is not present
        await expect(page.locator('.name-error-element')).not.toBeVisible();
        await expect(page.locator('.email-error-element')).not.toBeVisible();
      });
    });

    test.describe('onChange Flag', () => {
      test('should validate field when change event is triggered with onChange flag', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onChange'],
            fields: {
              name: { rules: ['required'] },
            },
          });
        });

        const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
        
        await nameInput.pressSequentially('test');
        await nameInput.clear();

        await page.evaluate(() => {
          const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
          nameInput.dispatchEvent(new Event('change'));
        });

        // Should show error
        await expect(page.locator('.name-error-element')).toBeVisible();
      });

      test('should not validate field on change when onChange flag is not present', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onSubmit'],
            fields: {
              name: { rules: ['required'] },
            },
          });
        });

        const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
        
        // Trigger change event
        await nameInput.pressSequentially('test');
        await nameInput.clear();
        await nameInput.blur();

        // Should not show error because onChange flag is not present
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      });
    });

    test.describe('onKeyUp Flag', () => {
      test('should validate field on keyup when onKeyUp flag is present', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onKeyUp'],
            fields: {
              name: { rules: ['required'] },
            },
          });
        });

        const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
        
        // Type and then clear to trigger keyup validation
        await nameInput.pressSequentially('test');
        await nameInput.clear();

        // Should show error immediately on keyup
        await expect(page.locator('.name-error-element')).toBeVisible();
      });

      test('should not validate field on keyup when onKeyUp flag is not present', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onSubmit'],
            fields: {
              name: { rules: ['required'] },
            },
          });
        });

        const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
        
        // Type and then clear
        await nameInput.pressSequentially('test');
        await nameInput.clear();

        // Should not show error because onKeyUp flag is not present
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      });
    });

    test.describe('onKeyUpAfterChange Flag', () => {
      test('should validate field on keyup only after first change when onKeyUpAfterChange flag is present', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onKeyUpAfterChange'],
            fields: {
              name: { rules: ['required'] },
            },
          });
        });

        const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
        
        // First, type something without triggering change
        await nameInput.pressSequentially('test');
        await nameInput.clear();

        // Should not show error yet (no change event triggered)
        await expect(page.locator('.name-error-element')).not.toBeVisible();

        // Now trigger change event
        await nameInput.pressSequentially('test');
        await nameInput.blur(); // Triggers change event
        
        // Now keyup should work
        await nameInput.clear();

        // Should show error now
        await expect(page.locator('.name-error-element')).toBeVisible();
      });
    });

    test.describe('Multiple Flags', () => {
      test('should work with multiple validation flags', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onSubmit', 'onChange', 'onKeyUp'],
            fields: {
              name: { rules: ['required'] },
            },
          });
        });

        const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
        const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

        // Test onKeyUp
        await nameInput.pressSequentially('test');
        await nameInput.clear();
        await expect(page.locator('.name-error-element')).toBeVisible();

        // Clear error first
        await nameInput.pressSequentially('valid');
        await expect(page.locator('.name-error-element')).not.toBeVisible();

        // Test onChange
        await nameInput.clear();
        await nameInput.blur();
        await expect(page.locator('.name-error-element')).toBeVisible();

        // Test onSubmit
        await nameInput.pressSequentially('valid');
        await nameInput.clear();
        await submitButton.click();
        await expect(page.locator('.name-error-element')).toBeVisible();
      });
    });

    test.describe('Default validationFlags', () => {
      test('should use default flags when none are specified', async ({ page }) => {
        await page.evaluate(() => {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] },
            },
          });
        });

        const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
        const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

        // Test default behavior: onSubmit, onChange, onKeyUpAfterChange
        
        // Test onSubmit
        await submitButton.click();
        await expect(page.locator('.name-error-element')).toBeVisible();

        // Clear error
        await nameInput.pressSequentially('valid');
        await expect(page.locator('.name-error-element')).not.toBeVisible();

        // Test onChange
        await nameInput.clear();
        await nameInput.blur();
        await expect(page.locator('.name-error-element')).toBeVisible();
      });
    });
  });

  test.describe('submitCallback Option', () => {
    test('should call submitCallback with correct parameters when form is valid', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise<{ formData: any; formElement: string }>((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
            submitCallback: (formData, form) => {
              resolve({
                formData: formData,
                formElement: form?.tagName || 'undefined'
              });
            },
            fields: {
              name: { rules: ['required'] },
              email: { rules: ['required', 'validEmail'] },
              password: { 
                validateWhenHidden: true,
              },
            },
          });

          // Fill the form with valid data
          const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
          const emailInput = document.querySelector('section[data-value="basic"] input[name="email"]') as HTMLInputElement;
          
          nameInput.value = 'John Doe';
          emailInput.value = 'john@example.com';

          // Submit the form
          const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
          submitButton.click();
        });
      });

      expect(result.formData).toEqual({
        name: 'John Doe',
        email: 'john@example.com',
        password: '', // Password is not in the fields, but it is in the form element, so it's passed on the formData object
      });
      expect(result.formElement).toBe('FORM');
    });

    test('should not call submitCallback when form is invalid', async ({ page }) => {
      const result = await page.evaluate(() => {
        let callbackCalled = false;
        
        new window.Validation('section[data-value="basic"] form', {
          submitCallback: (formData, form) => {
            callbackCalled = true;
          },
          fields: {
            name: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
          },
        });

        // Submit the form without filling it (should be invalid)
        const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
        submitButton.click();

        return callbackCalled;
      });

      expect(result).toBe(false);
    });

    test('should sanitize input values before passing to submitCallback', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise<{ formData: any }>((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
            submitCallback: (formData, form) => {
              resolve({ formData: formData });
            },
            fields: {
              name: { rules: ['required'] },
            },
          });

          // Fill the form with potentially dangerous content
          const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
          nameInput.value = '<script>alert("xss")</script>';

          // Submit the form
          const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
          submitButton.click();
        });
      });

      // Should be sanitized
      expect(result.formData.name).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    test('should use default submit behavior when no submitCallback is provided', async ({ page }) => {
      // This test verifies that the default submit behavior works
      // We can't actually test form submission in this environment, but we can verify the validation works
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Fill with valid data
      await nameInput.pressSequentially('John Doe');
      await submitButton.click();

      // Should not show any errors
      await expect(page.locator('.name-error-element')).not.toBeVisible();
    });
  });

  test.describe('invalidHandler Option', () => {
    test('should call invalidHandler with correct parameters when form is invalid', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise<{ errors: any; formElement: string }>((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
            invalidHandler: (errors, form) => {
              resolve({
                errors: (errors.filter(Array.isArray) as Array<[any, any]>).map(([field, message]) => ({
                  fieldName: field.name,
                  message: message
                })),
                formElement: form?.tagName || 'undefined'
              });
            },
            fields: {
              name: { rules: ['required'] },
              email: { rules: ['required', 'validEmail'] },
            },
          });

          // Submit the form without filling it (should be invalid)
          const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
          submitButton.click();
        });
      });

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].fieldName).toBe('name');
      expect(result.errors[0].message).toBe('This field is required');
      expect(result.errors[1].fieldName).toBe('email');
      expect(result.errors[1].message).toBe('This field is required');
      expect(result.formElement).toBe('FORM');
    });

    test('should not call invalidHandler when form is valid', async ({ page }) => {
      const result = await page.evaluate(() => {
        let handlerCalled = false;
        
        new window.Validation('section[data-value="basic"] form', {
          invalidHandler: (errors, form) => {
            handlerCalled = true;
          },
          fields: {
            name: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
          },
        });

        // Fill the form with valid data
        const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
        const emailInput = document.querySelector('section[data-value="basic"] input[name="email"]') as HTMLInputElement;
        
        nameInput.value = 'John Doe';
        emailInput.value = 'john@example.com';

        // Submit the form
        const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
        submitButton.click();

        return handlerCalled;
      });

      expect(result).toBe(false);
    });

    test('should focus first invalid field when invalidHandler is called', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          invalidHandler: (errors, form) => {
            // Custom handler that doesn't interfere with focus
          },
          fields: {
            name: { rules: ['required'] },
            email: { rules: ['required', 'validEmail'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      await submitButton.click();

      // First invalid field should be focused
      await expect(nameInput).toBeFocused();
    });

    test('should provide error details for each invalid field', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise<{ errors: any }>((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
                         invalidHandler: (errors, form) => {
               resolve({
                 errors: (errors.filter(Array.isArray) as Array<[any, any]>).map(([field, message]) => ({
                   fieldName: field.name,
                   fieldType: field.type,
                   fieldValue: field.value,
                   message: message
                 }))
               });
             },
            fields: {
              name: { rules: ['required'] },
              email: { rules: ['required', 'validEmail'] },
            },
          });

          // Fill email with invalid data
          const emailInput = document.querySelector('section[data-value="basic"] input[name="email"]') as HTMLInputElement;
          emailInput.value = 'invalid-email';

          // Submit the form
          const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
          submitButton.click();
        });
      });

      expect(result.errors).toHaveLength(2);
      
      // Check name field error
      const nameError = result.errors.find((e: any) => e.fieldName === 'name');
      expect(nameError.fieldType).toBe('text');
      expect(nameError.fieldValue).toBe('');
      expect(nameError.message).toBe('This field is required');
      
      // Check email field error
      const emailError = result.errors.find((e: any) => e.fieldName === 'email');
      expect(emailError.fieldType).toBe('email');
      expect(emailError.fieldValue).toBe('invalid-email');
      expect(emailError.message).toBe('Please enter a valid email address in the format of example@test.com');
    });

    test('should use default invalidHandler when none is provided', async ({ page }) => {
      // Default invalidHandler does nothing, so we just verify validation still works
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should still show errors even without custom invalidHandler
      await expect(page.locator('.name-error-element')).toBeVisible();
    });
  });

  test.describe('Config Integration Tests', () => {
    test('should work with all config options together', async ({ page }) => {
      const result = await page.evaluate(() => {
        return new Promise<{ 
          submitCalled: boolean; 
          invalidCalled: boolean; 
          errors?: any;
          formData?: any;
        }>((resolve) => {
          let submitCalled = false;
          let invalidCalled = false;
          let capturedErrors: any;
          let capturedFormData: any;

          new window.Validation('section[data-value="basic"] form', {
            validationFlags: ['onSubmit', 'onChange'],
            submitCallback: (formData, form) => {
              submitCalled = true;
              capturedFormData = formData;
              resolve({ 
                submitCalled, 
                invalidCalled, 
                formData: capturedFormData 
              });
            },
                         invalidHandler: (errors, form) => {
               invalidCalled = true;
               capturedErrors = (errors.filter(Array.isArray) as Array<[any, any]>).map(([field, message]) => ({
                 fieldName: field.name,
                 message: message
               }));
               resolve({ 
                 submitCalled, 
                 invalidCalled, 
                 errors: capturedErrors 
               });
             },
            fields: {
              name: { rules: ['required'] },
              email: { rules: ['required', 'validEmail'] },
            },
          });

          // Submit invalid form first
          const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
          submitButton.click();
        });
      });

      // Should call invalidHandler, not submitCallback
      expect(result.invalidCalled).toBe(true);
      expect(result.submitCalled).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

         test('should handle empty configuration gracefully', async ({ page }) => {
       await page.evaluate(() => {
         new window.Validation('section[data-value="basic"] form', { fields: {} });
       });

       const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
       await submitButton.click();

       // Should work with default configuration
       // Since no fields are configured, form should submit successfully
       // We can't verify actual submission, but no errors should be shown
       await expect(page.locator('.error')).not.toBeVisible();
     });
  });
});

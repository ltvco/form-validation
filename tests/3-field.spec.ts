/*
Field Options Testing
- Check if each of the field options can be correctly applied and each one works as expected
*/

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index'

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
  }
}

test.describe('Form Validation Field Options Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
    await page.waitForFunction(() => window.Validation);
  });

  test.describe('rules Option', () => {
    test('should apply single rule to field', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('This field is required');
    });

    test('should apply multiple rules to field', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            email: { rules: ['required', 'validEmail'] },
          },
        });
      });

      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test required rule
      await submitButton.click();
      await expect(page.locator('.email-error-element')).toBeVisible();
      await expect(page.locator('.email-error-element')).toHaveText('This field is required');

      // Test validEmail rule
      await emailInput.pressSequentially('invalid-email');
      await submitButton.click();
      await expect(page.locator('.email-error-element')).toBeVisible();
      await expect(page.locator('.email-error-element')).toHaveText('Please enter a valid email address in the format of example@test.com');
    });

    test('should apply rules with parameters', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required', 'minCharacterAmount(3)'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      await nameInput.pressSequentially('ab');
      await submitButton.click();
      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('Please enter a minimum of 3 characters');
    });

    test('should handle empty rules array', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: [] },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should not show any errors since no rules are applied
      await expect(page.locator('.name-error-element')).not.toBeVisible();
    });
  });

  test.describe('messages Option', () => {
    test('should use custom string messages', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              messages: {
                required: 'Please enter your name'
              }
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('Please enter your name');
    });

    test('should use custom function messages', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['minCharacterAmount(5)'],
              messages: {
                'minCharacterAmount(5)': (field, ...args) => `Field "${field.name}" must have at least ${args[0]} characters`
              }
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      await nameInput.pressSequentially('abc');
      await submitButton.click();

      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('Field "name" must have at least 5 characters');
    });

    test('should fall back to default message when custom message not provided', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              messages: {
                // No custom message for required rule
              }
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('This field is required');
    });

    test('should handle HTML in custom messages', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              messages: {
                required: 'Please enter your <strong>name</strong>'
              }
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element strong')).toHaveText('name');
    });
  });

  test.describe('optional Option', () => {
    test('should not validate optional field when empty', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['validEmail'],
              optional: true
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should not show error for empty optional field
      await expect(page.locator('.name-error-element')).not.toBeVisible();
    });

    test('should validate optional field when it has value', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            email: { 
              rules: ['validEmail'],
              optional: true
            },
          },
        });
      });

      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      await emailInput.pressSequentially('invalid-email');
      await submitButton.click();

      // Should show error for invalid value in optional field
      await expect(page.locator('.email-error-element')).toBeVisible();
      await expect(page.locator('.email-error-element')).toHaveText('Please enter a valid email address in the format of example@test.com');
    });

    test('should override optional when required rule is present', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              optional: true
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should show error because required rule overrides optional
      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('This field is required');
    });

    test('should add required rule when optional is false and required not present', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['lettersOnly'],
              optional: false
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should show required error because optional: false adds required rule
      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('This field is required');
    });

    test('should default to required when optional not specified and required rule present', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required']
              // optional not specified
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.name-error-element')).toHaveText('This field is required');
    });

    test('should default to optional when optional not specified and required rule not present', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['lettersOnly']
              // optional not specified, required not present
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should not show error because field defaults to optional
      await expect(page.locator('.name-error-element')).not.toBeVisible();
    });
  });

  test.describe('inputContainer Option', () => {
    test('should use custom input container with CSS selector', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              inputContainer: '.input-container'
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Check that error class is added to the input container
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/error/);
    });

    test('should use HTMLElement as input container', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              // @ts-expect-error - container is not typed
              inputContainer: document.querySelector('section[data-value="basic"] .input-container:has(input[name="name"])'),
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/error/);
    });
  });

  test.describe('errorPlacement Option', () => {
    test('should use custom error placement function', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              errorPlacement: (input, errorElement) => {
                // Place error before the input instead of after
                input.parentElement!.insertBefore(errorElement, input);
              }
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Check that error element is placed before the input
      const errorElement = page.locator('.name-error-element');
      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      await expect(errorElement).toBeVisible();
      
             // Verify the error element comes before the input in DOM order
       const errorPosition = await errorElement.evaluate(el => Array.from(el.parentNode!.children).indexOf(el));
       const inputPosition = await nameInput.evaluate(el => Array.from(el.parentNode!.children).indexOf(el));
      
      expect(errorPosition).toBeLessThan(inputPosition);
    });

    test('should provide correct parameters to errorPlacement function', async ({ page }) => {
      const result = page.evaluate(() => {
        return new Promise((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                errorPlacement: (input, errorElement, inputContainer, form) => {
                  resolve({
                    inputName: input.name,
                    errorElementTag: errorElement.tagName,
                    inputContainerTag: inputContainer?.tagName,
                    formTag: form?.tagName
                  });
                }
              },
            },
          });
        });
      });

      // Wait for the Validation to be initialized
      await page.waitForTimeout(1000);

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      expect(await result).toEqual({
        inputName: 'name',
        errorElementTag: 'P',
        inputContainerTag: 'DIV',
        formTag: 'FORM'
      });
    });
  });

  test.describe('errorClass Option', () => {
    test('should use custom error class', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              errorClass: 'custom-error'
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Check that custom error class is added to container
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/custom-error/);
      
      // Should still have the default error class on the input itself
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/error/);
    });

    test('should use default error class when not specified', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required']
              // errorClass not specified
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should use default 'error' class
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/error/);
    });
  });

  test.describe('errorTag Option', () => {
    test('should use custom error tag', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              errorTag: 'span'
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Check that error element is a span
      await expect(page.locator('span.name-error-element')).toBeVisible();
      await expect(page.locator('span.name-error-element')).toHaveText('This field is required');
    });

    test('should use default error tag when not specified', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required']
              // errorTag not specified
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should use default 'p' tag
      await expect(page.locator('p.name-error-element')).toBeVisible();
    });
  });

  test.describe('validClass Option', () => {
    test('should use custom valid class', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              validClass: 'custom-valid'
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      await nameInput.pressSequentially('John Doe');
      await nameInput.blur();

      // Check that custom valid class is added to container
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/custom-valid/);
      
      // Should still have the default valid class on the input itself
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/valid/);
    });

    test('should use default valid class when not specified', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required']
              // validClass not specified
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      await nameInput.pressSequentially('John Doe');
      await nameInput.blur();

      // Should use default 'valid' class
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/valid/);
    });

    test('should not add valid class to optional empty field', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['lettersOnly'],
              optional: true,
              validClass: 'custom-valid'
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      
      await submitButton.click();

      // Should not add valid class to optional empty field
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).not.toHaveClass(/custom-valid/);
    });
  });

  test.describe('normalizer Option', () => {
    test('should normalize input value on keyup for text inputs', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              normalizer: (value) => value.toUpperCase()
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      await nameInput.pressSequentially('john doe');
      
      // Check that value was normalized to uppercase
      await expect(nameInput).toHaveValue('JOHN DOE');
    });

    test('should normalize input value on change for non-text inputs', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            email: { 
              rules: ['required'],
              normalizer: (value) => value.toLowerCase()
            },
          },
        });
      });

      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');
      
      await emailInput.pressSequentially('JOHN@EXAMPLE.COM');
      await emailInput.blur();
      
      // Check that value was normalized to lowercase
      await expect(emailInput).toHaveValue('john@example.com');
    });

    test('should provide correct parameters to normalizer function', async ({ page }) => {
      const result = page.evaluate(() => {
        return new Promise((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                normalizer: (value, element, form) => {
                  resolve({
                    value: value,
                    elementName: element?.name,
                    formTag: form?.tagName
                  });
                  return value.toUpperCase();
                }
              },
            },
          });
        });
      });

      // Wait for the Validation to be initialized
      await page.waitForTimeout(1000);

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');

      // Fill the input with 'tes' and then press 't' to trigger the change event
      await nameInput.fill('tes');
      await nameInput.pressSequentially('t');
      
      console.log('result', await result);
      expect(await result).toEqual({
        value: 'test',
        elementName: 'name',
        formTag: 'FORM'
      });
    });

    test('should only change value when normalized value is different', async ({ page }) => {
      let changeCount = 0;
      
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              normalizer: (value) => {
                // Return same value to test that it doesn't change unnecessarily
                return value;
              }
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      // Monitor value changes
      await nameInput.evaluate(el => {
        el.addEventListener('input', () => {
          (window as any).changeCount = ((window as any).changeCount || 0) + 1;
        });
      });
      
      await nameInput.pressSequentially('test');
      
      // Value should remain the same
      await expect(nameInput).toHaveValue('test');
    });
  });

  test.describe('fieldErrorHandler Option', () => {
    test('should call custom error handler when field is invalid', async ({ page }) => {
      const result = page.evaluate(() => {
        return new Promise((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                fieldErrorHandler: (field, message, fieldConfig, form) => {
                  resolve({
                    fieldName: field.name,
                    message: message,
                    formTag: form?.tagName
                  });
                }
              },
            },
          });
        });
      });

      // Wait for the Validation to be initialized
      await page.waitForTimeout(1000);

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      expect(await result).toEqual({
        fieldName: 'name',
        message: 'This field is required',
        formTag: 'FORM'
      });
    });

    test('should replace default functionality when fieldHandlerKeepFunctionality is false', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              fieldHandlerKeepFunctionality: false,
              fieldErrorHandler: (field, message, fieldConfig, form) => {
                // Custom handler that adds a custom class instead of default error handling
                field.classList.add('custom-error-field');
              }
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should use custom error handling
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/custom-error-field/);
      
      // Should not show default error element
      await expect(page.locator('.name-error-element')).not.toBeVisible();
    });

    test('should keep default functionality when fieldHandlerKeepFunctionality is true', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              fieldHandlerKeepFunctionality: true,
              fieldErrorHandler: (field, message, fieldConfig, form) => {
                // Custom handler that adds additional functionality
                field.classList.add('custom-error-field');
              }
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should have both custom and default error handling
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/custom-error-field/);
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/error/);
      
      // Should show default error element
      await expect(page.locator('.name-error-element')).toBeVisible();
    });
  });

  test.describe('fieldValidHandler Option', () => {
    test('should call custom valid handler when field is valid', async ({ page }) => {
      const result = page.evaluate(() => {
        return new Promise((resolve) => {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                fieldValidHandler: (field, fieldConfig, form) => {
                  resolve({
                    fieldName: field.name,
                    formTag: form?.tagName
                  });
                }
              },
            },
          });
        });
      });

      // Wait for the Validation to be initialized
      await page.waitForTimeout(1000);

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      await nameInput.pressSequentially('John Doe');
      await nameInput.blur();

      expect(await result).toEqual({
        fieldName: 'name',
        formTag: 'FORM'
      });
    });

    test('should replace default functionality when fieldHandlerKeepFunctionality is false', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              fieldHandlerKeepFunctionality: false,
              fieldValidHandler: (field, fieldConfig, form) => {
                // Custom handler that adds a custom class instead of default valid handling
                field.classList.add('custom-valid-field');
              }
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      await nameInput.pressSequentially('John Doe');
      await nameInput.blur();

      // Should use custom valid handling
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/custom-valid-field/);
      
      // Should not have default valid class
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).not.toHaveClass(/valid/);
    });

    test('should keep default functionality when fieldHandlerKeepFunctionality is true', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              fieldHandlerKeepFunctionality: true,
              fieldValidHandler: (field, fieldConfig, form) => {
                // Custom handler that adds additional functionality
                field.classList.add('custom-valid-field');
              }
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      
      await nameInput.pressSequentially('John Doe');
      await nameInput.blur();

      // Should have both custom and default valid handling
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/custom-valid-field/);
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/valid/);
    });
  });

  test.describe('fieldHandlerKeepFunctionality Option', () => {
    test('should default to false when not specified', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              fieldErrorHandler: (field, message, fieldConfig, form) => {
                field.classList.add('custom-error-only');
              }
              // fieldHandlerKeepFunctionality not specified
            },
          },
        });
      });

      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');
      await submitButton.click();

      // Should use only custom error handling (default behavior)
      await expect(page.locator('section[data-value="basic"] input[name="name"]')).toHaveClass(/custom-error-only/);
      await expect(page.locator('.name-error-element')).not.toBeVisible();
    });

    test('should work correctly with both error and valid handlers', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required'],
              fieldHandlerKeepFunctionality: true,
              fieldErrorHandler: (field, message, fieldConfig, form) => {
                field.dataset.customError = 'true';
              },
              fieldValidHandler: (field, fieldConfig, form) => {
                field.dataset.customValid = 'true';
              }
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test error handler
      await submitButton.click();
      await expect(nameInput).toHaveAttribute('data-custom-error', 'true');
      await expect(page.locator('.name-error-element')).toBeVisible();

      // Test valid handler
      await nameInput.pressSequentially('John Doe');
      await nameInput.blur();
      await expect(nameInput).toHaveAttribute('data-custom-valid', 'true');
      await expect(nameInput).toHaveClass(/valid/);
    });
  });

  test.describe('Integration Tests', () => {
    test('should work with multiple field options together', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required', 'minCharacterAmount(2)'],
              messages: {
                required: 'Name is required',
                minCharacterAmount: 'Name must be at least 2 characters'
              },
              optional: false,
              errorClass: 'custom-error',
              validClass: 'custom-valid',
              errorTag: 'span',
              normalizer: (value) => value.trim(),
              fieldHandlerKeepFunctionality: true,
              fieldErrorHandler: (field) => {
                field.dataset.hasError = 'true';
              },
              fieldValidHandler: (field) => {
                field.dataset.isValid = 'true';
              }
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test error state
      await submitButton.click();
      await expect(page.locator('span.name-error-element')).toBeVisible();
      await expect(page.locator('span.name-error-element')).toHaveText('Name is required');
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/custom-error/);
      await expect(nameInput).toHaveAttribute('data-has-error', 'true');

      // Test valid state
      await nameInput.pressSequentially('  John  ');
      await nameInput.blur();
      
      // Should be normalized
      await expect(nameInput).toHaveValue('John');
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="name"])')).toHaveClass(/custom-valid/);
      await expect(nameInput).toHaveAttribute('data-is-valid', 'true');
    });

    test('should handle field options with complex form interactions', async ({ page }) => {
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          validationFlags: ['onChange', 'onKeyUp'],
          fields: {
            name: { 
              rules: ['required'],
              normalizer: (value) => value.replace(/\s+/g, ' '),
            },
            email: { 
              rules: ['required', 'validEmail'],
              messages: {
                required: 'Email is required',
                validEmail: 'Please enter a valid email'
              },
              errorClass: 'email-error',
              validClass: 'email-valid'
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');

      // Test normalizer with multiple spaces
      await nameInput.pressSequentially('John    Doe');
      await expect(nameInput).toHaveValue('John Doe');

      // Test email validation
      await emailInput.pressSequentially('invalid');

      await expect(page.locator('.email-error-element')).toBeVisible();
      await expect(page.locator('.email-error-element')).toHaveText('Please enter a valid email');
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="email"])')).toHaveClass(/email-error/);

      // Fix email
      await emailInput.clear();
      await emailInput.pressSequentially('john@example.com');
      await emailInput.blur();
      await expect(page.locator('section[data-value="basic"] .input-container:has(input[name="email"])')).toHaveClass(/email-valid/);
    });
  });
});

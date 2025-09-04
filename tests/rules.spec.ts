/*
Rules Testing
- Check if each of the default rules can be correctly applied and each one works as expected
*/

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index'

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
  }
}

test.describe('Form Validation Rules Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
    await page.waitForFunction(() => window.Validation);
  });

  test.describe('Required Rule', () => {
    test('should fail validation when text input is empty', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Leave field empty and submit
      await submitButton.click();

      // Should show error
      await expect(page.locator('.name-error-element')).toBeVisible();
    });

    test('should pass validation when text input has value', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['required'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Fill field and submit
      await nameInput.pressSequentially('John Doe');
      await submitButton.click();

      // Should not show error
      await expect(page.locator('.name-error-element')).not.toBeVisible();
    });

    test('should fail validation when checkbox is unchecked', async ({ page }) => {
      // Initialize validation for checkbox
      await page.evaluate(() => {
        new window.Validation('section[data-value="on-change"] form', {
          fields: {
            tos: { rules: ['required'] },
          },
        });
      });

      const submitButton = page.locator('section[data-value="on-change"] button[type="submit"]');

      // Submit without checking checkbox
      await submitButton.click();

      // Should show error
      await expect(page.locator('.tos-error-element')).toBeVisible();
    });

    test('should pass validation when checkbox is checked', async ({ page }) => {
      // Initialize validation for checkbox
      await page.evaluate(() => {
        new window.Validation('section[data-value="on-change"] form', {
          fields: {
            tos: { rules: ['required'] },
          },
        });
      });

      const tosCheckbox = page.locator('section[data-value="on-change"] input[name="tos"]');
      const submitButton = page.locator('section[data-value="on-change"] button[type="submit"]');

      // Check checkbox and submit
      await tosCheckbox.check();
      await submitButton.click();

      // Should not show error
      await expect(page.locator('.tos-error-element')).not.toBeVisible();
    });
  });

  test.describe('ValidEmail Rule', () => {
    test('should fail validation with invalid email formats', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            email: { rules: ['validEmail'] },
          },
        });
      });

      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various invalid email formats
      const invalidEmails = [
        'user*@example.com',
        'user@example.COM',
        'user @example.com',
        'user@example',
        'user@example.c',
        '@example.com',
        'user@',
        'user@@example.com',
        'user@exam_ple.com',
        'user@example.com.',
      ];

      for (const email of invalidEmails) {
        await emailInput.clear();
        await emailInput.pressSequentially(email);
        await submitButton.click();

        // Should show error for invalid email
        await expect(page.locator('.email-error-element')).toBeVisible();
      }
    });

    test('should pass validation with valid email formats', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            email: { rules: ['validEmail'] },
          },
        });
      });

      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various valid email formats
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user123@example.com',
        'user@example-domain.com',
        'user@subdomain.example.com',
        'a@b.co',
        'test@domain.info',
      ];

      for (const email of validEmails) {
        await emailInput.clear();
        await emailInput.pressSequentially(email);
        await submitButton.click();

        // Should not show error for valid email
        await expect(page.locator('.email-error-element')).not.toBeVisible();
      }
    });

    test('should fail validation with email longer than 80 characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            email: { rules: ['validEmail'] },
          },
        });
      });

      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Create email longer than 80 characters
      const longEmail = 'a'.repeat(70) + '@domain.com'; // 81 characters
      await emailInput.pressSequentially(longEmail);
      await submitButton.click();

      // Should show error for long email
      await expect(page.locator('.email-error-element')).toBeVisible();
    });
  });

  test.describe('NotEmail Rule', () => {
    test('should fail validation with email-like formats', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['notEmail'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various email-like formats
      const emailLikeInputs = [
        'user@domain.com',
        'test@example.org',
        'someone@site.net',
      ];

      for (const input of emailLikeInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for email-like input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation with non-email formats', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['notEmail'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various non-email formats
      const nonEmailInputs = [
        'John Doe',
        'username',
        'some text',
        '12345',
        'user.name',
        'user-name',
        'user_name',
      ];

      for (const input of nonEmailInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should not show error for non-email input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('NoSpecialCharacters Rule', () => {
    test('should fail validation with special characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['noSpecialCharacters'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various special characters
      const specialCharInputs = [
        'text$',
        'text%',
        'text&',
        'text(',
        'text)',
        'text*',
        'text!',
        'text?',
        'text{',
        'text}',
        'text[',
        'text]',
        'text|',
        'text/',
        'text:',
        'text?',
        'text=',
        'text;',
        'text<',
        'text>',
        'text=',
        'text+',
        'text-',
        'text_',
        'text^',
        'text`',
        'text~',
        'text"',
        "text'",
      ];

      for (const input of specialCharInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for special characters
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation without special characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['noSpecialCharacters'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various valid inputs
      const validInputs = [
        'John',
        'John Doe',
        'JohnDoe',
        'John123',
        'JOHN',
        'john',
        '123456',
        'John Doe 123',
        'John #3',
      ];

      for (const input of validInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('EmptyOrLetters Rule', () => {
    test('should fail validation with non-letter characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['emptyOrLetters'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various invalid inputs
      const invalidInputs = [
        '123',
        '!@#',
      ];

      for (const input of invalidInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for non-letter input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation with letters or empty', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['emptyOrLetters'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various valid inputs
      const validInputs = [
        '',
        'John',
        'JOHN',
        'john',
        'John Doe',
        'JohnDoe',
        'a',
        'Z',
      ];

      for (const input of validInputs) {
        await nameInput.clear();
        if (input !== '') {
          await nameInput.pressSequentially(input);
        }
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('OnlyAlphanumeric Rule', () => {
    test('should fail validation with non-alphanumeric characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['onlyAlphanumeric'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various invalid inputs
      const invalidInputs = [
        'John Doe',
        'John!',
        'John@',
        'John#',
        'John$',
        'John%',
        'John-',
        'John_',
        'John.',
        'John,',
        'John;',
        'John:',
      ];

      for (const input of invalidInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for non-alphanumeric input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation with alphanumeric characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['onlyAlphanumeric'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various valid inputs
      const validInputs = [
        '',
        'John',
        'JOHN',
        'john',
        '123',
        'John123',
        'ABC123',
        'a1b2c3',
        'Test123',
      ];

      for (const input of validInputs) {
        await nameInput.clear();
        if (input !== '') {
          await nameInput.pressSequentially(input);
        }
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('PhoneUS Rule', () => {
    test('should fail validation with invalid phone formats', async ({ page }) => {
      // Initialize validation for custom form
      await page.evaluate(() => {
        new window.Validation('section[data-value="custom"] form', {
          fields: {
            phone: { rules: ['phoneUS'] },
          },
        });
      });

      const phoneInput = page.locator('section[data-value="custom"] input[name="phone"]');
      const submitButton = page.locator('section[data-value="custom"] button[type="submit"]');

      // Test various invalid phone formats
      const invalidPhones = [
        '123',
        '1234567890',
        '123-456-789',
        '123-456-78901',
        '123-456-abcd',
        '000-000-0000',
        '111-111-1111',
        '123-000-0000',
        '123-456-0000',
        '1234567',
        'abc-def-ghij',
        '123 456 7890',
        '123.456.7890',
        '+1-123-456-7890',
      ];

      for (const phone of invalidPhones) {
        await phoneInput.clear();
        await phoneInput.pressSequentially(phone);
        await submitButton.click();

        // Should show error for invalid phone
        await expect(page.locator('.phone-error-element')).toBeVisible();
      }
    });

    test('should pass validation with valid US phone formats', async ({ page }) => {
      // Initialize validation for custom form
      await page.evaluate(() => {
        new window.Validation('section[data-value="custom"] form', {
          fields: {
            phone: { rules: ['phoneUS'] },
          },
        });
      });

      const phoneInput = page.locator('section[data-value="custom"] input[name="phone"]');
      const submitButton = page.locator('section[data-value="custom"] button[type="submit"]');

      // Test various valid phone formats
      const validPhones = [
        '2025551234',
        '202-555-1234',
        '(202)555-1234',
        '(202)-555-1234',
        '+12025551234',
        '12025551234',
        '3025551234',
      ];

      for (const phone of validPhones) {
        await phoneInput.clear();
        await phoneInput.pressSequentially(phone);
        await submitButton.click();

        // Should not show error for valid phone
        await expect(page.locator('.phone-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('NumbersOnly Rule', () => {
    test('should fail validation with non-numeric characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['numbersOnly'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various invalid inputs
      const invalidInputs = [
        'abc',
        '123abc',
        'abc123',
        '12.34',
        '12,34',
        '12-34',
        '12+34',
        '12 34',
        '12a34',
        '!@#',
      ];

      for (const input of invalidInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for non-numeric input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation with numeric characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['numbersOnly'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various valid inputs
      const validInputs = [
        '',
        '0',
        '123',
        '0123',
        '999999',
        '1234567890',
      ];

      for (const input of validInputs) {
        await nameInput.clear();
        if (input !== '') {
          await nameInput.pressSequentially(input);
        }
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('LettersOnly Rule', () => {
    test('should fail validation with non-letter characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['lettersOnly'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various invalid inputs
      const invalidInputs = [
        '123',
        'John123',
        'John!',
        'John@',
        'John#',
        'John Doe',
        'John-Doe',
        'John_Doe',
        'John.Doe',
        'John,Doe',
        'John;Doe',
        'John:Doe',
      ];

      for (const input of invalidInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for non-letter input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation with letter characters', async ({ page }) => {
      // Initialize validation for basic form
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { rules: ['lettersOnly'] },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test various valid inputs
      const validInputs = [
        '',
        'John',
        'JOHN',
        'john',
        'JohnDoe',
        'JOHNDOE',
        'johndoe',
        'a',
        'Z',
        'ABC',
        'xyz',
      ];

      for (const input of validInputs) {
        await nameInput.clear();
        if (input !== '') {
          await nameInput.pressSequentially(input);
        }
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('CharacterAmount Rule', () => {
    test('should fail validation when length is outside range', async ({ page }) => {
      // Initialize validation with character amount rule
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['characterAmount(3,10)']
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test inputs that are too short
      const tooShortInputs = ['a', 'ab'];
      for (const input of tooShortInputs) {
        await nameInput.clear();
        if (input !== '') {
          await nameInput.pressSequentially(input);
        }
        await submitButton.click();

        // Should show error for too short input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }

      // Test inputs that are too long
      const tooLongInputs = ['this is way too long', 'a'.repeat(15)];
      for (const input of tooLongInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for too long input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation when length is within range', async ({ page }) => {
      // Initialize validation with character amount rule
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['characterAmount(3,10)']
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test inputs within range
      const validInputs = ['abc', 'John', 'John Doe', 'abcdefghij'];
      for (const input of validInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('MaxCharacterAmount Rule', () => {
    test('should fail validation when length exceeds maximum', async ({ page }) => {
      // Initialize validation with max character amount rule
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['maxCharacterAmount(5)']
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test inputs that are too long
      const tooLongInputs = ['toolong', 'this is way too long', 'abcdef'];
      for (const input of tooLongInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should show error for too long input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation when length is within maximum', async ({ page }) => {
      // Initialize validation with max character amount rule
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['maxCharacterAmount(5)']
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test inputs within range
      const validInputs = ['', 'a', 'ab', 'abc', 'abcd', 'abcde'];
      for (const input of validInputs) {
        await nameInput.clear();
        if (input !== '') {
          await nameInput.pressSequentially(input);
        }
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('MinCharacterAmount Rule', () => {
    test('should fail validation when length is below minimum', async ({ page }) => {
      // Initialize validation with min character amount rule
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['minCharacterAmount(3)']
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test inputs that are too short
      const tooShortInputs = ['a', 'ab'];
      for (const input of tooShortInputs) {
        await nameInput.clear();
        if (input !== '') {
          await nameInput.pressSequentially(input);
        }
        await submitButton.click();

        // Should show error for too short input
        await expect(page.locator('.name-error-element')).toBeVisible();
      }
    });

    test('should pass validation when length meets minimum', async ({ page }) => {
      // Initialize validation with min character amount rule
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['minCharacterAmount(3)']
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test inputs that meet minimum
      const validInputs = ['abc', 'John', 'John Doe', 'this is a long text'];
      for (const input of validInputs) {
        await nameInput.clear();
        await nameInput.pressSequentially(input);
        await submitButton.click();

        // Should not show error for valid input
        await expect(page.locator('.name-error-element')).not.toBeVisible();
      }
    });
  });

  test.describe('Multiple Rules Integration', () => {
    test('should validate with multiple rules', async ({ page }) => {
      // Initialize validation with multiple rules
      await page.evaluate(() => {
        new window.Validation('section[data-value="basic"] form', {
          fields: {
            name: { 
              rules: ['required', 'lettersOnly', 'minCharacterAmount(2)']
            },
            email: {
              rules: ['required', 'validEmail']
            },
          },
        });
      });

      const nameInput = page.locator('section[data-value="basic"] input[name="name"]');
      const emailInput = page.locator('section[data-value="basic"] input[name="email"]');
      const submitButton = page.locator('section[data-value="basic"] button[type="submit"]');

      // Test with invalid name (numbers)
      await nameInput.pressSequentially('John123');
      await emailInput.pressSequentially('test@example.com');
      await submitButton.click();

      // Should show error for name with numbers
      await expect(page.locator('.name-error-element')).toBeVisible();
      await expect(page.locator('.email-error-element')).not.toBeVisible();

      // Test with valid inputs
      await nameInput.clear();
      await nameInput.pressSequentially('John');
      await submitButton.click();

      // Should not show any errors
      await expect(page.locator('.name-error-element')).not.toBeVisible();
      await expect(page.locator('.email-error-element')).not.toBeVisible();
    });
  });
});

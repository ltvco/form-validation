/*
Basic configuration testing
- Check if Validation can be initialized and correctly configured
- No in-depth testing of Validation functionality
*/

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index'

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
  }
}

test.describe('Form Validation Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
    await page.waitForFunction(() => window.Validation);
  });

  // Validation class should be available and be able to be initialized
  test('Validation can be initialized', async ({ page }) => {
    const validationExists = await page.evaluate(() => {
      return typeof window.Validation === 'function';
    });
    expect(validationExists).toBe(true);

    const validationInstance = await page.evaluate(() => {
      const validation = new window.Validation('section[data-value="basic"] form');
      return validation !== null && typeof validation === 'object';
    });
    expect(validationInstance).toBe(true);
  });

  // Basic functionality of the Validation class with a simple form
  test('Validation basic functionality', async ({ page }) => {
    const validationExists = await page.evaluate(() => {
      return typeof window.Validation === 'function';
    });
    expect(validationExists).toBe(true);

    const validationInstance = await page.evaluate(() => {
      const validation = new window.Validation('section[data-value="basic"] form', {
        submitCallback: (_, form) => {
          form?.classList.add('submitted');
        },
        fields: {
          name: {
            rules: ['required'],
          },
          email: {
            rules: ['required', 'validEmail'],
            messages: {
              required: 'Email is required',
              validEmail: 'Please enter a valid email address',
            },
          },
          password: {
            rules: [],
            optional: true,
          },
        },
      });
      return validation;
    });
    expect(validationInstance).not.toBeNull();

    const submitButton = await page.locator('section[data-value="basic"] button[type="submit"]');
    await submitButton?.click();

    expect(await page.isVisible('.name-error-element')).toBe(true);
    expect(await page.isVisible('.email-error-element')).toBe(true);
    expect(await page.locator('.password-error-element').count()).toBe(0);

    const nameInput = await page.locator('section[data-value="basic"] input[name="name"]');
    const emailInput = await page.locator('section[data-value="basic"] input[name="email"]');

    // Use type() instead of fill() to trigger validation events
    await nameInput?.pressSequentially('John Doe');
    await emailInput?.pressSequentially('john.doe@some.com');

    await submitButton?.click();

    expect(await page.isVisible('.name-error-element')).toBe(false);
    expect(await page.isVisible('.email-error-element')).toBe(false);
    expect(await page.locator('.password-error-element').count()).toBe(0);
    expect(await page.isVisible('section[data-value="basic"] form.submitted')).toBe(true);
  });
});

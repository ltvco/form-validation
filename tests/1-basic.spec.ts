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
    await page.goto('http://127.0.0.1:3000/tests');
  });

  // Validation class should be available and be able to be initialized
  test('Validation can be initialized', async ({ page }) => {
    const validationExists = await page.evaluate(() => {
      return typeof window.Validation === 'function';
    });
    expect(validationExists).toBe(true);

    const validationInstance = await page.evaluate(() => {
      const validation = new window.Validation('#testForm');
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
      const validation = new window.Validation('#testForm', {
        submitCallback: (formDataObj, form) => {
          form?.classList.add('submitted');
          console.log(formDataObj);
        },
        fields: {
          name: {
            rules: ['required'],
          },
          email: {
            rules: ['required', 'validEmail'],
          },
        },
      });
      return validation !== null && typeof validation === 'object';
    });
    expect(validationInstance).toBe(true);

    const submitButton = await page.$('button[type="submit"]');
    await submitButton?.click();
    expect(await page.isVisible('.error')).toBe(true);

    const nameInput = await page.$('#name');
    const emailInput = await page.$('#email');
    const ageInput = await page.$('#age');

    await nameInput?.fill('John Doe');
    await emailInput?.fill('jhon.doe@some.com');
    await ageInput?.fill('26');

    expect(await page.isVisible('.error')).toBe(false);
    expect(await page.isVisible('.valid')).toBe(true);

    await submitButton?.click();
    expect(await page.isVisible('.submitted')).toBe(true);
  });
});

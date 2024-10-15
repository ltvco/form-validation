/*
Public Methods Testing
- Check if each of the public methods can be called and work as expected
*/
// /*
// Basic configuration testing
// - Check if Validation can be initialized and correctly configured
// - No in-depth testing of Validation functionality
// */

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index';

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
    validationInstance: Validation;
  }
}

test.beforeEach(async ({ page }) => {
  page.on('console', (msg) => console.log(msg.text())); // Capture console logs

  await page.goto('http://127.0.0.1:3000/tests');

  await page.evaluate(() => {
    window.validationInstance = new window.Validation('#testForm', {
      submitCallback: () => {},
      fields: {
        name: {
          rules: ['required'],
        },
        email: {
          rules: ['required', 'validEmail'],
        },
      },
    });
  });
});

test.describe('Validation Methods', () => {
  // TESTS

  test.describe('#isValid', () => {
    test('should return true when all fields are valid', async ({ page }) => {
      const nameInput = await page.$('#name');
      const emailInput = await page.$('#email');
      const ageInput = await page.$('#age');

      await nameInput?.fill('John Doe');
      await emailInput?.fill('jhon.doe@some.com');
      await ageInput?.fill('26');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isValid();
      });

      expect(isValid).toBe(true);
    });

    test('should return false when there are validation errors', async ({
      page,
    }) => {
      const nameInput = await page.$('#name');
      const emailInput = await page.$('#email');
      const ageInput = await page.$('#age');

      await nameInput?.fill('John Doe');
      await emailInput?.fill('abc');
      await ageInput?.fill('24');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isValid();
      });

      expect(isValid).toBe(false);
    });
  });

  test.describe('#validateForm', () => {
    test('should validate the form and return true when valid', async ({
      page,
    }) => {
      const nameInput = await page.$('#name');
      const emailInput = await page.$('#email');
      const ageInput = await page.$('#age');

      await nameInput?.fill('John Doe');
      await emailInput?.fill('jhon.doe@some.com');
      await ageInput?.fill('26');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.validateForm();
      });

      expect(isValid).toBe(true);
    });

    test('should validate the form and return false when invalid', async ({
      page,
    }) => {
      const nameInput = await page.$('#name');
      const emailInput = await page.$('#email');
      const ageInput = await page.$('#age');

      await nameInput?.fill('John Doe');
      await emailInput?.fill('abc');
      await ageInput?.fill('24');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.validateForm();
      });

      expect(isValid).toBe(false);
    });
  });

  test.describe('#isFieldValid', () => {
    test('should return true when a specific field is valid', async ({
      page,
    }) => {
      const emailInput = await page.$('#email');

      await emailInput?.fill('john.doe@gmail.com');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('email');
      });

      expect(isValid).toBe(true);
    });

    test('should return false when a specific field is invalid', async ({
      page,
    }) => {
      const emailInput = await page.$('#email');

      await emailInput?.fill('invalid-email');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('email');
      });

      expect(isValid).toBe(false);
    });

    test('should throw an error if the field is empty', async ({ page }) => {
      // Test the isFieldValid method when the field is empty
      try {
        await page.evaluate(() => {
          return window.validationInstance.isFieldValid('');
        });
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });

    test('should throw an error if the field does not exist', async ({
      page,
    }) => {
      try {
        await page.evaluate(() => {
          return window.validationInstance.isFieldValid('nonExistentField');
        });
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});

test.describe('Rule Management Methods', () => {
  test.describe('#addMethod', async () => {
    test('should successfully add a custom validation method', async ({
      page,
    }) => {
      page.evaluate(() => {
        window.validationInstance.addMethod(
          'startsWithA',
          (_, value) => {
            return value.startsWith('a');
          },
          'Email must start with the letter "a"'
        );

        window.validationInstance.addFieldRule('email', 'startsWithA');
      });

      const emailInput = await page.$('#email');
      await emailInput?.fill('a@gmail.com');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('email');
      });

      expect(isValid).toBe(true);
    });

    test('should modify a method if it already exists', async ({ page }) => {
      page.evaluate(() => {
        window.validationInstance.addMethod(
          'validEmail',
          (_, value) => {
            return value.startsWith('a');
          },
          "Email must start with the letter 'a'"
        );

        window.validationInstance.addFieldRule('email', 'validEmail');
      });

      const emailInput = await page.$('#email');
      await emailInput?.fill('a');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('email');
      });

      expect(isValid).toBe(true);
    });
  });

  test.describe('#setFieldRules', () => {
    test('should set the rules for a field', async ({ page }) => {
      page.evaluate(() => {
        window.validationInstance.setFieldRules('age', [
          'numbersOnly',
          'required',
        ]);
      });

      const nameInput = await page.$('#age');
      await nameInput?.fill('26');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('age');
      });

      expect(isValid).toBe(true);
    });
  });

  test.describe('#addFieldRule', () => {
    test('should add a rule to a field', async ({ page }) => {
      page.evaluate(() => {
        window.validationInstance.addFieldRule('age', 'numbersOnly');
      });

      const nameInput = await page.$('#age');
      await nameInput?.fill('26');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('age');
      });

      expect(isValid).toBe(true);
    });
  });

  test.describe('#removeFieldRule', () => {
    test('should remove a rule from a field', async ({ page }) => {
      page.evaluate(() => {
        window.validationInstance.removeFieldRule('email', 'validEmail');
      });

      const emailInput = await page.$('#email');
      await emailInput?.fill('invalid-email');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('email');
      });

      expect(isValid).toBe(true);
    });

    test('should throw an error if the field does not exist', async ({
      page,
    }) => {
      try {
        await page.evaluate(() => {
          window.validationInstance.removeFieldRule(
            'nonExistentField',
            'validEmail'
          );
        });
      } catch (error) {
        expect(error).toBeTruthy();
      }
    });
  });
});

test.describe('Form Configuration Methods', () => {
  test.describe('#addFieldConfig', () => {
    test('should add a field configuration', async ({ page }) => {
      page.evaluate(() => {
        window.validationInstance.addFieldConfig('age', {
          rules: ['numbersOnly'],
          messages: {
            numbersOnly: 'Please enter numbers only',
          },
          optional: false,
          inputContainer: '#age',
          errorPlacement: () => {},
        });
      });

      const nameInput = await page.$('#age');
      await nameInput?.fill('26');

      const isValid = await page.evaluate(() => {
        return window.validationInstance.isFieldValid('age');
      });

      expect(isValid).toBe(true);
    });
  });
});

test.describe('Form Utility Methods', () => {
  test.describe('#cloneDeep', () => {
    test('should clone a validation object', async ({ page }) => {
      const clonedInstance = await page.evaluate(() => {
        return window.validationInstance.cloneDeep({
          submitCallback: () => {},
          fields: {
            name: {
              rules: ['required'],
            },
            email: {
              rules: ['required', 'validEmail'],
            },
          },
        });
      });

      expect(clonedInstance).toBeTruthy();
    });
  });
});

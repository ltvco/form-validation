/*
Error Handling Testing
- Check if the library can handle errors gracefully, throw the correct errors, and provide the correct error messages
*/

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index'

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
  }
}

test.describe('Form Validation Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
    await page.waitForFunction(() => window.Validation);
  });

  test.describe('Constructor Errors', () => {
    test('should throw error when no form is provided', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          // @ts-expect-error - Testing invalid constructor call
          new window.Validation();
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('A valid form element or selector is required.');
    });

    test('should throw error when form is not a string or HTML element', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          // @ts-expect-error - Testing invalid form parameter
          new window.Validation(123);
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Form must be a string or a HTML Element.');
    });

    test('should throw error when form selector is not found', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('.non-existent-form');
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Form selector ".non-existent-form" not found.');
    });

    test('should throw error when config is not an object', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          // @ts-expect-error - Testing invalid config parameter
          new window.Validation('section[data-value="basic"] form', 'invalid-config');
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Config must be an object.');
    });

    test('should throw error when rules is not an object', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          }, 'invalid-rules' as any);
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Rules must be an object.');
    });

    test('should throw error when custom rule validator is not a function', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          }, {
            customRule: {
              // @ts-expect-error - Testing invalid validator
              validator: 'not-a-function',
              message: 'Custom error'
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('customRule must be a function.');
    });

    test('should throw error when custom rule message is not a string or function', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required', 'customRule'] }
            }
          }, {
            customRule: {
              validator: (field) => field.value !== '',
              // @ts-expect-error - Testing invalid message
              message: 123
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('customRule message must be a string or a function.');
    });
  });

  test.describe('Field Configuration Errors', () => {
    test('should throw error when field is not found in form', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              nonExistentField: { rules: ['required'] }
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Field nonExistentField was not found in the form');
    });

    test('should throw error when rules is not an array', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                // @ts-expect-error - Testing invalid rules type
                rules: 'required' 
              }
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Rules must be an array');
    });

    test('should throw error when messages is not an object', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                // @ts-expect-error - Testing invalid messages type
                messages: 'invalid-messages'
              }
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Messages must be an object');
    });

    test('should throw error when input container selector is not found', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                inputContainer: '.non-existent-container'
              }
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Input container "null" not found.');
    });

    test('should throw error when normalizer is not a function', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                // @ts-expect-error - Testing invalid normalizer
                normalizer: 'not-a-function'
              }
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Normalizer must be a function.');
    });
  });

  test.describe('Public Method Errors', () => {
    test.describe('addMethod Errors', () => {
      test('should throw error when name is not provided', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            // @ts-expect-error - Testing invalid name type
            validation.addMethod();
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Name must be a string');
      });

      test('should throw error when name is not a string', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            // @ts-expect-error - Testing invalid name type
            validation.addMethod(123);
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Name must be a string');
      });

      test('should throw error when validator is not provided for new rule', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            validation.addMethod('newRule');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Validator cannot be empty');
      });

      test('should throw error when message is not provided for new rule', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            validation.addMethod('newRule', (field) => field.value !== '');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Message cannot be empty');
      });

      test('should throw error when validator is not a function', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            // @ts-expect-error - Testing invalid validator type
            validation.addMethod('newRule', 'not-a-function', 'Error message');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Validator must be a function');
      });

      test('should throw error when message is not a string or function', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            // @ts-expect-error - Testing invalid message type
            validation.addMethod('newRule', (field) => field.value !== '', 123);
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Message must be a string or a function that resolves to a string');
      });
    });

    test.describe('isFieldValid Errors', () => {
      test('should throw error when field is not provided', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            // @ts-expect-error - Testing invalid field type
            validation.isFieldValid();
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Field cannot be empty');
      });

      test('should throw error when field does not exist', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            validation.isFieldValid('nonExistentField');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Field "null" does not exist');
      });

      test('should throw error when field is not a string or HTML element', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            // @ts-expect-error - Testing invalid field type
            validation.isFieldValid(123);
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Field must be a string or an HTML element');
      });

      test('should throw error when field is not being validated', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            // Try to validate email field which is not configured
            validation.isFieldValid('email');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Field "email" is not being validated');
      });
    });

    test.describe('setFieldRules Errors', () => {
      test('should throw error when field does not exist', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            validation.setFieldRules('nonExistentField', ['required']);
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Field nonExistentField was not found in the form');
      });
    });

    test.describe('addFieldRule Errors', () => {
      test('should throw error when field does not exist', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            validation.addFieldRule('nonExistentField', 'required', 'Custom message');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Field nonExistentField does not exist');
      });

      test('should throw error when rule does not exist', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            validation.addFieldRule('name', 'nonExistentRule', 'Custom message');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Rule nonExistentRule does not exist');
      });
    });

    test.describe('removeFieldRule Errors', () => {
      test('should throw error when field does not exist', async ({ page }) => {
        const error = await page.evaluate(() => {
          try {
            const validation = new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { rules: ['required'] }
              }
            });
            validation.removeFieldRule('nonExistentField', 'required');
            return null;
          } catch (e) {
            return e.message;
          }
        });

        expect(error).toBe('Field nonExistentField does not exist');
      });
    });
  });

  test.describe('Runtime Validation Errors', () => {
    test('should throw error when fieldErrorHandler is not a function during validation', async ({ page }) => {
      const error = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Set up error handler to catch uncaught errors
          const originalErrorHandler = window.onerror;
          window.onerror = (message) => {
            window.onerror = originalErrorHandler;
            // Extract the actual error message from the browser's error format
            const errorMessage = typeof message === 'string' ? message : message.toString();
            const match = errorMessage.match(/Error: (.+)$/);
            resolve(match ? match[1] : errorMessage);
            return true;
          };

          try {
            new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { 
                  rules: ['required'],
                  // @ts-expect-error - Testing invalid fieldErrorHandler
                  fieldErrorHandler: 'not-a-function'
                }
              }
            });

            // Use setTimeout to let the validation setup complete
            setTimeout(() => {
              const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
              submitButton.click();
              
              // If no error was thrown, resolve with null after a delay
              setTimeout(() => {
                window.onerror = originalErrorHandler;
                resolve(null);
              }, 100);
            }, 10);
          } catch (e) {
            window.onerror = originalErrorHandler;
            resolve(e.message);
          }
        });
      });

      expect(error).toBe('"fieldErrorHandler" must be a function.');
    });

    test('should throw error when fieldValidHandler is not a function during validation', async ({ page }) => {
      const error = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Set up error handler to catch uncaught errors
          const originalErrorHandler = window.onerror;
          window.onerror = (message) => {
            window.onerror = originalErrorHandler;
            // Extract the actual error message from the browser's error format
            const errorMessage = typeof message === 'string' ? message : message.toString();
            const match = errorMessage.match(/Error: (.+)$/);
            resolve(match ? match[1] : errorMessage);
            return true;
          };

          try {
            new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { 
                  rules: ['required'],
                  // @ts-expect-error - Testing invalid fieldValidHandler
                  fieldValidHandler: 'not-a-function'
                }
              }
            });

            // Use setTimeout to let the validation setup complete
            setTimeout(() => {
              const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
              nameInput.value = 'Valid Name';
              nameInput.dispatchEvent(new Event('change'));
              
              // If no error was thrown, resolve with null after a delay
              setTimeout(() => {
                window.onerror = originalErrorHandler;
                resolve(null);
              }, 100);
            }, 10);
          } catch (e) {
            window.onerror = originalErrorHandler;
            resolve(e.message);
          }
        });
      });

      expect(error).toBe('"fieldValidHandler" must be a function.');
    });

    test('should throw error when errorPlacement is not a function during error creation', async ({ page }) => {
      const error = await page.evaluate(() => {
        return new Promise((resolve) => {
          // Set up error handler to catch uncaught errors
          const originalErrorHandler = window.onerror;
          window.onerror = (message) => {
            window.onerror = originalErrorHandler;
            // Extract the actual error message from the browser's error format
            const errorMessage = typeof message === 'string' ? message : message.toString();
            const match = errorMessage.match(/Error: (.+)$/);
            resolve(match ? match[1] : errorMessage);
            return true;
          };

          try {
            new window.Validation('section[data-value="basic"] form', {
              fields: {
                name: { 
                  rules: ['required'],
                  // @ts-expect-error - Testing invalid errorPlacement
                  errorPlacement: 'not-a-function'
                }
              }
            });

            // Use setTimeout to let the validation setup complete
            setTimeout(() => {
              const submitButton = document.querySelector('section[data-value="basic"] button[type="submit"]') as HTMLButtonElement;
              submitButton.click();
              
              // If no error was thrown, resolve with null after a delay
              setTimeout(() => {
                window.onerror = originalErrorHandler;
                resolve(null);
              }, 100);
            }, 10);
          } catch (e) {
            window.onerror = originalErrorHandler;
            resolve(e.message);
          }
        });
      });

      expect(error).toBe('Error placement must be a function.');
    });

    test('should throw error when custom message functions throw errors', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['required'],
                messages: {
                  required: () => {
                    throw new Error('Message function error');
                  }
                }
              }
            }
          });
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Message function error');
    });
  });

  test.describe('Edge Cases', () => {
    test('should handle empty field names gracefully', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          const validation = new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          });
          validation.addFieldRule('', 'required', 'Custom message');
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Field  does not exist');
    });

    test('should handle null field parameter gracefully', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          const validation = new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          });
          // @ts-expect-error - Testing null field
          validation.isFieldValid(null);
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Field cannot be empty');
    });

    test('should handle undefined field parameter gracefully', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          const validation = new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          });
          // @ts-expect-error - Testing undefined field
          validation.isFieldValid(undefined);
          return null;
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('Field cannot be empty');
    });

    test('should handle malformed dynamic rule parameters gracefully', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { 
                rules: ['minCharacterAmount(abc)'] // Invalid parameter
              }
            }
          });

          const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
          nameInput.value = 'test';
          nameInput.dispatchEvent(new Event('change'));
          return 'no-error';
        } catch (e) {
          return e.message;
        }
      });

      // This should not throw an error but handle it gracefully
      expect(error).toBe('no-error');
    });
  });

  test.describe('Form Element Validation', () => {
    test('should handle validation when form element is removed from DOM', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          const validation = new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          });

          // Remove form from DOM
          const form = document.querySelector('section[data-value="basic"] form');
          form?.remove();

          // Try to validate - should handle gracefully
          validation.validateForm();
          return 'no-error';
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('no-error');
    });

    test('should handle validation when field is removed from DOM', async ({ page }) => {
      const error = await page.evaluate(() => {
        try {
          const validation = new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          });

          // Remove field from DOM
          const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]');
          nameInput?.remove();

          // Try to validate - should handle gracefully
          validation.validateForm();
          return 'no-error';
        } catch (e) {
          return e.message;
        }
      });

      expect(error).toBe('no-error');
    });
  });

  test.describe('Error Recovery', () => {
    test('should recover from errors and continue working', async ({ page }) => {
      const result = await page.evaluate(() => {
        try {
          const validation = new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          });

          // Try to add a rule that doesn't exist (should throw error)
          try {
            validation.addFieldRule('name', 'nonExistentRule', 'Custom message');
          } catch (e) {
            // Expected error
          }

          // Validation should still work after the error
          const nameInput = document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement;
          nameInput.value = 'Valid Name';
          
          return validation.isFieldValid('name');
        } catch (e) {
          return e.message;
        }
      });

      expect(result).toBe(true);
    });

    test('should handle multiple error scenarios in sequence', async ({ page }) => {
      const result = await page.evaluate(() => {
        const errors: string[] = [];
        
        try {
          const validation = new window.Validation('section[data-value="basic"] form', {
            fields: {
              name: { rules: ['required'] }
            }
          });

          // Test multiple error scenarios
          try {
            validation.addFieldRule('nonExistentField', 'required', 'message');
          } catch (e) {
            errors.push(e.message);
          }

          try {
            validation.addFieldRule('name', 'nonExistentRule', 'message');
          } catch (e) {
            errors.push(e.message);
          }

          try {
            validation.isFieldValid('nonExistentField');
          } catch (e) {
            errors.push(e.message);
          }

          return errors;
        } catch (e) {
          return [e.message];
        }
      });

      expect(result).toEqual([
        'Field nonExistentField does not exist',
        'Rule nonExistentRule does not exist',
        'Field "null" does not exist'
      ]);
    });
  });
});

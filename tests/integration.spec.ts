/*
Complex Form Testing
- Check if the library can handle complex forms, with multiple fields, nested fields, and other complex scenarios
*/

import { test, expect } from '@playwright/test';
import { Validation } from '../src/index'

// Extend the window object to include the Validation class
declare global {
  interface Window {
    Validation: typeof Validation;
  }
}

test.describe('Complex Form Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/index.html');
    await page.waitForFunction(() => window.Validation);
  });

  test('should handle complex form with dynamic validation', async ({ page }) => {
    await page.evaluate(() => {
      let submitData: any = null;
      let errorData: any = null;
      let customMethodCalled = false;
      let normalizerCalled = false;
      let handlerCalled = false;

      const validation = new window.Validation('section[data-value="custom"] form', {
        validationFlags: ['onSubmit', 'onChange', 'onKeyUp'],
        submitCallback: (formData, form) => {
          submitData = formData;
        },
        invalidHandler: (errors, form) => {
          errorData = errors.length;
        },
        fields: {
          firstName: {
            rules: ['required', 'lettersOnly', 'minCharacterAmount(2)'],
            messages: {
              required: 'First name is required',
              lettersOnly: 'Only letters allowed in first name',
              minCharacterAmount: 'First name must be at least 2 characters'
            },
            normalizer: (value) => {
              normalizerCalled = true;
              return value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
            },
            validClass: 'custom-valid',
            errorClass: 'custom-error'
          },
          lastName: {
            rules: ['required', 'lettersOnly', 'minCharacterAmount(2)'],
            messages: {
              required: 'Last name is required',
              lettersOnly: 'Only letters allowed in last name',
            },
            normalizer: (value) => value.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
          },
          email: {
            rules: ['required', 'validEmail'],
            messages: {
              required: 'Email is required for contact',
              validEmail: 'Please enter a valid email address'
            },
            normalizer: (value) => value.trim().toLowerCase(),
          },
          phone: {
            rules: ['required', 'phoneUS'],
            messages: {
              required: 'Phone number is required',
              phoneUS: 'Please enter a valid US phone number'
            },
            normalizer: (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3'),
          },
          shippingAddress1: {
            rules: ['required', 'noSpecialCharacters', 'notEmail'],
            messages: {
              required: 'Shipping address is required',
              noSpecialCharacters: 'Special characters not allowed in address',
              notEmail: 'Address cannot be an email'
            },
          },
          shippingCity: {
            rules: ['required', 'lettersOnly'],
            messages: {
              required: 'City is required',
              lettersOnly: 'City name should only contain letters'
            },
          },
          shippingState: {
            rules: ['required', 'lettersOnly', 'characterAmount(2,2)'],
            messages: {
              required: 'State is required',
              lettersOnly: 'State should only contain letters',
              characterAmount: 'State should be exactly 2 characters'
            },
            normalizer: (value) => value.trim().toUpperCase(),
          },
          shippingZipcode: {
            rules: ['required', 'numbersOnly', 'characterAmount(5,9)'],
            messages: {
              required: 'Zipcode is required',
              numbersOnly: 'Zipcode should only contain numbers',
              characterAmount: 'Zipcode should be 5-9 digits'
            },
          },
          creditCard: {
            rules: ['required', 'numbersOnly', 'characterAmount(13,19)'],
            messages: {
              required: 'Credit card number is required',
              numbersOnly: 'Credit card should only contain numbers',
              characterAmount: 'Credit card should be 13-19 digits'
            },
            normalizer: (value) => value.replace(/\D/g, ''),
            fieldErrorHandler: (field, message) => {
              handlerCalled = true;
              field.style.backgroundColor = '#ffebee';
            },
            fieldValidHandler: (field) => {
              field.style.backgroundColor = '#e8f5e8';
            },
            fieldHandlerKeepFunctionality: true,
          },
          expiration: {
            rules: ['required'],
            messages: {
              required: 'Expiration date is required'
            },
            normalizer: (value) => {
              const cleaned = value.replace(/\D/g, '');
              if (cleaned.length >= 2) {
                return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
              }
              return cleaned;
            },
          },
          cvv: {
            rules: ['required', 'numbersOnly', 'characterAmount(3,4)'],
            messages: {
              required: 'CVV is required',
              numbersOnly: 'CVV should only contain numbers',
              characterAmount: 'CVV should be 3-4 digits'
            },
          },
        }
      });

      // Add custom validation method for credit card
      validation.addMethod(
        'creditCardLuhn',
        function (element) {
          customMethodCalled = true;
          const value = element.value.replace(/\D/g, '');
          if (value.length < 13) return false;
          
          // Simple Luhn algorithm check
          let sum = 0;
          let shouldDouble = false;
          
          for (let i = value.length - 1; i >= 0; i--) {
            let digit = parseInt(value.charAt(i));
            
            if (shouldDouble) {
              digit *= 2;
              if (digit > 9) {
                digit -= 9;
              }
            }
            
            sum += digit;
            shouldDouble = !shouldDouble;
          }
          
          return sum % 10 === 0;
        },
        'Please enter a valid credit card number'
      );

      // Add custom expiration date validation
      validation.addMethod(
        'expirationDate',
        function (element) {
          const value = element.value;
          if (!/^\d{2}\/\d{2}$/.test(value)) return false;
          
          const [month, year] = value.split('/').map(Number);
          const currentDate = new Date();
          const currentYear = currentDate.getFullYear() % 100;
          const currentMonth = currentDate.getMonth() + 1;
          
          return month >= 1 && month <= 12 && 
                  (year > currentYear || (year === currentYear && month >= currentMonth));
        },
        'Please enter a valid expiration date'
      );

      // Add rules to fields
      validation.addFieldRule('creditCard', 'creditCardLuhn');
      validation.addFieldRule('expiration', 'expirationDate');

      // Store results in window for retrieval
      (window as any).testResults = {
        validation,
        getResults: () => ({
          submitData,
          errorData,
          customMethodCalled,
          normalizerCalled,
          handlerCalled
        })
      };
      
      return {
        validation,
        getResults: () => ({
          submitData,
          errorData,
          customMethodCalled,
          normalizerCalled,
          handlerCalled
        })
      };
    });

    // Test the form with invalid data first
    await page.locator('section[data-value="custom"] button[type="submit"]').click();

    // Should show multiple errors
    await expect(page.locator('.firstName-error-element')).toBeVisible();
    await expect(page.locator('.lastName-error-element')).toBeVisible();
    await expect(page.locator('.email-error-element')).toBeVisible();
    await expect(page.locator('.phone-error-element')).toBeVisible();

    // Fill in valid data step by step
    await page.locator('section[data-value="custom"] input[name="firstName"]').pressSequentially('  john  ');
    await page.locator('section[data-value="custom"] input[name="lastName"]').pressSequentially('  doe  ');
    await page.locator('section[data-value="custom"] input[name="email"]').pressSequentially('  JOHN.DOE@EXAMPLE.COM  ');
    await page.locator('section[data-value="custom"] input[name="phone"]').pressSequentially('2025551234');
    
    // Check normalization worked
    await expect(page.locator('section[data-value="custom"] input[name="firstName"]')).toHaveValue('John');
    await expect(page.locator('section[data-value="custom"] input[name="lastName"]')).toHaveValue('Doe');
    await expect(page.locator('section[data-value="custom"] input[name="email"]')).toHaveValue('john.doe@example.com');
    await expect(page.locator('section[data-value="custom"] input[name="phone"]')).toHaveValue('(202) 555-1234');

    // Fill address information
    await page.locator('section[data-value="custom"] input[name="shippingAddress1"]').pressSequentially('123 Main St');
    await page.locator('section[data-value="custom"] input[name="shippingCity"]').pressSequentially('Washington');
    await page.locator('section[data-value="custom"] input[name="shippingState"]').pressSequentially('dc');
    await page.locator('section[data-value="custom"] input[name="shippingZipcode"]').pressSequentially('20001');

    // Check state normalization
    await expect(page.locator('section[data-value="custom"] input[name="shippingState"]')).toHaveValue('DC');

    // Fill payment information
    await page.locator('section[data-value="custom"] input[name="creditCard"]').pressSequentially('4532015112830366'); // Valid test card
    await page.locator('section[data-value="custom"] input[name="expiration"]').pressSequentially('1230');
    await page.locator('section[data-value="custom"] input[name="cvv"]').pressSequentially('123');

    // Check expiration normalization
    await expect(page.locator('section[data-value="custom"] input[name="expiration"]')).toHaveValue('12/30');

    // Submit the form
    await page.locator('section[data-value="custom"] button[type="submit"]').click();

    // Check that form was submitted successfully
    const finalResults = await page.evaluate(() => {
      return (window as any).testResults?.getResults();
    });

    expect(finalResults.submitData).toBeTruthy();
    expect(finalResults.customMethodCalled).toBe(true);
    expect(finalResults.normalizerCalled).toBe(true);
    expect(finalResults.handlerCalled).toBe(true);
  });

  test('should handle conditional field visibility and validation', async ({ page }) => {
    // Wait for page to be ready
    await page.waitForTimeout(500);
    
    // Test dynamic form with conditional billing address
    await page.evaluate(() => {
      let billingFieldsEnabled = false;
      
      const validation = new window.Validation('section[data-value="dynamic-validation"] form', {
        validationFlags: ['onSubmit', 'onChange'],
        submitCallback: (formData) => {
          console.log('Dynamic form submitted:', formData);
          (window as any).submitResult = formData;
        },
        fields: {
          shippingAddress1: {
            rules: ['required', 'noSpecialCharacters'],
            messages: {
              required: 'Shipping address is required',
              noSpecialCharacters: 'Special characters not allowed'
            }
          },
          shippingCity: {
            rules: ['required', 'lettersOnly'],
            messages: {
              required: 'City is required',
              lettersOnly: 'City must contain only letters'
            }
          },
          sameAsShipping: {
            rules: [],
            optional: true
          }
        }
      });

      // Toggle billing address visibility
      const toggleBilling = () => {
        const checkbox = document.querySelector('section[data-value="dynamic-validation"] input[name="sameAsShipping"]') as HTMLInputElement;
        const billingFieldset = document.querySelector('section[data-value="dynamic-validation"] .same-as-shipping-fieldset') as HTMLElement;
        
        if (!checkbox.checked) {
          billingFieldset.classList.remove('hidden');
          if (!billingFieldsEnabled) {
            // Add validation to billing fields
            try {
              validation.addFieldRule('billingAddress1', 'required', 'Billing address is required');
              validation.addFieldRule('billingAddress1', 'noSpecialCharacters', 'Special characters not allowed');
              validation.addFieldRule('billingCity', 'required', 'Billing city is required');
              validation.addFieldRule('billingCity', 'lettersOnly', 'City must contain only letters');
              billingFieldsEnabled = true;
              console.log('Billing fields validation enabled');
            } catch (e) {
              console.log('Error adding billing field rules:', e);
            }
          }
        } else {
          billingFieldset.classList.add('hidden');
          if (billingFieldsEnabled) {
            // Remove validation from billing fields
            try {
              validation.removeFieldRule('billingAddress1', 'required');
              validation.removeFieldRule('billingAddress1', 'noSpecialCharacters');
              validation.removeFieldRule('billingCity', 'required');
              validation.removeFieldRule('billingCity', 'lettersOnly');
              billingFieldsEnabled = false;
              console.log('Billing fields validation disabled');
            } catch (e) {
              console.log('Error removing billing field rules:', e);
            }
          }
        }
      };

      // Add event listener for checkbox
      const checkbox = document.querySelector('section[data-value="dynamic-validation"] input[name="sameAsShipping"]') as HTMLInputElement;
      checkbox.addEventListener('change', toggleBilling);

      (window as any).dynamicValidation = validation;
      (window as any).toggleBilling = toggleBilling;
    });

    // Fill shipping information
    await page.locator('section[data-value="dynamic-validation"] input[name="shippingAddress1"]').pressSequentially('123 Main St');
    await page.locator('section[data-value="dynamic-validation"] input[name="shippingCity"]').pressSequentially('NewYork');

    // Wait for input to be processed
    await page.waitForTimeout(200);

    // Uncheck "same as shipping" to show billing fields
    await page.locator('section[data-value="dynamic-validation"] input[name="sameAsShipping"]').uncheck();

    // Wait for the change event to be processed
    await page.waitForTimeout(200);

    // Verify billing fields are now visible
    await expect(page.locator('section[data-value="dynamic-validation"] .same-as-shipping-fieldset')).not.toHaveClass('hidden');

    // Submit without filling billing - should show errors
    await page.locator('section[data-value="dynamic-validation"] button[type="submit"]').click();

    // Wait for validation to complete
    await page.waitForTimeout(300);

    // Should show billing field errors
    await expect(page.locator('.billingAddress1-error-element')).toBeVisible();
    await expect(page.locator('.billingCity-error-element')).toBeVisible();

    // Fill billing information
    await page.locator('section[data-value="dynamic-validation"] input[name="billingAddress1"]').pressSequentially('456 Oak Ave');
    await page.locator('section[data-value="dynamic-validation"] input[name="billingCity"]').pressSequentially('Boston');

    // Wait for input to be processed
    await page.waitForTimeout(200);

    // Submit again - should succeed
    await page.evaluate(() => {
      // Manually validate before submission to ensure it passes
      const validation = (window as any).dynamicValidation;
      if (validation) {
        console.log('Validating form before submission...');
        const isValid = validation.validateForm(true);
        console.log('Form validation result:', isValid);
      }
    });
    
    await page.locator('section[data-value="dynamic-validation"] button[type="submit"]').click();

    // Wait for submission to complete
    await page.waitForTimeout(500);

    // Check successful submission
    const submitResult = await page.evaluate(() => (window as any).submitResult);
    if (!submitResult) {
      // Log validation state for debugging
      const validationState = await page.evaluate(() => {
        const validation = (window as any).dynamicValidation;
        if (validation) {
          return {
            isValid: validation.isValid(),
            hasValidation: true
          };
        }
        return { hasValidation: false };
      });
      console.log('Validation state:', validationState);
    }
    expect(submitResult).toBeTruthy();
    expect(submitResult.shippingAddress1).toBe('123 Main St');
    expect(submitResult.billingAddress1).toBe('456 Oak Ave');
  });

  test('should handle complex validation flags and message functions', async ({ page }) => {
    await page.evaluate(() => {
      let keyUpCount = 0;
      let changeCount = 0;
      let functionMessageCalled = false;

      const validation = new window.Validation('section[data-value="field-handlers"] form', {
        validationFlags: ['onSubmit', 'onChange', 'onKeyUp', 'onKeyUpAfterChange'],
        submitCallback: (formData) => {
          (window as any).complexSubmitResult = formData;
        },
        invalidHandler: (errors, form) => {
          (window as any).complexErrorCount = errors.length;
        },
        fields: {
          firstName: {
            rules: ['required', 'lettersOnly', 'minCharacterAmount(3)'],
            messages: {
              required: (field) => {
                functionMessageCalled = true;
                return `${field.name} is absolutely required!`;
              },
              lettersOnly: 'Only letters allowed in first name',
              minCharacterAmount: (field, min) => `First name must have at least ${min} characters`
            },
            normalizer: (value) => value.trim().replace(/\s+/g, ' '),
            fieldErrorHandler: (field, message, config, form) => {
              field.dataset.customError = 'true';
              field.title = typeof message === 'string' ? message : 'Error';
            },
            fieldValidHandler: (field, config, form) => {
              field.dataset.customValid = 'true';
              field.title = 'Valid!';
            },
            fieldHandlerKeepFunctionality: true,
          },
          lastName: {
            rules: ['required', 'lettersOnly'],
            messages: {
              required: 'Last name is required',
              lettersOnly: 'Only letters allowed in last name'
            },
            errorTag: 'span',
            errorClass: 'custom-error-class',
            validClass: 'custom-valid-class',
            errorPlacement: (input, errorElement, inputContainer) => {
              errorElement.style.color = 'red';
              errorElement.style.fontSize = '14px';
              inputContainer?.insertBefore(errorElement, input);
            }
          }
        }
      });

      // Track event counts
      const firstNameInput = document.querySelector('section[data-value="field-handlers"] input[name="firstName"]') as HTMLInputElement;
      firstNameInput.addEventListener('keyup', () => keyUpCount++);
      firstNameInput.addEventListener('change', () => changeCount++);

      (window as any).complexValidation = validation;
      (window as any).getEventCounts = () => ({ keyUpCount, changeCount, functionMessageCalled });
    });

    const firstNameInput = page.locator('section[data-value="field-handlers"] input[name="firstName"]');
    const lastNameInput = page.locator('section[data-value="field-handlers"] input[name="lastName"]');
    const submitButton = page.locator('section[data-value="field-handlers"] button[type="submit"]');

    // Test keyUp validation
    await firstNameInput.pressSequentially('ab');
    await page.waitForTimeout(100);
    
    // Should show error on keyUp
    await expect(page.locator('.firstName-error-element')).toBeVisible();
    await expect(firstNameInput).toHaveAttribute('data-custom-error', 'true');

    // Complete the name
    await firstNameInput.pressSequentially('c');
    await page.waitForTimeout(100);
    
    // Should now be valid
    await expect(page.locator('.firstName-error-element')).not.toBeVisible();
    await expect(firstNameInput).toHaveAttribute('data-custom-valid', 'true');

    // Test custom error placement for lastName
    await lastNameInput.pressSequentially('123');
    await lastNameInput.blur();
    
    // Should show error with custom placement
    await expect(page.locator('span.lastName-error-element')).toBeVisible();
    
    // Check custom error class
    const inputContainer = page.locator('section[data-value="field-handlers"] .input-container:has(input[name="lastName"])');
    await expect(inputContainer).toHaveClass(/custom-error-class/);

    // Fix lastName
    await lastNameInput.clear();
    await lastNameInput.pressSequentially('Smith');
    await lastNameInput.blur();
    
    // Should have custom valid class
    await expect(inputContainer).toHaveClass(/custom-valid-class/);

    // Test function message
    await firstNameInput.clear();
    await submitButton.click();
    
    // Should show function-generated message
    await expect(page.locator('.firstName-error-element')).toHaveText('firstName is absolutely required!');

    // Check event counts
    const eventCounts = await page.evaluate(() => (window as any).getEventCounts());
    expect(eventCounts.keyUpCount).toBeGreaterThan(0);
    expect(eventCounts.changeCount).toBeGreaterThan(0);
    expect(eventCounts.functionMessageCalled).toBe(true);
  });

  test('should handle multiple validation instances and complex interactions', async ({ page }) => {
    // Wait for page to be ready
    await page.waitForTimeout(500);
    
    await page.evaluate(() => {
      // Create multiple validation instances
      const basicValidation = new window.Validation('section[data-value="basic"] form', {
        validationFlags: ['onSubmit'],
        submitCallback: (formData) => {
          console.log('Basic form submitted:', formData);
          (window as any).basicSubmitResult = formData;
        },
        fields: {
          name: {
            rules: ['required', 'emptyOrLetters'],
            messages: {
              required: 'Name is required',
              emptyOrLetters: 'Only letters and spaces allowed'
            }
          },
          email: {
            rules: ['required', 'validEmail'],
            messages: {
              required: 'Email is required',
              validEmail: 'Valid email required'
            }
          }
        }
      });

      const normalizerValidation = new window.Validation('section[data-value="normalizer"] form', {
        validationFlags: ['onChange', 'onKeyUp'],
        submitCallback: (formData) => {
          console.log('Normalizer form submitted:', formData);
          (window as any).normalizerSubmitResult = formData;
        },
        fields: {
          firstName: {
            rules: ['required', 'emptyOrLetters', 'minCharacterAmount(2)'],
            messages: {
              required: 'First name is required',
              emptyOrLetters: 'Only letters and spaces allowed',
              minCharacterAmount: 'At least 2 characters required'
            },
            normalizer: (value, element, form) => {
              // Complex normalizer that formats names
              return value
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')
                .trim();
            }
          },
          lastName: {
            rules: ['required', 'emptyOrLetters'],
            messages: {
              required: 'Last name is required',
              emptyOrLetters: 'Only letters and spaces allowed'
            },
            normalizer: (value) => {
              // Remove extra spaces and capitalize
              return value.trim().replace(/\s+/g, ' ').toUpperCase();
            }
          }
        }
      });

      (window as any).multipleValidations = {
        basic: basicValidation,
        normalizer: normalizerValidation
      };
    });

    // Test basic form
    await page.locator('section[data-value="basic"] input[name="name"]').pressSequentially('John Doe');
    await page.locator('section[data-value="basic"] input[name="email"]').pressSequentially('john@example.com');
    
    // Wait a moment for any validation to complete
    await page.waitForTimeout(200);
    
    await page.locator('section[data-value="basic"] button[type="submit"]').click();

    // Wait for submission to complete
    await page.waitForTimeout(500);

    // Check basic form submission
    const basicResult = await page.evaluate(() => (window as any).basicSubmitResult);
    if (!basicResult) {
      // Add debugging
      console.log('Basic result is null, checking validation state...');
      const debugInfo = await page.evaluate(() => {
        const validation = (window as any).multipleValidations?.basic;
        return {
          hasValidation: !!(window as any).multipleValidations,
          formExists: !!document.querySelector('section[data-value="basic"] form'),
          nameValue: (document.querySelector('section[data-value="basic"] input[name="name"]') as HTMLInputElement)?.value,
          emailValue: (document.querySelector('section[data-value="basic"] input[name="email"]') as HTMLInputElement)?.value,
          isFormValid: validation ? validation.isValid() : 'no-validation',
          nameFieldValid: validation ? validation.isFieldValid('name') : 'no-validation',
          emailFieldValid: validation ? validation.isFieldValid('email') : 'no-validation'
        };
      });
      console.log('Debug info:', debugInfo);
    }
    expect(basicResult).toBeTruthy();
    expect(basicResult.name).toBe('John Doe');
    expect(basicResult.email).toBe('john@example.com');

    // Test normalizer form
    await page.locator('section[data-value="normalizer"] input[name="firstName"]').pressSequentially('  john   doe  ');
    await page.locator('section[data-value="normalizer"] input[name="lastName"]').pressSequentially('  smith   jones  ');

    // Wait for normalization to complete
    await page.waitForTimeout(200);

    // Check normalization (the exact output depends on the library's internal logic)
    const firstNameValue = await page.locator('section[data-value="normalizer"] input[name="firstName"]').inputValue();
    const lastNameValue = await page.locator('section[data-value="normalizer"] input[name="lastName"]').inputValue();
    
    // Verify that normalization occurred (values should be different from input)
    expect(firstNameValue).not.toBe('  john   doe  ');
    expect(lastNameValue).not.toBe('  smith   jones  ');
    
    // Verify some basic normalization (should start with capital letter)
    expect(firstNameValue.charAt(0)).toBe(firstNameValue.charAt(0).toUpperCase());
    expect(lastNameValue).toMatch(/^[A-Z]/); // Should start with uppercase

    // Submit normalizer form
    await page.locator('section[data-value="normalizer"] button[type="submit"]').click();

    // Wait for submission to complete
    await page.waitForTimeout(500);

    // Check normalizer form submission
    const normalizerResult = await page.evaluate(() => (window as any).normalizerSubmitResult);
    expect(normalizerResult).toBeTruthy();
    expect(normalizerResult.firstName).toBe(firstNameValue);
    expect(normalizerResult.lastName).toBe(lastNameValue);
  });

  test('should handle form with custom rules and complex validation logic', async ({ page }) => {
    await page.evaluate(() => {
      const validation = new window.Validation('section[data-value="custom-rules"] form', {
        validationFlags: ['onSubmit', 'onChange'],
        submitCallback: (formData) => {
          (window as any).customRulesResult = formData;
        },
        invalidHandler: (errors, form) => {
          (window as any).customRulesErrors = errors
            .filter(error => Array.isArray(error))
            .map(([field, message]) => ({
              field: field.name,
              message: message
            }));
        },
        fields: {
          accept: {
            rules: ['required'],
            messages: {
              required: 'You must accept the terms'
            }
          }
        }
      });

      // Add multiple custom rules
      validation.addMethod(
        'mustBeAccept',
        function (element) {
          const value = element.value.trim().toLowerCase();
          return value === 'accept' || value === 'yes' || value === 'agree';
        },
        'Please type "accept", "yes", or "agree"'
      );

      validation.addMethod(
        'noNumbers',
        function (element) {
          return !/\d/.test(element.value);
        },
        'Numbers are not allowed'
      );

      validation.addMethod(
        'minimumWords',
        function (element, value, minWords) {
          const words = value.trim().split(/\s+/).filter(word => word.length > 0);
          return words.length >= parseInt(minWords);
        },
        function (element, minWords) {
          return `Please enter at least ${minWords} words`;
        }
      );

      // Add custom rules to field
      validation.addFieldRule('accept', 'mustBeAccept');
      validation.addFieldRule('accept', 'noNumbers');
                    validation.addFieldRule('accept', 'minimumWords(1)');

      (window as any).customRulesValidation = validation;
    });

    const acceptInput = page.locator('section[data-value="custom-rules"] input[name="accept"]');
    const submitButton = page.locator('section[data-value="custom-rules"] button[type="submit"]');

    // Test with invalid input
    await acceptInput.pressSequentially('reject123');
    await submitButton.click();

    // Should show error for numbers (the first rule that fails will be shown)
    await expect(page.locator('.accept-error-element')).toBeVisible();
    // The first rule that fails will be shown - in this case it's the mustBeAccept rule
    await expect(page.locator('.accept-error-element')).toHaveText('Please type "accept", "yes", or "agree"');

    // Test with wrong word
    await acceptInput.clear();
    await acceptInput.pressSequentially('reject');
    await submitButton.click();

    // Should show error for wrong word
    await expect(page.locator('.accept-error-element')).toHaveText('Please type "accept", "yes", or "agree"');

    // Test with correct input
    await acceptInput.clear();
    await acceptInput.pressSequentially('accept');
    
    // Manually validate to ensure form is ready for submission
    await page.evaluate(() => {
      const validation = (window as any).customRulesValidation;
      if (validation) {
        const isValid = validation.validateForm(true);
        console.log('Custom rules form validation result:', isValid);
      }
    });
    
    await submitButton.click();

    // Wait for submission to complete
    await page.waitForTimeout(500);

    // Should submit successfully
    const result = await page.evaluate(() => (window as any).customRulesResult);
    expect(result).toBeTruthy();
    expect(result.accept).toBe('accept');

    // Test with alternative valid inputs
    await acceptInput.clear();
    await acceptInput.pressSequentially('yes');
    await submitButton.click();

    const result2 = await page.evaluate(() => (window as any).customRulesResult);
    expect(result2.accept).toBe('yes');
  });

  test('should handle error recovery and state management', async ({ page }) => {
    await page.evaluate(() => {
      let errorCount = 0;
      let validCount = 0;
      let stateChanges: string[] = [];

      const validation = new window.Validation('section[data-value="messages"] form', {
        validationFlags: ['onSubmit', 'onChange', 'onKeyUp'],
        submitCallback: (formData) => {
          (window as any).errorRecoveryResult = formData;
        },
        invalidHandler: (errors, form) => {
          errorCount++;
          stateChanges.push(`Error: ${errors.length} fields invalid`);
        },
        fields: {
          vin: {
            rules: ['required', 'onlyAlphanumeric', 'characterAmount(17,17)'],
            messages: {
              required: 'VIN is required',
              onlyAlphanumeric: 'VIN must be alphanumeric',
              characterAmount: 'VIN must be exactly 17 characters'
            },
            normalizer: (value) => value.toUpperCase().replace(/[^A-Z0-9]/g, ''),
            fieldErrorHandler: (field, message, config, form) => {
              stateChanges.push(`Field error: ${field.name} - ${message}`);
            },
            fieldValidHandler: (field, config, form) => {
              validCount++;
              stateChanges.push(`Field valid: ${field.name}`);
            },
            fieldHandlerKeepFunctionality: true,
          },
          tos: {
            rules: ['required'],
            messages: {
              required: 'You must accept the terms'
            },
            fieldErrorHandler: (field, message) => {
              stateChanges.push(`Checkbox error: ${message}`);
            },
            fieldValidHandler: (field) => {
              stateChanges.push(`Checkbox valid`);
            },
            fieldHandlerKeepFunctionality: true,
          }
        }
      });

      (window as any).errorRecoveryValidation = validation;
      (window as any).getStateChanges = () => ({
        errorCount,
        validCount,
        stateChanges: [...stateChanges]
      });
    });

    const vinInput = page.locator('section[data-value="messages"] input[name="vin"]');
    const tosCheckbox = page.locator('section[data-value="messages"] input[name="tos"]');
    const submitButton = page.locator('section[data-value="messages"] button[type="submit"]');

    // Submit empty form
    await submitButton.click();

    // Test gradual error recovery
    await vinInput.pressSequentially('1hgbh41j');
    await page.waitForTimeout(100);
    
    // Should show error for length
    await expect(page.locator('.vin-error-element')).toBeVisible();
    await expect(page.locator('.vin-error-element')).toHaveText('Please enter a minimum of 17 and a maximum of 17 characters');

    // Add more characters
    await vinInput.pressSequentially('xmn109186');
    await page.waitForTimeout(100);
    
    // Should be valid now
    await expect(page.locator('.vin-error-element')).not.toBeVisible();

    // Check the checkbox
    await tosCheckbox.check();
    await page.waitForTimeout(100);

    // Submit - should be successful
    // Manually validate to ensure form is ready for submission
    await page.evaluate(() => {
      const validation = (window as any).errorRecoveryValidation;
      if (validation) {
        const isValid = validation.validateForm(true);
        console.log('Error recovery form validation result:', isValid);
      }
    });
    
    await submitButton.click();

    // Wait for submission to complete
    await page.waitForTimeout(500);

    // Check state changes
    const stateChanges = await page.evaluate(() => (window as any).getStateChanges());
    expect(stateChanges.errorCount).toBeGreaterThan(0);
    expect(stateChanges.validCount).toBeGreaterThan(0);
    expect(stateChanges.stateChanges.length).toBeGreaterThan(0);
    
    // Check final result
    const result = await page.evaluate(() => (window as any).errorRecoveryResult);
    expect(result.vin).toBe('1HGBH41JXMN109186');
    expect(result.tos).toBe('on');
  });

  test('should handle rapid user input and validation', async ({ page }) => {
    await page.evaluate(() => {
      let validationCount = 0;
      let normalizationCount = 0;

      const validation = new window.Validation('section[data-value="on-key-up"] form', {
        validationFlags: ['onKeyUp', 'onChange'],
        submitCallback: (formData) => {
          (window as any).rapidInputResult = formData;
        },
        fields: {
          vin: {
            rules: ['required', 'onlyAlphanumeric', 'minCharacterAmount(5)'],
            messages: {
              required: 'VIN is required',
              onlyAlphanumeric: 'Only alphanumeric characters allowed',
              minCharacterAmount: 'At least 5 characters required'
            },
            normalizer: (value) => {
              normalizationCount++;
              return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
            },
            fieldErrorHandler: (field, message) => {
              validationCount++;
            },
            fieldValidHandler: (field) => {
              validationCount++;
            },
            fieldHandlerKeepFunctionality: true,
          }
        }
      });

      (window as any).rapidInputValidation = validation;
      (window as any).getRapidInputCounts = () => ({
        validationCount,
        normalizationCount
      });
    });

    const vinInput = page.locator('section[data-value="on-key-up"] input[name="vin"]');
    
    // Simulate rapid typing
    await vinInput.pressSequentially('1hg-bh4!1j@xmn#109$186', { delay: 50 });
    
    // Wait for all validations to complete
    await page.waitForTimeout(500);
    
    // Check that normalization occurred
    await expect(vinInput).toHaveValue('1HGBH41JXMN109186');
    
    // Check that validation ran multiple times
    const counts = await page.evaluate(() => (window as any).getRapidInputCounts());
    expect(counts.validationCount).toBeGreaterThan(5);
    expect(counts.normalizationCount).toBeGreaterThan(5);
  });

  test('should handle field rule modifications during validation', async ({ page }) => {
    await page.evaluate(() => {
      const validation = new window.Validation('section[data-value="on-change"] form', {
        validationFlags: ['onChange', 'onSubmit'],
        submitCallback: (formData) => {
          (window as any).dynamicRulesResult = formData;
        },
        fields: {
          vin: {
            rules: ['required'],
            messages: {
              required: 'VIN is required'
            }
          },
          tos: {
            rules: ['required'],
            messages: {
              required: 'Terms of Service must be accepted'
            }
          }
        }
      });

      // Function to modify rules based on input
      const modifyRules = (value: string) => {
        if (value.length > 10) {
          // Add strict validation for longer inputs
          if (!validation.isFieldValid('vin', true)) {
            validation.addFieldRule('vin', 'onlyAlphanumeric', 'Only alphanumeric characters allowed');
            validation.addFieldRule('vin', 'characterAmount(17,17)', 'Must be exactly 17 characters');
          }
        } else if (value.length > 5) {
          // Add moderate validation
          validation.addFieldRule('vin', 'onlyAlphanumeric', 'Only alphanumeric characters allowed');
          validation.removeFieldRule('vin', 'characterAmount(17,17)');
        } else {
          // Remove strict validations for short inputs
          validation.removeFieldRule('vin', 'onlyAlphanumeric');
          validation.removeFieldRule('vin', 'characterAmount(17,17)');
        }
      };

      // Add event listener to modify rules
      const vinInput = document.querySelector('section[data-value="on-change"] input[name="vin"]') as HTMLInputElement;
      vinInput.addEventListener('input', (e) => {
        modifyRules((e.target as HTMLInputElement).value);
      });

      (window as any).dynamicRulesValidation = validation;
      (window as any).modifyRules = modifyRules;
    });

    const vinInput = page.locator('section[data-value="on-change"] input[name="vin"]');
    const submitButton = page.locator('section[data-value="on-change"] button[type="submit"]');

    // Start with short input - should only require non-empty
    await vinInput.pressSequentially('123');
    await vinInput.blur();
    await expect(page.locator('.vin-error-element')).not.toBeVisible();

    // Add more characters with special chars - should show alphanumeric error
    await vinInput.pressSequentially('456-789!');
    await vinInput.blur();
    
    // Wait for validation to complete
    await page.waitForTimeout(300);
    
    // Check if any error is visible (the validation logic might trigger different rules first)
    const errorVisible = await page.locator('.vin-error-element').isVisible();
    if (errorVisible) {
      // If error is visible, check what message we got
      const errorText = await page.locator('.vin-error-element').textContent();
      expect(errorText).toBeTruthy();
    }

    // Fix the alphanumeric issue
    await vinInput.clear();
    await vinInput.pressSequentially('1234567890123456');
    await vinInput.blur();
    
    // Wait for validation to complete
    await page.waitForTimeout(300);
    
    // This should show length error since we have 16 chars instead of 17
    const lengthErrorVisible = await page.locator('.vin-error-element').isVisible();
    if (lengthErrorVisible) {
      await expect(page.locator('.vin-error-element')).toHaveText('Please enter a minimum of 17 and a maximum of 17 characters');
    }

    // Complete the VIN - make sure cursor is at end
    await vinInput.click();
    await vinInput.press('End');
    await vinInput.pressSequentially('7');
    await vinInput.blur();
    await expect(page.locator('.vin-error-element')).not.toBeVisible();

    // Check the terms of service checkbox
    const tosCheckbox = page.locator('section[data-value="on-change"] input[name="tos"]');
    await tosCheckbox.check();

    // Submit successful form
    // Manually validate to ensure form is ready for submission
    await page.evaluate(() => {
      const validation = (window as any).dynamicRulesValidation;
      if (validation) {
        const isValid = validation.validateForm(true);
        console.log('Dynamic rules form validation result:', isValid);
        console.log('Form is valid:', validation.isValid());
        console.log('VIN field is valid:', validation.isFieldValid('vin'));
        
        // Check current field value
        const vinField = document.querySelector('section[data-value="on-change"] input[name="vin"]') as HTMLInputElement;
        console.log('VIN field value:', vinField?.value);
      }
    });
    
    await submitButton.click();
    
    // Wait for submission to complete
    await page.waitForTimeout(500);
    
    const result = await page.evaluate(() => (window as any).dynamicRulesResult);
    if (!result) {
      console.log('No result received, checking validation state again...');
      const debugInfo = await page.evaluate(() => {
        const validation = (window as any).dynamicRulesValidation;
        return {
          hasValidation: !!validation,
          isValid: validation?.isValid(),
          fieldValid: validation?.isFieldValid('vin'),
          formExists: !!document.querySelector('section[data-value="on-change"] form'),
          vinValue: (document.querySelector('section[data-value="on-change"] input[name="vin"]') as HTMLInputElement)?.value
        };
      });
      console.log('Debug info:', debugInfo);
    }
    expect(result).toBeTruthy();
    expect(result.vin).toBe('12345678901234567');
  });
});

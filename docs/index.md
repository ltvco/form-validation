# Form Validation – Technical Documentation

This document outlines advanced features and API methods for the `@ltvco/form-validation` library. It is intended for developers who need to customize, extend, or control validation behavior beyond basic setup.

Whether you're adding rules dynamically, modifying validation behavior at runtime, or triggering manual validation flows, this guide covers the core API you’ll need.

## Table of Contents

- [Getting Started](#getting-started)
- [Adding New Rules](#adding-new-rules)
- [Modifying Rules for Fields](#modifying-rules-for-fields)
- [Manual Validation](#manual-validation)
- [Full API Reference](#api-reference)
  - [Constructor](#constructor)
  - [Configuration](#configuration)
    - [`validationFlags`](#validationflags)
    - [`submitCallback`](#submitcallback)
    - [`invalidHandler`](#invalidhandler)
    - [`fields`](#fields)
    - [`rules`](#rules)
    - [`messages`](#messages)
    - [`optional`](#optional)
    - [`inputContainer`](#inputcontainer)
    - [`errorPlacement`](#errorplacement)
    - [`errorClass`](#errorclass)
    - [`errorTag`](#errortag)
    - [`validClass`](#validclass)
    - [`normalizer`](#normalizer)
    - [`fieldErrorHandler`](#fielderrorhandler)
    - [`fieldValidHandler`](#fieldvalidhandler)
    - [`fieldHandlerKeepFunctionality`](#fieldhandlerkeepfunctionality)
  - [Dynamic Rules](#dynamic-rules)
  - [Default Rules](#default-rules)
  - [Public Methods](#public-methods)
    - [`isValid()`](#isvalid)
    - [`validateForm(silently)`](#validateformsilently)
    - [`isFieldValid(field, silently)`](#isfieldvalidfield-silently)
    - [`addMethod(name, validator, message)`](#addmethodname-validator-message)
    - [`setFieldRules(fieldName, rules, messages)`](#setfieldrulesfieldname-rules-messages)
    - [`addFieldRule(fieldName, ruleName, message)`](#addfieldrulefieldname-rulename-message)
    - [`removeFieldRule(fieldName, ruleName)`](#removefieldrulefieldname-rulename)

## Getting Started

To install and initialize the library, follow the steps below:

1. Install via npm:

    ```bash
    npm install @ltvco/form-validation
    ```

2. Import and configure:

    ```js
    import { Validation } from '@ltvco/form-validation';
    ```

## Adding New Rules

You can register new validation rules or override existing ones using the `addMethod` function.

```js
myValidation.addMethod(
  'customRule2',
  (field) => field.value !== '',
  'This field cannot be empty'
);
```

If the rule already exists, you can also modify either the default message or the validation function.

### Modify only the validator function (keep message)

```js
myValidation.addMethod('customRule2', (field) => field.value !== '');
```

### Modify only the message (keep validator)

```js
myValidation.addMethod('customRule2', null, 'This field cannot be empty');
```

## Modifying Rules for Fields

If you need to update validation rules dynamically (e.g. based on user input or form state), you can modify a specific field’s rules after initialization.

### Add a rule to a field

```js
myValidation.addFieldRule(
  'fieldName',
  'customRule',
  'This is a custom error message for customRule'
);
```

### Remove an existing rule from a field

```js
myValidation.removeFieldRule('fieldName', 'customRule');
```

### Replace all rules for a field

```js
myValidation.setFieldRules('fieldName', ['customRule', 'customRule2'], {
  customRule: 'This is a custom error message for customRule',
  customRule2: 'This is a custom error message for customRule2',
});
```

## Manual Validation

You can manually trigger form validation, with or without showing error messages. This is useful for complex flows or async form handling. This section is explained in more detail in the [Public Methods Section](#public-methods).

### Validate the entire form

```js
const isFormValid = myValidation.validateForm(); // Shows errors by default
```

### Validate a specific field

```js
const isFieldValid = myValidation.isFieldValid('myField');
```

Both validateForm and isFieldValid accept an optional silently boolean parameter to suppress error messages:

```js
const isFormValid = myValidation.validateForm(true); // Silent validation
```

---

## API Reference

### Constructor

```js
constructor(form, config, rules);
```

#### Parameters

- **`form`** `{HTMLElement | string}`: Form element or selector that will be validated.
- **`config`** `{Object}`: _[Optional]_ Object containing fields to validate, which rules to apply, and other configurations.
- **`rules`** `{Object}`: _[Optional]_ Custom rules to use in validation.

#### Returns

An instance with the validation.

#### Description

Sets up all variables and configurations for validation to work on a form.

---

### Configuration

The `config` object allows you to control how validation works on your form. It defines which fields should be validated, when validation should occur, what to do on submission or errors, and how error styling and messages are handled.

Here’s an example of a complete configuration object:

```js
const config = {
  validationFlags: ['onSubmit', 'onChange', 'onKeyUpAfterChange'],
  submitCallback: (formObj) => console.log(formObj);
  invalidHandler: (errors) => console.error(errors),
  fields: {
    field1: {
      rules: ['rule1', 'rule2'],
      inputContainer: '.error-placement-selector',
      errorClass: '.custom-error-class',
      validClass: '.custom-valid-class',
      fieldErrorHandler: (field, message) => alert(`The input ${field.name} has an error: ${message}`),
      fieldValidHandler: (field) => alert(`The input ${field.name} is valid!`),
      messages: {
        rule1: 'Custom error message for rule1.',
        rule2: (field) => `rule2 validation has not been met for ${field.name}`,
      }
    }
  },
}
```

The `config` object supports several attributes that control the behavior of the validation process. Below is a breakdown of the main configuration options and their roles.

---

#### `validationFlags`

Array with triggers that define when will the validator check for the validity of the fields.

**Available Flags**

| Flag                 | Description                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `onChange`           | **[Default]** Validates a field when the `change` event is triggered.                                                                           |
| `onKeyUpAfterChange` | **[Default]** Works the same as the `onKeyUp` flag, however, it's added after the first time the field is changed.                              |
| `onSubmit`           | **[Default]** Validates all fields before the form is submitted.                                                                                |
| `onKeyUp`            | Validates a field when the `keyup` event is triggered on the field. This is only added to inputs that can be written on. (`text`, `date`, etc.) |

**Default Value**

```js
validationFlags: ['onChange', 'onKeyUpAfterChange', 'onSubmit'];
```

**Usage**

```js
const myConfig = {
  ...
  validationFlags: ['onKeyUp', 'onSubmit'],
  ...
}
```

---

#### `submitCallback`

Function to be called when the form is submitted successfully. It's important to mention that by default, the inputs will be sanitized before calling this function.

**Available Parameters**

| Parameter    | Type              | Description                                                                                                                                                    |
| ------------ | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `formObject` | `Object`          | An object containing all the key-value pairs of each of the inputs. The field's `name` will be the key and the `value` will be whatever the user set as input. |
| `form`       | `HTMLFormElement` | The reference to the form `element` where the validation is being applied.                                                                                     |

**Default Value**

```js
submitCallback: (formObj, form) => form.submit();
```

**Usage**

```js
const myConfig = {
  ...
  submitCallback: function(formObject, form) {
    form.classList.add('is-loading');
    return fetch('http://my.api.com/url', {
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(formObject)
    }).then((response) => {
      console.log(response);
      form.classList.remove('is-loading');
    })
  },
  ...
}
```

---

#### `invalidHandler`

Function to be called when the form is submitted with errors.

**Available Parameters**

| Parameter | Type                           | Description                                                                                                                                                               |
| --------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `errors`  | `Array<[HTMLElement, string]>` | An array containing all the errors found inside the form. Each element of the array is a tuple with the `input` as an `HTMLElement` and the `errorMessage` as a `string`. |
| `form`    | `HTMLFormElement`              | The reference to the form `element` where the validation is being applied.                                                                                                |

**Default Value**

```js
invalidHandler: () => {};
```

**Usage**

```js
const myConfig = {
  ...
  invalidHandler: function(errors, form) {
    const formErrorsSection = form.querySelector('.js-error-section');
    formErrorsSection.innerHTML = '';

    errors.forEach([field, errorMessage] => {
      const errorElement = document.createElement('li');
      errorElement.innerHTML = errorMessage;

      formErrorsSection.appendChild(errorElement);
    });
  },
  ...
}
```

---

#### `fields`

An object where we configure each of the fields we want to validate, along with each of the rules we want to add to the field. The `key` of each object must match the `name` of an input.

**Structure**

```js
const myConfig = {
  ...
  fields: {
    'zipCode': {
      rules: ['required', 'characterAmount(5,9)', 'numbersOnly', ...],
      messages: {
        'required': 'Please enter a valid zip code.',
        'characterAmount': function(field, ...args) { return `Zip code must have between ${args[0]} and ${args[1]} characters.` },
      },
      inputContainer: '.input-container',
      errorClass: 'zip-error',
      errorElement: 'span',
      validClass: 'zip-valid',
      fieldHandlerKeepFunctionality: true,
      fieldErrorHandler: function(field, message, fieldConfig, form) {
        ...
      },
      fieldValidHandler: function(field, fieldConfig, form) {
        ...
      },
    },
    'state': {
      ...
    },
    ...
  }
  ...
}
```

---

#### `rules`

An array with all the rules to validate for each of the fields. The order of the array is important as well, as the validator will prioritize rules in ascending order, meaning the smaller the index, the higher priority it has.

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'fn': {
      rules: ['required', ...],
      ...
    },
    ...
  }
  ...
}
```

---

#### `messages`

An object containing any messages to be overwritten with a custom error message. Each object `key` must match a `rule` name. The `value` can either be a `string` or a function that resolves to a `string`.

Something to keep in mind is that as of now, **if the message is a function, the function will resolve when the Form Validator is initialized**, and not each time the input is validated.

It's also important to know that the messages are added to the DOM as `innerHTML` and not `innerText`, so you can add custom styling and `HTML` tags to the messages.

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'email': {
      rules: ['required', 'validEmail', 'maxCharacterAmount(100)', ...],
      messages: {
        'required': 'Please enter a valid email address.',
        'maxCharacterAmount': function(field, ...args) { return `Email address can't be over ${args[0]} characters long.` }
        ...
      },
      ...
    },
    ...
  }
  ...
}
```

---

#### `optional`

Boolean to define if the field is optional or not. If `true`, the field will be marked as optional and won't be validated if it's empty. If `false`, the field will be marked as `required` and will be validated even if it's empty.

A few things to keep in mind:

- If no `optional` flag is passed and the `required` rule is not present, the field will be marked as `optional`.
- If no `optional` flag is passed and the `required` rule is present, the field will be marked as not `optional`.
- If an `optional` flag is passed as true and the rules also include the `required` rule, the `required` rule will have priority and the field will be marked as not `optional` instead.
- Finally, if an `optional` flag is passed as false and the `required` rule is not present, the `required` rule will be automatically added.

**Default value:** `false`

**Usage**

```js
const myConfig = {
  ...
  fields: {
    email: {
      optional: true,
      rules: ['validEmail', 'maxCharacterAmount(100)', ...],
      messages: {
        'required': 'Please enter a valid email address.',
        'maxCharacterAmount': function(field, ...args) { return `Email address can't be over ${args[0]} characters long.` }
        ...
      },
      ...
    },
    ...
  }
  ...
}
```

---

#### `inputContainer`

A `string` with a selector matching one of the field's parents where the `errorClass` will be added when the field is invalid. If the selector doesn't match any of the field's parents, the `errorClass` will be placed on the parent element.

**Default Value:** `input.parentElement`

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'ln': {
      inputContainer: '.input-container',
      ...
    },
    ...
  }
  ...
}
```

---

#### `errorPlacement`

Function to be called when the error element is created. The function receives the `input` element and the `error` element (not yet attached to the DOM) as parameters. The function is expected to add the `error` element to the DOM.

**Available Parameters**

| Parameter        | Type              | Description                                                                  |
| ---------------- | ----------------- | ---------------------------------------------------------------------------- |
| `input`          | `HTMLElement`     | The reference to the `input` element that throws the error.                  |
| `errorElement`   | `HTMLElement`     | An `HTMLElement` with the error message that has yet to be added to the DOM. |
| `inputContainer` | `HTMLElement`     | The reference to the `inputContainer` element.                               |
| `form`           | `HTMLFormElement` | A reference to the `form` element where the validation is being applied.     |

**Default Value:**

```js
  errorPlacement: (input, errorElement) => input.parentElement!.appendChild(errorElement),
```

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'fn': {
      errorPlacement: (input, errorElement) => input.after(errorElement),
      ...
    },
    ...
  }
  ...
}
```

---

#### `errorClass`

A string with a class that will be added to the `inputContainer` element when the field is invalid. By default, the class `error` is added when the field is invalid.

It's also important to note that the class `error` will also be added to the input itself as well, however this class isn't modified by the `errorClass` property.

**Default Value:** `error`

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'zipcode': {
      errorClass: 'zip-error',
      ...
    },
    ...
  }
  ...
}
```

---

#### `errorTag`

A string of the element tag in which the error will be displayed. An element of the type `errorTag` will be created and placed as the last child of the `inputContainer` element. It will always have the class `error`.

**Default Value:** `p`

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'ln': {
      errorTag: 'span',
      ...
    },
    ...
  }
  ...
}
```

---

#### `validClass`

A string of the class name that will be added to the `inputContainer` element when the `input` is valid. By default, the class `valid` is added when the field is valid.

Like with the `error` class, it's important to note that the class `valid` will also be added to the input itself as well, however this class isn't modified by the `validClass` property.

**Default Value:** `'valid'`

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'fn': {
      validClass: 'success',
      ...
    },
    ...
  }
  ...
}
```

---

#### `normalizer`

This function serves the purpose of adjusting the value in any way before it's validated. This function is destructive so it will change the value of the input. If the function is present, it will be added to the `onKeyDown` event to writeable inputs (`text`, `password`, `email`, etc.), or `onChange` to all other inputs before being validated.

**Available Parameters**

| Parameter | Type              | Description                                                              |
| --------- | ----------------- | ------------------------------------------------------------------------ |
| `value`   | `string`          | The current `value` of the `input` to be normalized.                     |
| `input`   | `HTMLElement`     | The reference to the `input` element.                                    |
| `form`    | `HTMLFormElement` | A reference to the `form` element where the validation is being applied. |

**Default Value:**

```js
  normalizer: (value, input, form) => {},
```

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'vin': {
      normalizer: (value, input, form) => value.toUpperCase(),
      ...
    },
    ...
  }
  ...
}
```

---

#### `fieldErrorHandler`

Function to be called when the field is validated and it has errors. There's 2 ways to use this function, either you can use it to completely replace the default functionality, or you can use it to add your own functionality on top of the default one. This is done with the `fieldHandlerKeepFunctionality` property, which if `true` will keep the default functionality, and if `false` will replace it.

**Available Parameters**

| Parameter     | Type              | Description                                                              |
| ------------- | ----------------- | ------------------------------------------------------------------------ |
| `input`       | `HTMLElement`     | The reference to the `input` throwing the error.                         |
| `message`     | `string`          | Error message to be displayed.                                           |
| `fieldConfig` | `Object`          | An object with the config options that this field was initialized with.  |
| `form`        | `HTMLFormElement` | A reference to the `form` element where the validation is being applied. |

**Default Functionality:**

```js
function onError(field, fieldConfig) {
  this.errors.push([field, message]);
  const { optional, errorClass, inputContainer, validClass } = fieldConfig;

  // Here the 'fieldErrorHandler' would be called if present, and replace the default functionality if 'fieldHandlerKeepFunctionality' is set to false.
  // if (fieldConfig.fieldErrorHandler) {
  //   fieldConfig.fieldErrorHandler(field, message, fieldConfig, this.form);
  //   return;
  // }

  // If there's no error element yet, create it.
  if (!this.form.querySelector(`.${field.name}-error-element`)) this.createError(field, fieldConfig);

  const inputParent =
    typeof inputContainer === 'string' ?
    (field.closest(inputContainer) as HTMLElement) :
    inputContainer || (field.parentElement as HTMLElement);

  if ((optional && field.value) || !optional) {
    const errorElement = this.form.querySelector(`.${field.name}-error-element`) as HTMLElement;

    errorElement.innerHTML = message;
    errorElement.style.display = 'block';

    inputParent.classList.add(errorClass || 'error');
    field.classList.add('error');
  }

  // Remove Valid Class if present
  inputParent.classList.remove(validClass || 'valid');
  field.classList.remove('valid');

  // Finally, if the 'fieldErrorHandler' is present and the 'fieldHandlerKeepFunctionality' is set to true, here it would be called, adding any extra functionality on top of the default one.
  // if (fieldConfig.fieldErrorHandler && fieldConfig.fieldHandlerKeepFunctionality) {
  //   fieldConfig.fieldErrorHandler(field, message, fieldConfig, this.form);
  // }
}
```

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'vin': {
      fieldHandlerKeepFunctionality: true,
      fieldErrorHandler: (input, message, fieldConfig, form) => {
        // Focus input on error
        input.focus();

        // Add error class to form
        form.classList.add('has-errors');
      },
      ...
    },
    ...
  }
  ...
}
```

---

#### `fieldValidHandler`

Function to be called when the field is validated and it passes all the rules. Similarly to the `fieldErrorHandler`, there's 2 ways to use this function, either you can use it to completely replace the default functionality, or you can use it to add your own functionality on top of the default one. This is done with the `fieldHandlerKeepFunctionality` property, which if `true` will keep the default functionality, and if `false` will replace it.

**Available Parameters**

| Parameter     | Type              | Description                                                              |
| ------------- | ----------------- | ------------------------------------------------------------------------ |
| `input`       | `HTMLElement`     | The reference to the `input` element that passed validations.            |
| `fieldConfig` | `Object`          | An object with the config options that this field was initialized with.  |
| `form`        | `HTMLFormElement` | A reference to the `form` element where the validation is being applied. |

**Default Functionality:**

```js
function onValid(field, fieldConfig) {
  const { optional, errorClass, inputContainer, validClass } = fieldConfig;
  this.errors = this.errors.filter(([errorField]) => errorField !== field);

  // Here the 'fieldValidHandler' would be called if present, and replace the default functionality if 'fieldHandlerKeepFunctionality' is set to false.
  // if (fieldConfig.fieldValidHandler) {
  //   fieldConfig.fieldValidHandler(field, fieldConfig, this.form);
  //   return;
  // }

  const inputParent =
    typeof inputContainer === 'string' ?
    (field.closest(inputContainer) as HTMLElement) :
    inputContainer || (field.parentElement as HTMLElement);
  const errorElement = this.form.querySelector(`.${field.name}-error-element`) as HTMLElement;

  inputParent.classList.remove(errorClass || 'error');
  field.classList.remove('error');

  if (errorElement) errorElement.style.display = 'none';

  if (!optional || (optional && field.value)) {
    inputParent.classList.add(validClass || 'valid');
    field.classList.add('valid');
  } else {
    inputParent.classList.remove(validClass || 'valid');
    field.classList.remove('valid');
  }

  // Finally, if the 'fieldValidHandler' is present and the 'fieldHandlerKeepFunctionality' is set to true, here it would be called, adding any extra functionality on top of the default one.
  // if (fieldConfig.fieldValidHandler && fieldConfig.fieldHandlerKeepFunctionality) {
  //   fieldConfig.fieldValidHandler(field, message, fieldConfig, this.form);
  // }
}
```

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'vin': {
      fieldHandlerKeepFunctionality: true,
      fieldValidHandler: (input, fieldConfig, form) => {
        // Remove error class to form
        form.classList.remove('has-errors');
      },
      ...
    },
    ...
  }
  ...
}
```

---

#### `fieldHandlerKeepFunctionality`

Boolean to define if the default functionality of the `fieldErrorHandler` and `fieldValidHandler` should be kept or not. If `true`, the default functionality will be kept, and if `false` it will be replaced.

**Default Value:** `false`

**Usage**

```js
const myConfig = {
  ...
  fields: {
    'vin': {
      fieldHandlerKeepFunctionality: true,
      fieldErrorHandler: (input, message, fieldConfig, form) => {
        // Focus input on error
        input.focus();

        // Add error class to form
        form.classList.add('has-errors');
      },
      fieldValidHandler: (input, fieldConfig, form) => {
        // Remove error class to form
        form.classList.remove('has-errors');
      },
      ...
    },
    ...
  }
  ...
}
```

---

### Dynamic Rules

There's also a way to add dynamic rules, where we can pass arguments to the rule's validator. This way we can have rules that differ in just a certain variable without having to have a rule for each of the variants.

So a use case for this is for example if we want a rule to limit the amount of characters inside a field. Then on our form, we have one field that can have a maximum amount of characters to `5`, and another one that can have a maximum amount of `10` characters. Instead of creating 2 different rules, we can have a single rule that takes in the number of characters as a parameter.

So the way this works is you define a rule like normal, but pass the parameters as a third argument when calling the `validator`. This also applies to the `message`, as the parameters will be passed to the function, but it's not a requirement.

```js
{
  ...,
  characterAmount: {
    validator: function (element, value, ...args) {
      const [min, max] = args;
      return value.length >= parseInt(min) && value.length <= parseInt(max);
    },
    message: function (element, ...args) {
      const [min, max] = args;
      return `Please enter a minimum of ${min} and a maximum of ${max} characters.`;
    },
  },
  ...,
}
```

The way to use it is to call it with the wanted parameters in the `rules` array in the configuration. In this case, it would be as follows:

```js
const myConfig = {
  ...
  fields: {
    'zipcode': {
      rules: ['characterAmount(5, 9)', ...],
    },
    ...
  }
  ...
}
```

---

### Default Rules

The validator comes with a predefined amount of rules ready to be used.

| Name                  | Description                                                                 | Error Message                                                          |
| --------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `required`            | Value must not be empty or contain only spaces                              | This field is required                                                 |
| `notEmail`            | Value must not be an email                                                  | Email addresses are not searchable here                                |
| `validEmail`          | Value must have a correct email format.                                     | Please enter a valid email address in the format of `example@test.com` |
| `noSpecialCharacters` | Value must not contain any of the following characters: `[$-/:-?{-~!"^_`[]` | Special characters are not allowed                                     |
| `noEmptySpacesOnly`   | Value must not be just empty spaces                                         | Empty spaces are not allowed                                           |
| `emptyOrLetters`      | Value must either be empty or contain letters only                          | Alphabetic characters required                                         |
| `onlyAlphanumeric`    | Value must be alphabetic characters only                                    | Only alphanumeric values are allowed                                   |
| `phoneUS`             | Value must have the structure of a common US phone                          | Please specify a valid phone number                                    |
| `numbersOnly`         | Value must contain numeric values only                                      | Only numeric values are allowed                                        |
| `lettersOnly`         | Value must contain alphabetic values only                                   | Only alphabetic characters are allowed                                 |
| `characterAmount`     | Value's length must be between `min` and `max`                              | Please enter a minimum of `min` and a maximum of `max` characters      |
| `maxCharacterAmount`  | Value's length must be a maximum of `max` characters                        | Please enter a maximum of `max` characters                             |
| `minCharacterAmount`  | Value's length must be at least `min` characters long                       | Please enter a minimum of `min` characters                             |

---

### Public Methods

#### `isValid()`

Function to check if all fields in the form are valid. This doesn't re-validate fields, it just checks if there are any errors in the form from the previous validation done, but if some of the fields have not been validated, it's better to use the `validateForm` section.

**Returns**
`boolean`: `True` if all the fields are valid, `false` otherwise.

**Usage**

```js
if (myValidation.isValid()) {
  console.log('The form is valid');
} else {
  console.log('The form is invalid');
}
```

---

#### `validateForm(silently)`

This function forces all the fields to be validated. A flag can be passed to display errors or not.

**Parameters**

| Parameter  | Type      | Default | Description                                                                                               |
| ---------- | --------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `silently` | `boolean` | `true`  | _[Optional]_ If the value is true, error messages won't be displayed, false means they will be displayed. |

**Returns**
`boolean`: `True` if all the fields are valid, `false` otherwise.

**Usage**

```js
const isFormValid = myValidation.validateForm();
```

---

#### `isFieldValid(field, silently)`

This function forces a specific field to be validated. A flag can be passed to display errors or not.

**Parameters**

| Parameter  | Type         | Default | Description                                                                                               |
| ---------- | ------------ | ------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `field`    | `HTMLElement | string` |                                                                                                           | _[Required]_ The field to validate. Can be either an `HTMLElement` or a `string` with the name of the field. |
| `silently` | `boolean`    | `true`  | _[Optional]_ If the value is true, error messages won't be displayed, false means they will be displayed. |

**Returns**
`boolean`: `True` if the field is valid, `false` otherwise.

**Usage**

```js
const isFieldValid = myValidation.isFieldValid('myField');
```

---

#### `addMethod(name, validator, message)`

This function adds a new validation rule or modifies an existing one. If you pass a name that already exists, the function will overwrite the existing rule.

**Parameters**

| Parameter   | Type       | Description                                                                |
| ----------- | ---------- | -------------------------------------------------------------------------- |
| `name`      | `string`   | _[Required]_ The name of the validation rule.                              |
| `validator` | `Function` | _[Required]_ The function that validates the field.                        |
| `message`   | `string`   | _[Required]_ The message that will be displayed when the field is invalid. |

**Usage**

```js
myValidation.addMethod(
  'customRule2',
  (field) => field.value !== '',
  'This field cannot be empty'
);
```

---

#### `setFieldRules(fieldName, rules, messages)`

This function sets the validation rules for a specific field. If the field already has rules, they will be overwritten.

**Parameters**

| Parameter   | Type            | Description                                                                             |
| ----------- | --------------- | --------------------------------------------------------------------------------------- |
| `fieldName` | `string`        | _[Required]_ The name of the field.                                                     |
| `rules`     | `Array<string>` | _[Required]_ An array of strings, where each string is the name of the validation rule. |
| `messages`  | `Object`        | _[Required]_ An object that defines the custom messages for each validation rule.       |

**Usage**

```js
myValidation.setFieldRules('fieldName', ['customRule', 'customRule2'], {
  customRule: 'This is a custom error message for customRule',
  customRule2: 'This is a custom error message for customRule2',
});
```

---

#### `addFieldRule(fieldName, ruleName, message)`

This function adds a validation rule to a specific field. If the field already has the rule, it will be overwritten.

**Parameters**

| Parameter   | Type     | Description                                              |
| ----------- | -------- | -------------------------------------------------------- |
| `fieldName` | `string` | _[Required]_ The name of the field.                      |
| `ruleName`  | `string` | _[Required]_ The name of the validation rule.            |
| `message`   | `string` | _[Required]_ The custom message for the validation rule. |

**Usage**

```js
myValidation.addFieldRule(
  'fieldName',
  'customRule3',
  'This is a custom error message for customRule3'
);
```

---

#### `removeFieldRule(fieldName, ruleName)`

This function removes a validation rule from a specific field.

**Parameters**

| Parameter   | Type     | Description                                   |
| ----------- | -------- | --------------------------------------------- |
| `fieldName` | `string` | _[Required]_ The name of the field.           |
| `ruleName`  | `string` | _[Required]_ The name of the validation rule. |

**Returns**
`boolean`: `True` if the rule was removed successfully, `false` otherwise.

**Usage**

```js
myValidation.removeFieldRule('fieldName', 'customRule3');
```

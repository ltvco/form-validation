# LTV Form-Validation

## Overview

The `FormValidation.js` is a JavaScript form validation class that provides a flexible and customizable way to handle form validations. The library provides a set of features to handle form validation, including:

- A constructor that initializes form validation with a form selector, configuration options, and optional custom validation rules.
- Functions to sanitize input and prevent Cross-Site Scripting (XSS) attacks.
- Customizable field validation rules, messages, and configurations.
- Predefined validation methods and the ability to add custom validation methods.
- Error handling and visual feedback for invalid fields.
- Support for form submission handling with validation.
- Manual validation of the entire form or specific fields.

**_Note:_** _This library is not a replacement for server-side validation. It is intended to be used as a client-side validation tool to provide a better user experience and reduce the number of requests to the server._

## Table of contents

- [How to use it](#how-to-use-it)
  - [1. Installation](#1-installation)
  - [2. Importing](#2-importing)
  - [3. Basic Configuration](#3-basic-configuration)
  - [4. Adding Custom Rules](#4-adding-custom-rules)
  - [5. Initialize the Validator](#5-initialize-the-validator)
- [Documentation](#documentation)
- [How to Contribute](#how-to-contribute)

---

## How to use it

### 1. Installation

Install the package via npm:

```bash
npm install @ltvco/form-validation
```

### 2. Importing

Import the Validation class into your project:

```js
import { Validation } from '@ltvco/form-validation';
```

### 3. Basic Configuration

Create a configuration object defining your form fields and validation rules. Here’s a simple example:

```js
const myConfig = {
  fields: {  // Configuration for each form field
    fieldName: {
      rules: ['rule1', 'rule2', 'rule3'], // Validation rules to add to the field
      inputContainer: '.error-placement-selector', // [Optional] Where to add the errorClass
      errorClass: '.custom-error',  // [Optional] Error class to add to the inputContainer element
      messages: {
        rule1: 'This is a custom error message for rule1',
        rule2: 'This is a custom error message for rule2',
        rule3: 'This is a custom error message for rule3',
      },
    },
    // Add other fields here...
  },
};
```

For a full list of configuration options, see the [Technical Documentation](docs/index.md).

### 4. Adding Custom Rules

You can define custom rules by passing them as the third argument when initializing:

```js
const customRules = {
  customRule: {
    validator: (field) => field.value.length > 5, // Custom validation function
    message: 'This field must have more than 5 characters', // Custom error message
  },
};
```

### 5. Initialize the Validator

Create a new Validation instance with your form selector, configuration, and optional custom rules:

```js
const myValidation = new Validation('#myForm', myConfig, customRules);
```

That’s it! Your form validation is now ready. For advanced usage and API methods, check the [Technical Documentation](docs/index.md).

---

## Documentation

Full technical documentation—including advanced configuration, custom rule management, error handling options, and public API methods—is available in the [Technical Documentation](docs/index.md) page.

If you're looking to extend functionality, troubleshoot, or understand how each part of the library works under the hood, that document is the best place to start.

---

## How to Contribute

We welcome contributions! If you'd like to report a bug, suggest a new feature, or submit improvements, please check out our [Contributing guide](CONTRIBUTING.md).

There you'll find information about:
- Setting up the development environment
- Branch Naming Best Practices

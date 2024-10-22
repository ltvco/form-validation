import validatorRules from './rules';
import {
  Config,
  Flag,
  FormValidation,
  Message,
  FieldConfig,
  Rules,
  ValidatorInput,
  RuleValidator,
  FormDataObject,
  MessageFunction,
  PreprocessedMessages,
  ParamConfig,
} from './types';
const WRITEABLE_INPUTS = [
  'text',
  'password',
  'textarea',
  'email',
  'number',
  'search',
  'tel',
  'url',
  'date',
  'month',
  'week',
  'time',
  'datetime',
  'datetime-local',
];

/** Validate Form Class **/
export class Validation implements FormValidation {
  readonly form: HTMLFormElement;

  private errors: Array<[ValidatorInput, string]> = [];
  private rules: Rules = {
    ...validatorRules,
  };
  private fieldsToValidate: Array<ValidatorInput> = [];
  private config: Config = {
    validationFlags: [
      'onSubmit',
      'onChange',
      'onKeyUpAfterChange',
    ] as Array<Flag>,
    submitCallback: this.defaultSubmit,
    invalidHandler: () => {
      /* Do nothing */
    },
    fields: {},
  };

  /**
   * Sets up all variables and configurations for the
   * validation to work on a form.
   * @param {HTMLFormElement | string} form Form element or selector that will be validated.
   * @param {Config} [config] Object containing fields to validate, which rules to apply and any other configurations needed.
   * @param {Rules} [rules] Object containing custom rules to apply to the validation.
   * @returns {Validation} An instance with the validation.
   */
  constructor(
    form: HTMLFormElement | string,
    config?: ParamConfig,
    rules?: Rules
  ) {
    if (!form) throw new Error('A valid form element or selector is required.');
    if (typeof form !== 'string' && !(form instanceof Node))
      throw new Error('Form must be a string or a HTML Element.');
    if (typeof form === 'string' && !document.querySelector(form))
      throw new Error(`Form selector "${form}" not found.`);

    this.form =
      typeof form === 'string'
        ? (document.querySelector(form) as HTMLFormElement)
        : form;

    if (config) {
      if (typeof config !== 'object')
        throw new Error('Config must be an object.');
      this.config = {
        ...this.config,
        ...this.cloneDeep(config),
      } as Config;
    }

    if (rules && Object.keys(rules).length) {
      if (typeof rules !== 'object')
        throw new Error('Rules must be an object.');
      Object.keys(rules).forEach((rule) => {
        if (typeof rules[rule]?.validator !== 'function')
          throw new Error(`${rule} must be a function.`);
        if (typeof rules[rule]?.message !== 'string')
          throw new Error(`${rule} message must be a string.`);

        this.addMethod(rule, rules[rule].validator, rules[rule].message);
      });
    }

    // We need to add this to avoid the default validation that browsers provide.
    this.form.setAttribute('novalidate', '');

    this.setupConfig();
    this.form.addEventListener('submit', this.onSubmit.bind(this));
  }

  /*********************** Private Methods ***********************/

  /**
   * Normalizes a field's value.
   * @param {Event} event - Event object sent by the 'keyup' trigger.
   */
  private normalize(event: Event) {
    const field = event.currentTarget as ValidatorInput;
    const { normalizer } = this.config.fields[field.name];

    if (normalizer && typeof normalizer === 'function') {
      const normalizedValue = normalizer(field.value, field, this.form);

      // Only change the value if it's different from the normalized one.
      if (normalizedValue && normalizedValue !== field.value) {
        field.value = normalizedValue;
      }
    }
  }

  /**
   * Sanitizes a string to prevent XSS (Cross-Site Scripting) and HTML injection attacks.
   * @param {string} inputString - The input string to sanitize.
   * @return {string} - The sanitized version of the input.
   */
  private sanitizeInput(inputString: string): string {
    // Create a div element.
    const div = document.createElement('div');

    // Set the div's text content to the input string.
    // This will not interpret the input as HTML.
    div.textContent = inputString;

    // Return the innerHTML of the div, which will contain the sanitized version of the input.
    return div.innerHTML;
  }

  /**
   * Creates an error element and adds it to the field.
   * @param {ValidatorInput} field - Field to add the error to.
   * @param {FieldConfig} fieldConfig - Field configuration.
   */
  private createError(field: ValidatorInput, fieldConfig: FieldConfig) {
    const { errorPlacement, inputContainer, errorTag } = fieldConfig;
    const errorElement = document.createElement(errorTag || 'p');
    errorElement.className = `${field.name.replace(/\[/g, '-').replace(/\]/g, '')}-error-element error`;

    if (errorPlacement) {
      if (typeof errorPlacement !== 'function') {
        throw new Error('Error placement must be a function.');
      }

      const inputContainerElement =
        typeof inputContainer === 'string'
          ? (field.closest(inputContainer) as HTMLElement)
          : inputContainer || (field.parentElement as HTMLElement);
      errorPlacement(field, errorElement, inputContainerElement, this.form);
    } else {
      const errorTarget = field.parentElement as HTMLElement;
      errorTarget.appendChild(errorElement);
    }
  }

  /**
   * Checks if a field is currently visible or not.
   * @param {Element} field - Field to validate.
   * @return {boolean} Flag to know if the field is visible or not.
   */
  private isFieldVisible(field: ValidatorInput): boolean {
    return (
      !!(
        field.offsetWidth ||
        field.offsetHeight ||
        field.getClientRects().length
      ) &&
      window.getComputedStyle(field as ValidatorInput).visibility !== 'hidden'
    );
  }

  /**
   * Handle adding the error to the field and displaying it.
   * @param {ValidatorInput} field - Field where the error was found
   * @param {string} message - Error message
   * @param {FieldConfig} fieldConfig - Field configuration
   */
  private onError(
    field: ValidatorInput,
    message: string,
    fieldConfig: FieldConfig
  ) {
    this.errors.push([field, message]);
    const {
      optional,
      errorClass,
      inputContainer,
      validClass,
      fieldErrorHandler,
      fieldHandlerKeepFunctionality,
    } = fieldConfig;
    // If there's a custom fieldErrorHandler function, use it.
    if (fieldErrorHandler && !fieldHandlerKeepFunctionality) {
      if (typeof fieldErrorHandler !== 'function')
        throw new Error('"fieldErrorHandler" must be a function.');
      fieldErrorHandler(field, message, fieldConfig, this.form);
    } else {
      // If there's no error element yet, create it.
      if (
        !this.form.querySelector(
          `.${field.name.replace(/\[/g, '-').replace(/\]/g, '')}-error-element`
        )
      )
        this.createError(field, fieldConfig);

      const inputParent =
        typeof inputContainer === 'string'
          ? (field.closest(inputContainer) as HTMLElement)
          : inputContainer || (field.parentElement as HTMLElement);

      if ((optional && field.value) || !optional) {
        const errorElement = this.form.querySelector(
          `.${field.name.replace(/\[/g, '-').replace(/\]/g, '')}-error-element`
        ) as HTMLElement;

        errorElement.innerHTML = message;
        errorElement.style.display = 'block';

        inputParent.classList.add(errorClass || 'error');
        field.classList.add('error');
      }

      // Remove Valid Class if present
      inputParent.classList.remove(validClass || 'valid');
      field.classList.remove('valid');

      if (fieldErrorHandler && fieldHandlerKeepFunctionality) {
        if (typeof fieldErrorHandler !== 'function')
          throw new Error('"fieldErrorHandler" must be a function.');
        fieldErrorHandler(field, message, fieldConfig, this.form);
      }
    }
  }

  /**
   * Handle removing the error from the field and hiding it.
   * @param {ValidatorInput} field - Field where the error was found
   * @param {FieldConfig} fieldConfig - Field configuration
   */
  private onValid(field: ValidatorInput, fieldConfig: FieldConfig) {
    const {
      optional,
      errorClass,
      inputContainer,
      validClass,
      fieldValidHandler,
      fieldHandlerKeepFunctionality,
    } = fieldConfig;
    this.errors = this.errors.filter(([errorField]) => errorField !== field);

    // If there's a custom fieldValidHandler function, use it.
    if (fieldValidHandler && !fieldHandlerKeepFunctionality) {
      if (typeof fieldValidHandler !== 'function')
        throw new Error('"fieldValidHandler" must be a function.');
      fieldValidHandler(field, fieldConfig, this.form);
    } else {
      const inputParent =
        typeof inputContainer === 'string'
          ? (field.closest(inputContainer) as HTMLElement)
          : inputContainer || (field.parentElement as HTMLElement);
      const errorElement = this.form.querySelector(
        `.${field.name.replace(/\[/g, '-').replace(/\]/g, '')}-error-element`
      ) as HTMLElement;

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

      if (fieldValidHandler && fieldHandlerKeepFunctionality) {
        if (typeof fieldValidHandler !== 'function')
          throw new Error('"fieldValidHandler" must be a function.');
        fieldValidHandler(field, fieldConfig, this.form);
      }
    }
  }

  /**
   * Validates a field and adds error messages found to fields.
   * @param {ValidatorInput} field Element to validate.
   * @param {Boolean} silently If the flag is true, the method will not add the error to the field.
   * @returns {[ ValidatorInput, string ] | null} - Returns an array with the field and the error message or null if the field has no errors.
   */
  private validateField(
    field: ValidatorInput,
    silently = false
  ): [ValidatorInput, string] | null {
    const fieldConfig = this.config.fields[field.name];
    const { rules, messages, optional } = fieldConfig;

    if (optional && !field.value) {
      this.onValid(field, this.config.fields[field.name]);
      return null;
    }

    if (rules.length) {
      const errorRule = rules.find((rule) => {
        const value = field.value.trim();
        const hasParams = rule.split('(').length > 1;

        if (hasParams) {
          const ruleName = rule.split('(')[0];
          const params = rule.split('(')[1].split(')')[0].split(',');

          return !this.rules[ruleName].validator(field, value, ...params);
        }

        return !this.rules[rule].validator(field, value);
      });

      if (errorRule) {
        const errorMessage = messages[errorRule];

        if (!silently)
          this.onError(field, errorMessage, this.config.fields[field.name]);
        return [field, errorMessage];
      } else {
        this.onValid(field, this.config.fields[field.name]);
      }
    }

    // Since there are no rules, the field is considered valid.
    return null;
  }

  /**
   * Validates all visible fields.
   * @param {boolean} [silently] - If true, it won't show the error messages.
   * @returns {Array<[ValidatorInput, string]>} - Returns an array with the field and the error message or empty array if the field has no errors.
   */
  private validateAllVisibleFields(silently = false) {
    const errors: Array<[ValidatorInput, string]> = [];
    const errorSelector: Array<string> = [];

    this.fieldsToValidate.filter(this.isFieldVisible).map((field) => {
      const error = this.validateField(field, silently);
      const hasOnKeyUp = field.validator.hasOnKeyUp;

      if (error) {
        errors.push(error);
        errorSelector.push(`[name="${field.name}"]`);
      }

      // Add "keyup" event only if field doesn't have it yet.
      if (
        !hasOnKeyUp &&
        this.config.validationFlags.includes('onKeyUpAfterChange') &&
        WRITEABLE_INPUTS.includes(field.type)
      ) {
        field.addEventListener('keyup', this.onChange.bind(this));
        field.validator.hasOnKeyUp = true;
      }
    });

    return { errors, errorSelector };
  }

  /**
   * Makes sure all inputs are valid before submitting.
   * @param {Event} event Event object sent by the 'submit' trigger
   */
  private onSubmit(event: Event) {
    event.preventDefault();

    const silently = !this.config.validationFlags.includes('onSubmit');
    const { errors, errorSelector } = this.validateAllVisibleFields(silently);

    if (errors.length) {
      const firstField = this.form.querySelector(
        errorSelector.join(',')
      ) as HTMLElement;
      firstField.focus();

      this.config.invalidHandler(errors, this.form);
    } else {
      this.onSubmitSuccess();
    }
  }

  /**
   * Calls the callback function when form is submitted and valid.
   */
  private onSubmitSuccess() {
    const data: FormDataObject = {};
    const formData = new FormData(this.form);

    for (const key of formData.keys()) {
      const field = this.form.querySelector(
        `[name="${key}"]`
      ) as ValidatorInput;

      if (this.isFieldVisible(field))
        data[key] = this.sanitizeInput(
          formData.get(key)?.toString().trim() as string
        );
    }

    this.config.submitCallback(data, this.form);
  }

  /**
   * If no submit callback is provided, this method will be called. It will
   * sanitize all inputs and submit the form.
   */
  private defaultSubmit() {
    this.fieldsToValidate.filter(this.isFieldVisible).map((field) => {
      field.value = this.sanitizeInput(field.value);
    });

    this.form.submit();
  }

  /**
   * Validates field on change.
   * @param {Event} event - Event object sent by the 'change' trigger.
   */
  private onChange(event: Event) {
    const field = event.currentTarget as ValidatorInput;
    const hasOnKeyUp = field.validator.hasOnKeyUp;
    const { validationFlags } = this.config;

    this.validateField(field);

    if (
      !hasOnKeyUp &&
      validationFlags.includes('onKeyUpAfterChange') &&
      WRITEABLE_INPUTS.includes(field.type)
    ) {
      field.addEventListener('keyup', this.onChange.bind(this));
      field.validator.hasOnKeyUp = true;
    }
  }

  /**
   * Sets up the message function to be called with the field and the parameters.
   * @param {ValidatorInput} field - Field to validate.
   * @param {string} rule - Rule to be validated.
   * @param {MessageFunction} message - Message function to be called.
   * @param {string[]} args - Parameters to be passed to the message function.
   * @returns {string} - The message returned by the message function.
   */
  private setupFunctionMessage(
    field: ValidatorInput,
    rule: string,
    message: MessageFunction
  ): string {
    const hasParams = rule.includes('(');
    const params = hasParams ? rule.split('(')[1].split(')')[0].split(',') : [];

    // If rule has parameters, call the message function with them.
    return hasParams ? message(field, ...params) : message(field);
  }

  /**
   * Sets up the configuration for a field.
   * @param {string} fieldName - Name of the field to add config to
   * @param {Array<string>} rules - Array of rules to add to the field
   * @param {ProcessedMessages} [messages] - Object with custom messages for each rule
   */
  private setupFieldConfig(
    fieldName: string,
    rules: FieldConfig['rules'],
    messages?: FieldConfig['messages']
  ) {
    const field = this.form.querySelector(
      `[name="${fieldName}"]`
    ) as ValidatorInput;
    if (!field) throw new Error(`Field ${fieldName} was not found in the form`);
    if (!rules) throw new Error('Rules cannot be empty');
    if (!Array.isArray(rules)) throw new Error('Rules must be an array');
    if (messages && typeof messages !== 'object')
      throw new Error('Messages must be an object');

    this.config.fields[fieldName] = {
      ...{
        rules,
        messages: messages || {},
        inputContainer: field.parentElement as HTMLElement,
        errorPlacement: (element, errorElement) =>
          element.parentElement!.appendChild(errorElement),
        optional: !rules.includes('required'),
      },
      ...this.config.fields[fieldName],
    };

    if (typeof this.config.fields[fieldName].inputContainer === 'string') {
      const inputContainerElement = field.closest(
        this.config.fields[fieldName].inputContainer as string
      ) as HTMLElement;
      if (!inputContainerElement)
        throw new Error(
          `Input container "${inputContainerElement}" not found.`
        );
      this.config.fields[fieldName].inputContainer = inputContainerElement;
    }

    this.setFieldRules(fieldName, rules, messages);
    field.validator = {
      hasOnKeyUp: false,
    };

    const { inputContainer, optional } = this.config.fields[fieldName];
    if (inputContainer && typeof inputContainer === 'string') {
      const inputContainerElement = field.closest(
        inputContainer
      ) as unknown as HTMLElement;

      if (!inputContainerElement)
        throw new Error(
          `Input container "${inputContainerElement}" not found.`
        );
      this.config.fields[fieldName].inputContainer = inputContainerElement;
    } else if (
      inputContainer &&
      inputContainer instanceof HTMLElement &&
      !inputContainer.contains(field)
    ) {
      throw new Error('Input container must contain the field.');
    }

    if (!optional && !rules.includes('required'))
      this.addFieldRule(fieldName, 'required');
  }

  /**
   * Sets up all initial configuration by importing the rules
   * and adding custom messages to the rules in case there are any.
   */
  private setupConfig() {
    // Each key in the config is a field's name
    Object.keys(this.config.fields).forEach((fieldName) => {
      const { rules, messages } = this.config.fields[fieldName];
      this.setupFieldConfig(fieldName, rules, messages);
    });

    // If there were any other inputs inside the form with the "required" attribute,
    // add the "required" rule to them.
    const requiredFields = [
      ...(this.form.querySelectorAll(
        '[required]'
      ) as NodeListOf<ValidatorInput>),
    ]
      .map((field: ValidatorInput) => field.name)
      .filter((name) => !this.config.fields[name]);
    requiredFields.forEach((fieldName) => {
      this.setupFieldConfig(fieldName, ['required']);
    });
  }

  /*********************** Public Methods ***********************/

  /**
   * Checks if all fields are valid.
   * @returns True if all fields are valid, false otherwise.
   */
  isValid(): boolean {
    return this.errors.length === 0;
  }

  /**
   * Manually validates the entire form
   * @param {boolean} [silently] - If true, it won't call the invalidHandler callback.
   * @returns True if all fields are valid, false otherwise.
   */
  validateForm(silently = true): boolean {
    this.validateAllVisibleFields(silently);
    return this.isValid();
  }

  /**
   * Checks if a field is valid.
   * @param {ValidatorInput | string} field - Name of the field or the field itself.
   * @param {boolean} [silently] - If true, it won't show the error messages.
   * @returns True if the field is valid, false otherwise.
   */
  isFieldValid(field: ValidatorInput | string, silently = true): boolean {
    if (!field) throw new Error('Field cannot be empty');

    if (typeof field === 'string')
      field = this.form.querySelector(`[name="${field}"]`) as ValidatorInput;
    if (!field) throw new Error(`Field "${field}" does not exist`);
    else if (!(field instanceof Node))
      throw new Error('Field must be a string or an HTML element');

    if (!this.fieldsToValidate.includes(field))
      throw new Error(`Field "${field.name}" is not being validated`);

    return !this.validateField(field, silently);
  }

  /**
   * Adds a new rule to the validator, or modifies an existing one.
   * @param {string} name - Name of the rule
   * @param {RuleValidator} [validator] - Function that validates the field
   * @param {Message} [message] - Message to be displayed when the field is invalid
   */
  addMethod(name: string, validator?: RuleValidator, message?: Message) {
    if (!name || typeof name !== 'string')
      throw new Error('Name must be a string');
    if (this.rules[name]) {
      const { validator: currentValidator, message: currentMessage } =
        this.rules[name];
      this.rules[name] = {
        validator: validator || currentValidator,
        message: message || currentMessage,
      };
    } else {
      if (!validator) throw new Error('Validator cannot be empty');
      if (!message) throw new Error('Message cannot be empty');
      if (typeof validator !== 'function')
        throw new Error('Validator must be a function');
      if (typeof message !== 'function' && typeof message !== 'string')
        throw new Error(
          'Message must be a string or a function that resolves to a string'
        );

      this.rules[name] = { validator, message };
    }
  }

  /**
   * Set the rules of a field.
   * @param {string} fieldName - Name of the field to add rules to
   * @param {Array<string>} [rules] - Array of rules to add to the field
   * @param {Messages} [messages] - Object with custom messages for each rule
   */
  setFieldRules(
    fieldName: string,
    rules?: Array<string>,
    messages?: PreprocessedMessages
  ) {
    const field = this.form.querySelector(
      `[name="${fieldName}"]`
    ) as ValidatorInput;
    if (!field) throw new Error(`Field ${fieldName} was not found in the form`);

    rules?.forEach((rule) =>
      this.addFieldRule(fieldName, rule, messages?.[rule])
    );
  }

  /**
   * Adds a rule to a field.
   * @param {string} fieldName - Name of the field to add rule to
   * @param {string} ruleName - Name of the rule to add to the field
   * @param {string} [message] - Custom message for the rule
   */
  addFieldRule(fieldName: string, ruleName: string, message?: Message) {
    const field = this.form.querySelector(
      `[name="${fieldName}"]`
    ) as ValidatorInput;
    if (!field) throw new Error(`Field ${fieldName} does not exist`);

    if (!this.config.fields[fieldName])
      this.setupFieldConfig(fieldName, [ruleName]);
    if (ruleName === 'required') this.config.fields[fieldName].optional = false;

    const { rules, normalizer } = this.config.fields[fieldName];
    const ruleNoParams = ruleName.includes('(')
      ? ruleName.split('(')[0]
      : ruleName;

    if (!this.rules[ruleNoParams])
      throw new Error(`Rule ${ruleNoParams} does not exist`);
    else {
      if (!rules.includes(ruleName))
        this.config.fields[fieldName].rules = [...rules, ruleName];

      let ruleMessage = message || this.rules[ruleNoParams].message;
      if (typeof ruleMessage === 'function')
        ruleMessage = this.setupFunctionMessage(field, ruleName, ruleMessage);
      this.config.fields[fieldName].messages[ruleName] = ruleMessage;
    }

    if (!this.fieldsToValidate.includes(field)) {
      if (normalizer && typeof normalizer !== 'function')
        throw new Error('Normalizer must be a function.');
      this.fieldsToValidate.push(field);

      const { validationFlags } = this.config;
      const onChange =
        validationFlags.includes('onChange') ||
        validationFlags.includes('onKeyUpAfterChange');
      const onKeyUp = validationFlags.includes('onKeyUp');

      if (WRITEABLE_INPUTS.includes(field.type)) {
        if (normalizer && typeof normalizer === 'function') {
          field.addEventListener('keyup', this.normalize.bind(this));
        }

        if (onKeyUp) {
          field.addEventListener('keyup', this.onChange.bind(this));
          field.validator = { hasOnKeyUp: true };
        } else {
          field.validator = { hasOnKeyUp: false };
        }
      } else {
        // Only add "change" event if the field is not a writeable input.
        if (normalizer && typeof normalizer === 'function') {
          field.addEventListener('change', this.normalize.bind(this));
        }
      }

      onChange && field.addEventListener('change', this.onChange.bind(this));
    }
  }

  /**
   * Removes a rule from a field.
   * @param {string} fieldName - Name of the field to remove rule from
   * @param {string} ruleName - Name of the rule to remove from the field
   */
  removeFieldRule(fieldName: string, ruleName: string) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);

    if (!field) throw new Error(`Field ${fieldName} does not exist`);
    const { rules, messages } = this.config.fields[fieldName];

    if (rules.length && rules.includes(ruleName)) {
      const newRules = rules.filter((rule) => rule !== ruleName);
      const newMessages = { ...messages };
      delete newMessages[ruleName];

      this.config.fields[fieldName].rules = newRules;
      this.config.fields[fieldName].messages = newMessages;

      if (ruleName === 'required')
        this.config.fields[fieldName].optional = true;
    }
  }

  /**
   * Adds a configuration to a field.
   * @param {string} fieldName - Name of the field to add config to
   * @param {FieldConfig} config - Object containing the configuration for the field
   */
  addFieldConfig(fieldName: string, config: FieldConfig) {
    const field = this.form.querySelector(`[name="${fieldName}"]`);

    if (!field) throw new Error(`Field ${fieldName} does not exist`);
    if (!config) throw new Error('Config cannot be empty');
    if (typeof config !== 'object') throw new Error('Config must be an object');

    this.config.fields[fieldName] = { ...config };
    this.setupFieldConfig(fieldName, config.rules, config.messages);
  }

  /**
   * Clones an object deeply.
   * We need this method to clone the configuration object and allow us to use the same configuration object in different instances.
   * @param {T} obj - Object to clone.
   * @returns {T} - Cloned object.
   */
  cloneDeep<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      const copy: any = [];
      obj.forEach((elem, index) => {
        copy[index] = this.cloneDeep(elem);
      });
      return copy;
    }

    const copy: any = {};
    Object.keys(obj).forEach((key) => {
      copy[key] = this.cloneDeep((obj as any)[key]);
    });
    return copy;
  }
}

export type InputContainer = string | HTMLElement;
export type MessageFunction = (
  element: ValidatorInput,
  ...args: string[]
) => string;
export type Message = string | MessageFunction;
export type ErrorPlacement = (
  element: ValidatorInput,
  errorElement: HTMLElement,
  inputContainer?: HTMLElement,
  form?: HTMLFormElement
) => void;
export type RuleValidator = (
  element: ValidatorInput,
  value: string,
  ...args: string[]
) => boolean;
export type Flag = 'onSubmit' | 'onChange' | 'onKeyUpAfterChange' | 'onKeyUp';
export type FormDataObject = { [key: string]: string };

export interface ValidatorInput extends HTMLInputElement {
  validator: {
    hasOnKeyUp: boolean;
  };
}

export interface Rule {
  validator: RuleValidator;
  message: Message;
}

export interface Rules {
  [key: string]: Rule;
}

export interface PreprocessedMessages {
  [key: string]: Message;
}

export interface ProcessedMessages {
  [key: string]: string;
}

export interface FieldConfig {
  rules: Array<string>;
  messages: PreprocessedMessages;
  optional: boolean;
  inputContainer: InputContainer;
  errorPlacement: ErrorPlacement;
  errorClass?: string;
  errorTag?: string;
  validClass?: string;
  validateWhenHidden?: boolean;
  normalizer?: (
    value: string,
    element?: ValidatorInput,
    form?: HTMLFormElement
  ) => string;
  fieldErrorHandler?: (
    field: ValidatorInput,
    message: Message,
    fieldConfig?: FieldConfig,
    form?: HTMLFormElement
  ) => void;
  fieldValidHandler?: (
    field: ValidatorInput,
    fieldConfig?: FieldConfig,
    form?: HTMLFormElement
  ) => void;
  fieldHandlerKeepFunctionality?: boolean;
}

export interface Config {
  fields: {
    [key: string]: FieldConfig;
  };
  validationFlags: Array<Flag>;
  submitCallback?: ((
    formDataObj: { [key: string]: string },
    form?: HTMLFormElement
  ) => void);
  invalidHandler: (
    errors: Array<[ValidatorInput, Message] | boolean>,
    form?: HTMLFormElement
  ) => void;
}

export type ParamConfig = Omit<Partial<Config>, 'fields'> & {
  fields: {
    [key: string]: Partial<FieldConfig>;
  };
};

export interface FormValidation {
  isValid: () => boolean;
  validateForm: (silently?: boolean) => boolean;
  isFieldValid: (field: ValidatorInput | string, silently?: boolean) => boolean;
  addMethod: (name: string, validator: RuleValidator, message: Message) => void;
  setFieldRules: (
    fieldName: string,
    rules?: Array<string>,
    messages?: PreprocessedMessages
  ) => void;
  addFieldRule: (fieldName: string, ruleName: string, message?: Message) => void;
  removeFieldRule: (fieldName: string, ruleName: string) => void;
}

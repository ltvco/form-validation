import { Rules, ValidatorInput } from './types';

const rules: Rules = {
  required: {
    validator: function (element: ValidatorInput, value: string) {
      const elements = element.closest('form')?.elements.namedItem(element.name) as HTMLInputElement | RadioNodeList;
      switch (element.type) {
        case 'radio':
          return elements && !!elements.value;
        case 'checkbox':
          return element.checked;
        default:
          return value !== '' || value.length !== 0;
      }
    },
    message: 'This field is required',
  },
  notEmail: {
    validator: function (element: ValidatorInput, value: string) {
      return !/^[ a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{0,61}[ a-zA-Z0-9])?(?:\.[ a-zA-Z0-9](?:[ a-zA-Z0-9-]{0,61}[ a-zA-Z0-9])?)*$/.test(value);
    },
    message: 'Email addresses are not searchable here',
  },
  validEmail: {
    validator: function (element: ValidatorInput, value: string) {
      const emailRegex = /^([^*@\s]+)@((?:[-a-z0-9]+\.)+[a-z]{2,})$/;
      return emailRegex.test(value) && value.length <= 80;
    },
    message: 'Please enter a valid email address in the format of example@test.com',
  },
  noSpecialCharacters: {
    validator: function (element: ValidatorInput, value: string) {
      return !/[$-/:-?{-~!"^_`[\]]/.test(value);
    },
    message: 'Special characters are not allowed',
  },
  noEmptySpacesOnly: {
    validator: function (element: ValidatorInput, value: string) {
      return value.trim() !== '';
    },
    message: 'Empty spaces are not allowed',
  },
  emptyOrLetters: {
    validator: function (element: ValidatorInput, value: string) {
      return (value !== '' && /[a-z]+/i.test(value)) || value === '';
    },
    message: 'Alphabetic characters required',
  },
  onlyAlphanumeric: {
    validator: function (element: ValidatorInput, value: string) {
      return /^[a-zA-Z0-9]*$/.test(value);
    },
    message: 'Only alphanumeric values are allowed',
  },
  phoneUS: {
    validator: function (element: ValidatorInput, value: string) {
      const phoneNumber = value.replace(/\s+/g, '');
      const phoneRegex = /^(\+?1-?)?(\([2-9]([02-9]\d|1[02-9])\)|[2-9]([02-9]\d|1[02-9]))-?[2-9]([02-9]\d|1[02-9])-?\d{4}$/;

      return phoneNumber.length > 9 && !!phoneNumber.match(phoneRegex);
    },
    message: 'Please specify a valid phone number',
  },
  numbersOnly: {
    validator: function (element: ValidatorInput, value: string) {
      return /^[0-9]*$/.test(value);
    },
    message: 'Only numeric values are allowed',
  },
  lettersOnly: {
    validator: function (element: ValidatorInput, value: string) {
      return /^[a-zA-Z]*$/.test(value);
    },
    message: 'Only alphabetic characters are allowed',
  },
  characterAmount: {
    validator: function (element: ValidatorInput, value: string, ...args: string[]) {
      const [min, max] = args;
      return value.length >= parseInt(min) && value.length <= parseInt(max);
    },
    message: function (element: ValidatorInput, ...args: string[]) {
      const [min, max] = args;
      return `Please enter a minimum of ${min} and a maximum of ${max} characters`;
    },
  },
  maxCharacterAmount: {
    validator: function (element: ValidatorInput, value: string, ...args: string[]) {
      const [max] = args;
      return value.length <= parseInt(max);
    },
    message: function (element: ValidatorInput, ...args: string[]) {
      const [max] = args;
      return `Please enter a maximum of ${max} characters`;
    },
  },
  minCharacterAmount: {
    validator: function (element: ValidatorInput, value: string, ...args: string[]) {
      const [min] = args;
      return value.length >= parseInt(min);
    },
    message: function (element: ValidatorInput, ...args: string[]) {
      const [min] = args;
      return `Please enter a minimum of ${min} characters`;
    },
  },
};

export default rules;

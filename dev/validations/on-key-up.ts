import { Validation } from 'validation';

export default function init() {
  const onKeyUpForm = document.querySelector('[data-value="on-key-up"] form');

  if (!onKeyUpForm) {
    return;
  }

  new Validation(onKeyUpForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    validationFlags: ['onKeyUp'],
    fields: {
      vin: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
      },
    },
  });
}

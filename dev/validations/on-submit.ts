import { Validation } from 'validation';

export default function init() {
  const onSubmitForm = document.querySelector('[data-value="on-submit"] form');

  if (!onSubmitForm) {
    return;
  }

  new Validation(onSubmitForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    validationFlags: ['onSubmit'],
    fields: {
      vin: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
      },
      tos: {
        rules: ['required'],
      },
    },
  });
}

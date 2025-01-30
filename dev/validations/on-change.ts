import { Validation } from 'validation';

export default function init() {
  const onChangeForm = document.querySelector('[data-value="on-change"] form');

  if (!onChangeForm) {
    return;
  }

  new Validation(onChangeForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    validationFlags: ['onChange'],
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

import { Validation } from 'validation';

export default function init() {
  const onKeyUpAfterChangeForm = document.querySelector(
    '[data-value="on-key-up-after-change"] form'
  );

  new Validation(onKeyUpAfterChangeForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    validationFlags: ['onKeyUpAfterChange'],
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

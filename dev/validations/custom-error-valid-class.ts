import { Validation } from 'validation';

export default function customErrorValidClass() {
  const customErrorClassForm = document.querySelector(
    '[data-value="custom-error-valid-class"] form'
  );

  if (!customErrorClassForm) {
    return;
  }

  new Validation(customErrorClassForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    fields: {
      vin: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
        errorClass: 'custom-error-class',
        validClass: 'custom-valid-class',
      },
    },
  });
}

import { Validation } from 'validation';

export default function init() {
  const normalizerForm = document.querySelector(
    '[data-value="normalizer"] form'
  );

  if (!normalizerForm) {
    return;
  }

  new Validation(normalizerForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    validationFlags: ['onSubmit', 'onKeyUp'],
    fields: {
      firstName: {
        rules: ['required', 'lettersOnly'],
        normalizer: function (value) {
          return value.trim();
        },
      },
      lastName: {
        rules: ['required', 'lettersOnly'],
        normalizer: function (value) {
          return value.trim();
        },
      },
    },
  });
}

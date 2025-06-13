import { Validation } from 'validation';

export default function init() {
  const invalidHandlerForm = document.querySelector(
    '[data-value="invalid-handler"] form'
  );

  if (!invalidHandlerForm) {
    return;
  }

  new Validation(invalidHandlerForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: (errors) => {
      const errorSubtitle = document.querySelector(
        '[data-value="invalid-handler"] .error-subtitle'
      );
      errorSubtitle?.classList.remove('hidden');
      console.log(errors);
    },
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

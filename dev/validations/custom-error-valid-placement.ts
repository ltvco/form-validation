import { Validation } from 'validation';

export default function customErrorValidClass() {
  const customErrorPlacementForm = document.querySelector(
    '[data-value="custom-error-valid-placement"] form'
  );

  if (!customErrorPlacementForm) {
    return;
  }

  new Validation(customErrorPlacementForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    fields: {
      vin: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
        errorPlacement: (element, error) => {
          const parent = element.closest('.input-container-variant');
          if (parent) {
            parent.appendChild(error);
          } else {
            element.parentElement?.after(error);
          }
        },
      },
    },
  });
}

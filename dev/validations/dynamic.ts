import { Validation } from 'validation';

export default function init() {
  const dynamicValidationForm: HTMLFormElement | null = document.querySelector(
    '[data-value="dynamic-validation"] form'
  );

  if (!dynamicValidationForm) {
    return;
  }

  new Validation(dynamicValidationForm, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    fields: {
      shippingAddress1: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
      },
      shippingAddress2: {
        rules: ['noSpecialCharacters'],
      },
      shippingCity: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
      },
      billingAddress1: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
      },
      billingAddress2: {
        rules: ['noSpecialCharacters'],
      },
      billingCity: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
      },
    },
  });

  const sameAsShipping1 = dynamicValidationForm.querySelector(
    '.same-as-shipping-fieldset'
  );
  const sameAsShippingCheckbox1 = dynamicValidationForm.querySelector(
    '.same-as-shipping-checkbox'
  );
  sameAsShippingCheckbox1?.addEventListener('change', (e) => {
    (e.currentTarget as HTMLInputElement).checked
      ? sameAsShipping1?.classList.add('hidden')
      : sameAsShipping1?.classList.remove('hidden');
  });
}

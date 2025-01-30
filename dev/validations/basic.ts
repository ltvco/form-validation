import { Validation } from 'validation';

export default function basicForm() {
  const form = document.querySelector(
    '[data-value="basic"] form'
  ) as HTMLFormElement;

  new Validation(form, {
    fields: {
      name: {
        rules: ['required', 'notEmail'],
      },
      email: {
        optional: true,
        rules: ['validEmail'],
      },
      password: {
        rules: ['required', 'minCharacterAmount(8)'],
      },
    },
    submitCallback(formDataObj) {
      console.log(formDataObj);
    },
  });
}

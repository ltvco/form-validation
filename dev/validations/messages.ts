import { Validation } from 'validation';

export default function init() {
  const messagesForm = document.querySelector('[data-value="messages"] form');

  if (!messagesForm) {
    return;
  }

  new Validation(messagesForm as HTMLFormElement, {
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
    fields: {
      vin: {
        rules: ['required', 'noSpecialCharacters', 'notEmail'],
        messages: {
          required: function (field) {
            return `The ${field.name.toUpperCase()} field is required.`;
          },
        },
      },
      tos: {
        rules: ['required'],
        messages: {
          required: function (field) {
            return `You must agree to the ${field.name.toUpperCase()}.`;
          },
        },
      },
    },
  });
}

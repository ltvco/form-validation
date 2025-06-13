import type { ValidatorInput, Message } from 'validation/types';
import { Validation } from 'validation';

let fieldHandlersValidation: Validation;

function fieldErrorHandler(field: ValidatorInput, message: Message) {
  const errorTarget = field.parentElement!;
  const button: HTMLButtonElement | null = document.querySelector(
    '[data-value="field-handlers"] button'
  );

  let errorElement: HTMLParagraphElement | null =
    errorTarget.querySelector('p.error');

  // If there's no error element yet, create it.
  if (!errorElement) {
    errorElement = document.createElement('p') as HTMLParagraphElement;

    errorElement.className = 'error hidden';
    errorTarget?.appendChild(errorElement);
  }

  errorElement.innerText = message as string;
  errorElement.classList.remove('hidden');

  errorTarget.classList.add('error');

  // Disable the button if there are any errors.
  button && (button.disabled = true);
}

function fieldValidHandler(field: ValidatorInput) {
  const errorTarget = field.parentElement!;
  const currentError = errorTarget.querySelector('p.error');
  const button: HTMLButtonElement | null = document.querySelector(
    '[data-value="field-handlers"] button'
  );

  errorTarget.classList.remove('error');
  currentError && currentError.classList.add('hidden');

  // Disable the button if there are any errors.
  fieldHandlersValidation.isValid() && button?.removeAttribute('disabled');
}

export default function init() {
  const fieldHandlersForm = document.querySelector(
    '[data-value="field-handlers"] form'
  );
  fieldHandlersValidation = new Validation(
    fieldHandlersForm as HTMLFormElement,
    {
      submitCallback: function (formObject) {
        console.log(formObject);
      },
      invalidHandler: function (errors) {
        console.log(errors);
      },
      fields: {
        firstName: {
          rules: ['required', 'lettersOnly'],
          fieldErrorHandler,
          fieldValidHandler,
        },
        lastName: {
          rules: ['required', 'lettersOnly'],
          fieldErrorHandler,
          fieldValidHandler,
        },
      },
    }
  );
}

import { Validation } from 'validation';

export default function init() {
  const requiredValidationForm = document.querySelector(
    '[data-value="required-validation"] form'
  );
  requiredValidationForm &&
    new Validation(requiredValidationForm as HTMLFormElement);
}

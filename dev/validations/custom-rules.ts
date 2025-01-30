import { Validation } from 'validation';

export default function init() {
  const customRulesForm = document.querySelector(
    '[data-value="custom-rules"] form'
  );

  if (!customRulesForm) {
    return;
  }

  const customRules = new Validation(customRulesForm as HTMLFormElement, {
    fields: {
      accept: {
        rules: ['required'],
      },
    },
    submitCallback: function (formObject) {
      console.log(formObject);
    },
    invalidHandler: function (errors) {
      console.log(errors);
    },
  });
  customRules.addMethod(
    'typeAccept',
    function (element) {
      return element.value.trim().toLowerCase() === 'accept';
    },
    'Please enter the word "Accept".'
  );
  customRules.addFieldRule('accept', 'typeAccept');
}

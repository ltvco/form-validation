import './environment-setup/styles.scss';
import { Validation } from 'validation';
import customFormValidation from './validations/custom';
import * as FormSelector from './environment-setup/form-selector';
import * as ValidationSetup from './environment-setup/validation-setup';

function initCustomValidation() {
  customFormValidation(); // You can remove this line if you want to create your own form
}

function init() {
  initCustomValidation();

  FormSelector.init();
  ValidationSetup.init();
}

init();

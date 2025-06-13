import basicForm from 'dev/validations/basic';
import customErrorValidClassForm from 'dev/validations/custom-error-valid-class';
import customErrorValidPlacementForm from 'dev/validations/custom-error-valid-placement';
import invalidHandlerForm from 'dev/validations/invalid-handler';
import onKeyUpForm from 'dev/validations/on-key-up';
import onChangeForm from 'dev/validations/on-change';
import onKeyUpAfterChangeForm from 'dev/validations/on-key-up-after-change';
import onSubmitForm from 'dev/validations/on-submit';
import customRulesForm from 'dev/validations/custom-rules';
import fieldHandlersForm from 'dev/validations/field-handlers';
import messagesForm from 'dev/validations/messages';
import normalizerForm from 'dev/validations/normalizer';
import requiredForm from 'dev/validations/required';
import dynamicValidationForm from 'dev/validations/dynamic';

export function init() {
  basicForm();
  customErrorValidClassForm();
  customErrorValidPlacementForm();
  invalidHandlerForm();
  onKeyUpForm();
  onChangeForm();
  onKeyUpAfterChangeForm();
  onSubmitForm();
  customRulesForm();
  fieldHandlersForm();
  messagesForm();
  normalizerForm();
  requiredForm();
  dynamicValidationForm();
}

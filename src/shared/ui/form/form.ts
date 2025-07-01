import { validatorDestroyFunction, validatorInitFunction, } from '../../../shared/scripts/libs/custom-validator'

import {
  isValidForm,
  resetFormError,
  resetFormFieldErrors,
  resetFormFieldsErrors,
  setFormError,
  setFormFieldError,
  validateField,
  validateForm,

} from '../../../shared/scripts/libs/custom-validator/utils/ValidatorUtils'

export const formApi = {
  resetFormError,
  isValidForm,
  validateField,
  resetFormFieldsErrors,
  validateForm,
  resetFormFieldErrors,
  setFormFieldError,
  setFormError,
  initAll: validatorInitFunction,
  destroyAll: validatorDestroyFunction,
}
